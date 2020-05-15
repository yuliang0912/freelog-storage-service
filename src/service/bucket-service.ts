import {provide, inject} from 'midway';
import {IBucketService, BucketInfo, BucketTypeEnum} from '../interface/bucket-interface';
import {ApplicationError, ArgumentError} from 'egg-freelog-base/error';
import {StorageObject} from '../interface/storage-object-interface';

@provide('bucketService')
export class BucketService implements IBucketService {

    @inject()
    ctx;
    @inject()
    bucketProvider;
    bucketCreatedLimitCount = 5;

    /**
     * 用户创建bucket
     * @param {BucketInfo} bucketInfo
     * @returns {Promise<BucketInfo>}
     */
    async createBucket(bucketInfo: BucketInfo): Promise<BucketInfo> {

        if (bucketInfo.bucketType !== BucketTypeEnum.UserStorage) {
            throw new ArgumentError('please check code param:bucketType!');
        }
        const createdBucketCount: number = await this.bucketProvider.count({
            userId: bucketInfo.userId,
            bucketType: BucketTypeEnum.UserStorage
        });
        if (createdBucketCount >= this.bucketCreatedLimitCount) {
            throw new ApplicationError(this.ctx.gettext('bucket-create-count-limit-validate-failed', this.bucketCreatedLimitCount));
        }

        bucketInfo.bucketUniqueKey = BucketService.generateBucketUniqueKey(bucketInfo);
        const existBucket: object = await this.bucketProvider.findOne({bucketUniqueKey: bucketInfo.bucketUniqueKey});
        if (existBucket) {
            throw new ApplicationError(this.ctx.gettext('bucket-name-create-duplicate-error'));
        }

        return this.bucketProvider.create(bucketInfo);
    }

    /**
     * 系统创建bucket
     * @param {BucketInfo} bucketInfo
     * @returns {Promise<BucketInfo>}
     */
    async createOrFindSystemBucket(bucketInfo: BucketInfo): Promise<BucketInfo> {

        if (bucketInfo.bucketType !== BucketTypeEnum.SystemStorage) {
            throw new ArgumentError('please check code param:bucketType!');
        }
        bucketInfo.bucketUniqueKey = BucketService.generateBucketUniqueKey(bucketInfo);
        const existBucket: BucketInfo = await this.bucketProvider.findOne({bucketUniqueKey: bucketInfo.bucketUniqueKey});
        if (existBucket) {
            // throw new ApplicationError(this.ctx.gettext('bucket-name-create-duplicate-error'));
            return existBucket;
        }

        return this.bucketProvider.create(bucketInfo);
    }

    /**
     * 删除bucket
     * @param bucketName
     * @returns {Promise<boolean>}
     */
    async deleteBucket(bucketName: string): Promise<boolean> {

        const userId = this.ctx.request.userId;
        const bucketInfo: BucketInfo = await this.bucketProvider.findOne({bucketName, userId});

        this.ctx.entityNullValueAndUserAuthorizationCheck(bucketInfo, {
            msg: this.ctx.gettext('params-validate-failed', 'bucketName'),
            data: {bucketName}
        });

        if (bucketInfo.totalFileSize > 0) {
            throw new ApplicationError({msg: this.ctx.gettext('bucket-delete-validate-error')});
        }

        return this.bucketProvider.deleteOne({bucketName: bucketInfo.bucketName}).then(data => Boolean(data.n));
    }

    /**
     * 查找单个bucket
     * @param {object} condition
     * @returns {Promise<BucketInfo>}
     */
    async findOne(condition: object): Promise<BucketInfo> {
        return this.bucketProvider.findOne(condition);
    }

    /**
     * 查找多个bucket
     * @param {object} condition
     * @returns {Promise<BucketInfo>}
     */
    async find(condition: object): Promise<BucketInfo[]> {
        return this.bucketProvider.find(condition);
    }

    /**
     * 查找统计数量
     * @param {object} condition
     * @returns {Promise<number>}
     */
    async count(condition: object): Promise<number> {
        return this.bucketProvider.count(condition);
    }

    /**
     * 生成唯一失败符
     * @param {BucketInfo} bucketInfo
     * @returns {string}
     */
    static generateBucketUniqueKey(bucketInfo: BucketInfo) {
        return bucketInfo.bucketType === BucketTypeEnum.UserStorage ? bucketInfo.bucketName : `${bucketInfo.userId}/${bucketInfo.bucketName}`;
    }

    /**
     * bucket中同一个object发生替换.重新计算整个bucket总文件大小
     * @param {StorageObject} newStorageObject
     * @param {StorageObject} oldStorageObject
     */
    replaceStorageObjectEventHandle(newStorageObject: StorageObject, oldStorageObject: StorageObject): void {
        if (oldStorageObject.systemMeta.fileSize === newStorageObject.systemMeta.fileSize) {
            return;
        }
        if (oldStorageObject.bucketId !== newStorageObject.bucketId || oldStorageObject.objectName !== newStorageObject.objectName) {
            throw new ArgumentError('code logic error');
        }
        this.bucketProvider.updateOne({bucketId: newStorageObject.bucketId}, {
            $inc: {
                totalFileSize: newStorageObject.systemMeta.fileSize - oldStorageObject.systemMeta.fileSize
            }
        });
    }

    /**
     * bucket新增文件事件处理
     * @param {StorageObject} storageObject
     */
    addStorageObjectEventHandle(storageObject: StorageObject): void {
        this.bucketProvider.updateOne({bucketId: storageObject.bucketId}, {
            $inc: {totalFileQuantity: 1, totalFileSize: storageObject.systemMeta.fileSize}
        });
    }

    deleteStorageObjectEventHandle(storageObject: StorageObject): void {

    }
}
