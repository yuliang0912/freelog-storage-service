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
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
const midway_1 = require("midway");
const index_1 = require("egg-freelog-base/index");
const bucket_interface_1 = require("../../interface/bucket-interface");
const common_interface_1 = require("../../interface/common-interface");
let UserNodeDataObjectController = class UserNodeDataObjectController {
    async createOrReplace(ctx) {
        const nodeId = ctx.checkBody('nodeId').optional().toInt().value;
        const nodeDomain = ctx.checkBody('nodeDomain').optional().isNodeDomain().value;
        const userNodeData = ctx.checkBody('userNodeData').exist().isObject().value;
        ctx.validateParams();
        if (!nodeId && !nodeDomain) {
            throw new index_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'nodeId or nodeDomain'));
        }
        const nodeInfo = await ctx.curlIntranetApi(`${ctx.webApi.nodeInfo}/${nodeId ? nodeId : `detail?nodeDomain=${nodeDomain}`}`);
        if (!nodeInfo) {
            throw new index_1.ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        const fileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(userNodeData);
        const updateFileOptions = {
            userId: ctx.request.userId, nodeInfo,
            fileStorageInfo: {
                sha1: fileStorageInfo.sha1,
                fileSize: fileStorageInfo.fileSize,
                serviceProvider: fileStorageInfo.serviceProvider,
                storageInfo: fileStorageInfo.storageInfo
            }
        };
        await this.objectStorageService.createUserNodeObject(updateFileOptions).then(ctx.success);
    }
    async update(ctx) {
        const nodeId = ctx.checkParams('nodeId').exist().toInt().value;
        const removeFields = ctx.checkBody('removeFields').optional().isArray().default([]).value;
        const appendOrReplaceObject = ctx.checkBody('appendOrReplaceObject').optional().isObject().value;
        ctx.validateParams();
        const nodeInfo = await ctx.curlIntranetApi(`${ctx.webApi.nodeInfo}/${nodeId}`);
        if (!nodeInfo) {
            throw new index_1.ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        const bucketInfo = await this.bucketService.findOne({
            userId: ctx.request.userId,
            bucketName: bucket_interface_1.SystemBucketName.UserNodeData
        });
        if (!bucketInfo) {
            throw new index_1.ApplicationError(ctx.gettext('bucket-entity-not-found'));
        }
        const storageObject = await this.objectStorageService.findOne({
            bucketId: bucketInfo.bucketId,
            objectName: `${nodeInfo.nodeDomain}.ncfg`
        });
        if (!storageObject) {
            throw new index_1.ApplicationError(ctx.gettext('storage-object-not-found'));
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        ctx.attachment(storageObject.objectName);
        const objectOperations = Object.keys(appendOrReplaceObject).map(key => Object({
            key, value: appendOrReplaceObject[key], type: common_interface_1.JsonObjectOperationTypeEnum.AppendOrReplace
        }));
        removeFields.forEach(item => objectOperations.push({ key: item, type: common_interface_1.JsonObjectOperationTypeEnum.Remove }));
        const transformStream = this.userNodeDataFileOperation.edit(fileStream, objectOperations);
        transformStream.filename = storageObject.objectName;
        const newFileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(transformStream);
        await this.objectStorageService.updateObject(storageObject, newFileStorageInfo).then(ctx.success);
    }
    async download(ctx) {
        const objectNameOrNodeId = ctx.checkParams('objectNameOrNodeId').exist().type('string').value;
        const fields = ctx.checkQuery('fields').optional().len(1).toSplitArray().default([]).value;
        ctx.validateParams();
        let getNodeInfoUrl = '';
        if (objectNameOrNodeId.endsWith('.ncfg')) {
            getNodeInfoUrl = `${ctx.webApi.nodeInfo}/detail?nodeDomain=${objectNameOrNodeId.replace('.ncfg', '')}`;
        }
        else if (/^\d{8,10}$/.test(objectNameOrNodeId)) {
            getNodeInfoUrl = `${ctx.webApi.nodeInfo}/${objectNameOrNodeId}`;
        }
        else {
            throw new index_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'objectNameOrNodeId'));
        }
        const nodeInfo = await ctx.curlIntranetApi(getNodeInfoUrl);
        if (!nodeInfo) {
            throw new index_1.ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        const bucketInfo = await this.bucketService.findOne({
            userId: ctx.request.userId,
            bucketName: bucket_interface_1.SystemBucketName.UserNodeData
        });
        if (!bucketInfo) {
            return ctx.body = new Buffer('{}');
        }
        const storageObject = await this.objectStorageService.findOne({
            bucketId: bucketInfo.bucketId,
            objectName: `${nodeInfo.nodeDomain}.ncfg`
        });
        if (!storageObject) {
            return ctx.body = new Buffer('{}');
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        if (fields.length) {
            ctx.set('Connection', 'close');
            ctx.set('Transfer-Encoding', 'chunked');
        }
        else {
            ctx.set('Content-length', storageObject.systemProperty.fileSize);
        }
        ctx.set('Content-Type', 'application/json');
        ctx.attachment(storageObject.objectName);
        ctx.body = this.userNodeDataFileOperation.pick(fileStream, fields);
    }
    async download1(ctx) {
        const objectNameOrNodeId = ctx.checkParams('objectNameOrNodeId').exist().type('string').value;
        const fields = ctx.checkQuery('fields').optional().len(1).toSplitArray().default([]).value;
        ctx.validateParams();
        ctx.request.userId = 50017;
        let getNodeInfoUrl = '';
        if (objectNameOrNodeId.endsWith('.ncfg')) {
            getNodeInfoUrl = `${ctx.webApi.nodeInfo}/detail?nodeDomain=${objectNameOrNodeId.replace('.ncfg', '')}`;
        }
        else if (/^\d{8,10}$/.test(objectNameOrNodeId)) {
            getNodeInfoUrl = `${ctx.webApi.nodeInfo}/${objectNameOrNodeId}`;
        }
        else {
            throw new index_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'objectNameOrNodeId'));
        }
        const nodeInfo = await ctx.curlIntranetApi(getNodeInfoUrl);
        if (!nodeInfo) {
            throw new index_1.ArgumentError(ctx.gettext('node-entity-not-found'));
        }
        const bucketInfo = await this.bucketService.findOne({
            userId: ctx.request.userId,
            bucketName: bucket_interface_1.SystemBucketName.UserNodeData
        });
        if (!bucketInfo) {
            return ctx.body = new Buffer('{}');
        }
        const storageObject = await this.objectStorageService.findOne({
            bucketId: bucketInfo.bucketId,
            objectName: `${nodeInfo.nodeDomain}.ncfg`
        });
        if (!storageObject) {
            return ctx.body = new Buffer('{}');
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        if (fields.length) {
            ctx.set('Connection', 'close');
            ctx.set('Transfer-Encoding', 'chunked');
        }
        else {
            ctx.set('Content-length', storageObject.systemProperty.fileSize);
        }
        ctx.set('Content-Type', 'application/json');
        ctx.attachment(storageObject.objectName);
        ctx.body = this.userNodeDataFileOperation.pick(fileStream, fields);
    }
};
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
], UserNodeDataObjectController.prototype, "userNodeDataFileOperation", void 0);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.post('/objects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserNodeDataObjectController.prototype, "createOrReplace", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.put('/objects/:nodeId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserNodeDataObjectController.prototype, "update", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.get('/objects/:objectNameOrNodeId/customPick'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserNodeDataObjectController.prototype, "download", null);
__decorate([
    midway_1.get('/objects/:objectNameOrNodeId/customPick1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserNodeDataObjectController.prototype, "download1", null);
UserNodeDataObjectController = __decorate([
    midway_1.provide(),
    midway_1.priority(1),
    midway_1.controller('/v1/storages/buckets/.UserNodeData')
], UserNodeDataObjectController);
exports.UserNodeDataObjectController = UserNodeDataObjectController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvdXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsa0ZBQXFFO0FBQ3JFLG1DQUE2RTtBQUM3RSxrREFBa0Y7QUFDbEYsdUVBQWtGO0FBR2xGLHVFQUE0RztBQUs1RyxJQUFhLDRCQUE0QixHQUF6QyxNQUFhLDRCQUE0QjtJQWFyQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7UUFFckIsTUFBTSxNQUFNLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDeEUsTUFBTSxVQUFVLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDdkYsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDNUUsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDeEIsTUFBTSxJQUFJLHFCQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7U0FDbkc7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCLFVBQVUsRUFBRSxFQUFF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