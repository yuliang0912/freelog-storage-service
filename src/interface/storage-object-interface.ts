export enum ServiceProviderEnum {AliOss = 'aliOss', AmazonS3 = 'amazonS3'}

export interface FileOssInfo {
    serviceProvider: ServiceProviderEnum;
    filename: string;
    objectKey: string;
    bucket: string;
    region: string;
    url: string;
}

export interface StorageObject {
    sha1: string;
    objectName: string;
    bucketName: string;
    resourceType: string;
    fileOss?: FileOssInfo;
    systemMeta?: object;
    customMeta?: object;
}

export interface FileSystemMeta {
    sha1?: string;
    fileSize?: number;
    mimeType?: string;
    width?: number | undefined;
    height?: number | undefined;
}

export interface UpdateFileOptions {
    fileStream: object;
    bucketName: string;
    resourceType: string;
    userId: number;
}

/**
 * bucket服务抽象接口
 */
export interface IStorageObjectService {

    createObject(updateFileOptions: UpdateFileOptions): Promise<StorageObject>;

    findOne(condition: object): Promise<StorageObject>;

    find(condition: object): Promise<StorageObject[]>;

    count(condition: object): Promise<number>;

    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<StorageObject[]>;

}
