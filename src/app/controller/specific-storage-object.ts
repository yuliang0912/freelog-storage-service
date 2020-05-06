import {inject, controller, get, post, provide} from 'midway';
import {LoginUser, ArgumentError} from 'egg-freelog-base/index';
import {IBucketService} from '../../interface/bucket-interface';
import {visitorIdentity} from '../extend/vistorIdentityDecorator';
import {FileStorageInfo, IFileStorageService} from '../../interface/file-storage-info-interface';
import {CreateUserNodeDataObjectOptions, IStorageObjectService} from '../../interface/storage-object-interface';

const sendToWormhole = require('stream-wormhole');

@provide()
@controller('/v1/specificStorages/')
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

        const condition: object = {bucketName};
        if (resourceType) {
            condition['resourceType'] = resourceType;
        }
        if (keywords) {
            const regex: object = {$regex: keywords, $options: 'i'};
            condition['$or'] = [{name: regex}, {bucketName: regex}];
        }

        await this.bucketService.findOne({bucketName}).then(bucketInfo => {
            ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
        });

        let dataList = [];
        const totalItem: number = await this.storageObjectService.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.storageObjectService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        }

        ctx.success({page, pageSize, totalItem, dataList});
    }

    @visitorIdentity(LoginUser)
    @post('/buckets/:bucketName/objects')
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
                fileStorageInfo = await this.fileStorageService.upload(fileStream);
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
}
