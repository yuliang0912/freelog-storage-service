import {satisfies} from 'semver';
import {provide, config, inject} from 'midway';
import {ApplicationError, ArgumentError, CommonRegex, FreelogContext, PageResult} from 'egg-freelog-base';
import {isEmpty, uniqWith, isArray, sumBy, isString, first, chain} from 'lodash';
import {
    IObjectStorageService, ObjectStorageInfo, CreateObjectStorageOptions,
    CreateUserNodeDataObjectOptions, ObjectDependencyInfo, UpdateObjectStorageOptions, CommonObjectDependencyTreeInfo
} from '../../interface/object-storage-interface';
import {IBucketService, BucketInfo, BucketTypeEnum, SystemBucketName} from '../../interface/bucket-interface';
import {IFileStorageService} from '../../interface/file-storage-info-interface';
import {
    IOutsideApiService,
    ResourceDependencyTreeInfo,
    ResourceInfo
} from '../../interface/common-interface';

@provide('objectStorageService')
export class ObjectStorageService implements IObjectStorageService {

    @inject()
    ctx: FreelogContext;
    @config('uploadConfig')
    uploadConfig;
    @inject()
    storageCommonGenerator;
    @inject()
    objectStorageProvider;
    @inject()
    bucketService: IBucketService;
    @inject()
    fileStorageService: IFileStorageService;
    @inject()
    outsideApiService: IOutsideApiService;

    /**
     * 创建存储对象(存在时,则替换)
     * @param bucketInfo
     * @param options
     */
    async createObject(bucketInfo: BucketInfo, options: CreateObjectStorageOptions): Promise<ObjectStorageInfo> {

        options.objectName = options.objectName.replace(/[\\|\/:*?"<>\s@$#]/g, '_');

        const model: ObjectStorageInfo = {
            sha1: options.fileStorageInfo.sha1,
            objectName: options.objectName,
            bucketId: bucketInfo.bucketId,
            bucketName: bucketInfo.bucketName,
            userId: bucketInfo.userId,
            systemProperty: options.fileStorageInfo.metaInfo,
            resourceType: [],
            uniqueKey: this.storageCommonGenerator.generateObjectUniqueKey(bucketInfo.bucketName, options.objectName)
        };
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
            throw new ApplicationError(this.ctx.gettext('object-circular-dependency-error'), {
                objectName: model.objectName, deep: cycleDependCheckResult.deep
            });
        }
        return this.objectStorageProvider.findOneAndUpdate({_id: oldObjectStorageInfo.objectId}, model, {new: true}).then((newObjectStorage) => {
            this.bucketService.replaceStorageObjectEventHandle(newObjectStorage, oldObjectStorageInfo);
            return newObjectStorage;
        });
    }

    /**
     * 创建用户节点数据
     * @param objectStorageInfo
     * @param options
     */
    async createOrUpdateUserNodeObject(objectStorageInfo: ObjectStorageInfo, options: CreateUserNodeDataObjectOptions): Promise<ObjectStorageInfo> {

        const model: ObjectStorageInfo = {
            sha1: options.fileStorageInfo.sha1,
            objectName: `${options.nodeInfo.nodeDomain}.ncfg`,
            bucketId: objectStorageInfo?.bucketId,
            bucketName: objectStorageInfo?.bucketName,
            userId: options.userId,
            resourceType: ['node-config'],
            systemProperty: options.fileStorageInfo.metaInfo
        };

        if (!objectStorageInfo) {
            const bucketInfo = await this.bucketService.createOrFindSystemBucket({
                bucketName: SystemBucketName.UserNodeData,
                bucketType: BucketTypeEnum.SystemStorage,
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

        return this.objectStorageProvider.findOneAndUpdate({_id: objectStorageInfo.objectId}, model, {new: true}).then(newObjectStorageInfo => {
            this.bucketService.replaceStorageObjectEventHandle(newObjectStorageInfo, objectStorageInfo);
            return newObjectStorageInfo;
        });
    }

    /**
     * 更新用户存储数据
     * @param oldObjectStorageInfo
     * @param options
     */
    async updateObject(oldObjectStorageInfo: ObjectStorageInfo, options: UpdateObjectStorageOptions): Promise<ObjectStorageInfo> {

        const updateInfo: any = {};
        if (isArray(options.customPropertyDescriptors)) {
            updateInfo.customPropertyDescriptors = options.customPropertyDescriptors;
        }
        if (isString(options.objectName)) {
            updateInfo.objectName = options.objectName;
            updateInfo.uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(oldObjectStorageInfo.bucketName, options.objectName);
        }
        if (isArray(options.dependencies)) {
            await this._checkDependencyInfo(options.dependencies);
            updateInfo.dependencies = options.dependencies;
        }
        if (isString(options.objectName) || isArray(options.dependencies)) {
            const objectFullName = `${oldObjectStorageInfo.bucketName}/${updateInfo.objectName ?? oldObjectStorageInfo.objectName}`;
            const cycleDependCheckResult = await this.cycleDependCheck(objectFullName, updateInfo.dependencies ?? oldObjectStorageInfo.dependencies, 1);
            if (cycleDependCheckResult.ret) {
                throw new ApplicationError(this.ctx.gettext('object-circular-dependency-error'), {
                    objectName: objectFullName,
                    deep: cycleDependCheckResult.deep
                });
            }
        }
        if (isString(options.objectName) && !updateInfo.systemProperty) {
            updateInfo.systemProperty = oldObjectStorageInfo.systemProperty;
            updateInfo.systemProperty.mime = this.storageCommonGenerator.generateMimeType(options.objectName);
        }
        if (isEmpty(Object.keys(updateInfo))) {
            throw new ArgumentError('please check args');
        }
        return this.objectStorageProvider.findOneAndUpdate({_id: oldObjectStorageInfo.objectId}, updateInfo, {new: true});
    }

    /**
     * 根据名称获取bucket
     * @param objectFullNames
     * @param args
     */
    async getObjectListByFullNames(objectFullNames: string[], ...args): Promise<ObjectStorageInfo[]> {

        if (isEmpty(objectFullNames)) {
            return [];
        }
        const condition = {$or: []};
        objectFullNames.forEach(fullObjectName => {
            const [bucketName, objectName] = fullObjectName.split('/');
            const uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketName, objectName);
            condition.$or.push({uniqueKey});
        });

        return this.find(condition, ...args);
    }

    /**
     * 删除存储对象
     * @param objectStorageInfo
     */
    async deleteObject(objectStorageInfo: ObjectStorageInfo): Promise<boolean> {
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
    async batchDeleteObjects(bucketInfo: BucketInfo, objectIds: string[]): Promise<boolean> {
        const condition = {
            bucketId: bucketInfo.bucketId, _id: {$in: objectIds}
        };
        const objectInfos = await this.objectStorageProvider.find(condition, 'systemProperty.fileSize');
        if (!objectInfos.length) {
            return false;
        }
        return this.objectStorageProvider.deleteMany(condition).then(data => {
            if (data.deletedCount) {
                this.bucketService.batchDeleteStorageObjectEventHandle(bucketInfo, objectInfos.length, sumBy(objectInfos, 'systemProperty.fileSize'));
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
    async findOneByName(bucketName: string, objectName: string, ...args): Promise<ObjectStorageInfo> {
        const uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketName, objectName);
        return this.findOne({uniqueKey}, ...args);
    }

    /**
     * 通过ID或者名称查找对象
     * @param objectIdOrFullName
     * @param args
     */
    async findOneByObjectIdOrName(objectIdOrFullName: string, ...args): Promise<ObjectStorageInfo> {
        if (CommonRegex.mongoObjectId.test(objectIdOrFullName)) {
            return this.findOne({_id: objectIdOrFullName}, ...args);
        } else if (objectIdOrFullName.includes('/')) {
            const [bucketName, objectName] = objectIdOrFullName.split('/');
            return this.findOneByName(bucketName, objectName, ...args);
        } else {
            throw new ArgumentError(this.ctx.gettext('params-format-validate-failed', 'objectIdOrName'));
        }
    }

    async findOne(condition: object, ...args): Promise<ObjectStorageInfo> {
        return this.objectStorageProvider.findOne(condition, ...args);
    }

    async find(condition: object, ...args): Promise<ObjectStorageInfo[]> {
        return this.objectStorageProvider.find(condition, ...args);
    }

    async findIntervalList(condition: object, skip: number, limit: number, projection: string[], sort?: object): Promise<PageResult<ObjectStorageInfo>> {
        let dataList = [];
        const totalItem = await this.count(condition);
        if (totalItem > skip) {
            dataList = await this.find(condition, projection.join(' '), {
                limit, skip: skip ?? 0, sort: sort ?? {createDate: -1},
            });
        }
        return {skip, limit, totalItem, dataList};
    }

    async count(condition: object): Promise<number> {
        return this.objectStorageProvider.count(condition);
    }

    async findAll(condition: object, page: number, pageSize: number) {

        const pipeline: any = [
            {
                $match: condition
            },
            {
                $addFields: {bucket_id: {$toObjectId: '$bucketId'}}
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

        const countAggregates = pipeline.concat([{$count: 'totalItem'}]);
        const pageAggregates = pipeline.concat([{
            $skip: (page - 1) * pageSize
        }, {
            $limit: pageSize
        }]);
        const [totalItemInfo] = await this.objectStorageProvider.aggregate(countAggregates);
        const {totalItem = 0} = totalItemInfo || {};
        const result = {page, pageSize, totalItem, dataList: []};
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
    async getDependencyTree(objectStorageInfo: ObjectStorageInfo, isContainRootNode: boolean): Promise<CommonObjectDependencyTreeInfo[]> {
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
    async _buildObjectDependencyTree(dependencies: ObjectDependencyInfo[]): Promise<CommonObjectDependencyTreeInfo[]> {

        const objectDependencyTrees: CommonObjectDependencyTreeInfo[] = [];
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

        function autoMappingResourceDependency(resourceDependency: ResourceDependencyTreeInfo): CommonObjectDependencyTreeInfo {
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
            objectDependencyTrees.push(autoMappingResourceDependency(first(dependencyTree)));
        }

        return objectDependencyTrees;
    }

    /**
     * 检查依赖信息
     * @param dependencies
     */
    async _checkDependencyInfo(dependencies: ObjectDependencyInfo[]) {

        if (isEmpty(dependencies)) {
            return;
        }

        const dependObjects = dependencies.filter(x => x.type === 'object');
        const dependResources = dependencies.filter(x => x.type === 'resource');

        // 不允许重复依赖
        if (uniqWith(dependencies, (x, y) => x.name === y.name && x.type === y.type).length !== dependencies.length) {
            throw new ApplicationError(this.ctx.gettext('resource-depend-release-invalid'), dependResources);
        }

        const resourceMap: Map<string, ResourceInfo> = new Map();
        if (!isEmpty(dependResources)) {
            await this.outsideApiService.getResourceListByNames(dependResources.map(x => x.name), {projection: 'resourceVersions,resourceName'}).then(list => {
                list.forEach(item => resourceMap.set(item.resourceName.toLowerCase(), item));
            });
        }
        const invalidDependResources = dependResources.filter(x => !resourceMap.has(x.name.toLowerCase()));
        if (!isEmpty(invalidDependResources)) {
            throw new ApplicationError(this.ctx.gettext('resource-depend-release-invalid'), {
                invalidDependResources, resourceMap
            });
        }
        const invalidResourceVersionRanges = dependResources.filter(x => !resourceMap.get(x.name.toLowerCase()).resourceVersions.some(m => satisfies(m.version, x.versionRange ?? '*')));
        if (!isEmpty(invalidResourceVersionRanges)) {
            throw new ApplicationError(this.ctx.gettext('resource-depend-release-versionRange-invalid'), {invalidResourceVersionRanges});
        }

        const objectNameAndUserIdMap: Map<string, number> = new Map();
        if (!isEmpty(dependObjects)) {
            await this.getObjectListByFullNames(dependObjects.map(x => x.name)).then(list => {
                list.forEach(item => objectNameAndUserIdMap.set(`${item.bucketName}/${item.objectName}`, item.userId));
            });
        }
        const invalidDependObjects = dependObjects.filter(x => !objectNameAndUserIdMap.has(x.name) || objectNameAndUserIdMap.get(x.name) !== this.ctx.userId);
        if (invalidDependObjects.length) {
            throw new ApplicationError(this.ctx.gettext('resource-depend-mock-invalid'), {invalidDependObjects});
        }
    }

    /**
     * 检查循环依赖(新建或者更新名称时,都需要做检查)
     * @param objectName
     * @param dependencies
     * @param deep
     * @private
     */
    async cycleDependCheck(objectName: string, dependencies: ObjectDependencyInfo[], deep: number): Promise<{ ret: boolean, deep?: number }> {

        dependencies = dependencies.filter(x => x.type === 'object');
        if (deep > 20) {
            throw new ApplicationError('资源嵌套层级超过系统限制');
        }
        if (isEmpty(dependencies)) {
            return {ret: false};
        }
        if (dependencies.some(x => x.name === objectName)) {
            return {ret: true, deep};
        }

        const dependObjects = await this.getObjectListByFullNames(dependencies.map(x => x.name), 'dependencies');
        const dependSubObjects = chain(dependObjects).map(m => m.dependencies ?? []).flattenDeep().value();

        return this.cycleDependCheck(objectName, dependSubObjects, deep + 1);
    }
}
