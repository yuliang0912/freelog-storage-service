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
const lodash_1 = require("lodash");
const egg_freelog_base_1 = require("egg-freelog-base");
const resource_type_repair_service_1 = require("../service/resource-type-repair-service");
let ObjectController = class ObjectController {
    async resourceTypeRepair() {
        await this.resourceTypeRepairService.resourceTypeRepair().then(() => this.ctx.success(true));
    }
    async myObjects() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().value;
        const resourceType = ctx.checkQuery('resourceType').optional().value;
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
        await this.objectStorageService.findIntervalList(condition, skip, limit, projection, sort).then(ctx.success);
    }
    async index() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').optional().isResourceType().toLow().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const isLoadingTypeless = ctx.checkQuery('isLoadingTypeless').optional().in([0, 1]).default(1).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.userId });
        ctx.entityNullObjectCheck(bucketInfo, { msg: ctx.gettext('bucket-entity-not-found') });
        const condition = { bucketId: bucketInfo.bucketId };
        if (resourceType && isLoadingTypeless) {
            condition.resourceType = { $in: [resourceType, ''] };
        }
        else if (resourceType) {
            condition.resourceType = resourceType;
        }
        else if (omitResourceType) {
            condition.resourceType = { $ne: omitResourceType };
        }
        else if (!isLoadingTypeless) {
            condition.resourceType = { $ne: '' };
        }
        if (keywords) {
            const regex = { $regex: keywords, $options: 'i' };
            condition.$or = [{ objectName: regex }, { bucketName: regex }];
        }
        await this.objectStorageService.findIntervalList(condition, skip, limit, projection, sort).then(ctx.success);
    }
    async show() {
        const { ctx } = this;
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectId = ctx.checkParams('objectId').exist().isMongoObjectId().value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.userId });
        ctx.entityNullObjectCheck(bucketInfo, { msg: ctx.gettext('bucket-entity-not-found') });
        await this.objectStorageService.findOne({ _id: objectId, bucketId: bucketInfo.bucketId }).then(ctx.success);
    }
    async list() {
        const { ctx } = this;
        // 需要调用方对每个objectName单独做编码.然后多个之间使用逗号分隔
        const fullObjectNames = ctx.checkQuery('fullObjectNames').optional().toSplitArray().len(1, 200).default([]).value;
        const objectIds = ctx.checkQuery('objectIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 200).default([]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const condition = { $or: objectIds.map(objectId => Object({ _id: objectId })) };
        fullObjectNames.forEach(fullObjectName => {
            fullObjectName = decodeURIComponent(fullObjectName);
            const [bucketName, objectName] = fullObjectName.split('/');
            if (!lodash_1.isString(bucketName) || !lodash_1.isString(objectName)) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'fullObjectName'));
            }
            if (!egg_freelog_base_1.CommonRegex.strictBucketName.test(bucketName)) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'fullObjectName'));
            }
            const uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketName, objectName);
            condition.$or.push({ uniqueKey });
        });
        if (lodash_1.isEmpty(condition.$or)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'fullObjectNames,objectIds'));
        }
        await this.objectStorageService.find(condition, projection.join(' ')).then(ctx.success);
    }
    async detail() {
        const { ctx } = this;
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        ctx.validateParams();
        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectIdOrName')
        });
        ctx.success(objectStorageInfo);
    }
    async createOrReplace() {
        const { ctx } = this;
        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        const objectName = ctx.checkBody('objectName').exist().value;
        const sha1 = ctx.checkBody('sha1').exist().isSha1().toLowercase().value;
        // const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLowercase().value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({
            bucketName, userId: ctx.userId
        });
        ctx.entityNullObjectCheck(bucketInfo, { msg: ctx.gettext('bucket-entity-not-found') });
        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, { msg: ctx.gettext('params-validate-failed', 'sha1') });
        if (fileStorageInfo.metaAnalyzeStatus === 1) {
            throw new egg_freelog_base_1.ArgumentError('文件属性正在分析中,请稍后再试!');
        }
        if (fileStorageInfo.metaAnalyzeStatus !== 2) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('file-analyze-failed'));
        }
        const createOrUpdateFileOptions = { objectName, fileStorageInfo };
        await this.objectStorageService.createObject(bucketInfo, createOrUpdateFileOptions).then(ctx.success);
    }
    async validateObjectDependencies() {
        const { ctx } = this;
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        const dependencies = ctx.checkBody('dependencies').exist().isArray().len(1).value;
        ctx.validateParams();
        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectIdOrName')
        });
        const objectDependencyValidateResult = this.objectDependencyValidator.validate(dependencies);
        if (!lodash_1.isEmpty(objectDependencyValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: objectDependencyValidateResult.errors
            });
        }
        const cycleDependCheckResult = await this.objectStorageService.cycleDependCheck(`${objectStorageInfo.bucketName}/${objectStorageInfo.objectName}`, dependencies, 1);
        ctx.success(Boolean(!cycleDependCheckResult.ret));
    }
    async destroy() {
        const { ctx } = this;
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectIds = ctx.checkParams('objectIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();
        const bucketInfo = await this.bucketService.findOne({ bucketName, userId: ctx.userId });
        ctx.entityNullObjectCheck(bucketInfo, { msg: ctx.gettext('bucket-entity-not-found') });
        await this.objectStorageService.batchDeleteObjects(bucketInfo, objectIds).then(ctx.success);
    }
    async download() {
        const { ctx } = this;
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        ctx.validateParams();
        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectIdOrName')
        });
        const fileStorageInfo = await this.fileStorageService.findBySha1(objectStorageInfo.sha1);
        if (!fileStorageInfo) {
            throw new egg_freelog_base_1.ApplicationError('file storage data is miss');
        }
        ctx.body = await this.fileStorageService.getFileStream(fileStorageInfo);
        ctx.attachment(objectStorageInfo.objectName);
        ctx.set('content-length', fileStorageInfo.fileSize.toString());
        if (objectStorageInfo.systemProperty.mime) {
            ctx.set('content-type', objectStorageInfo.systemProperty.mime);
        }
    }
    async updateProperty() {
        const { ctx } = this;
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        const customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray().value;
        const dependencies = ctx.checkBody('dependencies').optional().isArray().value;
        const resourceType = ctx.checkBody('resourceType').optional().isArray().len(1, 5).value;
        const objectName = ctx.checkBody('objectName').optional().type('string').len(1, 100).value;
        ctx.validateParams();
        const objectDependencyValidateResult = this.objectDependencyValidator.validate(dependencies);
        if (!lodash_1.isEmpty(objectDependencyValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: objectDependencyValidateResult.errors
            });
        }
        const customPropertyDescriptorValidateResult = await this.objectCustomPropertyValidator.validate(customPropertyDescriptors);
        if (!lodash_1.isEmpty(customPropertyDescriptors) && !lodash_1.isEmpty(customPropertyDescriptorValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'customPropertyDescriptors'), {
                errors: customPropertyDescriptorValidateResult.errors
            });
        }
        if (customPropertyDescriptors?.some(x => x.type !== 'editableText' && x.defaultValue.length < 1)) {
            throw new egg_freelog_base_1.ArgumentError('自定义属性格式校验失败,请确保defaultValue有效');
        }
        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectId')
        });
        if (lodash_1.isString(objectName)) {
            const existingObject = await this.objectStorageService.findOneByName(objectStorageInfo.bucketName, objectName);
            if (existingObject) {
                throw new egg_freelog_base_1.ApplicationError('objectName has already existing');
            }
        }
        await this.objectStorageService.updateObject(objectStorageInfo, {
            customPropertyDescriptors, dependencies, resourceType, objectName
        }).then(ctx.success);
    }
    async dependencyTree() {
        const { ctx } = this;
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();
        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        if (!objectStorageInfo) {
            throw new egg_freelog_base_1.ApplicationError(ctx.gettext('storage-object-not-found'));
        }
        await this.objectStorageService.getDependencyTree(objectStorageInfo, isContainRootNode).then(ctx.success);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectController.prototype, "ctx", void 0);
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
], ObjectController.prototype, "objectCustomPropertyValidator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ObjectController.prototype, "storageCommonGenerator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", resource_type_repair_service_1.ResourceTypeRepairService)
], ObjectController.prototype, "resourceTypeRepairService", void 0);
__decorate([
    midway_1.get('/resourceTypeRepair'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "resourceTypeRepair", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/buckets/_all/objects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "myObjects", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/buckets/:bucketName/objects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "index", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/buckets/:bucketName/objects/:objectId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "show", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/objects/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "list", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/objects/:objectIdOrName'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "detail", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.post('/buckets/:bucketName/objects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "createOrReplace", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.post('/objects/:objectIdOrName/cycleDependencyCheck'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "validateObjectDependencies", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.del('/buckets/:bucketName/objects/:objectIds'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "destroy", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/objects/:objectIdOrName/file'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "download", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.put('/objects/:objectIdOrName'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "updateProperty", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/objects/:objectIdOrName/dependencyTree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "dependencyTree", null);
ObjectController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v1/storages/')
], ObjectController);
exports.ObjectController = ObjectController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvb2JqZWN0LXN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsbUNBQXdFO0FBR3hFLG1DQUF5QztBQUV6Qyx1REFHMEI7QUFDMUIsMEZBQWtGO0FBSWxGLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWdCO0lBb0J6QixLQUFLLENBQUMsa0JBQWtCO1FBQ3BCLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUlELEtBQUssQ0FBQyxTQUFTO1FBQ1gsTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztRQUNuQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlFLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3pGLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3JELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsY0FB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