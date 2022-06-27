import {isString, pick} from 'lodash';
import {controller, get, inject, post, provide} from 'midway';
import {IFileStorageService} from '../../interface/file-storage-info-interface';
import {
    ApplicationError,
    ArgumentError,
    FreelogContext,
    IdentityTypeEnum,
    visitorIdentityValidator
} from 'egg-freelog-base';

@provide()
@controller('/v1/storages/files')
export class FileStorageController {

    @inject()
    ctx: FreelogContext;
    @inject()
    fileStorageService: IFileStorageService;

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @post('/upload')
    async uploadFile() {
        const {ctx} = this;
        const fileStream = await ctx.getFileStream({requireFile: false});
        if (!fileStream || !fileStream.filename) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'file'));
        }
        ctx.request['body'] = fileStream.fields;
        const resourceType: string = ctx.checkBody('resourceType').optional().isResourceType().toLow().value;
        ctx.validateParams();
        const fileStorageInfo = await this.fileStorageService.upload(fileStream, resourceType).catch(error => {
            return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                throw error;
            });
        });
        ctx.success({sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize});
    }

    @post('/uploadImage')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async uploadImage() {
        const {ctx} = this;
        const fileStream = await ctx.getFileStream({requireFile: false});
        if (!fileStream || !fileStream.filename) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'file'));
        }

        await this.fileStorageService.uploadImage(fileStream).then(url => ctx.success({url})).catch(error => {
            return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                throw error;
            });
        });
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    @get('/fileIsExist')
    async fileIsExist() {
        const {ctx} = this;
        const sha1s: string[] = ctx.checkQuery('sha1').exist().toLowercase().isSplitSha1().toSplitArray().len(1, 100).value;
        ctx.validateParams();

        const sha1Map = await this.fileStorageService.find({sha1: {$in: sha1s}}, 'sha1').then(list => {
            return new Map(list.map(x => [x.sha1, true]));
        });
        const result = sha1s.map(sha1 => Object({
            sha1, isExisting: sha1Map.has(sha1)
        }));
        ctx.success(result);
    }

    @get('/:sha1/info')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async fileSimpleInfo() {
        const {ctx} = this;
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        ctx.validateParams();
        await this.fileStorageService.findBySha1(sha1).then(data => {
            ctx.success(data ? pick(data, ['sha1', 'fileSize', 'metaInfo', 'metaAnalyzeStatus']) : null);
        });
    }

    @get('/:sha1')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async show() {
        const {ctx} = this;
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        ctx.validateParams();
        await this.fileStorageService.findBySha1(sha1).then(ctx.success);
    }

    @get('/:sha1/property')
    async fileProperty() {
        throw new ApplicationError('接口已停用');
        // const {ctx} = this;
        // const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        // const resourceType = ctx.checkQuery('resourceType').exist().isResourceType().toLow().value;
        // ctx.validateParams();
        //
        // const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        // ctx.entityNullObjectCheck(fileStorageInfo, {msg: ctx.gettext('file-storage-entity-not-found')});
        //
        // const analyzeResult = await this.fileStorageService.analyzeFileProperty(fileStorageInfo, resourceType);
        // if (analyzeResult.status === 1) {
        //     return ctx.success(Object.assign({fileSize: fileStorageInfo.fileSize}, analyzeResult.systemProperty));
        // }
        // if (analyzeResult.status === 2) {
        //     return ctx.error(new ApplicationError(analyzeResult.error));
        // }
        // ctx.success({fileSize: fileStorageInfo.fileSize});
    }

    @get('/:sha1/download')
    // @visitorIdentityValidator(IdentityTypeEnum.InternalClient)
    async download() {
        const {ctx} = this;

        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        const attachmentName = ctx.checkQuery('attachmentName').optional().type('string').value;
        ctx.validateParams();

        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, {msg: ctx.gettext('file-storage-entity-not-found')});

        try {
            ctx.body = await this.fileStorageService.getFileStream(fileStorageInfo);
            if (isString(attachmentName) && attachmentName.length) {
                ctx.attachment(attachmentName);
            }
            ctx.set('content-length', fileStorageInfo.fileSize.toString());
        } catch (error) {
            ctx.status = 410;
            throw new ApplicationError(ctx.gettext('file_download_failed') + error.toString());
        }
    }
}
