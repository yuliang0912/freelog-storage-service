import {inject, provide} from 'midway';
import {IMongodbOperation} from 'egg-freelog-base';
import {first} from 'lodash';

@provide()
export class ResourceTypeRepairService {
    @inject()
    objectStorageProvider: IMongodbOperation<any>;

    async resourceTypeRepair() {
        this.objectStorageProvider.find({}, 'resourceType').then(async list => {
            for (const item of list) {
                const resourceType = first<string>(item.resourceType) === '' ? [] : item.resourceType;
                this.objectStorageProvider.updateOne({_id: item.objectId}, {resourceType}).then();
            }
        });
    }
}
