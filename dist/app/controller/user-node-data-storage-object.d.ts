/// <reference types="node" />
import { IBucketService } from '../../interface/bucket-interface';
import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { IObjectStorageService } from '../../interface/object-storage-interface';
import { IOutsideApiService } from '../../interface/common-interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class UserNodeDataObjectController {
    ctx: FreelogContext;
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    objectStorageService: IObjectStorageService;
    outsideApiService: IOutsideApiService;
    userNodeDataFileOperation: any;
    createOrReplace(): Promise<void>;
    update(): Promise<void>;
    download(): Promise<Buffer>;
}
