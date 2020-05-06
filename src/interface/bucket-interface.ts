import {StorageObject} from './storage-object-interface';

export enum BucketTypeEnum {UserStorage = 1, SystemStorage = 2}

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

    replaceStorageObjectEventHandle(newStorageObject: StorageObject, oldStorageObject: StorageObject): void;

    addStorageObjectEventHandle(storageObject: StorageObject): void;

    deleteStorageObjectEventHandle(storageObject: StorageObject): void;

    findOne(condition: object): Promise<BucketInfo>;

    find(condition: object): Promise<BucketInfo[]>;

    count(condition: object): Promise<number>;
}
