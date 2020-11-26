import {omit} from 'lodash';
import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';

@scope('Singleton')
@provide('model.bucket')
export class BucketInfoModel extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {
        const bucketScheme = new this.mongoose.Schema({
            bucketName: {type: String, required: true},
            // 用于唯一性校验的排他索引,没有使用bucketName是考虑到不同用户的相同命名的系统存储bucket
            // 例如用户自己的则直接以bucketName作为索引.但是系统级的可能是userId/bucketName作为索引
            bucketUniqueKey: {type: String, required: true},
            userId: {type: Number, required: false},
            bucketType: {type: Number, enum: [1, 2, 3], default: 1, required: true}, // 1:个人所属 2:系统共用(例如.nodeData)
            totalFileQuantity: {type: Number, default: 0, required: true}, // 资源文件数量
            totalFileSize: {type: Number, default: 0, required: true}, // 总的文件大小(byte)
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: BucketInfoModel.toObjectOptions,
            toObject: BucketInfoModel.toObjectOptions
        });

        bucketScheme.index({bucketName: 1, userId: 1});
        bucketScheme.index({bucketUniqueKey: 1}, {unique: true});

        bucketScheme.virtual('bucketId').get(function (this: any) {
            return this.id;
        });

        return this.mongoose.model('buckets', bucketScheme);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return omit(ret, ['_id', 'bucketUniqueKey']);
            }
        };
    }
}
