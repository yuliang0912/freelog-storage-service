import {FileStorageInfo} from './file-storage-info-interface';

export enum ServiceProviderEnum {AliOss = 'aliOss', AmazonS3 = 'amazonS3'}

export interface StorageObject {
    sha1: string;
    objectName: string;
    bucketName: string;
    resourceType: string;
    bucketId?: string;
    systemMeta?: FileSystemMeta;
    customMeta?: object;
}

export interface FileSystemMeta {
    sha1?: string;
    fileSize: number;
    mimeType?: string;
    width?: number | undefined;
    height?: number | undefined;
}

export interface CreateStorageObjectOptions {
    objectName: string;
    bucketName: string;
    resourceType: string;
    userId: number;
    fileStorageInfo: FileStorageInfo;
}

/**
 * bucket服务抽象接口
 */
export interface IStorageObjectService {

    createObject(options: CreateStorageObjectOptions): Promise<StorageObject>;

    findOne(condition: object): Promise<StorageObject>;

    find(condition: object): Promise<StorageObject[]>;

    count(condition: object): Promise<number>;

    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<StorageObject[]>;

}
