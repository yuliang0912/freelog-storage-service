import {inject, controller, get, post, del, provide} from 'midway';
import {IBucketService, BucketInfo, BucketTypeEnum} from '../../interface/bucket-interface';
import {LoginUser} from 'egg-freelog-base';
import {visitorIdentity, InternalClient} from '../extend/vistorIdentityDecorator';

@provide()
@controller('/v1/storages/buckets')
export class BucketController {

    @inject()
    bucketService: IBucketService;

    @get('/')
    @visitorIdentity(LoginUser)
    async index(ctx) {
        await this.bucketService.find({userId: ctx.request.userId}).then(ctx.success);
    }

    @get('/count')
    @visitorIdentity(LoginUser)
    async createdCount(ctx) {
        await this.bucketService.count({userId: ctx.request.userId}).then(ctx.success);
    }

    @post('/')
    @visitorIdentity(LoginUser)
    async create(ctx) {

        // 只允许小写字母、数字、中划线（-），且不能以短横线开头或结尾
        const bucketName: string = ctx.checkBody('bucketName').exist().isBucketName().value;
        const bucketType: number = ctx.checkBody('bucketType').optional().toInt().in([BucketTypeEnum.UserStorage, BucketTypeEnum.SystemStorage]).default(BucketTypeEnum.UserStorage).value;

        ctx.validateParams();

        const bucketInfo: BucketInfo = {
            bucketName, bucketType,
            userId: ctx.request.userId
        };

        await this.bucketService.createBucket(bucketInfo).then(ctx.success);
    }

    @del('/:bucketName')
    @visitorIdentity(LoginUser)
    async destroy(ctx) {

        const bucketName: string = ctx.checkBody('bucketName').exist().isBucketName().value;
        ctx.validateParams();

        await this.bucketService.deleteBucket(bucketName).then(ctx.success);
    }

    @get('/isExist')
    @visitorIdentity(LoginUser | InternalClient)
    async isExistBucketName(ctx) {

        const bucketName = ctx.checkQuery('bucketName').exist().isBucketName().value;
        ctx.validateParams();

        await this.bucketService.count({bucketName}).then(data => ctx.success(Boolean(data)));
    }

    /**
     * 获取bucket详情
     * @param ctx
     * @returns {Promise<void>}
     */
    @get('/:bucketName')
    @visitorIdentity(LoginUser)
    async show(ctx) {

        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        ctx.validateParams();

        await this.bucketService.findOne({bucketName}).then(ctx.success);
    }
}
