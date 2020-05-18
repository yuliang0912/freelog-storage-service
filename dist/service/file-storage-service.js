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
const uuid_1 = require("uuid");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const file_storage_info_interface_1 = require("../interface/file-storage-info-interface");
const stream_1 = require("stream");
const sendToWormhole = require('stream-wormhole');
let FileStorageService = class FileStorageService {
    /**
     * 上传文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    async upload(fileStream) {
        const fileStorageInfo = await this._uploadFile(fileStream);
        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            return existingFileStorageInfo;
        }
        return this.fileStorageProvider.create(fileStorageInfo);
    }
    /**
     * 上传用户节点数据文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    async uploadUserNodeDataFile(fileStream) {
        const fileStreamCheckTask = this.userNodeDataFileOperation.checkJsonObject(fileStream);
        const fileStreamUploadTask = this._uploadFile(fileStream);
        const [fileStorageInfo] = await Promise.all([fileStreamUploadTask, fileStreamCheckTask]);
        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            return existingFileStorageInfo;
        }
        return this.fileStorageProvider.create(fileStorageInfo);
    }
    /**
     * 上传文件
     * @param fileStream
     * @param checkTasks
     * @returns {Promise<void>}
     * @private
     */
    async _uploadFile(fileStream) {
        if (!fileStream.filename) {
            throw new egg_freelog_base_1.ApplicationError('upload file error,filename not existing');
        }
        const temporaryObjectKey = `temporary_upload/${uuid_1.v4().replace(/-/g, '')}`.toLowerCase();
        const fileBaseInfoTransform = this.fileBaseInfoCalculateTransform('sha1', 'hex');
        await this.ossClient.putStream(temporaryObjectKey, fileStream.pipe(fileBaseInfoTransform));
        const objectKey = `user-file-storage/${fileBaseInfoTransform.hashAlgorithmValue}`;
        await this.copyFile(temporaryObjectKey, objectKey);
        const aliOssStorageInfo = {
            region: this.uploadConfig.aliOss.region,
            bucket: this.uploadConfig.aliOss.bucket,
            objectKey
        };
        const fileStorageInfo = {
            sha1: fileBaseInfoTransform.hashAlgorithmValue,
            fileSize: fileBaseInfoTransform.fileSize,
            serviceProvider: file_storage_info_interface_1.ServiceProviderEnum.AliOss,
            storageInfo: aliOssStorageInfo
        };
        return fileStorageInfo;
    }
    async fileStreamErrorHandler(fileStream) {
        stream_1.finished(fileStream, (error) => {
            if (error) {
                sendToWormhole(fileStream);
            }
        });
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
};
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
], FileStorageService.prototype, "fileStorageProvider", void 0);
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
exports.FileStorageService = FileStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZS9maWxlLXN0b3JhZ2Utc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLCtCQUF3QjtBQUN4QixtQ0FBdUQ7QUFDdkQsdURBQWtEO0FBQ2xELDBGQUVrRDtBQUNsRCxtQ0FBa0Q7QUFFbEQsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFHbEQsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBa0I7SUFhM0I7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVTtRQUVuQixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFM0QsTUFBTSx1QkFBdUIsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVFLElBQUksdUJBQXVCLEVBQUU7WUFDekIsT0FBTyx1QkFBdUIsQ0FBQztTQUNsQztRQUVELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVO1FBRW5DLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFMUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUV6RixNQUFNLHVCQUF1QixHQUFHLE1BQU0sSUFBSSxD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