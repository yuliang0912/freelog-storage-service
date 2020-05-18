import * as sendToWormhole from 'stream-wormhole';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {inject, controller, get, post, put, provide, priority} from 'midway';
import {LoginUser, ApplicationError, ArgumentError} from 'egg-freelog-base/index';
import {IBucketService, SystemBucketName} from '../../interface/bucket-interface';
import {FileStorageInfo, IFileStorageService} from '../../interface/file-storage-info-interface';
import {CreateUserNodeDataObjectOptions, IStorageObjectService} from '../../interface/storage-object-interface';
import {JsonObjectOperation, JsonObjectOperationTypeEnum, NodeInfo} from '../../interface/common-interface';

@provide()
@priority(1)
@controller('/v1/storages/buckets/.UserNodeData')
export class UserNodeDataObjectController {

    @inject()
    bucketService: IBucketService;
    @inject()
    fileStorageService: IFileStorageService;
    @inject()
    storageObjectService: IStorageObjectService;
    @inject()
    userNodeDataFileOperation;

    @visitorIdentity(LoginUser)
    @post('/objects')
    async create(ctx) {

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
            const nodeInfo = await ctx.curlIntranetApi(`${ctx.webApi.nodeInfo}/${nodeId}`);
            if (!nodeInfo) {
                throw new ArgumentError(ctx.gettext('node-entity-not-found'));
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
    @put('/objects/:nodeId')
    async update(ctx) {
        const nodeId: number = ctx.checkParams('nodeId').exist().toInt().value;
        const removeFields: string[] = ctx.checkBody('removeFields').optional().isArray().default([]).value;
        const appendOrReplaceObject: object = ctx.checkBody('appendOrReplaceObject').optional().isObject().value;
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
        const objectOperations: JsonObjectOperation[] = Object.keys(appendOrReplaceObject).map(key => Object({
            key, value: appendOrReplaceObject[key], type: JsonObjectOperationTypeEnum.AppendOrReplace
        }));
        removeFields.forEach(item => objectOperations.push({key: item, type: JsonObjectOperationTypeEnum.Remove}));

        const transformStream = this.userNodeDataFileOperation.edit(fileStream, objectOperations);
        transformStream.filename = storageObject.objectName;

        const newFileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(transformStream);

        await this.storageObjectService.updateObject(storageObject, newFileStorageInfo).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @get('/objects/:nodeId/file')
    async show(ctx) {
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
}
