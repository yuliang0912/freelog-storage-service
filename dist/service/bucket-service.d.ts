import { IBucketService, BucketInfo } from '../interface/bucket-interface';
import { StorageObject } from '../interface/storage-object-interface';
export declare class BucketService implements IBucketService {
    ctx: any;
    bucketProvider: any;
    bucketCreatedLimitCount: number;
    /**
     * 用户创建bucket
     * @param {BucketInfo} bucketInfo
     * @returns {Promise<BucketInfo>}
     */
    createBucket(bucketInfo: BucketInfo): Promise<BucketInfo>;
    /**
     * 系统创建bucket
     * @param {BucketInfo} bucketInfo
     * @returns {Promise<BucketInfo>}
     */
    createOrFindSystemBucket(bucketInfo: BucketInfo): Promise<BucketInfo>;
    /**
     * 删除bucket
     * @param bucketName
     * @returns {Promise<boolean>}
     */
    deleteBucket(bucketName: string): Promise<boolean>;
    /**
     * 查找单个bucket
     * @param {object} condition
     * @returns {Promise<BucketInfo>}
     */
    findOne(condition: object): Promise<BucketInfo>;
    /**
     * 查找多个bucket
     * @param {object} condition
     * @returns {Promise<BucketInfo>}
     */
    find(condition: object): Promise<BucketInfo[]>;
    /**
     * 查找统计数量
     * @param {object} condition
     * @returns {Promise<number>}
     */
    count(condition: object): Promise<number>;
    /**
     * bucket空间使用数据统计
     * @param {number} userId
     * @returns {Promise<any>}
     */
    spaceStatistics(userId: number): Promise<{
        bucketCount: number;
        totalFileSize: number;
    }>;
    /**
     * 生成唯一失败符
     * @param {BucketInfo} bucketInfo
     * @returns {string}
     */
    static generateBucketUniqueKey(bucketInfo: BucketInfo): string;
    /**
     * bucket中同一个object发生替换.重新计算整个bucket总文件大小
     * @param {StorageObject} newStorageObject
     * @param {StorageObject} oldStorageObject
     */
    replaceStorageObjectEventHandle(newStorageObject: StorageObject, oldStorageObject: StorageObject): void;
    /**
     * bucket新增文件事件处理
     * @param {StorageObject} storageObject
     */
    addStorageObjectEventHandle(storageObject: StorageObject): void;
    deleteStorageObjectEventHandle(storageObject: StorageObject): void;
}
