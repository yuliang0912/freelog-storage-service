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
exports.StorageObjectService = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const bucket_interface_1 = require("../interface/bucket-interface");
let StorageObjectService = /** @class */ (() => {
    let StorageObjectService = class StorageObjectService {
        /**
         * 创建文件对象
         * @param {BucketInfo} bucketInfo
         * @param {CreateStorageObjectOptions} options
         * @returns {Promise<StorageObject>}
         */
        async createObject(bucketInfo, options) {
            const storageObject = {
                sha1: options.fileStorageInfo.sha1,
                objectName: options.objectName,
                bucketId: bucketInfo.bucketId,
                bucketName: bucketInfo.bucketName,
                resourceType: options.resourceType,
                systemMeta: {
                    fileSize: options.fileStorageInfo.fileSize
                }
            };
            const findCondition = lodash_1.pick(storageObject, ['bucketId', 'objectName']);
            const oldStorageObject = await this.storageObjectProvider.findOneAndUpdate(findCondition, storageObject, { new: false });
            if (oldStorageObject) {
                this.bucketService.replaceStorageObjectEventHandle(storageObject, oldStorageObject);
                return this.storageObjectProvider.findOne(findCondition);
            }
            return this.storageObjectProvider.create(storageObject).tap(() => {
                this.bucketService.addStorageObjectEventHandle(storageObject);
            });
        }
        /**
         * 创建用户节点数据
         * @param {CreateUserNodeDataObjectOptions} options
         * @returns {Promise<StorageObject>}
         */
        async createUserNodeObject(options) {
            const bucket = {
                bucketName: bucket_interface_1.SystemBucketName.UserNodeData,
                bucketType: bucket_interface_1.BucketTypeEnum.SystemStorage,
                userId: options.userId
            };
            const bucketInfo = await this.bucketService.createOrFindSystemBucket(bucket);
            const storageObject = {
                sha1: options.fileStorageInfo.sha1,
                objectName: `${options.nodeInfo.nodeDomain}.ncfg`,
                bucketId: bucketInfo.bucketId,
                bucketName: bucketInfo.bucketName,
                resourceType: 'node-config',
                systemMeta: {
                    fileSize: options.fileStorageInfo.fileSize
                }
            };
            const findCondition = lodash_1.pick(storageObject, ['bucketId', 'objectName']);
            const oldStorageObject = await this.storageObjectProvider.findOneAndUpdate(findCondition, storageObject, { new: false });
            if (oldStorageObject) {
                this.bucketService.replaceStorageObjectEventHandle(storageObject, oldStorageObject);
                return this.storageObjectProvider.findOne(findCondition);
            }
            return this.storageObjectProvider.create(storageObject).tap(() => {
                this.bucketService.addStorageObjectEventHandle(storageObject);
            });
        }
        /**
         * 更新用户存储数据
         * @param {StorageObject} oldStorageObject - 现有的对象存储信息
         * @param {FileStorageInfo} newFileStorageInfo - 新的文件存储信息
         * @returns {Promise<StorageObject>}
         */
        async updateObject(oldStorageObject, newFileStorageInfo) {
            const updateStorageObjectInfo = {
                sha1: newFileStorageInfo.sha1,
                systemMeta: {
                    fileSize: newFileStorageInfo.fileSize
                }
            };
            const findCondition = lodash_1.pick(oldStorageObject, ['bucketId', 'objectName']);
            const newStorageObject = await this.storageObjectProvider.findOneAndUpdate(findCondition, updateStorageObjectInfo, { new: true });
            this.bucketService.replaceStorageObjectEventHandle(newStorageObject, oldStorageObject);
            return this.storageObjectProvider.findOne(findCondition);
        }
        async deleteObject(storageObject) {
            return this.storageObjectProvider.deleteOne({
                bucketId: storageObject.bucketId,
                objectName: storageObject.objectName
            }).then(data => {
                if (data.deletedCount) {
                    this.bucketService.deleteStorageObjectEventHandle(storageObject);
                }
                return Boolean(data.ok);
            });
        }
        async findOne(condition) {
            return this.storageObjectProvider.findOne(condition);
        }
        async find(condition) {
            return this.storageObjectProvider.find(condition);
        }
        async findPageList(condition, page, pageSize, projection, orderBy) {
            return this.storageObjectProvider.findPageList(condition, page, pageSize, projection.join(''), orderBy);
        }
        async count(condition) {
            return this.storageObjectProvider.count(condition);
        }
    };
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], StorageObjectService.prototype, "ctx", void 0);
    __decorate([
        midway_1.plugin(),
        __metadata("design:type", Object)
    ], StorageObjectService.prototype, "ossClient", void 0);
    __decorate([
        midway_1.config('uploadConfig'),
        __metadata("design:type", Object)
    ], StorageObjectService.prototype, "uploadConfig", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], StorageObjectService.prototype, "bucketService", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], StorageObjectService.prototype, "storageObjectProvider", void 0);
    StorageObjectService = __decorate([
        midway_1.provide('storageObjectService')
    ], StorageObjectService);
    return StorageObjectService;
})();
exports.StorageObjectService = StorageObjectService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1vYmplY3Qtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlL3N0b3JhZ2Utb2JqZWN0LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTRCO0FBQzVCLG1DQUF1RDtBQUl2RCxvRUFBMkc7QUFJM0c7SUFBQSxJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFvQjtRQVk3Qjs7Ozs7V0FLRztRQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBc0IsRUFBRSxPQUFtQztZQUUxRSxNQUFNLGFBQWEsR0FBa0I7Z0JBQ2pDLElBQUksRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUk7Z0JBQ2xDLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTtnQkFDOUIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO2dCQUM3QixVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7Z0JBQ2pDLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtnQkFDbEMsVUFBVSxFQUFFO29CQUNSLFFBQVEsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVE7aUJBQzdDO2FBQ0osQ0FBQztZQUVGLE1BQU0sYUFBYSxHQUFHLGFBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUV2SCxJQUFJLGdCQUFnQixFQUFFO2dCQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLCtCQUErQixDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNwRixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7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