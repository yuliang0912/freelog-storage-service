import {provide, inject, scope} from 'midway';
import * as MongoBaseOperation from 'egg-freelog-database/lib/database/mongo-base-operation';

@provide()
@scope('Singleton')
export default class BucketProvider extends MongoBaseOperation {
    constructor(@inject('model.bucket') model) {
        super(model);
    }
}
