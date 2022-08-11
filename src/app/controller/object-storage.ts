import {IBucketService} from '../../interface/bucket-interface';
import {controller, del, get, inject, post, provide, put} from 'midway';
import {IFileStorageService} from '../../interface/file-storage-info-interface';
import {IObjectStorageService} from '../../interface/object-storage-interface';
import {isEmpty, isString} from 'lodash';
import {IJsonSchemaValidate} from '../../interface/common-interface';
import {
    ApplicationError, ArgumentError, CommonRegex,
    FreelogContext, IdentityTypeEnum, visitorIdentityValidator
} from 'egg-freelog-base';
import {ResourceTypeRepairService} from '../service/resource-type-repair-service';

@provide()
@controller('/v1/storages/')
export class ObjectController {

    @inject()
    ctx: FreelogContext;
    @inject()
    bucketService: IBucketService;
    @inject()
    fileStorageService: IFileStorageService;
    @inject()
    objectStorageService: IObjectStorageService;
    @inject()
    objectDependencyValidator: IJsonSchemaValidate;
    @inject()
    objectCustomPropertyValidator: IJsonSchemaValidate;
    @inject()
    storageCommonGenerator;
    @inject()
    resourceTypeRepairService: ResourceTypeRepairService;

    @get('/resourceTypeRepair')
    async resourceTypeRepair() {
        await this.resourceTypeRepairService.resourceTypeRepair().then(() => this.ctx.success(true));
    }

    @get('/metaInfoRepair')
    async metaInfoRepair() {
        // await this.fileStorageService.fileStorageProvider.updateMany({}, {metaAnalyzeStatus: 0}).then(() => this.ctx.success(true));
        await this.resourceTypeRepairService.fileStorageMetaInfoRepair().then(() => this.ctx.success(true));
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @get('/buckets/_all/objects')
    async myObjects() {
        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().value;
        const resourceType = ctx.checkQuery('resourceType').optional().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const isLoadingTypeless = ctx.checkQuery('isLoadingTypeless').optional().in([0, 1]).default(1).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition: any = {};
        if (resourceType && isLoadingTypeless) {
            condition.resourceType = {$in: [resourceType, '']};
        } else if (resourceType) {
            condition.resourceType = resourceType;
        } else if (!isLoadingTypeless) {
            condition.resourceType = {$ne: ''};
        }
        if (keywords) {
            const regex = {$regex: keywords, $options: 'i'};
            condition.$or = [{objectName: regex}, {bucketName: regex}];
        }

        const buckets = await this.bucketService.find({userId: ctx.userId, bucketType: 1});
        condition.bucketId = {$in: buckets.map(x => x.bucketId)};

        await this.objectStorageService.findIntervalList(condition, skip, limit, projection, sort).then(ctx.success);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @get('/buckets/:bucketName/objects')
    async index() {
        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').optional().isResourceType().toLow().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const isLoadingTypeless = ctx.checkQuery('isLoadingTypeless').optional().in([0, 1]).default(1).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.userId});
        ctx.entityNullObjectCheck(bucketInfo, {msg: ctx.gettext('bucket-entity-not-found')});

        const condition: any = {bucketId: bucketInfo.bucketId};
        if (resourceType && isLoadingTypeless) {
            condition.resourceType = {$in: [resourceType, '']};
        } else if (resourceType) {
            condition.resourceType = resourceType;
        } else if (omitResourceType) {
            condition.resourceType = {$ne: omitResourceType};
        } else if (!isLoadingTypeless) {
            condition.resourceType = {$ne: ''};
        }
        if (keywords) {
            const regex: object = {$regex: keywords, $options: 'i'};
            condition.$or = [{objectName: regex}, {bucketName: regex}];
        }

        await this.objectStorageService.findIntervalList(condition, skip, limit, projection, sort).then(ctx.success);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @get('/buckets/:bucketName/objects/:objectId')
    async show() {
        const {ctx} = this;

        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectId = ctx.checkParams('objectId').exist().isMongoObjectId().value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.userId});
        ctx.entityNullObjectCheck(bucketInfo, {msg: ctx.gettext('bucket-entity-not-found')});

        await this.objectStorageService.findOne({_id: objectId, bucketId: bucketInfo.bucketId}).then(ctx.success);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @get('/objects/list')
    async list() {
        const {ctx} = this;
        // 需要调用方对每个objectName单独做编码.然后多个之间使用逗号分隔
        const fullObjectNames = ctx.checkQuery('fullObjectNames').optional().toSplitArray().len(1, 200).default([]).value;
        const objectIds = ctx.checkQuery('objectIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 200).default([]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const condition = {$or: objectIds.map(objectId => Object({_id: objectId}))};
        fullObjectNames.forEach(fullObjectName => {
            fullObjectName = decodeURIComponent(fullObjectName);
            const [bucketName, objectName] = fullObjectName.split('/');
            if (!isString(bucketName) || !isString(objectName)) {
                throw new ArgumentError(ctx.gettext('params-validate-failed', 'fullObjectName'));
            }
            if (!CommonRegex.strictBucketName.test(bucketName)) {
                throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'fullObjectName'));
            }
            const uniqueKey = this.storageCommonGenerator.generateObjectUniqueKey(bucketName, objectName);
            condition.$or.push({uniqueKey});
        });
        if (isEmpty(condition.$or)) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'fullObjectNames,objectIds'));
        }

        await this.objectStorageService.find(condition, projection.join(' ')).then(ctx.success);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @get('/objects/:objectIdOrName')
    async detail() {
        const {ctx} = this;

        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        ctx.validateParams();

        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectIdOrName')
        });

        ctx.success(objectStorageInfo);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @post('/buckets/:bucketName/objects')
    async createOrReplace() {
        const {ctx} = this;

        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        const objectName = ctx.checkBody('objectName').exist().value;
        const sha1 = ctx.checkBody('sha1').exist().isSha1().toLowercase().value;
        // const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLowercase().value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({
            bucketName, userId: ctx.userId
        });
        ctx.entityNullObjectCheck(bucketInfo, {msg: ctx.gettext('bucket-entity-not-found')});

        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, {msg: ctx.gettext('params-validate-failed', 'sha1')});
        if (fileStorageInfo.metaAnalyzeStatus === 1) {
            throw new ArgumentError('文件属性正在分析中,请稍后再试!');
        }
        if (fileStorageInfo.metaAnalyzeStatus !== 2) {
            throw new ArgumentError(ctx.gettext('file-analyze-failed'));
        }
        const createOrUpdateFileOptions = {objectName, fileStorageInfo};
        await this.objectStorageService.createObject(bucketInfo, createOrUpdateFileOptions).then(ctx.success);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @post('/objects/:objectIdOrName/cycleDependencyCheck')
    async validateObjectDependencies() {
        const {ctx} = this;
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        const dependencies = ctx.checkBody('dependencies').exist().isArray().len(1).value;
        ctx.validateParams();

        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectIdOrName')
        });
        const objectDependencyValidateResult = this.objectDependencyValidator.validate(dependencies);
        if (!isEmpty(objectDependencyValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: objectDependencyValidateResult.errors
            });
        }

        const cycleDependCheckResult = await this.objectStorageService.cycleDependCheck(`${objectStorageInfo.bucketName}/${objectStorageInfo.objectName}`, dependencies, 1);
        ctx.success(Boolean(!cycleDependCheckResult.ret));
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @del('/buckets/:bucketName/objects/:objectIds')
    async destroy() {
        const {ctx} = this;

        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectIds: string[] = ctx.checkParams('objectIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.userId});
        ctx.entityNullObjectCheck(bucketInfo, {msg: ctx.gettext('bucket-entity-not-found')});

        await this.objectStorageService.batchDeleteObjects(bucketInfo, objectIds).then(ctx.success);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @get('/objects/:objectIdOrName/file')
    async download() {
        const {ctx} = this;

        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        ctx.validateParams();

        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectIdOrName')
        });

        const fileStorageInfo = await this.fileStorageService.findBySha1(objectStorageInfo.sha1);
        if (!fileStorageInfo) {
            throw new ApplicationError('file storage data is miss');
        }

        ctx.body = await this.fileStorageService.getFileStream(fileStorageInfo);
        ctx.attachment(objectStorageInfo.objectName);
        ctx.set('content-length', fileStorageInfo.fileSize.toString());
        if (objectStorageInfo.systemProperty.mime) {
            ctx.set('content-type', objectStorageInfo.systemProperty.mime);
        }
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @put('/objects/:objectIdOrName')
    async updateProperty() {

        const {ctx} = this;
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        const customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray().value;
        const dependencies = ctx.checkBody('dependencies').optional().isArray().value;
        const resourceType = ctx.checkBody('resourceType').optional().isArray().len(1, 5).value;
        const objectName = ctx.checkBody('objectName').optional().type('string').len(1, 100).value;
        ctx.validateParams();

        const objectDependencyValidateResult = this.objectDependencyValidator.validate(dependencies);
        if (!isEmpty(objectDependencyValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: objectDependencyValidateResult.errors
            });
        }
        const customPropertyDescriptorValidateResult = await this.objectCustomPropertyValidator.validate(customPropertyDescriptors);
        if (!isEmpty(customPropertyDescriptors) && !isEmpty(customPropertyDescriptorValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'customPropertyDescriptors'), {
                errors: customPropertyDescriptorValidateResult.errors
            });
        }
        if (customPropertyDescriptors?.some(x => x.type !== 'editableText' && x.defaultValue.length < 1)) {
            throw new ArgumentError('自定义属性格式校验失败,请确保defaultValue有效');
        }

        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectId')
        });

        if (isString(objectName)) {
            const existingObject = await this.objectStorageService.findOneByName(objectStorageInfo.bucketName, objectName);
            if (existingObject) {
                throw new ApplicationError('objectName has already existing');
            }
        }

        await this.objectStorageService.updateObject(objectStorageInfo, {
            customPropertyDescriptors, dependencies, resourceType, objectName
        }).then(ctx.success);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @get('/objects/:objectIdOrName/dependencyTree')
    async dependencyTree() {

        const {ctx} = this;
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();

        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        if (!objectStorageInfo) {
            throw new ApplicationError(ctx.gettext('storage-object-not-found'));
        }
        await this.objectStorageService.getDependencyTree(objectStorageInfo, isContainRootNode).then(ctx.success);
    }
}
