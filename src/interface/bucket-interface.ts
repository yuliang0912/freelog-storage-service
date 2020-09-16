import {ObjectStorageInfo} from './object-storage-interface';

export enum BucketTypeEnum {UserStorage = 1, SystemStorage = 2}

export enum SystemBucketName {
    UserNodeData = '.UserNodeData'
}

/**
 * bucket实体结构
 */
export interface BucketInfo {
    bucketName: string;
    userId: number;
    bucketType: BucketTypeEnum;
    bucketId?: string;
    bucketUniqueKey?: string;
    totalFileQuantity?: number;
    totalFileSize?: number;
}

/**
 * bucket服务抽象接口
 */
export interface IBucketService {
    createBucket(bucket: BucketInfo): Promise<BucketInfo>;

    createOrFindSystemBucket(bucket: BucketInfo): Promise<BucketInfo>;

    deleteBucket(bucketName: string): Promise<boolean>;

    replaceStorageObjectEventHandle(newObjectStorage: ObjectStorageInfo, oldObjectStorage: ObjectStorageInfo): void;

    addStorageObjectEventHandle(objectStorageInfo: ObjectStorageInfo): void;

    deleteStorageObjectEventHandle(objectStorageInfo: ObjectStorageInfo): void;

    batchDeleteStorageObjectEventHandle(bucketInfo: BucketInfo, deletedFileQuantity: number, totalFileSize: number): void;

    findOne(condition: object): Promise<BucketInfo>;

    find(condition: object): Promise<BucketInfo[]>;

    count(condition: object): Promise<number>;

    spaceStatistics(userId: number): Promise<{ storageLimit: number, bucketCount: number, totalFileSize: number }>;
}
