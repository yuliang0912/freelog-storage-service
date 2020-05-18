/// <reference types="node" />
import { IBucketService } from '../../interface/bucket-interface';
import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { IStorageObjectService } from '../../interface/storage-object-interface';
export declare class UserNodeDataObjectController {
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    storageObjectService: IStorageObjectService;
    userNodeDataFileOperation: any;
    create(ctx: any): Promise<void>;
    update(ctx: any): Promise<void>;
    show(ctx: any): Promise<Buffer>;
}
