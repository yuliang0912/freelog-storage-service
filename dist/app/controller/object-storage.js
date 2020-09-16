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
const lodash_1 = require("lodash");
const common_regex_1 = require("egg-freelog-base/app/extend/helper/common_regex");
let ObjectController = class ObjectController {
    async myObjects(ctx) {
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
    async list(ctx) {
        // 需要调用方对URL做编码.然后多个obejctName使用.分隔(几个操作系统的文件名都不能包含".",所以不存在分隔冲突).
        const fullObjectNames = ctx.checkQuery('fullObjectNames').optional().decodeURIComponent().toSplitArray(null, '.').len(1, 200).default([]).value;
        const objectIds = ctx.checkQuery('objectIds').optional().isSplitMongoObjectId().toSplitArray(null, '.').len(1, 200).default([]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const condition = { $or: objectIds.map(objectId => Object({ _id: objectId })) };
        fullObjectNames.forEach(fullObjectName => {
            const [bucketName, objectName] = fullObjectName.split('/');
            if (!lodash_1.isString(bucketName) || !lodash_1.isString(objectName)) {
                throw new index_1.ArgumentError(ctx.gettext('params-validate-failed', 'fullObjectName'));
            }
            if (!common_regex_1.strictBucketName.test(bucketName)) {
                throw new index_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'fullObjectName'));
            }
            const uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketName, objectName);
            condition.$or.push({ uniqueKey });
        });
        if (lodash_1.isEmpty(condition.$or)) {
            throw new index_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'fullObjectNames,objectIds'));
        }
        await this.objectStorageService.find(condition, projection.join(' ')).then(ctx.success);
    }
    async detail(ctx) {
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        ctx.validateParams();
        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectIdOrName')
        });
        ctx.success(objectStorageInfo);
    }
    async createOrReplace(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        const objectName = ctx.checkBody('objectName').exist().value;
        const sha1 = ctx.checkBody('sha1').exist().isSha1().toLowercase().value;
        // const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLowercase().value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({
            bucketName,
            userId: ctx.request.userId
        });
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, ctx.gettext('params-validate-failed', 'sha1'));
        const createOrUpdateFileOptions = { objectName, fileStorageInfo };
        await this.objectStorageService.createObject(bucketInfo, createOrUpdateFileOptions).then(ctx.success);
    }
    async destroy(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectIds = ctx.checkParams('objectIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.request.userId });
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));
        await this.objectStorageService.batchDeleteObjects(bucketInfo, objectIds).then(ctx.success);
    }
    async download(ctx) {
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        ctx.validateParams();
        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectIdOrName')
        });
        const fileStorageInfo = await this.fileStorageService.findBySha1(objectStorageInfo.sha1);
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        ctx.body = fileStream;
        ctx.attachment(objectStorageInfo.objectName);
        ctx.set('content-length', fileStorageInfo.fileSize);
        if (objectStorageInfo.systemProperty.mime) {
            ctx.set('content-type', objectStorageInfo.systemProperty.mime);
        }
    }
    async updateProperty(ctx) {
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        const customProperty = ctx.checkBody('customProperty').optional().isObject().value;
        const dependencies = ctx.checkBody('dependencies').optional().isArray().value;
        const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLow().value;
        const objectName = ctx.checkBody('objectName').optional().type('string').value;
        ctx.validateParams();
        const objectDependencyValidateResult = this.objectDependencyValidator.validate(dependencies);
        if (!lodash_1.isEmpty(objectDependencyValidateResult.errors)) {
            throw new index_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: objectDependencyValidateResult.errors
            });
        }
        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectId')
        });
        await this.objectStorageService.updateObject(objectStorageInfo, {
            customProperty, dependencies, resourceType, objectName
        }).then(ctx.success);
    }
    async dependencyTree(ctx) {
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();
        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        if (!objectStorageInfo) {
            throw new index_1.ApplicationError(ctx.gettext('storage-object-not-found'));
        }
        await this.objectStorageService.getDependencyTree(objectStorageInfo, isContainRootNode).then(ctx.success);
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
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectController.prototype, "objectDependencyValidator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectController.prototype, "storageCommonGenerator", void 0);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.get('/buckets/_all/objects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "myObjects", null);
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
    midway_1.get('/objects/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "list", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.get('/objects/:objectIdOrName'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "detail", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.post('/buckets/:bucketName/objects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "createOrReplace", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.del('/buckets/:bucketName/objects/:objectIds'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "destroy", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.get('/objects/:objectIdOrName/file'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "download", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.put('/objects/:objectIdOrName'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "updateProperty", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(index_1.LoginUser),
    midway_1.get('/objects/:objectIdOrName/dependencyTree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "dependencyTree", null);
ObjectController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v1/storages/')
], ObjectController);
exports.ObjectController = ObjectController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvb2JqZWN0LXN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXdFO0FBQ3hFLGtEQUFrRjtBQUVsRixrRkFBcUU7QUFHckUsbUNBQXlDO0FBQ3pDLGtGQUFpRjtBQUtqRixJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQWV6QixLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUc7UUFDZixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzlFLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQy9GLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzlGLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDbEYsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FB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