import { IMongodbOperation } from 'egg-freelog-base';
export declare class ResourceTypeRepairService {
    objectStorageProvider: IMongodbOperation<any>;
    resourceTypeRepair(): Promise<void>;
}
