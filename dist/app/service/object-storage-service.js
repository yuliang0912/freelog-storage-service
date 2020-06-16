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
exports.ObjectStorageService = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const bucket_interface_1 = require("../../interface/bucket-interface");
const egg_freelog_base_1 = require("egg-freelog-base");
let ObjectStorageService = class ObjectStorageService {
    /**
     * 创建文件对象
     * @param {BucketInfo} bucketInfo
     * @param {CreateObjectStorageInfoOptions} options
     * @returns {Promise<ObjectStorageInfo>}
     */
    async createObject(bucketInfo, options) {
        options.objectName = options.objectName.replace(/[\\|\/|:|\*|\?|"|<|>|\||\s|@|\$|#]/g, '_');
        const model = {
            sha1: options.fileStorageInfo.sha1,
            objectName: options.objectName,
            bucketId: bucketInfo.bucketId,
            bucketName: bucketInfo.bucketName,
            resourceType: lodash_1.isNull(options.resourceType) || lodash_1.isUndefined(options.resourceType) ? '' : options.resourceType
        };
        const findCondition = lodash_1.pick(model, ['bucketId', 'objectName']);
        const oldObjectStorageInfo = await this.objectStorageProvider.findOne(findCondition);
        const isUpdateResourceType = !oldObjectStorageInfo || oldObjectStorageInfo.resourceType !== model.resourceType;
        if (isUpdateResourceType) {
            model.systemProperty = { fileSize: options.fileStorageInfo.fileSize };
        }
        if (isUpdateResourceType && this.fileStorageService.isCanAnalyzeFileProperty(model.resourceType)) {
            const cacheAnalyzeResult = await this.fileStorageService.analyzeFileProperty(options.fileStorageInfo, model.resourceType);
            if (cacheAnalyzeResult.status === 1) {
                model.systemProperty = lodash_1.assign(model.systemProperty, cacheAnalyzeResult.systemProperty);
            }
            if (cacheAnalyzeResult.status === 2) {
                throw new egg_freelog_base_1.ApplicationError(cacheAnalyzeResult.error);
            }
        }
        if (oldObjectStorageInfo) {
            return this.objectStorageProvider.findOneAndUpdate(findCondition, model, { new: true }).then((object) => {
                this.bucketService.replaceStorageObjectEventHandle(object, oldObjectStorageInfo);
                return object;
            });
        }
        return this.objectStorageProvider.create(model).tap(() => {
            this.bucketService.addStorageObjectEventHandle(model);
        });
    }
    /**
     * 创建用户节点数据
     * @param {CreateUserNodeDataObjectOptions} options
     * @returns {Promise<ObjectStorageInfo>}
     */
    async createUserNodeObject(options) {
        const bucket = {
            bucketName: bucket_interface_1.SystemBucketName.UserNodeData,
            bucketType: bucket_interface_1.BucketTypeEnum.SystemStorage,
            userId: options.userId
        };
        const bucketInfo = await this.bucketService.createOrFindSystemBucket(bucket);
        const model = {
            sha1: options.fileStorageInfo.sha1,
            objectName: `${options.nodeInfo.nodeDomain}.ncfg`,
            bucketId: bucketInfo.bucketId,
            bucketName: bucketInfo.bucketName,
            resourceType: 'node-config',
            systemProperty: {
                fileSize: options.fileStorageInfo.fileSize
            }
        };
        const findCondition = lodash_1.pick(model, ['bucketId', 'objectName']);
        const oldObjectStorageInfo = await this.objectStorageProvider.findOneAndUpdate(findCondition, model, { new: false });
        if (oldObjectStorageInfo) {
            this.bucketService.replaceStorageObjectEventHandle(model, oldObjectStorageInfo);
            return this.objectStorageProvider.findOne(findCondition);
        }
        return this.objectStorageProvider.create(model).tap((object) => {
            this.bucketService.addStorageObjectEventHandle(object);
        });
    }
    /**
     * 更新用户存储数据
     * @param {ObjectStorageInfo} oldObjectStorageInfo - 现有的对象存储信息
     * @param {FileStorageInfo} newFileStorageInfo - 新的文件存储信息
     * @returns {Promise<ObjectStorageInfo>}
     */
    async updateObject(oldObjectStorageInfo, newFileStorageInfo) {
        const updateInfo = {
            sha1: newFileStorageInfo.sha1,
            systemProperties: {
                fileSize: newFileStorageInfo.fileSize
            }
        };
        const findCondition = lodash_1.pick(oldObjectStorageInfo, ['bucketId', 'objectName']);
        const newObjectStorageInfo = await this.objectStorageProvider.findOneAndUpdate(findCondition, updateInfo, { new: true });
        this.bucketService.replaceStorageObjectEventHandle(newObjectStorageInfo, oldObjectStorageInfo);
        return this.objectStorageProvider.findOne(findCondition);
    }
    async deleteObject(objectStorageInfo) {
        return this.objectStorageProvider.deleteOne({
            bucketId: objectStorageInfo.bucketId,
            objectName: objectStorageInfo.objectName
        }).then(data => {
            if (data.deletedCount) {
                this.bucketService.deleteStorageObjectEventHandle(objectStorageInfo);
            }
            return Boolean(data.ok);
        });
    }
    async batchDeleteObjects(bucketInfo, objectIds) {
        const condition = {
            bucketId: bucketInfo.bucketId, _id: { $in: objectIds }
        };
        const objectInfos = await this.objectStorageProvider.find(condition, 'systemProperty.fileSize');
        if (!objectInfos.length) {
            return false;
        }
        return this.objectStorageProvider.deleteMany(condition).then(data => {
            if (data.deletedCount) {
                this.bucketService.batchDeleteStorageObjectEventHandle(bucketInfo, objectInfos.length, lodash_1.sumBy(objectInfos, 'systemProperty.fileSize'));
            }
            return Boolean(data.ok);
        });
    }
    async findOne(condition) {
        return this.objectStorageProvider.findOne(condition);
    }
    async find(condition) {
        return this.objectStorageProvider.find(condition);
    }
    async findPageList(condition, page, pageSize, projection, orderBy) {
        return this.objectStorageProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
    }
    async count(condition) {
        return this.objectStorageProvider.count(condition);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "ctx", void 0);
__decorate([
    midway_1.plugin(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "ossClient", void 0);
__decorate([
    midway_1.config('uploadConfig'),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "uploadConfig", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "bucketService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "objectStorageProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "systemAnalysisRecordProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "fileStorageService", void 0);
ObjectStorageService = __decorate([
    midway_1.provide('objectStorageService')
], ObjectStorageService);
exports.ObjectStorageService = ObjectStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vYmplY3Qtc3RvcmFnZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFnRTtBQUNoRSxtQ0FBdUQ7QUFJdkQsdUVBQThHO0FBRTlHLHVEQUFrRDtBQUdsRCxJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFvQjtJQWdCN0I7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQXNCLEVBQUUsT0FBbUM7UUFFMUUsT0FBTyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUU1RixNQUFNLEtBQUssR0FBc0I7WUFDN0IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSTtZQUNsQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7WUFDOUIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1lBQzdCLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxZQUFZLEVBQUUsZUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxvQkFBVyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWTtTQUM5RyxDQUFDO1FBQ0YsTUFBTSxhQUFhLEdBQUcsYUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzlELE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSxvQkFBb0IsQ0FBQyxZQUFZLEtB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