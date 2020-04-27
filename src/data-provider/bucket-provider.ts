import {provide, inject} from 'midway';
import * as MongoBaseOperation from 'egg-freelog-database/lib/database/mongo-base-operation';

@provide()
export default class BucketProvider extends MongoBaseOperation {
    constructor(@inject('model.bucket') bucketModel) {
        super(bucketModel);
    }
}
