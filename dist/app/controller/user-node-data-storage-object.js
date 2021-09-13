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
        const transformStream = this.userNodeDataFileOperation.edit(fileStream, objectOperations);
        transformStream.filename = objectInfo.objectName;
        const newFileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(transformStream);
        await this.objectStorageService.createOrUpdateUserNodeObject(objectInfo, {
            userId: objectInfo.userId, nodeInfo,
            fileStorageInfo: newFileStorageInfo
        }).then(ctx.success);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvdXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTZFO0FBQzdFLHVFQUFrRjtBQUdsRix1RUFLMEM7QUFDMUMsdURBRTBCO0FBSzFCLElBQWEsNEJBQTRCLEdBQXpDLE1BQWEsNEJBQTRCO0lBaUJyQyxLQUFLLENBQUMsZUFBZTtRQUVqQixNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2hFLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQy9FLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzVFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxnQ0FBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1NBQ25HO1FBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUM7UUFDdEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMs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