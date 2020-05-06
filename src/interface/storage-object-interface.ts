import {NodeInfo} from './common-interface';
import {FileStorageInfo} from './file-storage-info-interface';

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
    fileSize?: number;
    mimeType?: string;
    type?: string;
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

export interface CreateUserNodeDataObjectOptions {
    userId: number;
    nodeInfo: NodeInfo;
    fileStorageInfo: FileStorageInfo;
}

/**
 * bucket服务抽象接口
 */
export interface IStorageObjectService {

    createObject(options: CreateStorageObjectOptions): Promise<StorageObject>;

    createUserNodeObject(options: CreateUserNodeDataObjectOptions): Promise<StorageObject>;

    findOne(condition: object): Promise<StorageObject>;

    find(condition: object): Promise<StorageObject[]>;

    count(condition: object): Promise<number>;

    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<StorageObject[]>;

}
