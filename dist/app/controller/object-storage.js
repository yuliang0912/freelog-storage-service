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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvb2JqZWN0LXN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXdFO0FBQ3hFLGtEQUFtRTtBQUVuRSxrRkFBcUU7QUFNckUsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBZ0I7SUFXekIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO1FBQ1gsTUFBTSxJQUFJLEdBQVcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN0RixNQUFNLFFBQVEsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN2RyxNQUFNLFVBQVUsR0FBVyxHQUFHLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN0RixNQUFNLFlBQVksR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN0RyxNQUFNLFFBQVEsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzFGLE1BQU0sVUFBVSxHQUFhLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0RyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQzlGLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7UUFFOUUsTUFBTSxTQUFTLEdBQVEsRUFBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBQyxDQUFDO1FBQ3ZELElBQUksWUFBWSxFQUFFO1lBQ2QsU0FBUyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7U0FDekM7UUFDRCxJQUFJLFFBQVEsRUFBRTtZQUNWLE1BQU0sS0FBSyxHQUFXLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFDLENBQUM7WUFDeEQsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7U0FDOUQ7UUFFRCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25FLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRTtZQUNuQyxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7U0FDcEg7UUFFRCxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBSUQsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHO1FBQ1YsTUFBTSxVQUFVLEdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDdEYsTUFBTSxRQUFRLEdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDckYsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUM5RixHQUFHLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUcsQ0FBQztJQUlELEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztRQUNyQixNQUFNLFVBQVUsR0FBVyxHQUFHLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzVGLE1BQU0sVUFBVSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3JFLE1BQU0sSUFBSSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2hGLE1BQU0sWUFBWSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzNHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyQixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ2hELFVBQVU7WUFDVixNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNO1NBQzdCLENBQUMsQ0FBQztRQUNILEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7UUFFOUUsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZFLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTFGLE1BQU0seUJBQXlCLEdBQUc7WUFDOUIsWUFBWSxFQUFFLFVBQVUsRUFBRSxlQUFlO1NBQzVDLENBQUM7UUFDRixNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLHlCQUF5QixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRyxDQUFDO0lBSUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHO1FBQ2QsTUFBTSxVQUFVLEdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDdEYsTUFBTSxRQUFRLEdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDckYsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUM5RixHQUFHLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQzlHLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDaEIsTUFBTSxJQUFJLHdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDaEYsR0FBRyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7UUFDdEIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUlELEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRztRQUNiLE1BQU0sVUFBVSxHQUFXLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3RGLE1BQU0sU0FBUyxHQUFhLEdBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN6SCxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQzlGLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7UUFFOUUsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEcsQ0FBQztJQUlELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRztRQUNwQixNQUFNLFVBQVUsR0FBVyxHQUFHLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN0RixNQUFNLFFBQVEsR0FBVyxHQUFHLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNyRixNQUFNLGNBQWMsR0FBVyxHQUFHLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzNGLE1BQU0sWUFBWSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3JHLE1BQU0sYUFBYSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMxRixHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7Q0FDSixDQUFBO0FBMUhHO0lBREMsZUFBTSxFQUFFOzt1REFDcUI7QUFFOUI7SUFEQyxlQUFNLEVBQUU7OzREQUMrQjtBQUV4QztJQURDLGVBQU0sRUFBRTs7OERBQ21DO0FBSTVDO0lBRkMseUNBQWUsQ0FBQyxpQkFBUyxDQUFDO0lBQzFCLFlBQUcsQ0FBQyw4QkFBOEIsQ0FBQzs7Ozs2Q0E2Qm5DO0FBSUQ7SUFGQyx5Q0FBZSxDQUFDLGlCQUFTLENBQUM7SUFDMUIsWUFBRyxDQUFDLHdDQUF3QyxDQUFDOzs7OzRDQVU3QztBQUlEO0lBRkMseUNBQWUsQ0FBQyxpQkFBUyxDQUFDO0lBQzFCLGFBQUksQ0FBQyw4QkFBOEIsQ0FBQzs7Ozt1REFxQnBDO0FBSUQ7SUFGQyx5Q0FBZSxDQUFDLGlCQUFTLENBQUM7SUFDMUIsWUFBRyxDQUFDLDZDQUE2QyxDQUFDOzs7O2dEQW1CbEQ7QUFJRDtJQUZDLHlDQUFlLENBQUMsaUJBQVMsQ0FBQztJQUMxQixZQUFHLENBQUMseUNBQXlDLENBQUM7Ozs7K0NBVTlDO0FBSUQ7SUFGQyx5Q0FBZSxDQUFDLGlCQUFTLENBQUM7SUFDMUIsWUFBRyxDQUFDLHdDQUF3QyxDQUFDOzs7O3NEQVU3QztBQTVIUSxnQkFBZ0I7SUFGNUIsZ0JBQU8sRUFBRTtJQUNULG1CQUFVLENBQUMsZUFBZSxDQUFDO0dBQ2YsZ0JBQWdCLENBNkg1QjtBQTdIWSw0Q0FBZ0IifQ==