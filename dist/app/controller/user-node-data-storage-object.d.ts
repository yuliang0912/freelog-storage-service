/// <reference types="node" />
import { IBucketService } from '../../interface/bucket-interface';
import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { IObjectStorageService } from '../../interface/object-storage-interface';
export declare class UserNodeDataObjectController {
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    objectStorageService: IObjectStorageService;
    userNodeDataFileOperation: any;
    createOrReplace(ctx: any): Promise<void>;
    update(ctx: any): Promise<void>;
    download(ctx: any): Promise<Buffer>;
}
