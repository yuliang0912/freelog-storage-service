import { IMongodbOperation } from 'egg-freelog-base';
import { FileStorageInfo } from '../../interface/file-storage-info-interface';
import { FileStorageService } from './file-storage-service';
export declare class ResourceTypeRepairService {
    objectStorageProvider: IMongodbOperation<any>;
    fileStorageProvider: IMongodbOperation<FileStorageInfo>;
    fileStorageService: FileStorageService;
    resourceTypeRepair(): Promise<void>;
    fileStorageMetaInfoRepair(): Promise<void>;
}
