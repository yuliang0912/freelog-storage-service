import { IObjectStorageService } from 'egg-freelog-base';
export declare class ObjectStorageServiceClient {
    aliOssClient: (config: any) => IObjectStorageService;
    uploadConfig: object;
    readonly __cacheMap__: Map<any, any>;
    provider: string;
    bucket: string;
    constructor(uploadConfig: any);
    setBucket(bucket: string): this;
    build(): IObjectStorageService;
}
