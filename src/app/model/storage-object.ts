import {omit} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.object')
export class BucketInfoModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {
        const objectScheme = new this.mongoose.Schema({
            sha1: {type: String, required: true},
            objectName: {type: String, required: true},
            bucketId: {type: String, required: true},
            bucketName: {type: String, required: true},
            resourceType: {type: String, required: true},
            systemMeta: {}, //  系统meta,例如图片的宽高等
            customMeta: {} // 自定义meta,例如颜色,排序,或者依赖等信息
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: BucketInfoModel.toObjectOptions,
            toObject: BucketInfoModel.toObjectOptions
        });

        objectScheme.virtual('storageObjectId').get(function (this: any) {
            return this.id;
        });

        objectScheme.index({bucketId: 1, objectName: 1}, {unique: true});

        return this.mongoose.model('objects', objectScheme);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return omit(ret, ['_id']);
            }
        };
    }
}
