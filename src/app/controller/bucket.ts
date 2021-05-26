import {inject, controller, get, post, del, provide} from 'midway';
import {IBucketService, BucketInfo, BucketTypeEnum} from '../../interface/bucket-interface';
import {IdentityTypeEnum, visitorIdentityValidator, FreelogContext} from 'egg-freelog-base';

@provide()
@controller('/v1/storages/buckets')
export class BucketController {

    @inject()
    ctx: FreelogContext;
    @inject()
    bucketService: IBucketService;

    @get('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async index() {
        const {ctx} = this;
        const bucketType: number = ctx.checkQuery('bucketType').optional().toInt().in([0, 1, 2]).default(0).value;
        ctx.validateParams();
        const condition = {userId: ctx.userId};
        if (bucketType) {
            condition['bucketType'] = bucketType;
        }
        await this.bucketService.find(condition, null, {bucketName: -1}).then(ctx.success);
    }

    @get('/Count') // 需要首字母大写,避免和bucketName冲突
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async createdCount() {
        const {ctx} = this;
        const condition = {
            userId: ctx.userId,
            bucketType: BucketTypeEnum.UserStorage
        };
        await this.bucketService.count(condition).then(ctx.success);
    }

    @post('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async create() {

        const {ctx} = this;
        // 只允许小写字母、数字、中划线（-），且不能以短横线开头或结尾
        const bucketName: string = ctx.checkBody('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();

        // 系统级存储bucket不能通过API创建.由对应的业务来处理
        const bucketInfo: BucketInfo = {
            bucketName, bucketType: BucketTypeEnum.UserStorage,
            userId: ctx.userId
        };

        await this.bucketService.createBucket(bucketInfo).then(ctx.success);
    }

    @del('/:bucketName')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async destroy() {

        const {ctx} = this;
        const bucketName: string = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();

        await this.bucketService.deleteBucket(bucketName).then(ctx.success);
    }

    @get('/:bucketName/isExist')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async isExistBucketName() {
        const {ctx} = this;

        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();

        await this.bucketService.count({bucketName}).then(data => ctx.success(Boolean(data)));
    }

    @get('/spaceStatistics')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async spaceStatistics() {
        const {ctx} = this;
        await this.bucketService.spaceStatistics(ctx.userId).then(ctx.success);
    }

    @get('/:bucketName')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async show() {
        const {ctx} = this;

        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        ctx.validateParams();

        const condition = {
            userId: ctx.userId, bucketName
        };
        await this.bucketService.findOne(condition).then(ctx.success);
    }
}
