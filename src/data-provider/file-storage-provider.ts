import {provide, inject, scope} from 'midway';
import * as MongoBaseOperation from 'egg-freelog-database/lib/database/mongo-base-operation';

@provide()
@scope('Singleton')
export default class FileStorageProvider extends MongoBaseOperation {
    constructor(@inject('model.fileStorageInfo') bucketModel) {
        super(bucketModel);
    }
}
