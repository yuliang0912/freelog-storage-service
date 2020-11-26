import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';
import {ObjectStorageInfo} from '../../interface/object-storage-interface';

@provide()
@scope('Singleton')
export default class ObjectStorageProvider extends MongodbOperation<ObjectStorageInfo> {
    constructor(@inject('model.objectStorageInfo') model) {
        super(model);
    }
}
