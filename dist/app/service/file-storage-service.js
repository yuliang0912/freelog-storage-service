"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const uuid_1 = require("uuid");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const file_storage_info_interface_1 = require("../../interface/file-storage-info-interface");
const lodash_1 = require("lodash");
const sendToWormhole = require('stream-wormhole');
let FileStorageService = class FileStorageService {
    /**
     * 上传文件,并分析文件属性
     * @param fileStream
     * @param resourceType
     * @returns {Promise<FileStorageInfo>}
     */
    async upload(fileStream, resourceType) {
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(fileStream);
        if (this.isCanAnalyzeFileProperty(resourceType)) {
            await this.analyzeFileProperty(fileStorageInfo, resourceType);
        }
        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'resource-file-storage');
    }
    /**
     * 上传用户节点数据文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    async uploadUserNodeDataFile(fileStream) {
        const fileStreamCheckTask = this.userNodeDataFileOperation.checkJsonObject(fileStream);
        const fileStreamUploadTask = this._uploadFileToTemporaryDirectory(fileStream);
        const [fileStorageInfo] = await Promise.all([fileStreamUploadTask, fileStreamCheckTask]);
        if (fileStorageInfo.fileSize > 524288) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
        }
        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'user-node-data');
    }
    /**
     * 上传图片
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    async uploadImage(fileStream) {
        const resourceType = 'image';
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(fileStream);
        if (this.isCanAnalyzeFileProperty(resourceType)) {
            await this.analyzeFileProperty(fileStorageInfo, resourceType);
        }
        // 不允许超过2M
        if (fileStorageInfo.fileSize > 2097152) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
        }
        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'preview-image');
    }
    /**
     * 文件流排空
     * @param fileStream
     * @returns {Promise<any>}
     */
    async fileStreamErrorHandler(fileStream) {
        if (!fileStream) {
            return {};
        }
        return sendToWormhole(fileStream);
    }
    /**
     * 根据sha1值获取文件
     * @param {string} sha1
     * @returns {Promise<FileStorageInfo>}
     */
    async findBySha1(sha1) {
        return this.fileStorageProvider.findOne({ sha1 });
    }
    /**
     * 获取签名的文件URL读取路径
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {string}
     */
    getSignatureUrl(fileStorageInfo) {
        const ossClient = this.objectStorageServiceClient.setProvider(fileStorageInfo.serviceProvider).setBucket(fileStorageInfo.storageInfo.bucket).build();
        return ossClient.givenClient.client.signatureUrl(fileStorageInfo.storageInfo.objectKey, {
            method: 'GET', expires: 180
        });
    }
    /**
     * 获取文件流
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {any}
     */
    async getFileStream(fileStorageInfo) {
        const ossClient = this.objectStorageServiceClient.setProvider(fileStorageInfo.serviceProvider).setBucket(fileStorageInfo.storageInfo.bucket).build();
        const { stream } = await ossClient.getStream(fileStorageInfo.storageInfo.objectKey);
        return stream;
    }
    /**
     * 判断是否支持分析目标资源类型
     * @param {string} resourceType
     * @returns boolean
     */
    isCanAnalyzeFileProperty(resourceType) {
        if (!lodash_1.isString(resourceType)) {
            return false;
        }
        return this.filePropertyAnalyzeHandler.supportAnalyzeResourceTypes.includes(resourceType.toLowerCase());
    }
    /**
     * 分析并缓存文件属性
     * @param {FileStorageInfo} fileStorageInfo
     * @param {string} resourceType
     * @returns {Promise<object>}
     * @private
     */
    async analyzeFileProperty(fileStorageInfo, resourceType) {
        let cacheResult = await this.systemAnalysisRecordProvider.findOne({ sha1: fileStorageInfo.sha1, resourceType });
        if (cacheResult && cacheResult.status === 2) {
            return Promise.reject(cacheResult.error);
        }
        else if (cacheResult) {
            return cacheResult;
        }
        const signatureUrl = this.getSignatureUrl(fileStorageInfo);
        const analyzeResult = await this.filePropertyAnalyzeHandler.analyzeFileProperty(signatureUrl, resourceType);
        cacheResult = await this.systemAnalysisRecordProvider.create({
            sha1: fileStorageInfo.sha1, resourceType, provider: analyzeResult.provider,
            systemProperty: analyzeResult.fileProperty,
            error: analyzeResult.error ? analyzeResult.error.message : '',
            status: analyzeResult.analyzeStatus
        });
        if (analyzeResult.analyzeStatus === 2) {
            return Promise.reject(analyzeResult.error);
        }
        return cacheResult;
    }
    /**
     * 上传文件到临时目录
     * @param fileStream
     * @returns {Promise<void>}
     * @private
     */
    async _uploadFileToTemporaryDirectory(fileStream, bucketName = 'freelog-shenzhen') {
        if (!fileStream.filename) {
            throw new egg_freelog_base_1.ApplicationError('upload file error,filename not existing');
        }
        const temporaryObjectKey = `temporary_upload/${uuid_1.v4().replace(/-/g, '')}`.toLowerCase();
        const fileBaseInfoTransform = this.fileBaseInfoCalculateTransform('sha1', 'hex');
        const ossClient = this.objectStorageServiceClient.setProvider('aliOss').setBucket(bucketName).build();
        await ossClient.putStream(temporaryObjectKey, fileStream.pipe(fileBaseInfoTransform));
        // 此处代码后期需要等egg-freelog-base优化
        const { region, bucket } = ossClient.config;
        return {
            sha1: fileBaseInfoTransform.hashAlgorithmValue,
            fileSize: fileBaseInfoTransform.fileSize,
            serviceProvider: file_storage_info_interface_1.ServiceProviderEnum.AliOss,
            storageInfo: {
                region, bucket, objectKey: temporaryObjectKey
            }
        };
    }
    /**
     * 复制文件(临时目录copy到正式目录),并且保存文件信息入库
     * @param {FileStorageInfo} fileStorageInfo
     * @param targetDirectory
     * @returns {Promise<any>}
     * @private
     */
    async _copyFileAndSaveFileStorageInfo(fileStorageInfo, targetDirectory, bucketName = 'freelog-shenzhen') {
        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            return existingFileStorageInfo;
        }
        const temporaryObjectKey = fileStorageInfo.storageInfo.objectKey;
        const objectKey = `image-file-storage/${fileStorageInfo.sha1}`;
        const ossClient = this.objectStorageServiceClient.setProvider('aliOss').setBucket(bucketName).build();
        await ossClient.copyFile(objectKey, temporaryObjectKey);
        fileStorageInfo.storageInfo.objectKey = objectKey;
        return this.fileStorageProvider.create(fileStorageInfo);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "filePropertyAnalyzeHandler", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "fileStorageProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "systemAnalysisRecordProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "userNodeDataFileOperation", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Function)
], FileStorageService.prototype, "fileBaseInfoCalculateTransform", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "objectStorageServiceClient", void 0);
FileStorageService = __decorate([
    midway_1.provide('fileStorageService')
], FileStorageService);
exports.FileStorageService = FileStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvZmlsZS1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsK0JBQXdCO0FBQ3hCLG1DQUF1QztBQUN2Qyx1REFBa0Q7QUFDbEQsNkZBRXFEO0FBQ3JELG1DQUFnQztBQUVoQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUdsRCxJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFrQjtJQWlCM0I7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZO1FBRWpDLE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLCtCQUErQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzdDLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztTQUNqRTtRQUNELE9BQU8sSUFBSSxDQUFDLCtCQUErQixDQUFDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFVBQVU7UUFFbkMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZGLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFFekYsSUFBSSxlQUFlLENBQUMs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