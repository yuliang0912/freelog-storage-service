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
const file_storage_info_interface_1 = require("../interface/file-storage-info-interface");
const stream_1 = require("stream");
const sendToWormhole = require('stream-wormhole');
let FileStorageService = /** @class */ (() => {
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
    return FileStorageService;
})();
exports.FileStorageService = FileStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZS9maWxlLXN0b3JhZ2Utc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrQkFBd0I7QUFDeEIsbUNBQXVEO0FBQ3ZELHVEQUFrRDtBQUNsRCwwRkFFa0Q7QUFDbEQsbUNBQWtEO0FBRWxELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBR2xEO0lBQUEsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBa0I7UUFhM0I7Ozs7V0FJRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVTtZQUVuQixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFM0QsTUFBTSx1QkFBdUIsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVFLElBQUksdUJBQXVCLEVBQUU7Z0JBQ3pCLE9BQU8sdUJBQXVCLENBQUM7YUFDbEM7WUFFRCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxLQUFLLENBQUMsc0JBQXNCLENBQUMsVUFBVTtZQUVuQyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkYsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTFELE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFFekYsTUFBTSx1QkFBdUIsR0FBRyxNQUFN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