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
let ObjectStorageService = /** @class */ (() => {
    let ObjectStorageService = class ObjectStorageService {
        /**
         * 创建文件对象
         * @param {BucketInfo} bucketInfo
         * @param {CreateObjectStorageInfoOptions} options
         * @returns {Promise<ObjectStorageInfo>}
         */
        async createObject(bucketInfo, options) {
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
    return ObjectStorageService;
})();
exports.ObjectStorageService = ObjectStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vYmplY3Qtc3RvcmFnZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF5RDtBQUN6RCxtQ0FBdUQ7QUFJdkQsdUVBQThHO0FBRTlHLHVEQUFrRDtBQUdsRDtJQUFBLElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO1FBZ0I3Qjs7Ozs7V0FLRztRQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBc0IsRUFBRSxPQUFtQztZQUUxRSxNQUFNLEtBQUssR0FBc0I7Z0JBQzdCLElBQUksRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUk7Z0JBQ2xDLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTtnQkFDOUIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO2dCQUM3QixVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7Z0JBQ2pDLFlBQVksRUFBRSxlQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLG9CQUFXLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZO2FBQzlHLENBQUM7WUFDRixNQUFNLGFBQWEsR0FBRyxhQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDOUQsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDckYsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLG9CQUFvQixJQUFJLG9CQUFvQixDQUFDLFlBQVksS0FBSyxLQUFLLENBQUMsWUFBWSxDQUFDO1lBRS9HLElBQUksb0JBQW9CLEVBQUU7Z0JBQ3RCLEtBQUssQ0FBQyxjQUFjLEdBQUcs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