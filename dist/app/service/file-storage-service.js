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
        const bufferStream = new stream_1.PassThrough();
        bufferStream.end(Buffer.from(JSON.stringify(userNodeData)));
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(bufferStream);
        if (fileStorageInfo.fileSize > 536870912) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvZmlsZS1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsK0JBQXdCO0FBQ3hCLG1DQUF1QztBQUN2Qyx1REFBa0Q7QUFDbEQsNkZBRXFEO0FBQ3JELG1DQUFnQztBQUNoQyxtQ0FBbUM7QUFFbkMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFHbEQsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBa0I7SUFpQjNCOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsWUFBWTtRQUVqQyxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvRSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUM3QyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDakU7UUFDRCxPQUFPLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxZQUFvQjtRQUU3QyxNQUFNLFlBQVksR0FBRyxJQUFJLG9CQUFXLEVBQUUsQ0FBQztRQUN2QyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsK0JBQStCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFakYsSUFBSSxlQUFlLENBQUMsUUFBUSxHQUFHLFNBQVMs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