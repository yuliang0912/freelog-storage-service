import { MongodbOperation } from 'egg-freelog-base';
import { ObjectStorageInfo } from '../../interface/object-storage-interface';
export default class ObjectStorageProvider extends MongodbOperation<ObjectStorageInfo> {
    constructor(model: any);
}
