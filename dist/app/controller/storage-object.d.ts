/// <reference types="node" />
import { IBucketService } from '../../interface/bucket-interface';
import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { IStorageObjectService } from '../../interface/storage-object-interface';
import { IJsonSchemaValidate } from '../../interface/common-interface';
export declare class ObjectController {
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    storageObjectService: IStorageObjectService;
    userNodeDataFileOperation: any;
    userNodeDataEditValidator: IJsonSchemaValidate;
    fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any;
    index(ctx: any): Promise<void>;
    createUserNodeData(ctx: any): Promise<void>;
    editUserNodeData(ctx: any): Promise<void>;
    getUserNodeData(ctx: any): Promise<Buffer>;
    create(ctx: any): Promise<void>;
    uploadFile(ctx: any): Promise<void>;
}
