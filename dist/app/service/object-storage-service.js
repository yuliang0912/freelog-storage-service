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
            resourceType: '',
            uniqueKey: this.storageCommonGenerator.generateObjectUniqueKey(bucketInfo.bucketName, options.objectName)
        };
        const oldObjectStorageInfo = await this.findOneByName(bucketInfo.bucketName, options.objectName);
        if (!oldObjectStorageInfo) {
            model.systemProperty = await this._buildObjectSystemProperty(options.fileStorageInfo, options.objectName, model.resourceType);
            return this.objectStorageProvider.create(model).then(objectInfo => {
                this.bucketService.addStorageObjectEventHandle(model);
                return objectInfo;
            });
        }
        // 替换对象时,如果没有资源类型,或者新资源检测通过,则保留依赖和自定义属性,否则就清空自定义属性以及依赖信息和资源类型
        model.dependencies = oldObjectStorageInfo.dependencies ?? [];
        model.customPropertyDescriptors = oldObjectStorageInfo.customPropertyDescriptors ?? [];
        model.systemProperty = await this._buildObjectSystemProperty(options.fileStorageInfo, options.objectName, oldObjectStorageInfo.resourceType, function () {
            model.resourceType = '';
            model.dependencies = [];
            model.customPropertyDescriptors = [];
        });
        const cycleDependCheckResult = await this._cycleDependCheck(`${model.bucketName}/${model.objectName}`, model.dependencies, 1);
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
            resourceType: 'node-config'
        };
        model.systemProperty = await this._buildObjectSystemProperty(options.fileStorageInfo, model.objectName, model.resourceType);
        if (!objectStorageInfo) {
            const bucketInfo = await this.bucketService.createOrFindSystemBucket({
                bucketName: bucket_interface_1.SystemBucketName.UserNodeData,
                bucketType: bucket_interface_1.BucketTypeEnum.SystemStorage,
                userId: options.userId
            });
            model.bucketId = bucketInfo.bucketId;
            model.bucketName = bucketInfo.bucketName;
            model.uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketInfo.bucketName, model.objectName);
            return this.objectStorageProvider.create(model).then(object => {
                this.bucketService.addStorageObjectEventHandle(object);
                return object;
            });
        }
        model.uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(objectStorageInfo.bucketName, model.objectName);
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
        if (lodash_1.isString(options.resourceType)) {
            updateInfo.resourceType = options.resourceType;
            if (options.resourceType !== oldObjectStorageInfo.resourceType && this.fileStorageService.isCanAnalyzeFileProperty(options.resourceType)) {
                const fileStorageInfo = await this.fileStorageService.findBySha1(oldObjectStorageInfo.sha1);
                updateInfo.systemProperty = await this._buildObjectSystemProperty(fileStorageInfo, options.objectName ?? oldObjectStorageInfo.objectName, options.resourceType);
            }
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
            const cycleDependCheckResult = await this._cycleDependCheck(objectFullName, updateInfo.dependencies ?? oldObjectStorageInfo.dependencies, 1);
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
     * 生成存储对象的系统属性
     * @param fileStorageInfo
     * @param objectName
     * @param resourceType
     * @param analyzeFileErrorHandle
     */
    async _buildObjectSystemProperty(fileStorageInfo, objectName, resourceType, analyzeFileErrorHandle) {
        let systemProperty = {
            fileSize: fileStorageInfo.fileSize,
            mime: this.storageCommonGenerator.generateMimeType(objectName)
        };
        if (!this.fileStorageService.isCanAnalyzeFileProperty(resourceType)) {
            return systemProperty;
        }
        const cacheAnalyzeResult = await this.fileStorageService.analyzeFileProperty(fileStorageInfo, resourceType);
        if (cacheAnalyzeResult.status === 1) {
            systemProperty = lodash_1.assign(systemProperty, cacheAnalyzeResult.systemProperty);
        }
        if (cacheAnalyzeResult.status === 2) {
            if (analyzeFileErrorHandle) {
                analyzeFileErrorHandle(cacheAnalyzeResult.error);
            }
            else {
                throw new egg_freelog_base_1.ApplicationError(cacheAnalyzeResult.error);
            }
        }
        return systemProperty;
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
                invalidDependResources,
                resourceMap
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
    async _cycleDependCheck(objectName, dependencies, deep) {
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
        return this._cycleDependCheck(objectName, dependSubObjects, deep + 1);
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
], ObjectStorageService.prototype, "storageCommonGenerator", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vYmplY3Qtc3RvcmFnZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFpQztBQUNqQyxtQ0FBdUQ7QUFDdkQsdURBQTBHO0FBQzFHLG1DQUF5RjtBQUt6Rix1RUFBOEc7QUFTOUcsSUFBYSxvQkFBb0IsR0FBakMsTUFBYSxvQkFBb0I7SUFxQjdCOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQXNCLEVBQUUsT0FBbUM7UUFFMUUsT0FBTyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUU1RSxNQUFNLEtBQUssR0FBc0I7WUFDN0IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSTtZQUNsQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7WUFDOUIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1lBQzdCLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07WUFDekIsWUFBWSxFQUFFLEVBQUU7WUFDaEIsU0FBUyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUM7U0FDNUcsQ0FBQztRQUNGLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pHLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUN2QixLQUFLLENBQUMsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxlQUFl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