import {inject, controller, get, post, del, provide} from 'midway';
import {IBucketService, BucketInfo, BucketTypeEnum} from '../../interface/bucket-interface';
import {LoginUser, InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';

@provide()
@controller('/v1/storages/buckets')
export class BucketController {

    @inject()
    bucketService: IBucketService;

    @get('/')
    @visitorIdentity(LoginUser | InternalClient)
    async index(ctx) {
        const bucketType: number = ctx.checkQuery('bucketType').optional().toInt().in([0, 1, 2]).default(0).value;
        ctx.validateParams();
        const condition = {
            userId: ctx.request.userId
        };
        if (bucketType) {
            condition['bucketType'] = bucketType;
        }
        await this.bucketService.find(condition).then(ctx.success);
    }

    @get('/Count') // 需要首字母大写,避免和bucketName冲突
    @visitorIdentity(LoginUser)
    async createdCount(ctx) {
        const condition = {
            userId: ctx.request.userId,
            bucketType: BucketTypeEnum.UserStorage
        };
        await this.bucketService.count(condition).then(ctx.success);
    }

    @post('/')
    @visitorIdentity(LoginUser)
    async create(ctx) {

        // 只允许小写字母、数字、中划线（-），且不能以短横线开头或结尾
        const bucketName: string = ctx.checkBody('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();

        // 系统级存储bucket不能通过API创建.由对应的业务来处理
        const bucketInfo: BucketInfo = {
            bucketName, bucketType: BucketTypeEnum.UserStorage,
            userId: ctx.request.userId
        };

        await this.bucketService.createBucket(bucketInfo).then(ctx.success);
    }

    @del('/:bucketName')
    @visitorIdentity(LoginUser)
    async destroy(ctx) {

        const bucketName: string = ctx.checkBody('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();

        await this.bucketService.deleteBucket(bucketName).then(ctx.success);
    }

    @get('/:bucketName/isExist')
    @visitorIdentity(LoginUser | InternalClient)
    async isExistBucketName(ctx) {

        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();

        await this.bucketService.count({bucketName}).then(data => ctx.success(Boolean(data)));
    }

    @get('/spaceStatistics')
    @visitorIdentity(LoginUser)
    async spaceStatistics(ctx) {
        await this.bucketService.spaceStatistics(ctx.request.userId).then(ctx.success);
    }

    @get('/:bucketName')
    @visitorIdentity(LoginUser)
    async show(ctx) {

        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        ctx.validateParams();

        const condition = {
            userId: ctx.request.userId, bucketName
        };
        await this.bucketService.findOne(condition).then(ctx.success);
    }
}
