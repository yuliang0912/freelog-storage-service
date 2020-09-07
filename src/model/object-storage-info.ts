import {assign, omit} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.objectStorageInfo')
export class ObjectStorageInfo extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {

        const BaseDependencyScheme = new this.mongoose.Schema({
            name: {type: String, required: true},
            type: {type: String, required: true},
            versionRange: {type: String, required: true},
            versionRangeType: {type: Number, enum: [1, 2], required: true},
        }, {_id: false});

        const objectScheme = new this.mongoose.Schema({
            userId: {type: Number, required: true},
            sha1: {type: String, required: true},
            objectName: {type: String, required: true}, // 取值于文件名
            bucketId: {type: String, required: true},
            bucketName: {type: String, required: true},
            resourceType: {type: String, required: false, default: ''}, // 类型可以为空
            uniqueKey: {type: String, required: true},
            systemProperty: {type: this.mongoose.Schema.Types.Mixed, required: false, default: {}}, //  系统meta,例如图片的宽高等
            customProperty: {type: this.mongoose.Schema.Types.Mixed, required: false, default: {}}, // 自定义meta,例如颜色,排序,或者依赖等信息
            dependencies: {type: [BaseDependencyScheme], required: false, default: []},
        }, {
            minimize: false,
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ObjectStorageInfo.toObjectOptions,
            toObject: ObjectStorageInfo.toObjectOptions
        });

        objectScheme.virtual('objectId').get(function (this: any) {
            return this.id;
        });

        objectScheme.index({userId: 1});
        objectScheme.index({uniqueKey: 1}, {unique: true});
        objectScheme.index({bucketId: 1, objectName: 1}, {unique: true});

        return this.mongoose.model('objects', objectScheme);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return assign({objectId: doc.id}, omit(ret, ['_id']));
            }
        };
    }
}
