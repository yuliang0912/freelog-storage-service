export declare class ObjectStorageServiceClient {
    uploadConfig: any;
    readonly __cacheMap__: Map<any, any>;
    bucket: any;
    provider: string;
    config: any;
    constructor(uploadConfig: any);
    setProvider(provider: string): this;
    setBucket(bucket: string): this;
    build(): any;
}
