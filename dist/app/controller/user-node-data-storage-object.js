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
const sendToWormhole = require("stream-wormhole");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
const midway_1 = require("midway");
const index_1 = require("egg-freelog-base/index");
const bucket_interface_1 = require("../../interface/bucket-interface");
const common_interface_1 = require("../../interface/common-interface");
// import {finished} from 'stream';
let UserNodeDataObjectController = class UserNodeDataObjectController {
    async createOrReplace(ctx) {
        let fileStream = null;
        try {
            if (ctx.is('multipart')) {
                fileStream = await ctx.getFileStream({ requireFile: false });
                ctx.request.body = fileStream.fields;
            }
            const nodeId = ctx.checkBody('nodeId').optional().toInt().value;
            const nodeDomain = ctx.checkBody('nodeDomain').optional().isNodeDomain().value;
            const sha1 = ctx.checkBody('sha1').optional().isResourceId().toLowercase().value;
            ctx.validateParams();
            if (!nodeId && !nodeDomain) {
                throw new index_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'nodeId or nodeDomain'));
            }
            if (!sha1 && (!fileStream || !fileStream.filename)) {
                throw new index_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'file or sha1'));
            }
            const nodeInfo = await ctx.curlIntranetApi(`${ctx.webApi.nodeInfo}/${nodeId ? nodeId : `detail?nodeDomain=${nodeDomain}`}`);
            if (!nodeInfo) {
                throw new index_1.ArgumentError(ctx.gettext('node-entity-not-found'));
            }
            let fileStorageInfo = null;
            if (fileStream && fileStream.filename) {
                fileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(fileStream);
            }
            else if (fileStream) {
                fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
                await sendToWormhole(fileStream);
            }
            else {
                fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
            }
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
        catch (error) {
            if (fileStream) {
                await sendToWormhole(fileStream);
            }
            throw error;
        }
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
        const fileStream = this.fileStorageService.getFileStream(fileStorageInfo);
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
UserNodeDataObjectController = __decorate([
    midway_1.provide(),
    midway_1.priority(1),
    midway_1.controller('/v1/storages/buckets/.UserNodeData')
], UserNodeDataObjectController);
exports.UserNodeDataObjectController = UserNodeDataObjectController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvdXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQWtEO0FBQ2xELGtGQUFxRTtBQUNyRSxtQ0FBNkU7QUFDN0Usa0RBQWtGO0FBQ2xGLHVFQUFrRjtBQUdsRix1RUFBNEc7QUFFNUcsbUNBQW1DO0FBS25DLElBQWEsNEJBQTRCLEdBQXpDLE1BQWEsNEJBQTRCO0lBYXJDLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztRQUVyQixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSTtZQUNBLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDckIsVUFBVSxHQUFHLE1BQU0sR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO2dCQUMzRCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO2FBQ3hDO1lBQ0QsTUFBTSxNQUFNLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDeEUsTUFBTSxVQUFVLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDdkYsTUFBTSxJQUFJLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDekYsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lB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