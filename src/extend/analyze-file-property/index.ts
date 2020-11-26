import {inject, provide} from 'midway';
import * as probe from 'probe-image-size';
import {ApplicationError} from 'egg-freelog-base';
import {pick} from 'lodash';

@provide('filePropertyAnalyzeHandler')
export class FilePropertyAnalyzerHandler {
    @inject()
    ctx;

    readonly resourceAnalyzeHandlerMap = new Map([['image', this._imageFileAnalyzeHandle.bind(this)]]);

    get supportAnalyzeResourceTypes(): string[] {
        return [...this.resourceAnalyzeHandlerMap.keys()];
    }

    /**
     * 获取资源文件属性
     * @param src
     * @param resourceType
     */
    async analyzeFileProperty(src, resourceType: string): Promise<{ fileProperty: any, analyzeStatus: number, error: object }> {
        resourceType = resourceType.toLowerCase();
        const result: any = {analyzeStatus: 3, fileProperty: null, error: null, provider: ''};
        if (!this.supportAnalyzeResourceTypes.includes(resourceType)) {
            return result;
        }

        const handler = this.resourceAnalyzeHandlerMap.get(resourceType);
        await handler(src).then(property => {
            result.fileProperty = property;
            result.analyzeStatus = 1;
        }).catch(err => {
            result.analyzeStatus = 2;
            result.error = err;
        });
        result.provider = `${resourceType}-analyze-com`;
        return result;
    }

    /**
     * 获取图片基础属性
     * @param src
     */
    async _imageFileAnalyzeHandle(src): Promise<object> {

        const result = await probe(src).catch(_error => {
            throw new ApplicationError(this.ctx.gettext('image-file-analyze-failed'));
        });

        return pick(result, ['width', 'height', 'type', 'mime']);
    }
}
