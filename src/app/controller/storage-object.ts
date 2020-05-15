import {inject, controller, get, post, put, provide} from 'midway';
import {LoginUser, ApplicationError, ArgumentError} from 'egg-freelog-base/index';
import {IBucketService, SystemBucketName} from '../../interface/bucket-interface';
import {visitorIdentity} from '../extend/vistorIdentityDecorator';
import {FileStorageInfo, IFileStorageService} from '../../interface/file-storage-info-interface';
import {
    CreateStorageObjectOptions,
    CreateUserNodeDataObjectOptions,
    IStorageObjectService
} from '../../interface/storage-object-interface';

const sendToWormhole = require('stream-wormhole');
import {
    IJsonSchemaValidate,
    JsonObjectOperation,
    JsonObjectOperationTypeEnum,
    NodeInfo
} from '../../interface/common-interface';

@provide()
@controller('/v1/storages/')
export class ObjectController {

    @inject()
    bucketService: IBucketService;
    @inject()
    fileStorageService: IFileStorageService;
    @inject()
    storageObjectService: IStorageObjectService;
    @inject()
    userNodeDataFileOperation;
    @inject()
    userNodeDataEditValidator: IJsonSchemaValidate;
    @inject()
    fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any;

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
            condition.$or = [{name: regex}, {bucketName: regex}];
        }

        let dataList = [];
        const totalItem = await this.storageObjectService.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.storageObjectService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        }

        ctx.success({page, pageSize, totalItem, dataList});
    }

    @visitorIdentity(LoginUser)
    @post('/buckets/userNodeData/objects')
    async createUserNodeData(ctx) {

        let fileStream = null;
        try {
            if (ctx.is('multipart')) {
                fileStream = await ctx.getFileStream({requireFile: false});
                ctx.request.body = fileStream.fields;
            }
            const nodeId: number = ctx.checkBody('nodeId').exist().toInt().value;
            const sha1: string = ctx.checkBody('sha1').optional().isResourceId().toLowercase().value;
            ctx.validateParams();

            if (!sha1 && (!fileStream || !fileStream.filename)) {
                throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'file or sha1'));
            }

            let fileStorageInfo: FileStorageInfo = null;
            if (fileStream && fileStream.filename) {
                fileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(fileStream);
            } else if (fileStream) {
                fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
                await sendToWormhole(fileStream);
            } else {
                fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
            }

            const nodeInfo = await ctx.curlIntranetApi(`${ctx.webApi.nodeInfo}/${nodeId}`);
            if (!nodeInfo) {
                throw new ArgumentError(ctx.gettext('node-entity-not-found'));
            }

            const updateFileOptions: CreateUserNodeDataObjectOptions = {
                userId: ctx.request.userId, nodeInfo,
                fileStorageInfo: {
                    sha1: fileStorageInfo.sha1,
                    fileSize: fileStorageInfo.fileSize,
                    serviceProvider: fileStorageInfo.serviceProvider,
                    storageInfo: fileStorageInfo.storageInfo
                }
            };
            await this.storageObjectService.createUserNodeObject(updateFileOptions).then(ctx.success);
        } catch (error) {
            if (fileStream) {
                await sendToWormhole(fileStream);
            }
            throw error;
        }
    }

    @visitorIdentity(LoginUser)
    @put('/buckets/userNodeData/objects/:nodeId')
    async editUserNodeData(ctx) {
        const nodeId: number = ctx.checkParams('nodeId').exist().toInt().value;
        const removeFields: string[] = ctx.checkBody('removeFields').optional().isArray().default([]).value;
        const setOrReplaceFields: [{ field: string, value: any }] = ctx.checkBody('setOrReplaceFields').optional().isArray().value;
        ctx.validateParams();

        const validateResult = this.userNodeDataEditValidator.validate(setOrReplaceFields);
        if (validateResult.errors.length) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'setOrReplaceFields'), {validateResult});
        }

        const nodeInfo: NodeInfo = await ctx.curlIntranetApi(`${ctx.webApi.nodeInfo}/${nodeId}`);
        if (!nodeInfo) {
            throw new ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        const bucketInfo = await this.bucketService.findOne({
            userId: ctx.request.userId,
            bucketName: SystemBucketName.UserNodeData
        });
        if (!bucketInfo) {
            throw new ApplicationError(ctx.gettext('bucket-entity-not-found'));
        }
        const storageObject = await this.storageObjectService.findOne({
            bucketId: bucketInfo.bucketId,
            objectName: `${nodeInfo.nodeDomain}.ncfg`
        });
        if (!storageObject) {
            throw new ApplicationError(ctx.gettext('storage-object-not-found'));
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
        const fileStream = await ctx.curl(fileStorageInfo['fileUrl'], {streaming: true}).then(({status, headers, res}) => {
            if (status < 200 || status > 299) {
                throw new ApplicationError(ctx.gettext('文件流读取失败'), {httpStatus: status});
            }
            ctx.status = status;
            ctx.attachment(storageObject.objectName);
            return res;
        });

        const objectOperations: JsonObjectOperation[] = setOrReplaceFields.map(x => Object({
            key: x.field, value: x.value, type: JsonObjectOperationTypeEnum.SetOrReplace
        }))
        removeFields.forEach(item => objectOperations.push({key: item, type: JsonObjectOperationTypeEnum.Remove}));

        const transformStream = this.userNodeDataFileOperation.edit(fileStream, objectOperations);
        transformStream.filename = storageObject.objectName;

        const newFileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(transformStream);

        await this.storageObjectService.updateObject(storageObject, newFileStorageInfo).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @get('/buckets/userNodeData/objects/:nodeId')
    async getUserNodeData(ctx) {
        const nodeId: number = ctx.checkParams('nodeId').exist().toInt().value;
        const fields: string[] = ctx.checkQuery('fields').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const nodeInfo: NodeInfo = await ctx.curlIntranetApi(`${ctx.webApi.nodeInfo}/${nodeId}`);
        if (!nodeInfo) {
            throw new ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        const bucketInfo = await this.bucketService.findOne({
            userId: ctx.request.userId,
            bucketName: SystemBucketName.UserNodeData
        });
        if (!bucketInfo) {
            return ctx.body = new Buffer('{}');
        }
        const storageObject = await this.storageObjectService.findOne({
            bucketId: bucketInfo.bucketId,
            objectName: `${nodeInfo.nodeDomain}.ncfg`
        });
        if (!storageObject) {
            return ctx.body = new Buffer('{}');
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);

        const fileStream = await ctx.curl(fileStorageInfo['fileUrl'], {streaming: true}).then(({status, headers, res}) => {
            if (status < 200 || status > 299) {
                throw new ApplicationError(ctx.gettext('文件流读取失败'), {httpStatus: status});
            }
            ctx.status = status;
            ctx.attachment(storageObject.objectName);
            return res;
        });
        ctx.body = this.userNodeDataFileOperation.pick(fileStream, fields);
    }

    @visitorIdentity(LoginUser)
    @post('/buckets/:bucketName/objects')
    async create(ctx) {

        let fileStream = null;
        try {
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
                bucketName, resourceType, objectName,
                userId: ctx.request.userId,
                fileStorageInfo: {
                    sha1: fileStorageInfo.sha1,
                    fileSize: fileStorageInfo.fileSize,
                    serviceProvider: fileStorageInfo.serviceProvider,
                    storageInfo: fileStorageInfo.storageInfo
                }
            };

            await this.storageObjectService.createObject(updateFileOptions).then(ctx.success);
        } catch (error) {
            if (fileStream) {
                await sendToWormhole(fileStream);
            }
            throw error;
        }
    }

    @visitorIdentity(LoginUser)
    // @post('/buckets/:bucketName/objects/upload') 此接口目前暂不对外提供.需要看业务实际设计
    async uploadFile(ctx) {
        const fileStream = await ctx.getFileStream();
        const fileStorageInfo = await this.fileStorageService.upload(fileStream);
        ctx.success({sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize});
    }
}
