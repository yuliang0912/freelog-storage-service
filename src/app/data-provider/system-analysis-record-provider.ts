import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export default class SystemAnalysisRecordProvider extends MongodbOperation<any> {
    constructor(@inject('model.systemAnalysisRecords') model) {
        super(model);
    }
}
