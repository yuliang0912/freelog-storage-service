import {inject, controller, get, post, provide} from 'midway';
import {LoginUser, ArgumentError, ApplicationError, InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {IFileStorageService} from '../../interface/file-storage-info-interface';
import {isString} from 'lodash';

@provide()
@controller('/v1/storages/files')
export class FileStorageController {

    @inject()
    fileStorageService: IFileStorageService;

    @visitorIdentity(LoginUser)
    @post('/upload')
    async uploadFile(ctx) {
        const fileStream = await ctx.getFileStream({requireFile: false});
        if (!fileStream || !fileStream.filename) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'file'));
        }
        ctx.request.body = fileStream.fields;
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
    @visitorIdentity(LoginUser)
    async uploadImage(ctx) {
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

    @visitorIdentity(LoginUser | InternalClient)
    @get('/fileIsExist')
    async fileIsExist(ctx) {
        const sha1: string = ctx.checkQuery('sha1').exist().isSha1().toLowercase().value;
        ctx.validateParams();

        await this.fileStorageService.findBySha1(sha1).then(fileStorageInfo => ctx.success(Boolean(fileStorageInfo)));
    }

    @get('/:sha1')
    @visitorIdentity(InternalClient)
    async show(ctx) {
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        ctx.validateParams();
        await this.fileStorageService.findBySha1(sha1).then(ctx.success);
    }

    @get('/:sha1/property')
    // @visitorIdentity(InternalClient)
    async fileProperty(ctx) {
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        const resourceType = ctx.checkQuery('resourceType').exist().isResourceType().toLow().value;
        ctx.validateParams();

        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, ctx.gettext('file-storage-entity-not-found'));

        const analyzeResult = await this.fileStorageService.analyzeFileProperty(fileStorageInfo, resourceType);

        if (analyzeResult.status === 1) {
            return ctx.success(Object.assign({fileSize: fileStorageInfo.fileSize}, analyzeResult.systemProperty));
        }
        if (analyzeResult.status === 2) {
            return ctx.error(new ApplicationError(analyzeResult.error));
        }
        ctx.success({fileSize: fileStorageInfo.fileSize});
    }

    @get('/:sha1/download')
    // @visitorIdentity(InternalClient)
    async download(ctx) {

        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        const attachmentName = ctx.checkQuery('attachmentName').optional().type('string').value;
        ctx.validateParams();

        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, ctx.gettext('file-storage-entity-not-found'));

        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        ctx.body = fileStream;
        if (isString(attachmentName) && attachmentName.length) {
            ctx.attachment(attachmentName);
        }
        ctx.set('content-length', fileStorageInfo.fileSize);
    }
}
