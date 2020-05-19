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
let UserNodeDataObjectController = /** @class */ (() => {
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
                await this.storageObjectService.createUserNodeObject(updateFileOptions).then(ctx.success);
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
            const storageObject = await this.storageObjectService.findOne({
                bucketId: bucketInfo.bucketId,
                objectName: `${nodeInfo.nodeDomain}.ncfg`
            });
            if (!storageObject) {
                throw new index_1.ApplicationError(ctx.gettext('storage-object-not-found'));
            }
            const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
            const fileStream = await ctx.curl(fileStorageInfo['fileUrl'], { streaming: true }).then(({ status, headers, res }) => {
                if (status < 200 || status > 299) {
                    throw new index_1.ApplicationError(ctx.gettext('文件流读取失败'), { httpStatus: status });
                }
                ctx.status = status;
                ctx.attachment(storageObject.objectName);
                return res;
            });
            const objectOperations = Object.keys(appendOrReplaceObject).map(key => Object({
                key, value: appendOrReplaceObject[key], type: common_interface_1.JsonObjectOperationTypeEnum.AppendOrReplace
            }));
            removeFields.forEach(item => objectOperations.push({ key: item, type: common_interface_1.JsonObjectOperationTypeEnum.Remove }));
            const transformStream = this.userNodeDataFileOperation.edit(fileStream, objectOperations);
            transformStream.filename = storageObject.objectName;
            const newFileStorageInfo = await this.fileStorageService.uploadUserNodeDataFile(transformStream);
            await this.storageObjectService.updateObject(storageObject, newFileStorageInfo).then(ctx.success);
        }
        async download(ctx) {
            const nodeId = ctx.checkParams('nodeId').exist().toInt().value;
            const fields = ctx.checkQuery('fields').optional().toSplitArray().default([]).value;
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
            const fileStream = await ctx.curl(fileStorageInfo['fileUrl'], { streaming: true }).then(({ status, headers, res }) => {
                if (status < 200 || status > 299) {
                    throw new index_1.ApplicationError(ctx.gettext('文件流读取失败'), { httpStatus: status });
                }
                ctx.status = status;
                ctx.attachment(storageObject.objectName);
                return res;
            });
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
    ], UserNodeDataObjectController.prototype, "storageObjectService", void 0);
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
        midway_1.get('/objects/:nodeId/customPick'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], UserNodeDataObjectController.prototype, "download", null);
    UserNodeDataObjectController = __decorate([
        midway_1.provide(),
        midway_1.priority(1),
        midway_1.controller('/v1/storages/buckets/.UserNodeData')
    ], UserNodeDataObjectController);
    return UserNodeDataObjectController;
})();
exports.UserNodeDataObjectController = UserNodeDataObjectController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvdXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQWtEO0FBQ2xELGtGQUFxRTtBQUNyRSxtQ0FBNkU7QUFDN0Usa0RBQWtGO0FBQ2xGLHVFQUFrRjtBQUdsRix1RUFBNEc7QUFLNUc7SUFBQSxJQUFhLDRCQUE0QixHQUF6QyxNQUFhLDRCQUE0QjtRQWFyQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFFckIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUk7Z0JBQ0EsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUNyQixVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUMsV0FBVyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7b0JBQzNELEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7aUJBQ3hDO2dCQUNELE1BQU0sTUFBTSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO2dCQUN4RSxNQUFNLFVBQVUsR0FBVyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQztnQkFDdkYsTUFBTSxJQUFJLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUM7Z0JBQ3pGLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFF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