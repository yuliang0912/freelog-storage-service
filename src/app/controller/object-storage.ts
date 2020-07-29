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
    @get('/buckets/objects/my')
    async index1(ctx) {
        const page: number = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
        const pageSize: number = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const resourceType: string = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
        const keywords: string = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const isLoadingTypeless = ctx.checkQuery('isLoadingTypeless').optional().in([0, 1]).default(1).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition: any = {};
        if (resourceType && isLoadingTypeless) {
            condition.resourceType = {$in: [resourceType, '']};
        } else if (resourceType) {
            condition.resourceType = resourceType;
        } else if (!isLoadingTypeless) {
            condition.resourceType = {$ne: ''};
        }
        if (keywords) {
            const regex: object = {$regex: keywords, $options: 'i'};
            condition.$or = [{objectName: regex}, {bucketName: regex}];
        }

        const buckets = await this.bucketService.find({userId: ctx.userId, bucketType: 1});
        condition.bucketId = {$in: buckets.map(x => x.bucketId)};

        let dataList = [];
        const totalItem = await this.objectStorageService.count(condition);
        if (buckets.length && totalItem > (page - 1) * pageSize) {
            dataList = await this.objectStorageService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        }

        ctx.success({page, pageSize, totalItem, dataList});
    }

    @visitorIdentity(LoginUser)
    @get('/buckets/:bucketName/objects')
    async index(ctx) {
        const page: number = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
        const pageSize: number = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const resourceType: string = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
        const keywords: string = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const isLoadingTypeless = ctx.checkQuery('isLoadingTypeless').optional().in([0, 1]).default(1).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        const condition: any = {bucketId: bucketInfo.bucketId};
        if (resourceType && isLoadingTypeless) {
            condition.resourceType = {$in: [resourceType, '']};
        } else if (resourceType) {
            condition.resourceType = resourceType;
        } else if (!isLoadingTypeless) {
            condition.resourceType = {$ne: ''};
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
    @get('/buckets/:bucketName/objects/:objectId')
    async show(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectId: string = ctx.checkParams('objectId').exist().isMongoObjectId().value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        await this.objectStorageService.findOne({_id: objectId, bucketId: bucketInfo.bucketId}).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @post('/buckets/:bucketName/objects')
    async createOrReplace(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        const objectName: string = ctx.checkBody('objectName').exist().value;
        const sha1: string = ctx.checkBody('sha1').exist().isSha1().toLowercase().value;
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
    @get('/buckets/:bucketName/objects/:objectId/file')
    async download(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectId: string = ctx.checkParams('objectId').exist().isMongoObjectId().value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        const storageObject = await this.objectStorageService.findOne({_id: objectId, bucketId: bucketInfo.bucketId});
        if (!storageObject) {
            throw new ApplicationError(ctx.gettext('storage-object-not-found'));
        }

        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        ctx.body = fileStream;
        ctx.attachment(storageObject.objectName);
        ctx.set('content-length', fileStorageInfo.fileSize);
    }

    @visitorIdentity(LoginUser)
    @del('/buckets/:bucketName/objects/:objectIds')
    async destroy(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectIds: string[] = ctx.checkParams('objectIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        await this.objectStorageService.batchDeleteObjects(bucketInfo, objectIds).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @put('/buckets/:bucketName/objects/:objectId')
    async updateProperty(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectId: string = ctx.checkParams('objectId').exist().isMongoObjectId().value;
        const customProperty: object = ctx.checkBody('customProperty').optional().isObject().value;
        const resourceType: string = ctx.checkBody('resourceType').optional().isResourceType().toLow().value;
        const newObjectName: string = ctx.checkBody('objectName').optional().type('string').value;
        ctx.validateParams();

        ctx.success({bucketName, objectId, customProperty, resourceType, newObjectName});
    }
}
