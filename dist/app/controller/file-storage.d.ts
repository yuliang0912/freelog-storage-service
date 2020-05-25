import { IFileStorageService } from '../../interface/file-storage-info-interface';
export declare class FileStorageController {
    fileStorageService: IFileStorageService;
    show(ctx: any): Promise<void>;
    uploadFile(ctx: any): Promise<void>;
}
