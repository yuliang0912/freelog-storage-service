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
const client_1 = require("../../kafka/client");
const sendToWormhole = require('stream-wormhole');
let FileStorageService = class FileStorageService {
    /**
     * 上传文件,并分析文件属性
     * @param fileStream
     * @param resourceType
     * @returns {Promise<FileStorageInfo>}
     */
    async upload(fileStream, resourceType) {
        const tempFileStorageInfo = await this._uploadFileToTemporaryDirectory(fileStream, true);
        const fileStorage = await this._copyFileAndSaveFileStorageInfo(tempFileStorageInfo, 'resource-file-storage');
        this.sendAnalyzeFilePropertyTask(fileStorage, fileStream.filename).then().catch(x => console.error('消息发送失败'));
        return fileStorage;
    }
    /**
     * 上传用户节点数据文件
     * @param userNodeData
     */
    async uploadUserNodeDataFile(userNodeData) {
        let bufferStream = null;
        if (!(userNodeData instanceof stream_1.Stream)) {
            const userNodeDataJsonBuffer = Buffer.from(JSON.stringify(userNodeData));
            if (userNodeDataJsonBuffer.length > 536870912) {
                throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
            }
            bufferStream = new stream_1.PassThrough();
            bufferStream.end(userNodeDataJsonBuffer);
        }
        else {
            bufferStream = userNodeData;
        }
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(bufferStream, false);
        fileStorageInfo.metaAnalyzeStatus = 2;
        fileStorageInfo.metaInfo.mime = 'application/json';
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
            if (!['jpg', 'jpe', 'jpeg', 'png', 'gif'].includes(analyzeResult.systemProperty.type?.toLocaleString())) {
                throw new egg_freelog_base_1.ApplicationError('图片只支持jpg、jpe、jpeg、png、gif格式');
            }
            mime = analyzeResult.systemProperty.mime;
        }
        // 不允许超过2M
        if (fileStorageInfo.fileSize > 5242880) {
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
     * @param options
     * @returns {string}
     */
    getSignatureUrl(fileStorageInfo, options) {
        const ossClient = this.objectStorageServiceClient.setBucket(fileStorageInfo.storageInfo.bucket).build();
        return ossClient.client.signatureUrl(fileStorageInfo.storageInfo.objectKey, options || {
            method: 'GET', expires: 60
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
     * 分析文件属性(有专门的分析服务)
     * @param fileStorageInfo
     * @param filename
     */
    async sendAnalyzeFilePropertyTask(fileStorageInfo, filename) {
        if (fileStorageInfo.metaAnalyzeStatus === 2) {
            return true;
        }
        return this.kafkaClient.send({
            acks: -1,
            topic: 'file-meta-analyse-task-topic',
            messages: [{
                    key: fileStorageInfo.sha1,
                    value: JSON.stringify({
                        sha1: fileStorageInfo.sha1,
                        fileSize: fileStorageInfo.fileSize,
                        serviceProvider: fileStorageInfo.serviceProvider,
                        storageInfo: fileStorageInfo.storageInfo,
                        filename,
                        attachData: { userId: this.ctx.userId }
                    })
                }]
        }).then(() => {
            return this.fileStorageProvider.updateOne({ sha1: fileStorageInfo.sha1 }, {
                metaAnalyzeStatus: 1
            });
        });
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
        const fileExtName = this.getFileExt(fileStream.filename);
        // 此处代码后期需要等egg-freelog-base优化
        const { region, bucket } = ossClient.config;
        return {
            sha1: fileBaseInfoTransform.hashAlgorithmValue,
            fileSize: fileBaseInfoTransform.fileSize,
            serviceProvider: file_storage_info_interface_1.ServiceProviderEnum.AliOss,
            metaAnalyzeStatus: 0,
            fileExtNames: fileExtName ? [fileExtName] : [],
            metaInfo: {
                fileSize: fileBaseInfoTransform.fileSize
            },
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
            if (lodash_1.difference(fileStorageInfo.fileExtNames, existingFileStorageInfo.fileExtNames).length) {
                await this.fileStorageProvider.updateOne({ sha1: fileStorageInfo.sha1 }, {
                    $addToSet: { fileExtNames: fileStorageInfo.fileExtNames },
                });
                existingFileStorageInfo.fileExtNames.push(...fileStorageInfo.fileExtNames);
            }
            return existingFileStorageInfo;
        }
        const temporaryObjectKey = fileStorageInfo.storageInfo.objectKey;
        const objectKey = `${targetDirectory}/${fileStorageInfo.sha1}`;
        const ossClient = this.objectStorageServiceClient.setBucket(bucketName).build();
        await ossClient.copyObject(objectKey, temporaryObjectKey);
        fileStorageInfo.storageInfo.objectKey = objectKey;
        return this.fileStorageProvider.create(fileStorageInfo);
    }
    getFileExt(filename) {
        if (!filename || filename.indexOf('.') <= 0) {
            return null;
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageService.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", client_1.KafkaClient)
], FileStorageService.prototype, "kafkaClient", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvZmlsZS1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsK0JBQXdCO0FBQ3hCLG1DQUF1QztBQUN2Qyx1REFBcUY7QUFDckYsNkZBRXFEO0FBQ3JELG1DQUE0QztBQUM1QyxtQ0FBMkM7QUFFM0MsK0NBQStDO0FBRS9DLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBR2xELElBQWEsa0JBQWtCLEdBQS9CLE1BQWEsa0JBQWtCO0lBcUIzQjs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFlBQVk7UUFDakMsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekYsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsK0JBQStCLENBQUMsbUJBQW1CLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUM3RyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUcsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxZQUFvQjtRQUU3QyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLENBQUMsWUFBWSxZQUFZLGVBQU0sQ0FBQyxFQUFFO1lBQ25DLE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FB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