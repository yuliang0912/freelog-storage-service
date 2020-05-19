import * as sendToWormhole from 'stream-wormhole';
import {inject, controller, get, del, post, provide} from 'midway';
import {LoginUser, ApplicationError, ArgumentError} from 'egg-freelog-base/index';
import {IBucketService} from '../../interface/bucket-interface';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {FileStorageInfo, IFileStorageService} from '../../interface/file-storage-info-interface';
import {CreateStorageObjectOptions, IStorageObjectService} from '../../interface/storage-object-interface';

@provide()
@controller('/v1/storages/')
export class ObjectController {

    @inject()
    bucketService: IBucketService;
    @inject()
    fileStorageService: IFileStorageService;
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
        const totalItem = await this.storageObjectService.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.storageObjectService.findPageList(condition, page, pageSize, projection, {createDate: -1});
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

        await this.storageObjectService.findOne({bucketId: bucketInfo.bucketId, objectName}).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @post('/buckets/:bucketName/objects')
    async createOrReplace(ctx) {
        let fileStream = null;
        const createObjectFuncAsync = async () => {
            if (ctx.is('multipart')) {
                fileStream = await ctx.getFileStream({requireFile: false});
                ctx.request.body = fileStream.fields;
            }
            const bucketName: string = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
            const objectName: string = ctx.checkBody('objectName').exist().value;
            const resourceType: string = ctx.checkBody('resourceType').exist().isResourceType().toLowercase().value;
            const sha1: string = ctx.checkBody('sha1').optional().isResourceId().toLowercase().value;
            ctx.validateParams();

            if (!sha1 && (!fileStream || !fileStream.filename)) {
                throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'file or sha1'));
            }
            const bucketInfo = await this.bucketService.findOne({
                bucketName,
                userId: ctx.request.userId
            });
            ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

            let fileStorageInfo: FileStorageInfo = null;
            if (fileStream && fileStream.filename) {
                fileStorageInfo = await this.fileStorageService.upload(fileStream);
            } else if (fileStream) {
                fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
                await sendToWormhole(fileStream);
            } else {
                fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
            }
            const updateFileOptions: CreateStorageObjectOptions = {
                resourceType, objectName,
                fileStorageInfo: {
                    sha1: fileStorageInfo.sha1,
                    fileSize: fileStorageInfo.fileSize,
                    serviceProvider: fileStorageInfo.serviceProvider,
                    storageInfo: fileStorageInfo.storageInfo
                }
            };
            return this.storageObjectService.createObject(bucketInfo, updateFileOptions);
        };
        await createObjectFuncAsync().then(ctx.success).catch(error => {
            return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                throw error;
            });
        });
    }

    @visitorIdentity(LoginUser)
    @get('/buckets/:bucketName/objects/:objectName/file')
    async download(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectName: string = ctx.checkParams('objectName').exist().type('string').value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        const storageObject = await this.storageObjectService.findOne({bucketId: bucketInfo.bucketId, objectName});
        if (!storageObject) {
            throw new ApplicationError(ctx.gettext('storage-object-not-found'));
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
        await ctx.curl(fileStorageInfo['fileUrl'], {streaming: true}).then(({status, headers, res}) => {
            if (status < 200 || status > 299) {
                throw new ApplicationError(ctx.gettext('文件流读取失败'), {httpStatus: status});
            }
            ctx.status = status;
            ctx.body = res;
            ctx.set('content-type', headers['content-type']);
            ctx.set('content-length', headers['content-length']);
            ctx.attachment(storageObject.objectName);
            return res;
        });
    }

    @visitorIdentity(LoginUser)
    @del('/buckets/:bucketName/objects/:objectName')
    async destroy(ctx) {
        const bucketName: string = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectName: string = ctx.checkParams('objectName').exist().type('string').value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        const storageObject = await this.storageObjectService.findOne({bucketId: bucketInfo.bucketId, objectName});
        if (!storageObject) {
            throw new ApplicationError(ctx.gettext('storage-object-not-found'));
        }

        return this.storageObjectService.deleteObject(storageObject);
    }

    @visitorIdentity(LoginUser)
    // @post('/buckets/:bucketName/objects/upload') 此接口目前暂不对外提供.需要看业务实际设计
    async uploadFile(ctx) {
        const fileStream = await ctx.getFileStream();
        const fileStorageInfo = await this.fileStorageService.upload(fileStream);
        ctx.success({sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize});
    }
}
