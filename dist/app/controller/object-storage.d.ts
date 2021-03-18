import { IBucketService } from '../../interface/bucket-interface';
import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { IObjectStorageService } from '../../interface/object-storage-interface';
import { IJsonSchemaValidate } from '../../interface/common-interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class ObjectController {
    ctx: FreelogContext;
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    objectStorageService: IObjectStorageService;
    objectDependencyValidator: IJsonSchemaValidate;
    objectCustomPropertyValidator: IJsonSchemaValidate;
    storageCommonGenerator: any;
    myObjects(): Promise<void>;
    index(): Promise<void>;
    show(): Promise<void>;
    list(): Promise<void>;
    detail(): Promise<void>;
    createOrReplace(): Promise<void>;
    validateObjectDependencies(): Promise<void>;
    destroy(): Promise<void>;
    download(): Promise<void>;
    updateProperty(): Promise<void>;
    dependencyTree(): Promise<void>;
}
