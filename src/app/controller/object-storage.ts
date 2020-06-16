import {inject, controller, get, del, post, put, provide} from 'midway';
import {LoginUser, ApplicationError} from 'egg-freelog-base/index';
import {IBucketService} from '../../interface/bucket-interface';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {IFileStorageService} from '../../interface/file-storage-info-interface';
import {IObjectStorageService} from '../../interface/object-storage-interface';

@provide()
@controller('/v1/storages/')
export class ObjectController {

    @inject()
    bucketService: IBucketService;
    @inject()
    fileStorageService: IFileStorageService;
    @inject()
    objectStorageService: IObjectStorageService;

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

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        const condition: any = {bucketId: bucketInfo.bucketId};
        if (resourceType) {
            condition.resourceType = resourceType;
        }
        if (keywords) {
            const regex: object = {$regex: keywords, $options: 'i'};
            condition.$or = [{objectName: regex}, {bucketName: regex}];
        }

        let dataList = [];
        const totalItem = await this.objectStorageService.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.objectStorageService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        }

        ctx.success({page, pageSize, totalItem, dataList});
    }

    @visitorIdentity(LoginUser)
    @get('/buckets/:bucketName/objects/:objectName')
    async show(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectName: string = ctx.checkParams('objectName').exist().type('string').value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        await this.objectStorageService.findOne({bucketId: bucketInfo.bucketId, objectName}).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @post('/buckets/:bucketName/objects')
    async createOrReplace(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        const objectName: string = ctx.checkBody('objectName').exist().value;
        const sha1: string = ctx.checkBody('sha1').exist().isResourceId().toLowercase().value;
        const resourceType: string = ctx.checkBody('resourceType').optional().isResourceType().toLowercase().value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({
            bucketName,
            userId: ctx.request.userId
        });
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, ctx.gettext('params-validate-failed', 'sha1'));

        const createOrUpdateFileOptions = {
            resourceType, objectName, fileStorageInfo
        };
        await this.objectStorageService.createObject(bucketInfo, createOrUpdateFileOptions).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @get('/buckets/:bucketName/objects/:objectName/file')
    async download(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectName: string = ctx.checkParams('objectName').exist().type('string').value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        const storageObject = await this.objectStorageService.findOne({bucketId: bucketInfo.bucketId, objectName});
        if (!storageObject) {
            throw new ApplicationError(ctx.gettext('storage-object-not-found'));
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        ctx.body = fileStream;
        ctx.attachment(storageObject.objectName);
        ctx.set('content-length', storageObject.systemProperty.fileSize);
    }

    @visitorIdentity(LoginUser)
    @del('/buckets/:bucketName/objects/:objectName')
    async destroy(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectName: string = ctx.checkParams('objectName').exist().type('string').value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        const storageObject = await this.objectStorageService.findOne({bucketId: bucketInfo.bucketId, objectName});
        if (!storageObject) {
            throw new ApplicationError(ctx.gettext('storage-object-not-found'));
        }

        return this.objectStorageService.deleteObject(storageObject);
    }

    @visitorIdentity(LoginUser)
    @post('/buckets/:bucketName/objects/batchDestroy')
    async batchDestroy(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectIds: string[] = ctx.checkBody('objectIds').exist().isArray().len(1, 100).value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        await this.objectStorageService.batchDeleteObjects(bucketInfo, objectIds).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @put('/buckets/:bucketName/objects/:objectName')
    async updateProperty(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectName: string = ctx.checkParams('objectName').exist().type('string').value;
        const customProperty: object = ctx.checkBody('customProperty').optional().isObject().value;
        const resourceType: string = ctx.checkBody('resourceType').optional().isResourceType().toLow().value;
        const newObjectName: string = ctx.checkBody('objectName').optional().type('string').value;
        ctx.validateParams();

        ctx.success({bucketName, objectName, customProperty, resourceType, newObjectName});
    }
}
