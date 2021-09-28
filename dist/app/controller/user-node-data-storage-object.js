"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNodeDataObjectController = void 0;
const midway_1 = require("midway");
const bucket_interface_1 = require("../../interface/bucket-interface");
const common_interface_1 = require("../../interface/common-interface");
const egg_freelog_base_1 = require("egg-freelog-base");
const lodash_1 = require("lodash");
let UserNodeDataObjectController = class UserNodeDataObjectController {
    async index() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({ userId: ctx.userId, bucketType: 2 });
        if (!bucketInfo) {
            return ctx.success({ skip, limit, totalItem: 0, dataList: [] });
        }
        const condition = { bucketId: bucketInfo.bucketId };
        const nodeDataObjectPageResult = await this.objectStorageService.findIntervalList(condition, skip, limit, [], sort);
        if (nodeDataObjectPageResult.dataList.length) {
            const nodeDomains = nodeDataObjectPageResult.dataList.map(x => x.objectName.replace('.ncfg', ''));
            const nodeList = await this.outsideApiService.getNodeList(undefined, nodeDomains);
            nodeDataObjectPageResult.dataList = nodeDataObjectPageResult.dataList.map(item => {
                item = item.toObject();
                const nodeInfo = nodeList.find(x => x.nodeDomain.toLowerCase() === item.objectName.replace('.ncfg', '').toLowerCase());
                item['nodeInfo'] = lodash_1.pick(nodeInfo, ['nodeId', 'nodeName', 'nodeDomain']);
                return item;
            });
        }
        return ctx.success(nodeDataObjectPageResult);
    }
    async createOrReplace() {
        const { ctx } = this;
        const nodeId = ctx.checkBody('nodeId').optional().toInt().value;
        const nodeDomain = ctx.checkBody('nodeDomain').optional().isNodeDomain().value;
        const userNodeData = ctx.checkBody('userNodeData').exist().isObject().value;
        ctx.validateParams();
        if (!nodeId && !nodeDomain) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'nodeId or nodeDomain'));
        }
        const apiFunName = nodeId ? 'getNodeInfoById' : 'getNodeInfoByDomain';
        const nodeInfo = await this.outsideApiService[apiFunName].call(this.outsideApiService, nodeId ?? nodeDomain);
        if (!nodeInfo) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        await this._createUserNodeData(nodeInfo, userNodeData).then(ctx.success);
    }
    // 清理用户节点数据
    async clearUserNodeData() {
        const { ctx } = this;
        const nodeIds = ctx.checkQuery('nodeIds').optional().isSplitNumber().toSplitArray().len(1, 100).value;
        let nodeDomains = ctx.checkQuery('nodeDomains').optional().toSplitArray().len(1, 100).value;
        ctx.validateParams();
        const userNodeDataBucket = await this.bucketService.findOne({ userId: ctx.userId, bucketType: 2 });
        if (!userNodeDataBucket) {
            return ctx.success(true);
        }
        if (!lodash_1.isEmpty(nodeIds || [])) {
            nodeDomains = await this.outsideApiService.getNodeList(nodeIds).then(list => list.map(x => x.nodeDomain));
        }
        await this.bucketService.clearUserNodeData(userNodeDataBucket, nodeDomains).then(ctx.success);
    }
    // 为了方便前端开发,更新时如果不存在用户节点数据,则直接创建一份.省去了运行时get,create的两部操作.
    async update() {
        const { ctx } = this;
        const nodeId = ctx.checkParams('nodeId').exist().toInt().value;
        const removeFields = ctx.checkBody('removeFields').optional().isArray().default([]).value;
        const appendOrReplaceObject = ctx.checkBody('appendOrReplaceObject').optional().isObject().value;
        ctx.validateParams();
        const nodeInfo = await this.outsideApiService.getNodeInfoById(nodeId);
        if (!nodeInfo) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        ctx.entityNullValueAndUserAuthorizationCheck(nodeInfo, { property: 'ownerUserId' });
        const objectInfo = await this.objectStorageService.findOne({
            userId: ctx.userId,
            bucketName: bucket_interface_1.SystemBucketName.UserNodeData,
            objectName: `${nodeInfo.nodeDomain}.ncfg`
        });
        if (!objectInfo) {
            return this._createUserNodeData(nodeInfo, appendOrReplaceObject ?? {}).then(ctx.success);
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(objectInfo.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        const objectOperations = Object.keys(appendOrReplaceObject).map(key => Object({
            key, value: appendOrReplaceObject[key], type: common_interface_1.JsonObjectOperationTypeEnum.AppendOrReplace
        }));
        removeFields.forEach(item => objectOperations.push({ key: item, type: common_interface_1.JsonObjectOperationTypeEnum.Remove }));
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
    async download() {
        const { ctx } = this;
        const objectIdOrNodeId = ctx.checkParams('objectIdOrNodeId').exist().type('string').value;
        const fields = ctx.checkQuery('fields').optional().len(1).toSplitArray().default([]).value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({
            userId: ctx.userId,
            bucketName: bucket_interface_1.SystemBucketName.UserNodeData
        });
        if (!bucketInfo) {
            return ctx.body = Buffer.from('{}');
        }
        const findCondition = { bucketId: bucketInfo.bucketId };
        if (egg_freelog_base_1.CommonRegex.mongoObjectId.test(objectIdOrNodeId)) {
            findCondition._id = objectIdOrNodeId;
        }
        else if (/^\d{8,10}$/.test(objectIdOrNodeId)) {
            const nodeInfo = await this.outsideApiService.getNodeInfoById(objectIdOrNodeId);
            if (!nodeInfo) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('node-entity-not-found'));
            }
            findCondition.objectName = `${nodeInfo.nodeDomain}.ncfg`;
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'objectIdOrNodeId'));
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
        }
        else {
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
    async _createUserNodeData(nodeInfo, userNodeData) {
        const { ctx } = this;
        const fileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(userNodeData);
        const createUserNodeDataObjectOptions = {
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
            bucketName: bucket_interface_1.SystemBucketName.UserNodeData,
            objectName: `${nodeInfo.nodeDomain}.ncfg`
        });
        return this.objectStorageService.createOrUpdateUserNodeObject(objectInfo, createUserNodeDataObjectOptions);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], UserNodeDataObjectController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], UserNodeDataObjectController.prototype, "bucketService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], UserNodeDataObjectController.prototype, "fileStorageService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], UserNodeDataObjectController.prototype, "objectStorageService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], UserNodeDataObjectController.prototype, "outsideApiService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], UserNodeDataObjectController.prototype, "userNodeDataFileOperation", void 0);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/objects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserNodeDataObjectController.prototype, "index", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.post('/objects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserNodeDataObjectController.prototype, "createOrReplace", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.del('/objects/clear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserNodeDataObjectController.prototype, "clearUserNodeData", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.put('/objects/:nodeId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserNodeDataObjectController.prototype, "update", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/objects/:objectIdOrNodeId/customPick'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserNodeDataObjectController.prototype, "download", null);
UserNodeDataObjectController = __decorate([
    midway_1.provide(),
    midway_1.priority(1),
    midway_1.controller('/v1/storages/buckets/.UserNodeData')
], UserNodeDataObjectController);
exports.UserNodeDataObjectController = UserNodeDataObjectController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvdXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWtGO0FBQ2xGLHVFQUFrRjtBQUdsRix1RUFLMEM7QUFDMUMsdURBRTBCO0FBQzFCLG1DQUFxQztBQUtyQyxJQUFhLDRCQUE0QixHQUF6QyxNQUFhLDRCQUE0QjtJQWlCckMsS0FBSyxDQUFDLEtBQUs7UUFDUCxNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUUsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDekYsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDcEUsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFDLENB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