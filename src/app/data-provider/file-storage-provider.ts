import {provide, inject, scope} from 'midway';
import * as MongoBaseOperation from 'egg-freelog-base/lib/database/mongo-base-operation';

@provide()
@scope('Singleton')
export default class FileStorageProvider extends MongoBaseOperation {
    constructor(@inject('model.fileStorageInfo') model) {
        super(model);
    }
}
