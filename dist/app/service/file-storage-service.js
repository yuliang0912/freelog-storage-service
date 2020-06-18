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
const stream_1 = require("stream");
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
    async uploadUserNodeDataFile(userNodeData) {
        const userNodeDataJsonBuffer = Buffer.from(JSON.stringify(userNodeData));
        if (userNodeDataJsonBuffer.length > 536870912) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
        }
        const bufferStream = new stream_1.PassThrough();
        bufferStream.end(userNodeDataJsonBuffer);
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(bufferStream);
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
        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'preview-image', 'freelog-image');
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
        const objectKey = `${targetDirectory}/${fileStorageInfo.sha1}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvZmlsZS1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsK0JBQXdCO0FBQ3hCLG1DQUF1QztBQUN2Qyx1REFBa0Q7QUFDbEQsNkZBRXFEO0FBQ3JELG1DQUFnQztBQUNoQyxtQ0FBbUM7QUFFbkMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFHbEQsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBa0I7SUFpQjNCOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsWUFBWTtRQUVqQyxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvRSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUM3QyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDakU7UUFDRCxPQUFPLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxZQUFvQjtRQUU3QyxNQUFNLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksc0JBQXNCLENBQUMsTUFBTSxHQUFHLFNBQVMsRUFBRTtZQUMzQyxNQUFNLElBQUksbUNBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO1NBQ3hGO1FBQ0QsTUFBTSxZQUFZLEdBQUcs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