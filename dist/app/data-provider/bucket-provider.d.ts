import { MongodbOperation } from 'egg-freelog-base';
import { BucketInfo } from '../../interface/bucket-interface';
export default class BucketProvider extends MongodbOperation<BucketInfo> {
    constructor(model: any);
}
