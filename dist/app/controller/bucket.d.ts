import { IBucketService } from '../../interface/bucket-interface';
export declare class BucketController {
    bucketService: IBucketService;
    index(ctx: any): Promise<void>;
    createdCount(ctx: any): Promise<void>;
    create(ctx: any): Promise<void>;
    destroy(ctx: any): Promise<void>;
    isExistBucketName(ctx: any): Promise<void>;
    /**
     * 获取bucket详情
     * @param ctx
     * @returns {Promise<void>}
     */
    show(ctx: any): Promise<void>;
}
