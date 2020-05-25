import {omit} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.ResourceVersionModel') // 此model可能考虑不要
export class ResourceFileLibraryModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {

        const customMetaScheme = new this.mongoose.Schema({
            key: {type: String, required: true},
            value: {type: this.mongoose.Schema.Types.Mixed, required: true},
            writable: {type: Boolean, required: true} // 是否可编辑
        }, {_id: false});

        const BaseReleaseScheme = new this.mongoose.Schema({
            releaseId: {type: String, required: true},
            releaseName: {type: String, required: true}
        }, {_id: false});

        const resourceFileLibraryScheme = new this.mongoose.Schema({
            versionId: {type: String, required: true}, // 由resourceId和version通过算法计算获得
            resourceId: {type: String, required: true}, // 存储ID,对应存储服务的file-storage
            resourceName: {type: String, required: true},
            version: {type: String, required: true},
            userId: {type: Number, required: false},
            resourceType: {type: String, required: true},
            fileSha1: {type: String, required: true},
            systemMeta: {},
            customMeta: {type: [customMetaScheme], required: false},
            description: {type: String, default: '', required: false},
            dependencies: {type: [BaseReleaseScheme], required: false},
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate'},
            toJSON: ResourceFileLibraryModel.toObjectOptions,
            toObject: ResourceFileLibraryModel.toObjectOptions
        });

        resourceFileLibraryScheme.index({userId: 1})

        return this.mongoose.model('resource-file-library', resourceFileLibraryScheme);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret, options) {
                return omit(ret, ['_id', 'sign']);
            }
        };
    }
}
