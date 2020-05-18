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
exports.ObjectController = void 0;
const sendToWormhole = require("stream-wormhole");
const midway_1 = require("midway");
const index_1 = require("egg-freelog-base/index");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
let ObjectController = /** @class */ (() => {
    let ObjectController = class ObjectController {
        async index(ctx) {
            const page = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
            const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
            const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
            const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
            const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
            const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
            ctx.validateParams();
            const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
            ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
            const condition = { bucketId: bucketInfo.bucketId };
            if (resourceType) {
                condition.resourceType = resourceType;
            }
            if (keywords) {
                const regex = { $regex: keywords, $options: 'i' };
                condition.$or = [{ objectName: regex }, { bucketName: regex }];
            }
            let dataList = [];
            const totalItem = await this.storageObjectService.count(condition);
            if (totalItem > (page - 1) * pageSize) {
                dataList = await this.storageObjectService.findPageList(condition, page, pageSize, projection, { createDate: -1 });
            }
            ctx.success({ page, pageSize, totalItem, dataList });
        }
        async show(ctx) {
            const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
            const objectName = ctx.checkParams('objectName').exist().type('string').value;
            ctx.validateParams();
            const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
            ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
            await this.storageObjectService.findOne({ bucketId: bucketInfo.bucketId, objectName }).then(ctx.success);
        }
        async create(ctx) {
            let fileStream = null;
            const createObjectFuncAsync = async () => {
                if (ctx.is('multipart')) {
                    fileStream = await ctx.getFileStream({ requireFile: false });
                    ctx.request.body = fileStream.fields;
                }
                const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
                const objectName = ctx.checkBody('objectName').exist().value;
                const resourceType = ctx.checkBody('resourceType').exist().isResourceType().toLowercase().value;
                const sha1 = ctx.checkBody('sha1').optional().isResourceId().toLowercase().value;
                ctx.validateParams();
                if (!sha1 && (!fileStream || !fileStream.filename)) {
                    throw new index_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'file or sha1'));
                }
                let fileStorageInfo = null;
                if (fileStream && fileStream.filename) {
                    fileStorageInfo = await this.fileStorageService.upload(fileStream);
                }
                else if (fileStream) {
                    fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
                    await sendToWormhole(fileStream);
                }
                else {
                    fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
                }
                const updateFileOptions = {
                    bucketName, resourceType, objectName,
                    userId: ctx.request.userId,
                    fileStorageInfo: {
                        sha1: fileStorageInfo.sha1,
                        fileSize: fileStorageInfo.fileSize,
                        serviceProvider: fileStorageInfo.serviceProvider,
                        storageInfo: fileStorageInfo.storageInfo
                    }
                };
                return this.storageObjectService.createObject(updateFileOptions);
            };
            await createObjectFuncAsync().then(ctx.success).catch(error => {
                if (!fileStream) {
                    throw error;
                }
                return sendToWormhole(fileStream).then(() => {
                    throw error;
                });
            });
        }
        async download(ctx) {
            const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
            const objectName = ctx.checkParams('objectName').exist().type('string').value;
            ctx.validateParams();
            const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
            ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
            const storageObject = await this.storageObjectService.findOne({ bucketId: bucketInfo.bucketId, objectName });
            if (!storageObject) {
                throw new index_1.ApplicationError(ctx.gettext('storage-object-not-found'));
            }
            const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
            await ctx.curl(fileStorageInfo['fileUrl'], { streaming: true }).then(({ status, headers, res }) => {
                if (status < 200 || status > 299) {
                    throw new index_1.ApplicationError(ctx.gettext('文件流读取失败'), { httpStatus: status });
                }
                ctx.status = status;
                ctx.body = res;
                ctx.set('content-type', headers['content-type']);
                ctx.set('content-length', headers['content-length']);
                ctx.attachment(storageObject.objectName);
                return res;
            });
        }
        async destroy(ctx) {
            const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
            const objectName = ctx.checkParams('objectName').exist().type('string').value;
            ctx.validateParams();
            const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
            ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
            const storageObject = await this.storageObjectService.findOne({ bucketId: bucketInfo.bucketId, objectName });
            if (!storageObject) {
                throw new index_1.ApplicationError(ctx.gettext('storage-object-not-found'));
            }
            return this.storageObjectService.deleteObject(storageObject.bucketId, storageObject.objectName);
        }
        // @post('/buckets/:bucketName/objects/upload') 此接口目前暂不对外提供.需要看业务实际设计
        async uploadFile(ctx) {
            const fileStream = await ctx.getFileStream();
            const fileStorageInfo = await this.fileStorageService.upload(fileStream);
            ctx.success({ sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize });
        }
    };
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ObjectController.prototype, "bucketService", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ObjectController.prototype, "fileStorageService", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ObjectController.prototype, "storageObjectService", void 0);
    __decorate([
        vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
        midway_1.get('/buckets/:bucketName/objects'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ObjectController.prototype, "index", null);
    __decorate([
        vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
        midway_1.get('/buckets/:bucketName/objects/:objectName'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ObjectController.prototype, "show", null);
    __decorate([
        vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
        midway_1.post('/buckets/:bucketName/objects'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ObjectController.prototype, "create", null);
    __decorate([
        vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
        midway_1.get('/buckets/:bucketName/objects/:objectName/file'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ObjectController.prototype, "download", null);
    __decorate([
        vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
        midway_1.del('/buckets/:bucketName/objects/:objectName'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ObjectController.prototype, "destroy", null);
    __decorate([
        vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ObjectController.prototype, "uploadFile", null);
    ObjectController = __decorate([
        midway_1.provide(),
        midway_1.controller('/v1/storages/')
    ], ObjectController);
    return ObjectController;
})();
exports.ObjectController = ObjectController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvc3RvcmFnZS1vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQWtEO0FBQ2xELG1DQUFtRTtBQUNuRSxrREFBa0Y7QUFFbEYsa0ZBQXFFO0FBTXJFO0lBQUEsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBZ0I7UUFXekIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO1lBQ1gsTUFBTSxJQUFJLEdBQVcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUN0RixNQUFNLFFBQVEsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUN2RyxNQUFNLFVBQVUsR0FBVyxHQUFHLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQztZQUN0RixNQUFNLFlBQVksR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUN0RyxNQUFNLFFBQVEsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsS0FBSyxDQUFDO1lBQzFG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