import { IBucketService } from '../../interface/bucket-interface';
import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { IObjectStorageService } from '../../interface/object-storage-interface';
export declare class ObjectController {
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    objectStorageService: IObjectStorageService;
    index(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    createOrReplace(ctx: any): Promise<void>;
    download(ctx: any): Promise<void>;
    destroy(ctx: any): Promise<boolean>;
    batchDestroy(ctx: any): Promise<void>;
    updateProperty(ctx: any): Promise<void>;
}
