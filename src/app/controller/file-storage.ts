import {inject, controller, get, post, provide} from 'midway';
import {LoginUser, ArgumentError, InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {IFileStorageService} from '../../interface/file-storage-info-interface';

@provide()
@controller('/v1/storages/files')
export class FileStorageController {

    @inject()
    fileStorageService: IFileStorageService;

    @visitorIdentity(LoginUser | InternalClient)
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
        })
        ctx.success({sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize});
    }

    @visitorIdentity(LoginUser | InternalClient)
    @get('/uploadImage')
    async uploadImage(ctx) {
        const fileStream = await ctx.getFileStream({requireFile: false});
        if (!fileStream || !fileStream.filename) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'file'));
        }

        const fileStorageInfo = await this.fileStorageService.uploadImage(fileStream).catch(error => {
            return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                throw error;
            });
        });

        ctx.success({sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize});
    }

    @visitorIdentity(LoginUser | InternalClient)
    @get('/fileIsExist')
    async fileIsExist(ctx) {
        const sha1: string = ctx.checkQuery('sha1').exist().isResourceId().toLowercase().value;
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
}
