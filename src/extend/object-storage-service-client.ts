import {isObject, cloneDeep} from 'lodash';
import {config, provide, scope, inject} from 'midway';
import {ApplicationError, IObjectStorageService} from 'egg-freelog-base';

@scope('Singleton')
@provide('objectStorageServiceClient')
export class ObjectStorageServiceClient {

    @inject()
    aliOssClient: (config) => IObjectStorageService;

    uploadConfig: object;
    readonly __cacheMap__ = new Map();

    public provider = 'aliOss';
    public bucket = 'freelog-shenzhen';

    constructor(@config('uploadConfig') uploadConfig) {
        if (!uploadConfig) {
            throw new ApplicationError('uploadConfig is not found');
        }
        this.uploadConfig = cloneDeep(uploadConfig);
    }

    // 目前只支持阿里云
    // setProvider(provider: string) {
    //     this.provider = provider;
    //     return this;
    // }

    setBucket(bucket: string) {
        this.bucket = bucket;
        return this;
    }

    build(): IObjectStorageService {
        const clientConfig = this.uploadConfig[this.provider];
        if (!isObject(clientConfig)) {
            throw new ApplicationError('param provider is invalid');
        }
        const key = this.provider + this.bucket + this.provider;
        if (!this.__cacheMap__.has(key)) {
            clientConfig['bucket'] = this.bucket;
            const client = this.aliOssClient(clientConfig);
            client['config'] = cloneDeep(clientConfig);
            this.__cacheMap__.set(key, client);
        }
        return this.__cacheMap__.get(key);
    }
}
