import {pick} from 'lodash';
import {provide, config, plugin, inject} from 'midway';
import {
    IStorageObjectService, StorageObject, CreateStorageObjectOptions, CreateUserNodeDataObjectOptions
} from '../interface/storage-object-interface';
import {IBucketService, BucketInfo, BucketTypeEnum, SystemBucketName} from '../interface/bucket-interface';
import {FileStorageInfo} from '../interface/file-storage-info-interface';

@provide('storageObjectService')
export class StorageObjectService implements IStorageObjectService {
    @inject()
    ctx;
    @plugin()
    ossClient;
    @config('uploadConfig')
    uploadConfig;
    @inject()
    bucketService: IBucketService;
    @inject()
    storageObjectProvider;

    /**
     * 创建文件对象
     * @param {BucketInfo} bucketInfo
     * @param {CreateStorageObjectOptions} options
     * @returns {Promise<StorageObject>}
     */
    async createObject(bucketInfo: BucketInfo, options: CreateStorageObjectOptions): Promise<StorageObject> {

        const storageObject: StorageObject = {
            sha1: options.fileStorageInfo.sha1,
            objectName: options.objectName,
            bucketId: bucketInfo.bucketId,
            bucketName: bucketInfo.bucketName,
            resourceType: options.resourceType,
            systemMeta: {
                fileSize: options.fileStorageInfo.fileSize
            }
        };

        const findCondition = pick(storageObject, ['bucketId', 'objectName']);
        const oldStorageObject = await this.storageObjectProvider.findOneAndUpdate(findCondition, storageObject, {new: false});

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
    async createUserNodeObject(options: CreateUserNodeDataObjectOptions): Promise<StorageObject> {

        const bucket: BucketInfo = {
            bucketName: SystemBucketName.UserNodeData,
            bucketType: BucketTypeEnum.SystemStorage,
            userId: options.userId
        };

        const bucketInfo = await this.bucketService.createOrFindSystemBucket(bucket);

        const storageObject: StorageObject = {
            sha1: options.fileStorageInfo.sha1,
            objectName: `${options.nodeInfo.nodeDomain}.ncfg`,
            bucketId: bucketInfo.bucketId,
            bucketName: bucketInfo.bucketName,
            resourceType: 'node-config',
            systemMeta: {
                fileSize: options.fileStorageInfo.fileSize
            }
        };

        const findCondition = pick(storageObject, ['bucketId', 'objectName']);
        const oldStorageObject = await this.storageObjectProvider.findOneAndUpdate(findCondition, storageObject, {new: false});

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
    async updateObject(oldStorageObject: StorageObject, newFileStorageInfo: FileStorageInfo): Promise<StorageObject> {

        const updateStorageObjectInfo = {
            sha1: newFileStorageInfo.sha1,
            systemMeta: {
                fileSize: newFileStorageInfo.fileSize
            }
        };
        const findCondition = pick(oldStorageObject, ['bucketId', 'objectName']);
        const newStorageObject = await this.storageObjectProvider.findOneAndUpdate(findCondition, updateStorageObjectInfo, {new: true});
        this.bucketService.replaceStorageObjectEventHandle(newStorageObject, oldStorageObject);
        return this.storageObjectProvider.findOne(findCondition);
    }

    async deleteObject(storageObject: StorageObject): Promise<boolean> {
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

    async findOne(condition: object): Promise<StorageObject> {
        return this.storageObjectProvider.findOne(condition);
    }

    async find(condition: object): Promise<StorageObject[]> {
        return this.storageObjectProvider.find(condition);
    }

    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<StorageObject[]> {
        return this.storageObjectProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
    }

    async count(condition: object): Promise<number> {
        return this.storageObjectProvider.count(condition);
    }
}
