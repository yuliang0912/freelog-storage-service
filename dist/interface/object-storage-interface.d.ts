import { NodeInfo } from './common-interface';
import { FileStorageInfo } from './file-storage-info-interface';
import { BucketInfo } from './bucket-interface';
export interface ObjectStorageInfo {
    sha1: string;
    objectName: string;
    bucketName: string;
    resourceType: string;
    bucketId?: string;
    systemProperty?: SystemPropertyInfo;
    customProperty?: object;
}
export interface SystemPropertyInfo {
    sha1?: string;
    fileSize?: number;
    mimeType?: string;
    type?: string;
    width?: number | undefined;
    height?: number | undefined;
}
export interface CreateObjectStorageOptions {
    objectName: string;
    resourceType?: string;
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
export interface IObjectStorageService {
    /**
     * 创建用户存储对象
     * @param {BucketInfo} bucketInfo
     * @param {CreateStorageObjectOptions} options
     * @returns {Promise<StorageObject>}
     */
    createObject(bucketInfo: BucketInfo, options: CreateObjectStorageOptions): Promise<ObjectStorageInfo>;
    /**
     * 创建用户节点数据
     * @param {CreateUserNodeDataObjectOptions} options
     * @returns {Promise<StorageObject>}
     */
    createUserNodeObject(options: CreateUserNodeDataObjectOptions): Promise<ObjectStorageInfo>;
    /**
     * 更新用户存储数据
     * @param {StorageObject} oldStorageObject - 现有的对象存储信息
     * @param {FileStorageInfo} newFileStorageInfo - 新的文件存储信息
     * @returns {Promise<StorageObject>}
     */
    updateObject(oldStorageObject: ObjectStorageInfo, newFileStorageInfo: FileStorageInfo): Promise<ObjectStorageInfo>;
    findOne(condition: object): Promise<ObjectStorageInfo>;
    find(condition: object): Promise<ObjectStorageInfo[]>;
    deleteObject(storageObject: ObjectStorageInfo): Promise<boolean>;
    batchDeleteObjects(bucketInfo: BucketInfo, objectIds: string[]): Promise<boolean>;
    count(condition: object): Promise<number>;
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<ObjectStorageInfo[]>;
    findAll(condition: object, page: number, pageSize: number): any;
}
