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
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(fileStream, true);
        if (this.isCanAnalyzeFileProperty(resourceType)) {
            await this.analyzeFileProperty(fileStorageInfo, resourceType).then(analyzeResult => {
                if (analyzeResult.status === 2) {
                    throw new egg_freelog_base_1.ApplicationError(analyzeResult.error);
                }
            });
        }
        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'resource-file-storage');
    }
    /**
     * 上传用户节点数据文件
     * @param userNodeData
     */
    async uploadUserNodeDataFile(userNodeData) {
        const userNodeDataJsonBuffer = Buffer.from(JSON.stringify(userNodeData));
        if (userNodeDataJsonBuffer.length > 536870912) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
        }
        const bufferStream = new stream_1.PassThrough();
        bufferStream.end(userNodeDataJsonBuffer);
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(bufferStream, false);
        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'user-node-data');
    }
    /**
     * 上传图片
     * @param fileStream
     * @returns {Promise<string>}
     */
    async uploadImage(fileStream) {
        let mime = {};
        const resourceType = 'image';
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(fileStream, false);
        if (this.isCanAnalyzeFileProperty(resourceType)) {
            const analyzeResult = await this.analyzeFileProperty(fileStorageInfo, resourceType);
            if (analyzeResult.status === 2) {
                throw new egg_freelog_base_1.ApplicationError(analyzeResult.error);
            }
            mime = analyzeResult.systemProperty['mime'];
        }
        // 不允许超过2M
        if (fileStorageInfo.fileSize > 2097152) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
        }
        const objectKey = `preview-image/${fileStorageInfo.sha1}${fileStream.filename.includes('.') ? fileStream.filename.substr(fileStream.filename.lastIndexOf('.')) : ''}`;
        const temporaryFileStream = await this.getFileStream(fileStorageInfo);
        await this.objectStorageServiceClient.setBucket('freelog-image').build()
            .putStream(objectKey, temporaryFileStream, { headers: { 'Content-Type': mime } });
        return `https://image.freelog.com/${objectKey}`;
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
     * @param sha1
     * @param args
     */
    async findBySha1(sha1, ...args) {
        return this.fileStorageProvider.findOne({ sha1 }, ...args);
    }
    /**
     * 批量查找
     * @param condition
     * @param args
     */
    async find(condition, ...args) {
        return this.fileStorageProvider.find(condition, ...args);
    }
    /**
     * 获取签名的文件URL读取路径
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {string}
     */
    getSignatureUrl(fileStorageInfo) {
        const ossClient = this.objectStorageServiceClient.setBucket(fileStorageInfo.storageInfo.bucket).build();
        return ossClient.client.signatureUrl(fileStorageInfo.storageInfo.objectKey, {
            method: 'GET', expires: 180
        });
    }
    /**
     * 获取文件流
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {any}
     */
    async getFileStream(fileStorageInfo) {
        const ossClient = this.objectStorageServiceClient.setBucket(fileStorageInfo.storageInfo.bucket).build();
        return ossClient.getStream(fileStorageInfo.storageInfo.objectKey).then(res => res.stream);
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
        if (cacheResult) {
            return cacheResult;
        }
        const signatureUrl = this.getSignatureUrl(fileStorageInfo);
        const analyzeResult = await this.filePropertyAnalyzeHandler.analyzeFileProperty(signatureUrl, resourceType);
        if (analyzeResult.analyzeStatus === 3) {
            return analyzeResult;
        }
        cacheResult = await this.systemAnalysisRecordProvider.create({
            sha1: fileStorageInfo.sha1, resourceType, provider: analyzeResult.provider,
            systemProperty: analyzeResult.fileProperty,
            error: analyzeResult.error ? analyzeResult.error.message : '',
            status: analyzeResult.analyzeStatus
        });
        return cacheResult;
    }
    /**
     * 上传文件到临时目录
     * @param fileStream
     * @param isCheckSpace
     * @param meta
     */
    async _uploadFileToTemporaryDirectory(fileStream, isCheckSpace, meta = null) {
        const temporaryObjectKey = `temporary_upload/${uuid_1.v4().replace(/-/g, '')}`.toLowerCase();
        const fileBaseInfoTransform = this.fileBaseInfoCalculateTransform('sha1', 'hex');
        const ossClient = this.objectStorageServiceClient.setBucket('freelog-shenzhen').build();
        await ossClient.putStream(temporaryObjectKey, fileStream.pipe(fileBaseInfoTransform), meta);
        if (isCheckSpace) {
            const spaceStatisticInfo = await this.bucketService.spaceStatistics(this.ctx.userId);
            if (spaceStatisticInfo.storageLimit - spaceStatisticInfo.totalFileSize < fileBaseInfoTransform.fileSize) {
                throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('storage_full'));
            }
        }
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
     * @param fileStorageInfo
     * @param targetDirectory
     * @param bucketName
     */
    async _copyFileAndSaveFileStorageInfo(fileStorageInfo, targetDirectory, bucketName = 'freelog-shenzhen') {
        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            return existingFileStorageInfo;
        }
        const temporaryObjectKey = fileStorageInfo.storageInfo.objectKey;
        const objectKey = `${targetDirectory}/${fileStorageInfo.sha1}`;
        const ossClient = this.objectStorageServiceClient.setBucket(bucketName).build();
        await ossClient.copyFile(objectKey, temporaryObjectKey);
        fileStorageInfo.storageInfo.objectKey = objectKey;
        return this.fileStorageProvider.findOneAndUpdate({ sha1: fileStorageInfo.sha1 }, fileStorageInfo, { new: true }).then(data => {
            return data ?? this.fileStorageProvider.create(fileStorageInfo);
        });
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
], FileStorageService.prototype, "userNodeDataFileOperation", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "objectStorageServiceClient", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "bucketService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "systemAnalysisRecordProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Function)
], FileStorageService.prototype, "fileBaseInfoCalculateTransform", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "fileStorageProvider", void 0);
FileStorageService = __decorate([
    midway_1.provide('fileStorageService')
], FileStorageService);
exports.FileStorageService = FileStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvZmlsZS1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsK0JBQXdCO0FBQ3hCLG1DQUF1QztBQUN2Qyx1REFBcUY7QUFDckYsNkZBRXFEO0FBQ3JELG1DQUFnQztBQUNoQyxtQ0FBbUM7QUFHbkMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFHbEQsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBa0I7SUFtQjNCOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsWUFBWTtRQUVqQyxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckYsSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDN0MsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDL0UsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDNUIsTUFBTSxJQUFJLG1DQUFnQixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDbkQ7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxJQUFJLENBQUMsK0JBQStCLENBQUMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxZQUFvQjtRQUU3QyxNQUFNLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FB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