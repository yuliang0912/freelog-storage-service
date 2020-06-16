import { IBucketService, BucketInfo } from '../../interface/bucket-interface';
import { ObjectStorageInfo } from '../../interface/object-storage-interface';
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
     * bucket使用数据统计
     * @param {number} userId
     * @returns {Promise<any>}
     */
    spaceStatistics(userId: number): Promise<{
        storageLimit: number;
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
    replaceStorageObjectEventHandle(newObjectStorageInfo: ObjectStorageInfo, oldObjectStorageInfo: ObjectStorageInfo): void;
    /**
     * bucket新增对象事件处理
     * @param {ObjectStorageInfo} objectStorageInfo
     */
    addStorageObjectEventHandle(objectStorageInfo: ObjectStorageInfo): void;
    /**
     * 删除存储对象,自动移除所占的空间
     * @param {ObjectStorageInfo} objectStorageInfo
     */
    deleteStorageObjectEventHandle(objectStorageInfo: ObjectStorageInfo): void;
    batchDeleteStorageObjectEventHandle(bucketInfo: BucketInfo, deletedFileQuantity: number, totalFileSize: number): void;
}
