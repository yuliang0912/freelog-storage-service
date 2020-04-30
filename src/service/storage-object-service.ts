import {pick} from 'lodash';
import {provide, config, plugin, inject} from 'midway';
// import {ApplicationError} from 'egg-freelog-base';
import {IStorageObjectService, StorageObject, CreateStorageObjectOptions} from '../interface/storage-object-interface';
import {IBucketService} from '../interface/bucket-interface';

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
    @inject()
    storageFileCheck;

    /**
     * 创建文件对象
     * @param {UpdateFileOptions} updateFileOptions
     * @returns {Promise<StorageObject>}
     */
    async createObject(options: CreateStorageObjectOptions): Promise<StorageObject> {

        const bucketInfo = await this.bucketService.findOne({bucketName: options.bucketName, userId: options.userId});
        this.ctx.entityNullObjectCheck(bucketInfo, this.ctx.gettext('bucket-entity-not-found'));

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

        const findCondition = pick(storageObject, ['bucketName', 'objectName']);
        const oldStorageObject = await this.storageObjectProvider.findOneAndUpdate(findCondition, storageObject, {new: false})

        if (oldStorageObject) {
            this.bucketService.replaceStorageObjectEventHandle(storageObject, oldStorageObject);
            return this.storageObjectProvider.findOne(findCondition);
        }
        return this.storageObjectProvider.create(storageObject).tap(() => {
            this.bucketService.addStorageObjectEventHandle(storageObject);
        });
    }

    async findOne(condition: object): Promise<StorageObject> {
        return this.storageObjectProvider.findOne(condition);
    }

    async find(condition: object): Promise<StorageObject[]> {
        return this.storageObjectProvider.find(condition);
    }

    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<StorageObject[]> {
        return this.storageObjectProvider.findPageList(condition, page, pageSize, projection.join(''), orderBy);
    }

    async count(condition: object): Promise<number> {
        return this.storageObjectProvider.count(condition);
    }
}
