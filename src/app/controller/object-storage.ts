import {inject, controller, get, del, post, put, provide} from 'midway';
import {LoginUser, ApplicationError, ArgumentError} from 'egg-freelog-base/index';
import {IBucketService} from '../../interface/bucket-interface';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {IFileStorageService} from '../../interface/file-storage-info-interface';
import {IObjectStorageService} from '../../interface/object-storage-interface';
import {isString, isEmpty} from 'lodash';
import {strictBucketName} from 'egg-freelog-base/app/extend/helper/common_regex';
import {IJsonSchemaValidate} from '../../interface/common-interface';

@provide()
@controller('/v1/storages/')
export class ObjectController {

    @inject()
    bucketService: IBucketService;
    @inject()
    fileStorageService: IFileStorageService;
    @inject()
    objectStorageService: IObjectStorageService;
    @inject()
    objectDependencyValidator: IJsonSchemaValidate;
    @inject()
    storageCommonGenerator;

    @visitorIdentity(LoginUser)
    @get('/buckets/_all/objects')
    async myObjects(ctx) {
        const page = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const isLoadingTypeless = ctx.checkQuery('isLoadingTypeless').optional().in([0, 1]).default(1).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
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
            const regex: object = {$regex: keywords, $options: 'i'};
            condition.$or = [{objectName: regex}, {bucketName: regex}];
        }

        const buckets = await this.bucketService.find({userId: ctx.userId, bucketType: 1});
        condition.bucketId = {$in: buckets.map(x => x.bucketId)};

        let dataList = [];
        const totalItem = await this.objectStorageService.count(condition);
        if (buckets.length && totalItem > (page - 1) * pageSize) {
            dataList = await this.objectStorageService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        }

        ctx.success({page, pageSize, totalItem, dataList});
    }

    @visitorIdentity(LoginUser)
    @get('/buckets/:bucketName/objects')
    async index(ctx) {
        const page = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const isLoadingTypeless = ctx.checkQuery('isLoadingTypeless').optional().in([0, 1]).default(1).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        const condition: any = {bucketId: bucketInfo.bucketId};
        if (resourceType && isLoadingTypeless) {
            condition.resourceType = {$in: [resourceType, '']};
        } else if (resourceType) {
            condition.resourceType = resourceType;
        } else if (!isLoadingTypeless) {
            condition.resourceType = {$ne: ''};
        }
        if (keywords) {
            const regex: object = {$regex: keywords, $options: 'i'};
            condition.$or = [{objectName: regex}, {bucketName: regex}];
        }

        let dataList = [];
        const totalItem = await this.objectStorageService.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.objectStorageService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        }

        ctx.success({page, pageSize, totalItem, dataList});
    }

    @visitorIdentity(LoginUser)
    @get('/buckets/:bucketName/objects/:objectId')
    async show(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectId = ctx.checkParams('objectId').exist().isMongoObjectId().value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        await this.objectStorageService.findOne({_id: objectId, bucketId: bucketInfo.bucketId}).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @get('/objects/list')
    async list(ctx) {
        // 需要调用方对URL做编码.然后多个obejctName使用.分隔(几个操作系统的文件名都不能包含".",所以不存在分隔冲突).
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
            if (!strictBucketName.test(bucketName)) {
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

    @visitorIdentity(LoginUser)
    @get('/objects/:objectIdOrName')
    async detail(ctx) {
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        ctx.validateParams();

        const objectStorageInfo = await this.objectStorageService.findOneByObjectIdOrName(objectIdOrName);
        ctx.entityNullValueAndUserAuthorizationCheck(objectStorageInfo, {
            msg: ctx.gettext('params-validate-failed', 'objectIdOrName')
        });

        ctx.success(objectStorageInfo);
    }

    @visitorIdentity(LoginUser)
    @post('/buckets/:bucketName/objects')
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

        const createOrUpdateFileOptions = {objectName, fileStorageInfo};
        await this.objectStorageService.createObject(bucketInfo, createOrUpdateFileOptions).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @del('/buckets/:bucketName/objects/:objectIds')
    async destroy(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        const objectIds: string[] = ctx.checkParams('objectIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();

        const bucketInfo = await this.bucketService.findOne({bucketName, userId: ctx.request.userId});
        ctx.entityNullObjectCheck(bucketInfo, ctx.gettext('bucket-entity-not-found'));

        await this.objectStorageService.batchDeleteObjects(bucketInfo, objectIds).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @get('/objects/:objectIdOrName/file')
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

    @visitorIdentity(LoginUser)
    @put('/objects/:objectIdOrName')
    async updateProperty(ctx) {
        const objectIdOrName = ctx.checkParams('objectIdOrName').exist().decodeURIComponent().value;
        const customProperty = ctx.checkBody('customProperty').optional().isObject().value;
        const dependencies = ctx.checkBody('dependencies').optional().isArray().value;
        const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLow().value;
        const objectName = ctx.checkBody('objectName').optional().type('string').value;
        ctx.validateParams();

        const objectDependencyValidateResult = this.objectDependencyValidator.validate(dependencies);
        if (!isEmpty(objectDependencyValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
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

    @visitorIdentity(LoginUser)
    @get('/objects/:objectIdOrName/dependencyTree')
    async dependencyTree(ctx) {
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
