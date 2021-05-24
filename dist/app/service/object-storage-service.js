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