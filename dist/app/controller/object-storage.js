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
let ObjectController = class ObjectController {
    async index1(ctx) {
        const page = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const isLoadingTypeless = ctx.checkQuery('isLoadingTypeless').optional().in([0, 1]).default(1).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const condition = {};
        if (resourceType && isLoadingTypeless) {
            condition.resourceType = { $in: [resourceType, ''] };
        }
        else if (resourceType) {
            condition.resourceType = resourceType;
        }
        else if (!isLoadingTypeless) {
            condition.resourceType = { $ne: '' };
        }
        if (keywords) {
            const regex = { $regex: keywords, $options: 'i' };
            condition.$or = [{ objectName: regex }, { bucketName: regex }];
        }
        const buckets = await this.bucketService.find({ userId: ctx.userId, bucketType: 1 });
        condition.bucketId = { $in: buckets.map(x => x.bucketId) };
        let dataList = [];
        const totalItem = await this.objectStorageService.count(condition);
        if (buckets.length && totalItem > (page - 1) * pageSize) {
            dataList = await this.objectStorageService.findPageList(condition, page, pageSize, projection, { createDate: -1 });
        }
        ctx.success({ page, pageSize, totalItem, dataList });
    }
    async index(ctx) {
        const page = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const isLoadingTypeless = ctx.checkQuery('isLoadingTypeless').optional().in([0, 1]).default(1).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
        const condition = { bucketId: bucketInfo.bucketId };
        if (resourceType && isLoadingTypeless) {
            condition.resourceType = { $in: [resourceType, ''] };
        }
        else if (resourceType) {
            condition.resourceType = resourceType;
        }
        else if (!isLoadingTypeless) {
            condition.resourceType = { $ne: '' };
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
        const objectId = ctx.checkParams('objectId').exist().isMongoObjectId().value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
        await this.objectStorageService.findOne({ _id: objectId, bucketId: bucketInfo.bucketId }).then(ctx.success);
    }
    async createOrReplace(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        const objectName = ctx.checkBody('objectName').exist().value;
        const sha1 = ctx.checkBody('sha1').exist().isSha1().toLowercase().value;
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
        const objectId = ctx.checkParams('objectId').exist().isMongoObjectId().value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
        const storageObject = await this.objectStorageService.findOne({ _id: objectId, bucketId: bucketInfo.bucketId });
        if (!storageObject) {
            throw new index_1.ApplicationError(ctx.gettext('storage-object-not-found'));
        }
        const fileStorageInfo = await this.fileStorageService.findBySha1(storageObject.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        ctx.body = fileStream;
        ctx.attachment(storageObject.objectName);
        ctx.set('content-length', fileStorageInfo.fileSize);
    }
    async destroy(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectIds = ctx.checkParams('objectIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
        await this.objectStorageService.batchDeleteObjects(bucketInfo, objectIds).then(ctx.success);
    }
    async updateProperty(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectId = ctx.checkParams('objectId').exist().isMongoObjectId().value;
        const customProperty = ctx.checkBody('customProperty').optional().isObject().value;
        const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLow().value;
        const newObjectName = ctx.checkBody('objectName').optional().type('string').value;
        ctx.validateParams();
        ctx.success({ bucketName, objectId, customProperty, resourceType, newObjectName });
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
    midway_1.get('/buckets/objects/my'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "index1", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.get('/buckets/:bucketName/objects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "index", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.get('/buckets/:bucketName/objects/:objectId'),
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
    midway_1.get('/buckets/:bucketName/objects/:objectId/file'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "download", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.del('/buckets/:bucketName/objects/:objectIds'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "destroy", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.put('/buckets/:bucketName/objects/:objectId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "updateProperty", null);
ObjectController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v1/storages/')
], ObjectController);
exports.ObjectController = ObjectController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvb2JqZWN0LXN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXdFO0FBQ3hFLGtEQUFtRTtBQUVuRSxrRkFBcUU7QUFNckUsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBZ0I7SUFXekIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHO1FBQ1osTUFBTSxJQUFJLEdBQVcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN0RixNQUFNLFFBQVEsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN2RyxNQUFNLFlBQVksR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN0RyxNQUFNLFFBQVEsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzFGLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFD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