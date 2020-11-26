import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';
import {BucketInfo} from '../../interface/bucket-interface';

@provide()
@scope('Singleton')
export default class BucketProvider extends MongodbOperation<BucketInfo> {
    constructor(@inject('model.bucket') model) {
        super(model);
    }
}
