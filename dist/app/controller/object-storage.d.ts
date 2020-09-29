import { IBucketService } from '../../interface/bucket-interface';
import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { IObjectStorageService } from '../../interface/object-storage-interface';
import { IJsonSchemaValidate } from '../../interface/common-interface';
export declare class ObjectController {
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    objectStorageService: IObjectStorageService;
    objectDependencyValidator: IJsonSchemaValidate;
    objectCustomPropertyValidator: IJsonSchemaValidate;
    storageCommonGenerator: any;
    myObjects(ctx: any): Promise<void>;
    index(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    list(ctx: any): Promise<void>;
    detail(ctx: any): Promise<void>;
    createOrReplace(ctx: any): Promise<void>;
    destroy(ctx: any): Promise<void>;
    download(ctx: any): Promise<void>;
    updateProperty(ctx: any): Promise<void>;
    dependencyTree(ctx: any): Promise<void>;
}
