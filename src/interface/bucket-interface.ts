export enum BucketTypeEnum {UserStorage = 1, NodeStorage = 2}

/**
 * bucket实体结构
 */
export interface BucketInfo {
    bucketName: string;
    userId: number;
    nodeId?: number;
    bucketType?: BucketTypeEnum;
    totalFileQuantity?: number;
    totalFileSize?: number;
}

/**
 * bucket服务抽象接口
 */
export interface IBucketService {
    createBucket(bucket: BucketInfo): Promise<BucketInfo>;

    deleteBucket(bucketName: string): Promise<boolean>;

    findOne(condition: object): Promise<BucketInfo>;

    find(condition: object): Promise<BucketInfo[]>;

    count(condition: object): Promise<number>;
}
