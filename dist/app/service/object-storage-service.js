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
const common_regex_1 = require("egg-freelog-base/app/extend/helper/common_regex");
let ObjectStorageService = class ObjectStorageService {
    /**
     * 创建存储对象(存在时,则替换)
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
            userId: bucketInfo.userId,
            resourceType: '',
            uniqueKey: this.storageCommonGenerator.generateObjectUniqueKey(bucketInfo.bucketName, options.objectName)
        };
        const oldObjectStorageInfo = await this.findOneByName(bucketInfo.bucketName, options.objectName);
        if (!oldObjectStorageInfo) {
            model.systemProperty = await this._buildObjectSystemProperty(options.fileStorageInfo, '');
            return this.objectStorageProvider.create(model).tap(() => {
                this.bucketService.addStorageObjectEventHandle(model);
            });
        }
        // 替换对象时,如果没有资源类型,或者新资源检测通过,则保留依赖和自定义属性,否则就清空自定义属性以及依赖信息和资源类型
        model.dependencies = oldObjectStorageInfo.dependencies ?? [];
        model.customProperty = oldObjectStorageInfo.customProperty ?? {};
        model.systemProperty = await this._buildObjectSystemProperty(options.fileStorageInfo, oldObjectStorageInfo.resourceType, function (error) {
            model.resourceType = '';
            model.dependencies = [];
            model.customProperty = {};
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
     * @param {CreateUserNodeDataObjectOptions} options
     * @returns {Promise<ObjectStorageInfo>}
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
        model.systemProperty = await this._buildObjectSystemProperty(options.fileStorageInfo, model.resourceType);
        if (!objectStorageInfo) {
            const bucketInfo = await this.bucketService.createOrFindSystemBucket({
                bucketName: bucket_interface_1.SystemBucketName.UserNodeData,
                bucketType: bucket_interface_1.BucketTypeEnum.SystemStorage,
                userId: options.userId
            });
            model.bucketId = bucketInfo.bucketId;
            model.bucketName = bucketInfo.bucketName;
            model.uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketInfo.bucketName, model.objectName);
            return this.objectStorageProvider.create(model).tap((object) => {
                this.bucketService.addStorageObjectEventHandle(object);
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
     * @param {ObjectStorageInfo} oldObjectStorageInfo - 现有的对象存储信息
     * @param {FileStorageInfo} newFileStorageInfo - 新的文件存储信息
     * @returns {Promise<ObjectStorageInfo>}
     */
    async updateObject(oldObjectStorageInfo, options) {
        const updateInfo = {};
        if (lodash_1.isObject(options.customProperty)) {
            updateInfo.customProperty = options.customProperty;
        }
        if (lodash_1.isString(options.resourceType)) {
            updateInfo.resourceType = options.resourceType;
            if (options.resourceType !== oldObjectStorageInfo.resourceType && this.fileStorageService.isCanAnalyzeFileProperty(options.resourceType)) {
                const fileStorageInfo = await this.fileStorageService.findBySha1(oldObjectStorageInfo.sha1);
                updateInfo.systemProperty = await this._buildObjectSystemProperty(fileStorageInfo, options.resourceType);
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
        if (lodash_1.isEmpty(Object.keys(updateInfo))) {
            throw new egg_freelog_base_1.ArgumentError('please check args');
        }
        console.log(updateInfo);
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
        if (common_regex_1.mongoObjectId.test(objectIdOrFullName)) {
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
    async findPageList(condition, page, pageSize, projection, orderBy) {
        return this.objectStorageProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
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
        console.log(JSON.stringify(countAggregates));
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
                dependencies: await this._buildObjectDependencyTree(objectStorageInfo.dependencies ?? [])
            }];
    }
    /**
     * 生成存储对象的系统属性
     * @param fileStorageInfo
     * @param resourceType
     * @private
     */
    async _buildObjectSystemProperty(fileStorageInfo, resourceType, analyzeFileErrorHandle) {
        let systemProperty = { fileSize: fileStorageInfo.fileSize, mime: 'application/octet-stream' };
        if (resourceType === 'node-config') {
            systemProperty.mime = 'application/json';
        }
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
     * @param dependencyInfo
     * @returns {Promise<{releases: Array, mocks: Array}>}
     * @private
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
            await this.outsideApiService.getResourceListByNames(dependResources.map(x => x.name), { projection: 'resourceVersions resourceName' }).then(list => {
                list.forEach(item => resourceMap.set(item.resourceName.toLowerCase(), item));
            });
        }
        const invalidDependResources = dependResources.filter(x => !resourceMap.has(x.name));
        if (!lodash_1.isEmpty(invalidDependResources)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-depend-release-invalid'), { invalidDependResources });
        }
        const invalidResourceVersionRanges = dependResources.filter(x => !resourceMap.get(x.name).resourceVersions.some(m => semver_1.satisfies(m.version, x.versionRange ?? '*')));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vYmplY3Qtc3RvcmFnZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFpQztBQUNqQyxtQ0FBdUQ7QUFDdkQsdURBQWlFO0FBQ2pFLG1DQUFtRztBQUtuRyx1RUFBOEc7QUFHOUcsa0ZBQThFO0FBRzlFLElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBcUI3Qjs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBc0IsRUFBRSxPQUFtQztRQUUxRSxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTVGLE1BQU0sS0FBSyxHQUFzQjtZQUM3QixJQUFJLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJO1lBQ2xDLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTtZQUM5QixRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7WUFDN0IsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO1lBQ2pDLE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTTtZQUN6QixZQUFZLEVBQUUsRUFBRTtZQUNoQixTQUFTLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQztTQUM1RyxDQUFDO1FBQ0YsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakcsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQ3ZCLEtBQUssQ0FBQyxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMs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