import {provide, inject} from 'midway';
import {IBucketService, BucketInfo, BucketTypeEnum} from '../../interface/bucket-interface';
import {ApplicationError, ArgumentError, FreelogContext, IMongodbOperation} from 'egg-freelog-base';
import {ObjectStorageInfo} from '../../interface/object-storage-interface';

@provide('bucketService')
export class BucketService implements IBucketService {

    @inject()
    ctx: FreelogContext;
    @inject()
    bucketProvider: IMongodbOperation<BucketInfo>;
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
            throw new ApplicationError(this.ctx.gettext('bucket-create-count-limit-validate-failed', this.bucketCreatedLimitCount.toString()));
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

        const userId = this.ctx.userId;
        const bucketInfo: BucketInfo = await this.bucketProvider.findOne({bucketName, userId});

        this.ctx.entityNullValueAndUserAuthorizationCheck(bucketInfo, {
            msg: this.ctx.gettext('params-validate-failed', 'bucketName'),
            data: {bucketName}
        });

        if (bucketInfo.totalFileSize > 0) {
            throw new ApplicationError(this.ctx.gettext('bucket-delete-validate-error'));
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
     * bucket使用数据统计
     * @param {number} userId
     * @returns {Promise<any>}
     */
    async spaceStatistics(userId: number): Promise<{ storageLimit: number, bucketCount: number, totalFileSize: number }> {
        const storageLimit = 5368709120; // 目前限制为5G
        const [statisticsInfo] = await this.bucketProvider.aggregate([{
            $match: {userId, bucketType: BucketTypeEnum.UserStorage}
        }, {
            $group: {_id: '$userId', totalFileSize: {$sum: '$totalFileSize'}, bucketCount: {$sum: 1}}
        }]);
        if (!statisticsInfo) {
            return {storageLimit, bucketCount: 0, totalFileSize: 0};
        }
        return {
            storageLimit,
            bucketCount: statisticsInfo['bucketCount'],
            totalFileSize: statisticsInfo['totalFileSize']
        };
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
     * @param newObjectStorageInfo
     * @param oldObjectStorageInfo
     */
    replaceStorageObjectEventHandle(newObjectStorageInfo: ObjectStorageInfo, oldObjectStorageInfo: ObjectStorageInfo): void {
        if (oldObjectStorageInfo.systemProperty.fileSize === newObjectStorageInfo.systemProperty.fileSize) {
            return;
        }
        if (oldObjectStorageInfo.bucketId !== newObjectStorageInfo.bucketId || oldObjectStorageInfo.objectName !== newObjectStorageInfo.objectName) {
            throw new ArgumentError('code logic error');
        }
        this.bucketProvider.updateOne({_id: newObjectStorageInfo.bucketId}, {
            $inc: {
                totalFileSize: newObjectStorageInfo.systemProperty.fileSize - oldObjectStorageInfo.systemProperty.fileSize
            }
        }).then();
    }

    /**
     * bucket新增对象事件处理
     * @param {ObjectStorageInfo} objectStorageInfo
     */
    addStorageObjectEventHandle(objectStorageInfo: ObjectStorageInfo): void {
        this.bucketProvider.updateOne({_id: objectStorageInfo.bucketId}, {
            $inc: {totalFileQuantity: 1, totalFileSize: objectStorageInfo.systemProperty.fileSize}
        }).then();
    }

    /**
     * 删除存储对象,自动移除所占的空间
     * @param {ObjectStorageInfo} objectStorageInfo
     */
    deleteStorageObjectEventHandle(objectStorageInfo: ObjectStorageInfo): void {
        this.bucketProvider.updateOne({_id: objectStorageInfo.bucketId}, {
            $inc: {totalFileQuantity: -1, totalFileSize: -objectStorageInfo.systemProperty.fileSize}
        }).then();
    }

    batchDeleteStorageObjectEventHandle(bucketInfo: BucketInfo, deletedFileQuantity: number, totalFileSize: number) {
        this.bucketProvider.updateOne({_id: bucketInfo.bucketId}, {
            $inc: {totalFileQuantity: -deletedFileQuantity, totalFileSize: -totalFileSize}
        }).then();
    }
}
