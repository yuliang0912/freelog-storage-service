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
let UserNodeDataObjectController = class UserNodeDataObjectController {
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
        const nodeId = ctx.checkBody('nodeId').optional().toInt().value;
        const nodeDomain = ctx.checkBody('nodeDomain').optional().isNodeDomain().value;
        ctx.validateParams();
        const userNodeDataBucket = await this.bucketService.findOne({ userId: ctx.userId, bucketType: 2 });
        if (!userNodeDataBucket) {
            return ctx.success(true);
        }
        let nodeInfo = null;
        if (nodeId) {
            nodeInfo = await this.outsideApiService.getNodeInfoById(nodeId);
        }
        else if (nodeDomain) {
            nodeInfo = await this.outsideApiService.getNodeInfoByDomain(nodeDomain);
        }
        await this.bucketService.clearUserNodeData(userNodeDataBucket, nodeInfo).then(ctx.success);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvdXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWtGO0FBQ2xGLHVFQUFrRjtBQUdsRix1RUFLMEM7QUFDMUMsdURBRTBCO0FBSzFCLElBQWEsNEJBQTRCLEdBQXpDLE1BQWEsNEJBQTRCO0lBaUJyQyxLQUFLLENBQUMsZUFBZTtRQUVqQixNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2hFLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQy9FLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzVFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxnQ0FBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1NBQ25HO1FBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUM7UUFDdEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMs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