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
 * 用户对象存储服务接口
 */
export interface IStorageObjectService {

    /**
     * 创建用户存储对象
     * @param {CreateStorageObjectOptions} options
     * @returns {Promise<StorageObject>}
     */
    createObject(options: CreateStorageObjectOptions): Promise<StorageObject>;

    /**
     * 创建用户节点数据
     * @param {CreateUserNodeDataObjectOptions} options
     * @returns {Promise<StorageObject>}
     */
    createUserNodeObject(options: CreateUserNodeDataObjectOptions): Promise<StorageObject>;

    /**
     * 更新用户存储对象
     * @param {StorageObject} 原有的存储信息
     * @param {FileStorageInfo} 新的文件信息
     * @returns {Promise<StorageObject>}
     */
    updateObject(oldStorageObject: StorageObject, newFileStorageInfo: FileStorageInfo): Promise<StorageObject>;

    findOne(condition: object): Promise<StorageObject>;

    find(condition: object): Promise<StorageObject[]>;

    count(condition: object): Promise<number>;

    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<StorageObject[]>;

}
