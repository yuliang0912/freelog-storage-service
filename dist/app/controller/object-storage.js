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
            const totalItem = await this.objectStorageService.count(condition);
            if (totalItem > (page - 1) * pageSize) {
                dataList = await this.objectStorageService.findPageList(condition, page, pageSize, projection, { createDate: -1 });
            }
            ctx.success({ page, pageSize, totalItem, dataList });
        }
        async show(ctx) {
            const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
            const objectName = ctx.checkParams('objectName').exist().type('string').value;
            ctx.validateParams();
            const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
            ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
            await this.objectStorageService.findOne({ bucketId: bucketInfo.bucketId, objectName }).then(ctx.success);
        }
        async createOrReplace(ctx) {
            const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
            const objectName = ctx.checkBody('objectName').exist().value;
            const sha1 = ctx.checkBody('sha1').exist().isResourceId().toLowercase().value;
            const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLowercase().value;
            ctx.validateParams();
            const bucketInfo = await this.bucketService.findOne({
                bucketName,
                userId: ctx.request.userId
            });
            ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
            const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
            ctx.entityNullObjectCheck(fileStorageInfo, ctx.gettext('params-validate-failed', 'sha1'));
            const createOrUpdateFileOptions = {
                resourceType, objectName, fileStorageInfo
            };
            await this.objectStorageService.createObject(bucketInfo, createOrUpdateFileOptions).then(ctx.success);
        }
        async download(ctx) {
            const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
            const objectName = ctx.checkParams('objectName').exist().type('string').value;
            ctx.validateParams();
            const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
            ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
            const storageObject = await this.objectStorageService.findOne({ bucketId: bucketInfo.bucketId, objectName });
            if (!storageObject) {
                throw new index_1.ApplicationError(ctx.gettext('storage-object-not-found'));
            }
            const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
            await ctx.curl(fileStorageInfo.fileUrl, { streaming: true }).then(({ status, headers, res }) => {
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
            const storageObject = await this.objectStorageService.findOne({ bucketId: bucketInfo.bucketId, objectName });
            if (!storageObject) {
                throw new index_1.ApplicationError(ctx.gettext('storage-object-not-found'));
            }
            return this.objectStorageService.deleteObject(storageObject);
        }
        async updateProperty(ctx) {
            const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
            const objectName = ctx.checkParams('objectName').exist().type('string').value;
            const customProperty = ctx.checkBody('customProperty').optional().isObject().value;
            const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLow().value;
            const newObjectName = ctx.checkBody('objectName').optional().type('string').value;
            ctx.validateParams();
            ctx.success({ bucketName, objectName, customProperty, resourceType, newObjectName });
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
    ], ObjectController.prototype, "objectStorageService", void 0);
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
    ], ObjectController.prototype, "createOrReplace", null);
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
        midway_1.put('/buckets/:bucketName/objects/:objectName'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ObjectController.prototype, "updateProperty", null);
    ObjectController = __decorate([
        midway_1.provide(),
        midway_1.controller('/v1/storages/')
    ], ObjectController);
    return ObjectController;
})();
exports.ObjectController = ObjectController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvb2JqZWN0LXN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXdFO0FBQ3hFLGtEQUFtRTtBQUVuRSxrRkFBcUU7QUFNckU7SUFBQSxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtRQVd6QixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUc7WUFDWCxNQUFNLElBQUksR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3RGLE1BQU0sUUFBUSxHQUFXLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3ZHLE1BQU0sVUFBVSxHQUFXLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3RGLE1BQU0sWUFBWSxHQUFXLEdBQUcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3RHLE1BQU0sUUFBUSxHQUFXLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDMUYsTUFBTSxVQUFVLEdB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