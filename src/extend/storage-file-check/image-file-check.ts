import {IFileCheck} from './index';
import {inject, provide} from 'midway';
import {getType} from 'mime';
import {ApplicationError} from 'egg-freelog-base';
import {imageSize} from 'image-size';
import {FileSystemMeta} from '../../interface/storage-object-interface';
import {pick} from 'lodash';

@provide('imageFileCheck')
export default class ImageFileCheck implements IFileCheck {

    @inject()
    ctx;

    async check(fileStream: any): Promise<FileSystemMeta> {

        const fileBuffer: Buffer = await new Promise((resolve, reject) => {
            const chunks = []
            fileStream.on('data', chunk => chunks.push(chunk))
                .on('end', () => resolve(Buffer.concat(chunks)))
                .on('error', reject);
        })
        if (fileStream.filename !== undefined) {
            this.checkMimeType(fileStream.filename);
        }
        try {
            return pick(imageSize(fileBuffer), ['width', 'height', 'type']);
        } catch (error) {
            throw new ApplicationError('image file validate error', {error: error.toString()});
        }
    }

    /**
     * 检查文件mimeType
     * @param ctx
     * @param fileName
     */
    checkMimeType(fileName) {

        const fileExt = fileName.substr(fileName.lastIndexOf('.') + 1)
        const mimeType = getType(fileExt)

        if (!/^image\/(jpg|png|gif|jpeg)$/i.test(mimeType)) {
            throw new ApplicationError(this.ctx.gettext('resource-image-extension-validate-failed', '(jpg|jpeg|png|gif)'), {filename: fileName});
        }
    }
}
