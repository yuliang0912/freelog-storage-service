import {provide, inject} from 'midway';
import {IBucketService, BucketInfo} from '../interface/bucket-interface';
import {ApplicationError} from 'egg-freelog-base/error';

@provide('bucketService')
export class BucketService implements IBucketService {

    @inject()
    ctx;
    @inject()
    bucketProvider;
    bucketCreatedLimitCount = 5;

    /**
     * 创建bucket
     * @param {BucketInfo} bucket
     * @returns {Promise<BucketInfo>}
     */
    async createBucket(bucketInfo: BucketInfo): Promise<BucketInfo> {

        const createdBucketCount: number = await this.bucketProvider.count({userId: this.ctx.request.userId});
        if (createdBucketCount >= this.bucketCreatedLimitCount) {
            throw new ApplicationError(this.ctx.gettext('bucket-create-count-limit-validate-failed', this.bucketCreatedLimitCount));
        }

        const existBucket: object = await this.bucketProvider.findOne({bucketName: bucketInfo.bucketName});
        if (existBucket) {
            throw new ApplicationError(this.ctx.gettext('bucket-name-create-duplicate-error'));
        }

        return this.bucketProvider.create(bucketInfo);
    }

    /**
     * 删除bucket
     * @param bucketName
     * @returns {Promise<boolean>}
     */
    async deleteBucket(bucketName: string): Promise<boolean> {

        const bucketInfo: BucketInfo = await this.bucketProvider.findOne({bucketName});

        this.ctx.entityNullValueAndUserAuthorizationCheck(bucketInfo, {
            msg: this.ctx.gettext('params-validate-failed', 'bucketName'),
            data: {bucketName}
        });

        if (bucketInfo.totalFileQuantity > 0) {
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
}
