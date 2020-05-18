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
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const bucket_interface_1 = require("../interface/bucket-interface");
let StorageObjectService = class StorageObjectService {
    /**
     * 创建文件对象
     * @param {CreateStorageObjectOptions} options
     * @returns {Promise<StorageObject>}
     */
    async createObject(options) {
        const bucketInfo = await this.bucketService.findOne({ bucketName: options.bucketName, userId: options.userId });
        this.ctx.entityNullObjectCheck(bucketInfo, this.ctx.gettext('bucket-entity-not-found'));
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
     * @param {StorageObject} 原有的存储信息
     * @param {FileStorageInfo} 新的文件信息
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
exports.StorageObjectService = StorageObjectService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1vYmplY3Qtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlL3N0b3JhZ2Utb2JqZWN0LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEI7QUFDNUIsbUNBQXVEO0FBSXZELG9FQUEyRztBQUkzRyxJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFvQjtJQVk3Qjs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFtQztRQUVsRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQzlHLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztRQUV4RixNQUFNLGFBQWEsR0FBa0I7WUFDakMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSTtZQUNsQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7WUFDOUIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1lBQzdCLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7WUFDbEMsVUFBVSxFQUFFO2dCQUNSLFFBQVEsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVE7YUFDN0M7U0FDSixDQUFDO1FBRUYsTUFBTSxhQUFhLEdBQUcsYUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENB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