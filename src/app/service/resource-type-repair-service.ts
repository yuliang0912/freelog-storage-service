import {inject, provide} from 'midway';
import {IMongodbOperation} from 'egg-freelog-base';
import {first} from 'lodash';
import {FileStorageInfo} from '../../interface/file-storage-info-interface';
import {FileStorageService} from './file-storage-service';

@provide()
export class ResourceTypeRepairService {
    @inject()
    objectStorageProvider: IMongodbOperation<any>;
    @inject()
    fileStorageProvider: IMongodbOperation<FileStorageInfo>;
    @inject()
    fileStorageService: FileStorageService;

    async resourceTypeRepair() {
        this.objectStorageProvider.find({}, 'resourceType').then(async list => {
            for (const item of list) {
                const resourceType = first<string>(item.resourceType) === '' ? [] : item.resourceType;
                this.objectStorageProvider.updateOne({_id: item.objectId}, {resourceType}).then();
            }
        });
    }

    async fileStorageMetaInfoRepair() {
        await this.fileStorageProvider.find({}).then(list => {
            for (const fileStorageInfo of list) {
                if (!fileStorageInfo.metaInfo) {
                    this.fileStorageService.sendAnalyzeFilePropertyTask(fileStorageInfo, 'unknown');
                }
            }
        });
    }
}
