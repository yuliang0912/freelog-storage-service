import {inject, controller, get, post, put, provide, priority, del} from 'midway';
import {IBucketService, SystemBucketName} from '../../interface/bucket-interface';
import {IFileStorageService} from '../../interface/file-storage-info-interface';
import {CreateUserNodeDataObjectOptions, IObjectStorageService} from '../../interface/object-storage-interface';
import {
    IOutsideApiService,
    JsonObjectOperation,
    JsonObjectOperationTypeEnum,
    NodeInfo
} from '../../interface/common-interface';
import {
    IdentityTypeEnum, FreelogContext, visitorIdentityValidator, CommonRegex, ArgumentError
} from 'egg-freelog-base';
import {pick, isEmpty} from 'lodash';

@provide()
@priority(1)
@controller('/v1/storages/buckets/.UserNodeData')
export class UserNodeDataObjectController {

    @inject()
    ctx: FreelogContext;
    @inject()
    bucketService: IBucketService;
    @inject()
    fileStorageService: IFileStorageService;
    @inject()
    objectStorageService: IObjectStorageService;
    @inject()
    outsideApiService: IOutsideApiService;
    @inject()
    userNodeDataFileOperation;

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @get('/objects')
    async index() {
        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({userId: ctx.userId, bucketType: 2});
        if (!bucketInfo) {
            return ctx.success({skip, limit, totalItem: 0, dataList: []});
        }

        const condition = {bucketId: bucketInfo.bucketId};
        const nodeDataObjectPageResult = await this.objectStorageService.findIntervalList(condition, skip, limit, [], sort);
        if (nodeDataObjectPageResult.dataList.length) {
            const nodeDomains = nodeDataObjectPageResult.dataList.map(x => x.objectName.replace('.ncfg', ''));
            const nodeList = await this.outsideApiService.getNodeList(undefined, nodeDomains);
            nodeDataObjectPageResult.dataList = nodeDataObjectPageResult.dataList.map(item => {
                item = (item as any).toObject();
                const nodeInfo = nodeList.find(x => x.nodeDomain.toLowerCase() === item.objectName.replace('.ncfg', '').toLowerCase());
                item['nodeInfo'] = pick(nodeInfo, ['nodeId', 'nodeName', 'nodeDomain']);
                return item;
            });
        }
        return ctx.success(nodeDataObjectPageResult);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @post('/objects')
    async createOrReplace() {

        const {ctx} = this;
        const nodeId = ctx.checkBody('nodeId').optional().toInt().value;
        const nodeDomain = ctx.checkBody('nodeDomain').optional().isNodeDomain().value;
        const userNodeData = ctx.checkBody('userNodeData').exist().isObject().value;
        ctx.validateParams();

        if (!nodeId && !nodeDomain) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'nodeId or nodeDomain'));
        }
        const apiFunName = nodeId ? 'getNodeInfoById' : 'getNodeInfoByDomain';
        const nodeInfo = await this.outsideApiService[apiFunName].call(this.outsideApiService, nodeId ?? nodeDomain);
        if (!nodeInfo) {
            throw new ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        await this._createUserNodeData(nodeInfo, userNodeData).then(ctx.success);
    }

    // 清理用户节点数据
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @del('/objects/clear')
    async clearUserNodeData() {

        const {ctx} = this;
        const nodeIds = ctx.checkQuery('nodeIds').optional().isSplitNumber().toSplitArray().len(1, 100).value;
        let nodeDomains = ctx.checkQuery('nodeDomains').optional().toSplitArray().len(1, 100).value;
        ctx.validateParams();

        const userNodeDataBucket = await this.bucketService.findOne({userId: ctx.userId, bucketType: 2});
        if (!userNodeDataBucket) {
            return ctx.success(true);
        }
        if (!isEmpty(nodeIds || [])) {
            nodeDomains = await this.outsideApiService.getNodeList(nodeIds).then(list => list.map(x => x.nodeDomain));
        }
        await this.bucketService.clearUserNodeData(userNodeDataBucket, nodeDomains).then(ctx.success);
    }

    // 为了方便前端开发,更新时如果不存在用户节点数据,则直接创建一份.省去了运行时get,create的两部操作.
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @put('/objects/:nodeId')
    async update() {

        const {ctx} = this;
        const nodeId: number = ctx.checkParams('nodeId').exist().toInt().value;
        const removeFields: string[] = ctx.checkBody('removeFields').optional().isArray().default([]).value;
        const appendOrReplaceObject: object = ctx.checkBody('appendOrReplaceObject').optional().isObject().value;
        ctx.validateParams();

        const nodeInfo = await this.outsideApiService.getNodeInfoById(nodeId);
        if (!nodeInfo) {
            throw new ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        ctx.entityNullValueAndUserAuthorizationCheck(nodeInfo, {property: 'ownerUserId'});
        const objectInfo = await this.objectStorageService.findOne({
            userId: ctx.userId,
            bucketName: SystemBucketName.UserNodeData,
            objectName: `${nodeInfo.nodeDomain}.ncfg`
        });
        if (!objectInfo) {
            return this._createUserNodeData(nodeInfo, appendOrReplaceObject ?? {}).then(ctx.success);
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(objectInfo.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);

        const objectOperations: JsonObjectOperation[] = Object.keys(appendOrReplaceObject).map(key => Object({
            key, value: appendOrReplaceObject[key], type: JsonObjectOperationTypeEnum.AppendOrReplace
        }));
        removeFields.forEach(item => objectOperations.push({key: item, type: JsonObjectOperationTypeEnum.Remove}));

        const transformStream = await this.userNodeDataFileOperation.edit(fileStream, objectOperations);
        transformStream.filename = objectInfo.objectName;

        const newFileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(transformStream);

        await this.objectStorageService.createOrUpdateUserNodeObject(objectInfo, {
            userId: objectInfo.userId, nodeInfo,
            fileStorageInfo: newFileStorageInfo
        }).then(ctx.success);
    }

    // // 清理用户节点数据
    // @del('/objects')
    // async delete() {
    //     const {ctx} = this;
    //     const nodeId = ctx.checkQuery('nodeId').exist().toInt().value;
    //     ctx.validateParams();
    //
    // }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @get('/objects/:objectIdOrNodeId/customPick')
    async download() {

        const {ctx} = this;
        const objectIdOrNodeId = ctx.checkParams('objectIdOrNodeId').exist().type('string').value;
        const fields: string[] = ctx.checkQuery('fields').optional().len(1).toSplitArray().default([]).value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({
            userId: ctx.userId,
            bucketName: SystemBucketName.UserNodeData
        });
        if (!bucketInfo) {
            return ctx.body = Buffer.from('{}');
        }

        const findCondition: any = {bucketId: bucketInfo.bucketId};
        if (CommonRegex.mongoObjectId.test(objectIdOrNodeId)) {
            findCondition._id = objectIdOrNodeId;
        } else if (/^\d{8,10}$/.test(objectIdOrNodeId)) {
            const nodeInfo = await this.outsideApiService.getNodeInfoById(objectIdOrNodeId);
            if (!nodeInfo) {
                throw new ArgumentError(ctx.gettext('node-entity-not-found'));
            }
            findCondition.objectName = `${nodeInfo.nodeDomain}.ncfg`;
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'objectIdOrNodeId'));
        }

        const storageObject = await this.objectStorageService.findOne(findCondition);
        if (!storageObject) {
            return ctx.body = Buffer.from('{}');
        }

        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        if (fields.length) {
            ctx.set('Connection', 'close');
            ctx.set('Transfer-Encoding', 'chunked');
        } else {
            ctx.set('Content-length', fileStorageInfo.fileSize.toString());
        }
        ctx.attachment(storageObject.objectName);
        ctx.body = this.userNodeDataFileOperation.pick(fileStream, fields);
    }

    /**
     * 创建用户节点数据
     * @param nodeInfo
     * @param userNodeData
     */
    async _createUserNodeData(nodeInfo: NodeInfo, userNodeData: object) {
        const {ctx} = this;
        const fileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(userNodeData);
        const createUserNodeDataObjectOptions: CreateUserNodeDataObjectOptions = {
            userId: ctx.userId, nodeInfo,
            fileStorageInfo: {
                sha1: fileStorageInfo.sha1,
                fileSize: fileStorageInfo.fileSize,
                serviceProvider: fileStorageInfo.serviceProvider,
                storageInfo: fileStorageInfo.storageInfo
            }
        };

        const objectInfo = await this.objectStorageService.findOne({
            userId: ctx.userId,
            bucketName: SystemBucketName.UserNodeData,
            objectName: `${nodeInfo.nodeDomain}.ncfg`
        });

        return this.objectStorageService.createOrUpdateUserNodeObject(objectInfo, createUserNodeDataObjectOptions);
    }
}
