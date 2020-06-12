import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.systemAnalysisRecords')
export class SystemAnalysisRecords extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {
        const SystemAnalysisRecordScheme = new this.mongoose.Schema({
            sha1: {type: String, required: true},
            resourceType: {type: String, required: true},
            provider: {type: String, required: true}, // 解析库提供方,一般是对应的代码库以及实现版本
            systemProperty: {type: this.mongoose.Schema.Types.Mixed, required: false, default: {}},
            error: {type: String, required: false},
            status: {type: Number, required: true}, // 1:通过 2:失败 3:未知
        }, {
            minimize: false,
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}
        });

        SystemAnalysisRecordScheme.index({sha1: 1, resourceType: 1, provider: 1}, {unique: true});

        return this.mongoose.model('system-analysis-records', SystemAnalysisRecordScheme);
    }
}
