import { NodeInfo } from './common-interface';
import { FileStorageInfo } from './file-storage-info-interface';
import { BucketInfo } from './bucket-interface';
import { PageResult } from 'egg-freelog-base';
export interface ObjectDependencyInfo {
    name: string;
    versionRange?: string;
    type: 'object' | 'resource';
}
export interface CommonObjectDependencyTreeInfo {
    id: string;
    name: string;
    version?: string;
    versionId?: string;
    versionRange?: string;
    fileSha1: string;
    versions?: string[];
    type: 'object' | 'resource';
    resourceType: string[];
    dependencies: CommonObjectDependencyTreeInfo[];
}
export interface ObjectStorageInfo {
    userId: number;
    sha1: string;
    objectId?: string;
    objectName: string;
    bucketName: string;
    resourceType: string[];
    bucketId?: string;
    systemProperty?: SystemPropertyInfo;
    customPropertyDescriptors?: object[];
    dependencies?: ObjectDependencyInfo[];
    uniqueKey?: string;
}
export interface SystemPropertyInfo {
    sha1?: string;
    fileSize?: number;
    mime?: string;
    type?: string;
    width?: number | undefined;
    height?: number | undefined;
}
export interface CreateObjectStorageOptions {
    objectName: string;
    fileStorageInfo: FileStorageInfo;
}
export interface CreateUserNodeDataObjectOptions {
    userId: number;
    nodeInfo: NodeInfo;
    fileStorageInfo: FileStorageInfo;
}
export interface UpdateObjectStorageOptions {
    customPropertyDescriptors?: object[];
    dependencies?: ObjectDependencyInfo;
    resourceType?: string[];
    objectName?: string;
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
    createOrUpdateUserNodeObject(storageObject: ObjectStorageInfo, options: CreateUserNodeDataObjectOptions): Promise<ObjectStorageInfo>;
    /**
     * 更新用户存储数据
     * @param {StorageObject} oldStorageObject - 现有的对象存储信息
     * @param {FileStorageInfo} newFileStorageInfo - 新的文件存储信息
     * @returns {Promise<StorageObject>}
     */
    updateObject(oldStorageObject: ObjectStorageInfo, updateObjectStorageOptions: UpdateObjectStorageOptions): Promise<ObjectStorageInfo>;
    findOne(condition: object, ...args: any[]): Promise<ObjectStorageInfo>;
    findOneByObjectIdOrName(objectIdOrFullName: string, ...args: any[]): Promise<ObjectStorageInfo>;
    findOneByName(bucketName: string, objectName: string, ...args: any[]): Promise<ObjectStorageInfo>;
    find(condition: object, ...args: any[]): Promise<ObjectStorageInfo[]>;
    deleteObject(storageObject: ObjectStorageInfo): Promise<boolean>;
    batchDeleteObjects(bucketInfo: BucketInfo, objectIds: string[]): Promise<boolean>;
    count(condition: object): Promise<number>;
    findIntervalList(condition: object, skip: number, limit: number, projection: string[], sort?: object): Promise<PageResult<ObjectStorageInfo>>;
    findAll(condition: object, page: number, pageSize: number): any;
    getDependencyTree(objectStorageInfo: ObjectStorageInfo, isContainRootNode: boolean): Promise<CommonObjectDependencyTreeInfo[]>;
    cycleDependCheck(objectName: string, dependencies: ObjectDependencyInfo[], deep: number): Promise<{
        ret: boolean;
        deep?: number;
    }>;
}
