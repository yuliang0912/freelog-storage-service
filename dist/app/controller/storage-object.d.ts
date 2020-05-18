import { IBucketService } from '../../interface/bucket-interface';
import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { IStorageObjectService } from '../../interface/storage-object-interface';
export declare class ObjectController {
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    storageObjectService: IStorageObjectService;
    index(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    create(ctx: any): Promise<void>;
    download(ctx: any): Promise<void>;
    uploadFile(ctx: any): Promise<void>;
}
