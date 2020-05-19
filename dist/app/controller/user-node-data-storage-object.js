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
        async create(ctx) {
            let fileStream = null;
            try {
                if (ctx.is('multipart')) {
                    fileStream = await ctx.getFileStream({ requireFile: false });
                    ctx.request.body = fileStream.fields;
                }
                const nodeId = ctx.checkBody('nodeId').exist().toInt().value;
                const sha1 = ctx.checkBody('sha1').optional().isResourceId().toLowercase().value;
                ctx.validateParams();
                if (!sha1 && (!fileStream || !fileStream.filename)) {
                    throw new index_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'file or sha1'));
                }
                const nodeInfo = await ctx.curlIntranetApi(`${ctx.webApi.nodeInfo}/${nodeId}`);
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
    ], UserNodeDataObjectController.prototype, "create", null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvdXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQWtEO0FBQ2xELGtGQUFxRTtBQUNyRSxtQ0FBNkU7QUFDN0Usa0RBQWtGO0FBQ2xGLHVFQUFrRjtBQUdsRix1RUFBNEc7QUFLNUc7SUFBQSxJQUFhLDRCQUE0QixHQUF6QyxNQUFhLDRCQUE0QjtRQWFyQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUc7WUFFWixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSTtnQkFDQSxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ3JCLFVBQVUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBQyxXQUFXLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztvQkFDM0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztpQkFDeEM7Z0JBQ0QsTUFBTSxNQUFNLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7Z0JBQ3JFLE1BQU0sSUFBSSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDO2dCQUN6RixHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBRXJCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDaEQsTUFBTSxJQUFJLHFCQUFhLENB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