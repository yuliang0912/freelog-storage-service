import { IMongodbOperation } from 'egg-freelog-base';
import { FileStorageInfo } from '../../interface/file-storage-info-interface';
import { FileStorageService } from './file-storage-service';
import { OutsideApiService } from './outside-api-service';
export declare class ResourceTypeRepairService {
    objectStorageProvider: IMongodbOperation<any>;
    fileStorageProvider: IMongodbOperation<FileStorageInfo>;
    fileStorageService: FileStorageService;
    outsideApiService: OutsideApiService;
    resourceTypeRepair(): Promise<void>;
    fileStorageMetaInfoRepair(): Promise<void>;
}
