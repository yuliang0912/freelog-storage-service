import { IBucketService } from '../../interface/bucket-interface';
import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { IStorageObjectService } from '../../interface/storage-object-interface';
export declare class ObjectController {
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    storageObjectService: IStorageObjectService;
    userNodeDataFileOperation: any;
    fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any;
    index(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    create(ctx: any): Promise<void>;
    uploadFile(ctx: any): Promise<void>;
}
