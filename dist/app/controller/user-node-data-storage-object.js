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
const common_regex_1 = require("egg-freelog-base/app/extend/helper/common_regex");
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
        const objectIdOrNodeId = ctx.checkParams('objectIdOrNodeId').exist().type('string').value;
        const fields = ctx.checkQuery('fields').optional().len(1).toSplitArray().default([]).value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({
            userId: ctx.request.userId,
            bucketName: bucket_interface_1.SystemBucketName.UserNodeData
        });
        if (!bucketInfo) {
            return ctx.body = Buffer.from('{}');
        }
        const findCondition = { bucketId: bucketInfo.bucketId };
        if (common_regex_1.mongoObjectId.test(objectIdOrNodeId)) {
            findCondition._id = objectIdOrNodeId;
        }
        else if (/^\d{8,10}$/.test(objectIdOrNodeId)) {
            const nodeInfo = await ctx.curlIntranetApi(`${ctx.webApi.nodeInfo}/${objectIdOrNodeId}`);
            if (!nodeInfo) {
                throw new index_1.ArgumentError(ctx.gettext('node-entity-not-found'));
            }
            findCondition.objectName = `${nodeInfo.nodeDomain}.ncfg`;
        }
        else {
            throw new index_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'objectIdOrNodeId'));
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
            ctx.set('Content-length', fileStorageInfo.fileSize);
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
    midway_1.get('/objects/:objectIdOrNodeId/customPick'),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvdXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsa0ZBQXFFO0FBQ3JFLG1DQUE2RTtBQUM3RSxrREFBa0Y7QUFDbEYsdUVBQWtGO0FBR2xGLHVFQUE0RztBQUM1RyxrRkFBOEU7QUFLOUUsSUFBYSw0QkFBNEIsR0FBekMsTUFBYSw0QkFBNEI7SUFhckMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1FBRXJCLE1BQU0sTUFBTSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3hFLE1BQU0sVUFBVSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3ZGLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzVFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxxQkFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1NBQ25HO1FBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixV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