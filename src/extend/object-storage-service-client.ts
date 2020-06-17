import {config, provide, scope} from 'midway';
import {isObject, cloneDeep} from 'lodash';
import {ApplicationError} from 'egg-freelog-base';
import * as FileOssManager from 'egg-freelog-base/app/extend/file-oss/index';

@scope('Singleton')
@provide('objectStorageServiceClient')
export class ObjectStorageServiceClient {

    uploadConfig: any;
    readonly __cacheMap__ = new Map();

    public bucket = 'freelog-shenzhen';
    public provider = 'aliOss';
    public config: any;

    constructor(@config('uploadConfig') uploadConfig) {
        if (!uploadConfig) {
            throw new ApplicationError('uploadConfig is not found');
        }
        this.uploadConfig = cloneDeep(uploadConfig);
    }

    setProvider(provider: string) {
        this.provider = provider;
        return this;
    }

    setBucket(bucket: string) {
        this.bucket = bucket;
        return this;
    }

    build() {
        this.config = this.uploadConfig[this.provider];
        if (!isObject(this.config)) {
            throw new ApplicationError('param provider is invalid');
        }
        this.config['bucket'] = this.bucket;
        const key = this.provider + this.bucket + this.provider;
        if (!this.__cacheMap__.has(key)) {
            const clientConfig = {
                uploadConfig: {[this.provider]: this.config}
            };
            const client = new FileOssManager(clientConfig);
            client.config = cloneDeep(this.config);
            this.__cacheMap__.set(key, client);
        }
        return this.__cacheMap__.get(key);
    }
}
