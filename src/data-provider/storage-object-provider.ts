import {provide, inject} from 'midway';
import * as MongoBaseOperation from 'egg-freelog-database/lib/database/mongo-base-operation';

@provide()
export default class StorageObjectProvider extends MongoBaseOperation {
    constructor(@inject('model.object') bucketModel) {
        super(bucketModel);
    }
}
