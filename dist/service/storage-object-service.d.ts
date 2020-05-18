import { IStorageObjectService, StorageObject, CreateStorageObjectOptions, CreateUserNodeDataObjectOptions } from '../interface/storage-object-interface';
import { IBucketService } from '../interface/bucket-interface';
import { FileStorageInfo } from '../interface/file-storage-info-interface';
export declare class StorageObjectService implements IStorageObjectService {
    ctx: any;
    ossClient: any;
    uploadConfig: any;
    bucketService: IBucketService;
    storageObjectProvider: any;
    /**
     * 创建文件对象
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
     * 更新用户存储数据
     * @param {StorageObject} 原有的存储信息
     * @param {FileStorageInfo} 新的文件信息
     * @returns {Promise<StorageObject>}
     */
    updateObject(oldStorageObject: StorageObject, newFileStorageInfo: FileStorageInfo): Promise<StorageObject>;
    findOne(condition: object): Promise<StorageObject>;
    find(condition: object): Promise<StorageObject[]>;
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<StorageObject[]>;
    count(condition: object): Promise<number>;
}
