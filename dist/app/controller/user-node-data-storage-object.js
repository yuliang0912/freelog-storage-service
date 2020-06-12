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
            await this.objectStorageService.updateObject(storageObject, newFileStorageInfo).then(ctx.success);
        }
        async download(ctx) {
            const nodeId = ctx.checkParams('nodeId').exist().toInt().value;
            const fields = ctx.checkQuery('fields').optional().len(1).toSplitArray().default([]).value;
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
            const storageObject = await this.objectStorageService.findOne({
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
                return res;
            });
            ctx.attachment(storageObject.objectName);
            ctx.set('Transfer-Encoding', 'chunked');
            const stream = ctx.body = this.userNodeDataFileOperation.pick(fileStream, fields);
            stream.on('error', error => {
                console.log('API-customPick error:' + error.toString());
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvdXNlci1ub2RlLWRhdGEtc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQWtEO0FBQ2xELGtGQUFxRTtBQUNyRSxtQ0FBNkU7QUFDN0Usa0RBQWtGO0FBQ2xGLHVFQUFrRjtBQUdsRix1RUFBNEc7QUFFNUcsbUNBQW1DO0FBS25DO0lBQUEsSUFBYSw0QkFBNEIsR0FBekMsTUFBYSw0QkFBNEI7UUFhckMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1lBRXJCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJO2dCQUNBLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDckIsVUFBVSxHQUFHLE1BQU0sR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO29CQUMzRCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO2lCQUN4QztnQkFDRCxNQUFNLE1BQU0sR0FBVyxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztnQkFDeEUsTUFBTSxVQUFVLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7Z0JBQ3ZGLE1BQU0sSUFBSSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDO2dCQUN6RixHQUFHLENBQUMsY0FBYyxF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