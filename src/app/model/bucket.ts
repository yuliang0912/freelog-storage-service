import {omit} from 'lodash';
import {scope, provide, plugin} from 'midway';

@scope('Singleton')
@provide('model.bucket')
export class BucketInfoModel {

    constructor(@plugin('mongoose') mongoose) {
        return this.buildBucketModel(mongoose);
    }

    buildBucketModel(mongoose): any {

        const toObjectOptions: object = {
            transform(doc, ret, options) {
                return omit(ret, ['_id']);
            }
        };

        const bucketScheme = new mongoose.Schema({
            bucketName: {type: String, required: true},
            userId: {type: Number, required: true},
            nodeId: {type: Number, required: false},
            bucketType: {type: Number, enum: [1, 2], default: 1, required: true}, // 1:个人所属 2:节点所属
            totalFileQuantity: {type: Number, default: 0, required: true}, // 资源文件数量
            totalFileSize: {type: Number, default: 0, required: true}, // 总的文件大小(byte)
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: toObjectOptions,
            toObject: toObjectOptions
        });

        bucketScheme.index({userId: 1, nodeId: 1})
        bucketScheme.index({bucketName: 1}, {unique: true});

        return mongoose.model('buckets', bucketScheme);
    }
}
