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
const semver_1 = require("semver");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const lodash_1 = require("lodash");
const bucket_interface_1 = require("../../interface/bucket-interface");
let ObjectStorageService = class ObjectStorageService {
    /**
     * 创建存储对象(存在时,则替换)
     * @param bucketInfo
     * @param options
     */
    async createObject(bucketInfo, options) {
        options.objectName = options.objectName.replace(/[\\|\/:*?"<>\s@$#]/g, '_');
        const model = {
            sha1: options.fileStorageInfo.sha1,
            objectName: options.objectName,
            bucketId: bucketInfo.bucketId,
            bucketName: bucketInfo.bucketName,
            userId: bucketInfo.userId,
            systemProperty: options.fileStorageInfo.metaInfo,
            resourceType: [],
            uniqueKey: this.storageCommonGenerator.generateObjectUniqueKey(bucketInfo.bucketName, options.objectName)
        };
        if (!options.fileStorageInfo.metaInfo) {
            model.systemProperty = { fileSize: options.fileStorageInfo.fileSize };
        }
        const oldObjectStorageInfo = await this.findOneByName(bucketInfo.bucketName, options.objectName);
        if (!oldObjectStorageInfo) {
            return this.objectStorageProvider.create(model).then(objectInfo => {
                this.bucketService.addStorageObjectEventHandle(model);
                return objectInfo;
            });
        }
        model.dependencies = oldObjectStorageInfo.dependencies ?? [];
        model.customPropertyDescriptors = oldObjectStorageInfo.customPropertyDescriptors ?? [];
        // 替换对象时,如果没有资源类型,或者新资源检测通过,则保留依赖和自定义属性,否则就清空自定义属性以及依赖信息和资源类型
        // model.systemProperty = await this._buildObjectSystemProperty(options.fileStorageInfo, options.objectName, oldObjectStorageInfo.resourceType, function () {
        //     model.resourceType = [];
        //     model.dependencies = [];
        //     model.customPropertyDescriptors = [];
        // });
        const cycleDependCheckResult = await this.cycleDependCheck(`${model.bucketName}/${model.objectName}`, model.dependencies, 1);
        if (cycleDependCheckResult.ret) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('object-circular-dependency-error'), {
                objectName: model.objectName, deep: cycleDependCheckResult.deep
            });
        }
        return this.objectStorageProvider.findOneAndUpdate({ _id: oldObjectStorageInfo.objectId }, model, { new: true }).then((newObjectStorage) => {
            this.bucketService.replaceStorageObjectEventHandle(newObjectStorage, oldObjectStorageInfo);
            return newObjectStorage;
        });
    }
    /**
     * 创建用户节点数据
     * @param objectStorageInfo
     * @param options
     */
    async createOrUpdateUserNodeObject(objectStorageInfo, options) {
        const model = {
            sha1: options.fileStorageInfo.sha1,
            objectName: `${options.nodeInfo.nodeDomain}.ncfg`,
            bucketId: objectStorageInfo?.bucketId,
            bucketName: objectStorageInfo?.bucketName,
            userId: options.userId,
            resourceType: ['node-config'],
            systemProperty: options.fileStorageInfo.metaInfo
        };
        if (!options.fileStorageInfo.metaInfo) {
            model.systemProperty = { fileSize: options.fileStorageInfo.fileSize };
        }
        if (!objectStorageInfo) {
            const bucketInfo = await this.bucketService.createOrFindSystemBucket({
                bucketName: bucket_interface_1.SystemBucketName.UserNodeData,
                bucketType: bucket_interface_1.BucketTypeEnum.SystemStorage,
                userId: options.userId
            });
            model.bucketId = bucketInfo.bucketId;
            model.bucketName = bucketInfo.bucketName;
            // 此处没有使用bucketName,因为所有用户的用户节点数据bucketName都是.UserNodeData
            model.uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketInfo.bucketId, model.objectName);
            return this.objectStorageProvider.create(model).then(object => {
                this.bucketService.addStorageObjectEventHandle(object);
                return object;
            });
        }
        return this.objectStorageProvider.findOneAndUpdate({ _id: objectStorageInfo.objectId }, model, { new: true }).then(newObjectStorageInfo => {
            this.bucketService.replaceStorageObjectEventHandle(newObjectStorageInfo, objectStorageInfo);
            return newObjectStorageInfo;
        });
    }
    /**
     * 更新用户存储数据
     * @param oldObjectStorageInfo
     * @param options
     */
    async updateObject(oldObjectStorageInfo, options) {
        const updateInfo = {};
        if (lodash_1.isArray(options.customPropertyDescriptors)) {
            updateInfo.customPropertyDescriptors = options.customPropertyDescriptors;
        }
        if (lodash_1.isString(options.objectName)) {
            updateInfo.objectName = options.objectName;
            updateInfo.uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(oldObjectStorageInfo.bucketName, options.objectName);
        }
        if (lodash_1.isArray(options.dependencies)) {
            await this._checkDependencyInfo(options.dependencies);
            updateInfo.dependencies = options.dependencies;
        }
        if (lodash_1.isString(options.objectName) || lodash_1.isArray(options.dependencies)) {
            const objectFullName = `${oldObjectStorageInfo.bucketName}/${updateInfo.objectName ?? oldObjectStorageInfo.objectName}`;
            const cycleDependCheckResult = await this.cycleDependCheck(objectFullName, updateInfo.dependencies ?? oldObjectStorageInfo.dependencies, 1);
            if (cycleDependCheckResult.ret) {
                throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('object-circular-dependency-error'), {
                    objectName: objectFullName,
                    deep: cycleDependCheckResult.deep
                });
            }
        }
        if (lodash_1.isString(options.objectName) && !updateInfo.systemProperty) {
            updateInfo.systemProperty = oldObjectStorageInfo.systemProperty;
            updateInfo.systemProperty.mime = this.storageCommonGenerator.generateMimeType(options.objectName);
        }
        if (lodash_1.isEmpty(Object.keys(updateInfo))) {
            throw new egg_freelog_base_1.ArgumentError('please check args');
        }
        return this.objectStorageProvider.findOneAndUpdate({ _id: oldObjectStorageInfo.objectId }, updateInfo, { new: true });
    }
    /**
     * 根据名称获取bucket
     * @param objectFullNames
     * @param args
     */
    async getObjectListByFullNames(objectFullNames, ...args) {
        if (lodash_1.isEmpty(objectFullNames)) {
            return [];
        }
        const condition = { $or: [] };
        objectFullNames.forEach(fullObjectName => {
            const [bucketName, objectName] = fullObjectName.split('/');
            const uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketName, objectName);
            condition.$or.push({ uniqueKey });
        });
        return this.find(condition, ...args);
    }
    /**
     * 删除存储对象
     * @param objectStorageInfo
     */
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
    /**
     * 批量删除存储对象
     * @param bucketInfo
     * @param objectIds
     */
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
    /**
     * 根据bucketName和objectName查询
     * @param bucketName
     * @param objectName
     * @param args
     */
    async findOneByName(bucketName, objectName, ...args) {
        const uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketName, objectName);
        return this.findOne({ uniqueKey }, ...args);
    }
    /**
     * 通过ID或者名称查找对象
     * @param objectIdOrFullName
     * @param args
     */
    async findOneByObjectIdOrName(objectIdOrFullName, ...args) {
        if (egg_freelog_base_1.CommonRegex.mongoObjectId.test(objectIdOrFullName)) {
            return this.findOne({ _id: objectIdOrFullName }, ...args);
        }
        else if (objectIdOrFullName.includes('/')) {
            const [bucketName, objectName] = objectIdOrFullName.split('/');
            return this.findOneByName(bucketName, objectName, ...args);
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-format-validate-failed', 'objectIdOrName'));
        }
    }
    async findOne(condition, ...args) {
        return this.objectStorageProvider.findOne(condition, ...args);
    }
    async find(condition, ...args) {
        return this.objectStorageProvider.find(condition, ...args);
    }
    async findIntervalList(condition, skip, limit, projection, sort) {
        let dataList = [];
        const totalItem = await this.count(condition);
        if (totalItem > skip) {
            dataList = await this.find(condition, projection.join(' '), {
                limit, skip: skip ?? 0, sort: sort ?? { createDate: -1 },
            });
        }
        return { skip, limit, totalItem, dataList };
    }
    async count(condition) {
        return this.objectStorageProvider.count(condition);
    }
    async findAll(condition, page, pageSize) {
        const pipeline = [
            {
                $match: condition
            },
            {
                $addFields: { bucket_id: { $toObjectId: '$bucketId' } }
            }, {
                $lookup: {
                    from: 'buckets',
                    localField: 'resource_id',
                    foreignField: '_id',
                    as: 'buckets'
                }
            },
            {
                $match: {
                    'buckets.bucketType': 1,
                    'buckets.userId': this.ctx.userId,
                }
            }
        ];
        const countAggregates = pipeline.concat([{ $count: 'totalItem' }]);
        const pageAggregates = pipeline.concat([{
                $skip: (page - 1) * pageSize
            }, {
                $limit: pageSize
            }]);
        const [totalItemInfo] = await this.objectStorageProvider.aggregate(countAggregates);
        const { totalItem = 0 } = totalItemInfo || {};
        const result = { page, pageSize, totalItem, dataList: [] };
        if (totalItem <= (page - 1) * pageSize) {
            return result;
        }
        result.dataList = await this.objectStorageProvider.aggregate(pageAggregates);
        return result;
    }
    /**
     * 获取对象依赖树
     * @param objectStorageInfo
     * @param isContainRootNode
     */
    async getDependencyTree(objectStorageInfo, isContainRootNode) {
        if (!isContainRootNode) {
            return this._buildObjectDependencyTree(objectStorageInfo.dependencies);
        }
        return [{
                type: 'object',
                id: objectStorageInfo.objectId,
                name: `${objectStorageInfo.bucketName}/${objectStorageInfo.objectName}`,
                resourceType: objectStorageInfo.resourceType,
                fileSha1: objectStorageInfo.sha1,
                dependencies: await this._buildObjectDependencyTree(objectStorageInfo.dependencies ?? [])
            }];
    }
    /**
     * 构建存储对象依赖树
     * @param dependencies
     * @private
     */
    async _buildObjectDependencyTree(dependencies) {
        const objectDependencyTrees = [];
        const dependObjects = dependencies.filter(x => x.type === 'object');
        const dependResources = dependencies.filter(x => x.type === 'resource');
        const resourceDependencyTask = dependResources.map(item => this.outsideApiService.getResourceDependencyTree(item.name, {
            isContainRootNode: true,
            versionRange: item.versionRange ?? '*'
        }));
        const objects = await this.getObjectListByFullNames(dependObjects.map(x => x.name));
        for (const objectInfo of objects) {
            objectDependencyTrees.push({
                type: 'object',
                id: objectInfo.objectId,
                name: `${objectInfo.bucketName}/${objectInfo.objectName}`,
                resourceType: objectInfo.resourceType,
                fileSha1: objectInfo.sha1,
                dependencies: await this._buildObjectDependencyTree(objectInfo.dependencies ?? [])
            });
        }
        function autoMappingResourceDependency(resourceDependency) {
            return {
                type: 'resource',
                id: resourceDependency.resourceId,
                name: resourceDependency.resourceName,
                resourceType: resourceDependency.resourceType,
                version: resourceDependency.version,
                versions: resourceDependency.versions,
                versionId: resourceDependency.versionId,
                fileSha1: resourceDependency.fileSha1,
                versionRange: resourceDependency.versionRange,
                dependencies: resourceDependency.dependencies.map(x => autoMappingResourceDependency(x))
            };
        }
        const results = await Promise.all(resourceDependencyTask);
        for (const dependencyTree of results) {
            objectDependencyTrees.push(autoMappingResourceDependency(lodash_1.first(dependencyTree)));
        }
        return objectDependencyTrees;
    }
    /**
     * 检查依赖信息
     * @param dependencies
     */
    async _checkDependencyInfo(dependencies) {
        if (lodash_1.isEmpty(dependencies)) {
            return;
        }
        const dependObjects = dependencies.filter(x => x.type === 'object');
        const dependResources = dependencies.filter(x => x.type === 'resource');
        // 不允许重复依赖
        if (lodash_1.uniqWith(dependencies, (x, y) => x.name === y.name && x.type === y.type).length !== dependencies.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-depend-release-invalid'), dependResources);
        }
        const resourceMap = new Map();
        if (!lodash_1.isEmpty(dependResources)) {
            await this.outsideApiService.getResourceListByNames(dependResources.map(x => x.name), { projection: 'resourceVersions,resourceName' }).then(list => {
                list.forEach(item => resourceMap.set(item.resourceName.toLowerCase(), item));
            });
        }
        const invalidDependResources = dependResources.filter(x => !resourceMap.has(x.name.toLowerCase()));
        if (!lodash_1.isEmpty(invalidDependResources)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-depend-release-invalid'), {
                invalidDependResources, resourceMap
            });
        }
        const invalidResourceVersionRanges = dependResources.filter(x => !resourceMap.get(x.name.toLowerCase()).resourceVersions.some(m => semver_1.satisfies(m.version, x.versionRange ?? '*')));
        if (!lodash_1.isEmpty(invalidResourceVersionRanges)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-depend-release-versionRange-invalid'), { invalidResourceVersionRanges });
        }
        const objectNameAndUserIdMap = new Map();
        if (!lodash_1.isEmpty(dependObjects)) {
            await this.getObjectListByFullNames(dependObjects.map(x => x.name)).then(list => {
                list.forEach(item => objectNameAndUserIdMap.set(`${item.bucketName}/${item.objectName}`, item.userId));
            });
        }
        const invalidDependObjects = dependObjects.filter(x => !objectNameAndUserIdMap.has(x.name) || objectNameAndUserIdMap.get(x.name) !== this.ctx.userId);
        if (invalidDependObjects.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-depend-mock-invalid'), { invalidDependObjects });
        }
    }
    /**
     * 检查循环依赖(新建或者更新名称时,都需要做检查)
     * @param objectName
     * @param dependencies
     * @param deep
     * @private
     */
    async cycleDependCheck(objectName, dependencies, deep) {
        dependencies = dependencies.filter(x => x.type === 'object');
        if (deep > 20) {
            throw new egg_freelog_base_1.ApplicationError('资源嵌套层级超过系统限制');
        }
        if (lodash_1.isEmpty(dependencies)) {
            return { ret: false };
        }
        if (dependencies.some(x => x.name === objectName)) {
            return { ret: true, deep };
        }
        const dependObjects = await this.getObjectListByFullNames(dependencies.map(x => x.name), 'dependencies');
        const dependSubObjects = lodash_1.chain(dependObjects).map(m => m.dependencies ?? []).flattenDeep().value();
        return this.cycleDependCheck(objectName, dependSubObjects, deep + 1);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "ctx", void 0);
__decorate([
    midway_1.config('uploadConfig'),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "uploadConfig", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "storageCommonGenerator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "objectStorageProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "bucketService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "fileStorageService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectStorageService.prototype, "outsideApiService", void 0);
ObjectStorageService = __decorate([
    midway_1.provide('objectStorageService')
], ObjectStorageService);
exports.ObjectStorageService = ObjectStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vYmplY3Qtc3RvcmFnZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFpQztBQUNqQyxtQ0FBK0M7QUFDL0MsdURBQTBHO0FBQzFHLG1DQUFpRjtBQUtqRix1RUFBOEc7QUFTOUcsSUFBYSxvQkFBb0IsR0FBakMsTUFBYSxvQkFBb0I7SUFpQjdCOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQXNCLEVBQUUsT0FBbUM7UUFFMUUsT0FBTyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUU1RSxNQUFNLEtBQUssR0FBc0I7WUFDN0IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSTtZQUNsQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7WUFDOUIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1lBQzdCLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07WUFDekIsY0FBYyxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUTtZQUNoRCxZQUFZLEVBQUUsRUFBRTtZQUNoQixTQUFTLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQztTQUM1RyxDQUFDO1FBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFO1lBQ25DLEtBQUssQ0FBQyxjQUFjLEdBQUcsRUFBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUMsQ0FBQztTQUN2RTtRQUNELE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pHLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUM5RCxJQUFJLENBQUMsYUFBYSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN0RCxPQUFPLFVBQVUsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztTQUNOO1FBRUQsS0FBSyxDQUFDLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDO1FBQzdELEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxvQkFBb0IsQ0FBQyx5QkFBeUIsSUFBSSxFQUFFLENBQUM7UUFDdkYsNkRBQTZEO1FBQzdELDZKQUE2SjtRQUM3SiwrQkFBK0I7UUFDL0IsK0JBQStCO1FBQy9CLDRDQUE0QztRQUM1QyxNQUFNO1FBRU4sTUFBTSxzQkFBc0IsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0gsSUFBSSxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7WUFDNUIsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLEVBQUU7Z0JBQzdFLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxJQUFJO2FBQ2xFLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxHQUFHLEVBQUUsb0JBQW9CLENBQUMsUUFBUSxFQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsRUFBRTtZQUNuSSxJQUFJLENBQUMsYUFBYSxDQUFDLCtCQUErQixDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDM0YsT0FBTyxnQkFBZ0IsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLDRCQUE0QixDQUFDLGlCQUFvQyxFQUFFLE9BQXdDO1FBRTdHLE1BQU0sS0FBSyxHQUFzQjtZQUM3QixJQUFJLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJO1lBQ2xDLFVBQVUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxPQUFPO1lBQ2pELFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxRQUFRO1lBQ3JDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxVQUFVO1lBQ3pDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtZQUN0QixZQUFZLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDN0IsY0FBYyxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUTtTQUNuRCxDQUFDO1FBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFO1lBQ25DLEtBQUssQ0FBQyxjQUFjLEdBQUcsRUFBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUMsQ0FBQztTQUN2RTtRQUNELElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUNwQixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUM7Z0JBQ2pFLFVBQVUsRUFBRSxtQ0FBZ0IsQ0FBQyxZQUFZO2dCQUN6QyxVQUFVLEVBQUUsaUNBQWMsQ0FBQyxhQUFhO2dCQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07YUFDekIsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1lBQ3JDLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztZQUN6QywwREFBMEQ7WUFDMUQsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFN0csT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkQsT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUVELE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLEVBQUMsR0FBRyxFQUFFLGlCQUFpQixDQUFDLFFBQVEsRUFBQyxFQUFFLEtBQUssRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1lBQ2xJLElBQUksQ0FBQyxhQUFhLENBQUMsK0JBQStCLENBQUMsb0JBQW9CLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUM1RixPQUFPLG9CQUFvQixDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLG9CQUF1QyxFQUFFLE9BQW1DO1FBRTNGLE1BQU0sVUFBVSxHQUFRLEVBQUUsQ0FBQztRQUMzQixJQUFJLGdCQUFPLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLEVBQUU7WUFDNUMsVUFBVSxDQUFDLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQztTQUM1RTtRQUNELElBQUksaUJBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsVUFBVSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQzNDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbkk7UUFDRCxJQUFJLGdCQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0RCxVQUFVLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7U0FDbEQ7UUFDRCxJQUFJLGlCQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLGdCQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQy9ELE1BQU0sY0FBYyxHQUFHLEdBQUcsb0JBQW9CLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxVQUFVLElBQUksb0JBQW9CLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEgsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLFlBQVksSUFBSSxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUksSUFBSSxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQzVCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFO29CQUM3RSxVQUFVLEVBQUUsY0FBYztvQkFDMUIsSUFBSSxFQUFFLHNCQUFzQixDQUFDLElBQUk7aUJBQ3BDLENBQUMsQ0FBQzthQUNOO1NBQ0o7UUFDRCxJQUFJLGlCQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRTtZQUM1RCxVQUFVLENBQUMsY0FBYyxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQztZQUNoRSxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3JHO1FBQ0QsSUFBSSxnQkFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRTtZQUNsQyxNQUFNLElBQUksZ0NBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxHQUFHLEVBQUUsb0JBQW9CLENBQUMsUUFBUSxFQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDdEgsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsd0JBQXdCLENBQUMsZUFBeUIsRUFBRSxHQUFHLElBQUk7UUFFN0QsSUFBSSxnQkFBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQzFCLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFDRCxNQUFNLFNBQVMsR0FBRyxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUMsQ0FBQztRQUM1QixlQUFlLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3JDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsdUJBQXVCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlGLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxpQkFBb0M7UUFDbkQsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDO1lBQ3hDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRO1lBQ3BDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxVQUFVO1NBQzNDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDWCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsOEJBQThCLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUN4RTtZQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFVBQXNCLEVBQUUsU0FBbUI7UUFDaEUsTUFBTSxTQUFTLEdBQUc7WUFDZCxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsU0FBUyxFQUFDO1NBQ3ZELENBQUM7UUFDRixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHlCQUF5QixDQUFDLENBQUM7UUFDaEcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDckIsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hFLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQ0FBbUMsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxjQUFLLENBQUMsV0FBVyxFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQzthQUN6STtZQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBa0IsRUFBRSxVQUFrQixFQUFFLEdBQUcsSUFBSTtRQUMvRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsdUJBQXVCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlGLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFNBQVMsRUFBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsdUJBQXVCLENBQUMsa0JBQTBCLEVBQUUsR0FBRyxJQUFJO1FBQzdELElBQUksOEJBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7WUFDcEQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUMzRDthQUFNLElBQUksa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3pDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9ELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDOUQ7YUFBTTtZQUNILE1BQU0sSUFBSSxnQ0FBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztTQUNoRztJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWlCLEVBQUUsR0FBRyxJQUFJO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtRQUNqQyxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLElBQVksRUFBRSxLQUFhLEVBQUUsVUFBb0IsRUFBRSxJQUFhO1FBQ3RHLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNsQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsSUFBSSxTQUFTLEdBQUcsSUFBSSxFQUFFO1lBQ2xCLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3hELEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFDO2FBQ3pELENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQWlCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpQixFQUFFLElBQVksRUFBRSxRQUFnQjtRQUUzRCxNQUFNLFFBQVEsR0FBUTtZQUNsQjtnQkFDSSxNQUFNLEVBQUUsU0FBUzthQUNwQjtZQUNEO2dCQUNJLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUMsRUFBQzthQUN0RCxFQUFFO2dCQUNDLE9BQU8sRUFBRTtvQkFDTCxJQUFJLEVBQUUsU0FBUztvQkFDZixVQUFVLEVBQUUsYUFBYTtvQkFDekIsWUFBWSxFQUFFLEtBQUs7b0JBQ25CLEVBQUUsRUFBRSxTQUFTO2lCQUNoQjthQUNKO1lBQ0Q7Z0JBQ0ksTUFBTSxFQUFFO29CQUNKLG9CQUFvQixFQUFFLENBQUM7b0JBQ3ZCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTTtpQkFDcEM7YUFDSjtTQUNKLENBQUM7UUFFRixNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEMsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVE7YUFDL0IsRUFBRTtnQkFDQyxNQUFNLEVBQUUsUUFBUTthQUNuQixDQUFDLENBQUMsQ0FBQztRQUNKLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDcEYsTUFBTSxFQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUMsR0FBRyxhQUFhLElBQUksRUFBRSxDQUFDO1FBQzVDLE1BQU0sTUFBTSxHQUFHLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBQyxDQUFDO1FBQ3pELElBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRTtZQUNwQyxPQUFPLE1BQU0sQ0FBQztTQUNqQjtRQUNELE1BQU0sQ0FBQyxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdFLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGlCQUFpQixDQUFDLGlCQUFvQyxFQUFFLGlCQUEwQjtRQUNwRixJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDcEIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDMUU7UUFDRCxPQUFPLENBQUM7Z0JBQ0osSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsRUFBRSxFQUFFLGlCQUFpQixDQUFDLFFBQVE7Z0JBQzlCLElBQUksRUFBRSxHQUFHLGlCQUFpQixDQUFDLFVBQVUsSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZFLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxZQUFZO2dCQUM1QyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtnQkFDaEMsWUFBWSxFQUFFLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLGlCQUFpQixDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7YUFDNUYsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsMEJBQTBCLENBQUMsWUFBb0M7UUFFakUsTUFBTSxxQkFBcUIsR0FBcUMsRUFBRSxDQUFDO1FBQ25FLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sZUFBZSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1FBRXhFLE1BQU0sc0JBQXNCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ25ILGlCQUFpQixFQUFFLElBQUk7WUFDdkIsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLElBQUksR0FBRztTQUN6QyxDQUFDLENBQUMsQ0FBQztRQUVKLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRixLQUFLLE1BQU0sVUFBVSxJQUFJLE9BQU8sRUFBRTtZQUM5QixxQkFBcUIsQ0FBQyxJQUFJLENBQUM7Z0JBQ3ZCLElBQUksRUFBRSxRQUFRO2dCQUNkLEVBQUUsRUFBRSxVQUFVLENBQUMsUUFBUTtnQkFDdkIsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFO2dCQUN6RCxZQUFZLEVBQUUsVUFBVSxDQUFDLFlBQVk7Z0JBQ3JDLFFBQVEsRUFBRSxVQUFVLENBQUMsSUFBSTtnQkFDekIsWUFBWSxFQUFFLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDO2FBQ3JGLENBQUMsQ0FBQztTQUNOO1FBRUQsU0FBUyw2QkFBNkIsQ0FBQyxrQkFBOEM7WUFDakYsT0FBTztnQkFDSCxJQUFJLEVBQUUsVUFBVTtnQkFDaEIsRUFBRSxFQUFFLGtCQUFrQixDQUFDLFVBQVU7Z0JBQ2pDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxZQUFZO2dCQUNyQyxZQUFZLEVBQUUsa0JBQWtCLENBQUMsWUFBWTtnQkFDN0MsT0FBTyxFQUFFLGtCQUFrQixDQUFDLE9BQU87Z0JBQ25DLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRO2dCQUNyQyxTQUFTLEVBQUUsa0JBQWtCLENBQUMsU0FBUztnQkFDdkMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLFFBQVE7Z0JBQ3JDLFlBQVksRUFBRSxrQkFBa0IsQ0FBQyxZQUFZO2dCQUM3QyxZQUFZLEVBQUUsa0JBQWtCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNGLENBQUM7UUFDTixDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDMUQsS0FBSyxNQUFNLGNBQWMsSUFBSSxPQUFPLEVBQUU7WUFDbEMscUJBQXFCLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLGNBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEY7UUFFRCxPQUFPLHFCQUFxQixDQUFDO0lBQ2pDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsb0JBQW9CLENBQUMsWUFBb0M7UUFFM0QsSUFBSSxnQkFBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3ZCLE9BQU87U0FDVjtRQUVELE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sZUFBZSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1FBRXhFLFVBQVU7UUFDVixJQUFJLGlCQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxZQUFZLENBQUMsTUFBTSxFQUFFO1lBQ3pHLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1NBQ3BHO1FBRUQsTUFBTSxXQUFXLEdBQThCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDekQsSUFBSSxDQUFDLGdCQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDM0IsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFDLFVBQVUsRUFBRSwrQkFBK0IsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3SSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakYsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUNELE1BQU0sc0JBQXNCLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuRyxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFO2dCQUM1RSxzQkFBc0IsRUFBRSxXQUFXO2FBQ3RDLENBQUMsQ0FBQztTQUNOO1FBQ0QsTUFBTSw0QkFBNEIsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQkFBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakwsSUFBSSxDQUFDLGdCQUFPLENBQUMsNEJBQTRCLENBQUMsRUFBRTtZQUN4QyxNQUFNLElBQUksbUNBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsOENBQThDLENBQUMsRUFBRSxFQUFDLDRCQUE0QixFQUFDLENBQUMsQ0FBQztTQUNoSTtRQUVELE1BQU0sc0JBQXNCLEdBQXdCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDOUQsSUFBSSxDQUFDLGdCQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDekIsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzNHLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFDRCxNQUFNLG9CQUFvQixHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RKLElBQUksb0JBQW9CLENBQUMsTUFBTSxFQUFFO1lBQzdCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFLEVBQUMsb0JBQW9CLEVBQUMsQ0FBQyxDQUFDO1NBQ3hHO0lBQ0wsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFrQixFQUFFLFlBQW9DLEVBQUUsSUFBWTtRQUV6RixZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUM7UUFDN0QsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFO1lBQ1gsTUFBTSxJQUFJLG1DQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxnQkFBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDdkI7UUFDRCxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxFQUFFO1lBQy9DLE9BQU8sRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDO1NBQzVCO1FBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN6RyxNQUFNLGdCQUFnQixHQUFHLGNBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRW5HLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQztDQUNKLENBQUE7QUFuYkc7SUFEQyxlQUFNLEVBQUU7O2lEQUNXO0FBRXBCO0lBREMsZUFBTSxDQUFDLGNBQWMsQ0FBQzs7MERBQ1Y7QUFFYjtJQURDLGVBQU0sRUFBRTs7b0VBQ2M7QUFFdkI7SUFEQyxlQUFNLEVBQUU7O21FQUNhO0FBRXRCO0lBREMsZUFBTSxFQUFFOzsyREFDcUI7QUFFOUI7SUFEQyxlQUFNLEVBQUU7O2dFQUMrQjtBQUV4QztJQURDLGVBQU0sRUFBRTs7K0RBQzZCO0FBZjdCLG9CQUFvQjtJQURoQyxnQkFBTyxDQUFDLHNCQUFzQixDQUFDO0dBQ25CLG9CQUFvQixDQXNiaEM7QUF0Ylksb0RBQW9CIn0=