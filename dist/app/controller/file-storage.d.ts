import { IFileStorageService } from '../../interface/file-storage-info-interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class FileStorageController {
    ctx: FreelogContext;
    fileStorageService: IFileStorageService;
    uploadFile(): Promise<void>;
    uploadImage(): Promise<void>;
    fileIsExist(): Promise<void>;
    fileSimpleInfo(): Promise<void>;
    list(): Promise<void>;
    show(): Promise<void>;
    fileProperty(): Promise<void>;
    download(): Promise<void>;
    fileStorageUrl(): Promise<void>;
}
