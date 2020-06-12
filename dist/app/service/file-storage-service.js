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
let FileStorageService = /** @class */ (() => {
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
            const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
            if (existingFileStorageInfo) {
                return existingFileStorageInfo;
            }
            const temporaryObjectKey = fileStorageInfo.storageInfo.objectKey;
            const objectKey = `user-file-storage/${fileStorageInfo.sha1}`;
            await this.copyFile(temporaryObjectKey, objectKey);
            fileStorageInfo.storageInfo.objectKey = objectKey;
            return this.fileStorageProvider.create(fileStorageInfo);
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
            const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
            if (existingFileStorageInfo) {
                return existingFileStorageInfo;
            }
            const temporaryObjectKey = fileStorageInfo.storageInfo.objectKey;
            const objectKey = `user-file-storage/${fileStorageInfo.sha1}`;
            await this.copyFile(temporaryObjectKey, objectKey);
            fileStorageInfo.storageInfo.objectKey = objectKey;
            return this.fileStorageProvider.create(fileStorageInfo);
        }
        /**
         * 上传文件
         * @param fileStream
         * @returns {Promise<void>}
         * @private
         */
        async _uploadFileToTemporaryDirectory(fileStream) {
            if (!fileStream.filename) {
                throw new egg_freelog_base_1.ApplicationError('upload file error,filename not existing');
            }
            const temporaryObjectKey = `temporary_upload/${uuid_1.v4().replace(/-/g, '')}`.toLowerCase();
            const fileBaseInfoTransform = this.fileBaseInfoCalculateTransform('sha1', 'hex');
            await this.ossClient.putStream(temporaryObjectKey, fileStream.pipe(fileBaseInfoTransform));
            const aliOssStorageInfo = {
                region: this.uploadConfig.aliOss.region,
                bucket: this.uploadConfig.aliOss.bucket,
                objectKey: temporaryObjectKey
            };
            return {
                sha1: fileBaseInfoTransform.hashAlgorithmValue,
                fileSize: fileBaseInfoTransform.fileSize,
                serviceProvider: file_storage_info_interface_1.ServiceProviderEnum.AliOss,
                storageInfo: aliOssStorageInfo,
                fileUrl: `http://${aliOssStorageInfo.bucket}.${aliOssStorageInfo.region}${this.uploadConfig.aliOss.internal ? '-internal' : ''}.aliyuncs.com/${aliOssStorageInfo.objectKey}`
            };
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
         * 复制文件
         * @param oldObjectKey
         * @param newObjectKey
         * @returns {Promise<Promise<any>>}
         */
        async copyFile(oldObjectKey, newObjectKey) {
            return this.ossClient.copyFile(newObjectKey, oldObjectKey);
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
            const analyzeResult = await this.filePropertyAnalyzeHandler.analyzeFileProperty(fileStorageInfo.fileUrl, resourceType);
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
    };
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], FileStorageService.prototype, "ctx", void 0);
    __decorate([
        midway_1.plugin(),
        __metadata("design:type", Object)
    ], FileStorageService.prototype, "ossClient", void 0);
    __decorate([
        midway_1.config('uploadConfig'),
        __metadata("design:type", Object)
    ], FileStorageService.prototype, "uploadConfig", void 0);
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
    FileStorageService = __decorate([
        midway_1.provide('fileStorageService')
    ], FileStorageService);
    return FileStorageService;
})();
exports.FileStorageService = FileStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvZmlsZS1zdG9yYWdlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsK0JBQXdCO0FBQ3hCLG1DQUF1RDtBQUN2RCx1REFBa0Q7QUFDbEQsNkZBRXFEO0FBQ3JELG1DQUFnQztBQUVoQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUdsRDtJQUFBLElBQWEsa0JBQWtCLEdBQS9CLE1BQWEsa0JBQWtCO1FBbUIzQjs7Ozs7V0FLRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFlBQVk7WUFFakMsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsK0JBQStCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0UsSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQzdDLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNqRTtZQUVELE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RSxJQUFJLHVCQUF1QixFQUFFO2dCQUN6QixPQUFPLHVCQUF1QixDQUFDO2FBQ2xDO1lBRUQsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUNqRSxNQUFNLFNBQVMsR0FBRyxxQkFBcUIsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzlELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNuRCxlQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFFbEQsT0FBTyxJQUFJLENBQUMs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