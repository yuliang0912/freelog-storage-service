import {inject, controller, get, post, provide} from 'midway';
import {LoginUser} from 'egg-freelog-base/index';
import {visitorIdentity} from '../extend/vistorIdentityDecorator';
import {IStorageObjectService} from '../../interface/storage-object-interface';

@provide()
@controller('/v1/storages/')
export default class ObjectController {

    @inject()
    storageObjectService: IStorageObjectService;

    @visitorIdentity(LoginUser)
    @get('/buckets/:bucketName/objects')
    async index(ctx) {

        const page: number = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
        const pageSize: number = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const resourceType: string = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
        const keywords: string = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition: object = {userId: ctx.request.userId}
        if (bucketName !== undefined) {
            condition['bucketName'] = bucketName;
        }
        if (resourceType) {
            condition['resourceType'] = resourceType;
        }
        if (keywords) {
            const regex: object = {$regex: keywords, $options: 'i'}
            condition['$or'] = [{name: regex}, {bucketName: regex}];
        }

        let dataList = [];
        const totalItem: number = await this.storageObjectService.count(condition)
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.storageObjectService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        }

        ctx.success({page, pageSize, totalItem, dataList});
    }

    @visitorIdentity(LoginUser)
    @post('/buckets/:bucketName/objects')
    async create(ctx) {

        const fileStream = await ctx.getFileStream();
        ctx.request.body = fileStream.fields;

        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const resourceType: string = ctx.checkBody('resourceType').exist().isResourceType().toLowercase().value;
        ctx.validateParams();

        const updateFileOptions = {
            bucketName, resourceType, fileStream,
            userId: ctx.request.userId
        }

        await this.storageObjectService.createObject(updateFileOptions).then(ctx.success);
    }
}
