import {inject, controller, get, post, provide} from 'midway';
import {LoginUser, ArgumentError, InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {IFileStorageService} from '../../interface/file-storage-info-interface';

@provide()
@controller('/v1/storages/files')
export class FileStorageController {

    @inject()
    fileStorageService: IFileStorageService;

    @get('/:sha1')
    @visitorIdentity(InternalClient)
    async show(ctx) {

        const sha1: string = ctx.checkParams('sha1').exist().isSha1().value;
        ctx.validateParams();

        await this.fileStorageService.findBySha1(sha1).then(ctx.success);
    }

    @visitorIdentity(LoginUser)
    @post('/upload')
    async uploadFile(ctx) {
        const fileStream = await ctx.getFileStream({requireFile: false});
        if (!fileStream || !fileStream.filename) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed', 'file'));
        }
        const fileStorageInfo = await this.fileStorageService.upload(fileStream).catch(error => {
            return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                throw error;
            });
        })
        ctx.success({sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize});
    }
}
