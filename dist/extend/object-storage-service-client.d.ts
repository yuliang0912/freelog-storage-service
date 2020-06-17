export declare class ObjectStorageServiceClient {
    uploadConfig: any;
    readonly __cacheMap__: Map<any, any>;
    bucket: string;
    provider: string;
    config: any;
    constructor(uploadConfig: any);
    setProvider(provider: string): this;
    setBucket(bucket: string): this;
    build(): any;
}
