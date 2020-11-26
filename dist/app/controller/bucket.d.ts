import { IBucketService } from '../../interface/bucket-interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class BucketController {
    ctx: FreelogContext;
    bucketService: IBucketService;
    index(): Promise<void>;
    createdCount(): Promise<void>;
    create(): Promise<void>;
    destroy(): Promise<void>;
    isExistBucketName(): Promise<void>;
    spaceStatistics(): Promise<void>;
    show(): Promise<void>;
}
