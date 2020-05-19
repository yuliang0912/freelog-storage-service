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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZS9maWxlLXN0b3JhZ2Utc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrQkFBd0I7QUFDeEIsbUNBQXVEO0FBQ3ZELHVEQUFrRDtBQUNsRCwwRkFFa0Q7QUFFbEQsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFHbEQ7SUFBQSxJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFrQjtRQWEzQjs7OztXQUlHO1FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVO1lBRW5CLE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUzRCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUUsSUFBSSx1QkFBdUIsRUFBRTtnQkFDekIsT0FBTyx1QkFBdUIsQ0FBQzthQUNsQztZQUVELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVO1lBRW5DLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2RixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFMUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUV6RixNQUFNLHVCQUF1QixHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUUsSUFBSSx1QkFBdUIsRUFBRTtnQkFDekIsT0FBTyx1QkFBdUIsQ0FBQzthQUNsQztZQUVELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQ7Ozs7OztXQU1HO1FBQ0gsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVO1lBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFO2dCQUN0QixNQUFNLElBQUksbUNBQWdCLENBQUMseUNBQXlDLENBQUMsQ0FBQzthQUN6RTtZQUNELE1BQU0sa0JBQWtCLEdBQUcsb0JBQW9CLFNBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN0RixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakYsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztZQUMzRixNQUFNLFNBQVMsR0FBRyxxQkFBcUIscUJBQXFCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNsRixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFbkQsTUFBTSxpQkFBaUIsR0FBZTtnQkFDbEMsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU07Z0JBQ3ZDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNO2dCQUN2QyxTQUFTO2FBQ1osQ0FBQztZQUVGLE1BQU0sZUFBZSxHQUFvQjtnQkFDckMsSUFBSSxFQUFFLHFCQUFxQixDQUFDLGtCQUFrQjtnQkFDOUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLFFBQVE7Z0JBQ3hDLGVBQWUsRUFBRSxpREFBbUIsQ0FBQyxNQUFNO2dCQUMzQyxXQUFXLEVBQUUsaUJBQWlCO2FBQ2pDLENBQUM7WUFDRixPQUFPLGVBQWUsQ0FBQztRQUMzQixDQUFDO1FBRUQsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFVBQVU7WUFDbkMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDYixPQUFPLEVBQUUsQ0FBQzthQUNiO1lBQ0QsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsWUFBWTtZQUNyQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBWTtZQUN6QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FDSixDQUFBO0lBeEdHO1FBREMsZUFBTSxFQUFFOzt5REFDQztJQUVWO1FBREMsZUFBTSxDQUFDLGNBQWMsQ0FBQzs7NERBQ1Y7SUFFYjtRQURDLGVBQU0sRUFBRTs7bUVBQ1c7SUFFcEI7UUFEQyxlQUFNLEVBQUU7O3lFQUNpQjtJQUUxQjtRQURDLGVBQU0sRUFBRTs7OEVBQ3NFO0lBWHRFLGtCQUFrQjtRQUQ5QixnQkFBTyxDQUFDLG9CQUFvQixDQUFDO09BQ2pCLGtCQUFrQixDQTJHOUI7SUFBRCx5QkFBQztLQUFBO0FBM0dZLGdEQUFrQiJ9