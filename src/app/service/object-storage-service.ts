import {pick, assign, isNull, isUndefined, sumBy} from 'lodash';
import {provide, config, plugin, inject} from 'midway';
import {
    IObjectStorageService, ObjectStorageInfo, CreateObjectStorageOptions, CreateUserNodeDataObjectOptions
} from '../../interface/object-storage-interface';
import {IBucketService, BucketInfo, BucketTypeEnum, SystemBucketName} from '../../interface/bucket-interface';
import {FileStorageInfo, IFileStorageService} from '../../interface/file-storage-info-interface';
import {ApplicationError} from 'egg-freelog-base';

@provide('objectStorageService')
export class ObjectStorageService implements IObjectStorageService {
    @inject()
    ctx;
    @plugin()
    ossClient;
    @config('uploadConfig')
    uploadConfig;
    @inject()
    bucketService: IBucketService;
    @inject()
    objectStorageProvider;
    @inject()
    systemAnalysisRecordProvider;
    @inject()
    fileStorageService: IFileStorageService;

    /**
     * 创建文件对象
     * @param {BucketInfo} bucketInfo
     * @param {CreateObjectStorageInfoOptions} options
     * @returns {Promise<ObjectStorageInfo>}
     */
    async createObject(bucketInfo: BucketInfo, options: CreateObjectStorageOptions): Promise<ObjectStorageInfo> {

        options.objectName = options.objectName.replace(/[\\|\/|:|\*|\?|"|<|>|\||\s|@|\$|#]/g, '_');

        const model: ObjectStorageInfo = {
            sha1: options.fileStorageInfo.sha1,
            objectName: options.objectName,
            bucketId: bucketInfo.bucketId,
            bucketName: bucketInfo.bucketName,
            resourceType: isNull(options.resourceType) || isUndefined(options.resourceType) ? '' : options.resourceType
        };
        const findCondition = pick(model, ['bucketId', 'objectName']);
        const oldObjectStorageInfo = await this.objectStorageProvider.findOne(findCondition);
        const isUpdateResourceType = !oldObjectStorageInfo || oldObjectStorageInfo.resourceType !== model.resourceType;

        if (isUpdateResourceType) {
            model.systemProperty = {fileSize: options.fileStorageInfo.fileSize};
        }
        if (isUpdateResourceType && this.fileStorageService.isCanAnalyzeFileProperty(model.resourceType)) {
            const cacheAnalyzeResult = await this.fileStorageService.analyzeFileProperty(options.fileStorageInfo, model.resourceType);
            if (cacheAnalyzeResult.status === 1) {
                model.systemProperty = assign(model.systemProperty, cacheAnalyzeResult.systemProperty);
            }
            if (cacheAnalyzeResult.status === 2) {
                throw new ApplicationError(cacheAnalyzeResult.error);
            }
        }

        if (oldObjectStorageInfo) {
            return this.objectStorageProvider.findOneAndUpdate(findCondition, model, {new: true}).then((object) => {
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
    async createUserNodeObject(options: CreateUserNodeDataObjectOptions): Promise<ObjectStorageInfo> {

        const bucket: BucketInfo = {
            bucketName: SystemBucketName.UserNodeData,
            bucketType: BucketTypeEnum.SystemStorage,
            userId: options.userId
        };

        const bucketInfo = await this.bucketService.createOrFindSystemBucket(bucket);

        const model: ObjectStorageInfo = {
            sha1: options.fileStorageInfo.sha1,
            objectName: `${options.nodeInfo.nodeDomain}.ncfg`,
            bucketId: bucketInfo.bucketId,
            bucketName: bucketInfo.bucketName,
            resourceType: 'node-config',
            systemProperty: {
                fileSize: options.fileStorageInfo.fileSize
            }
        };

        const findCondition = pick(model, ['bucketId', 'objectName']);
        const oldObjectStorageInfo = await this.objectStorageProvider.findOneAndUpdate(findCondition, model, {new: false});

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
    async updateObject(oldObjectStorageInfo: ObjectStorageInfo, newFileStorageInfo: FileStorageInfo): Promise<ObjectStorageInfo> {

        const updateInfo = {
            sha1: newFileStorageInfo.sha1,
            systemProperties: {
                fileSize: newFileStorageInfo.fileSize
            }
        };
        const findCondition = pick(oldObjectStorageInfo, ['bucketId', 'objectName']);
        const newObjectStorageInfo = await this.objectStorageProvider.findOneAndUpdate(findCondition, updateInfo, {new: true});
        this.bucketService.replaceStorageObjectEventHandle(newObjectStorageInfo, oldObjectStorageInfo);
        return this.objectStorageProvider.findOne(findCondition);
    }

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

    async findOne(condition: object): Promise<ObjectStorageInfo> {
        return this.objectStorageProvider.findOne(condition);
    }

    async find(condition: object): Promise<ObjectStorageInfo[]> {
        return this.objectStorageProvider.find(condition);
    }

    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<ObjectStorageInfo[]> {
        return this.objectStorageProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
    }

    async count(condition: object): Promise<number> {
        return this.objectStorageProvider.count(condition);
    }
}
