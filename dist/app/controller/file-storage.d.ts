import { IFileStorageService } from '../../interface/file-storage-info-interface';
export declare class FileStorageController {
    fileStorageService: IFileStorageService;
    uploadFile(ctx: any): Promise<void>;
    fileIsExist(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
}
