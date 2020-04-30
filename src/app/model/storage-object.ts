import {omit} from 'lodash';
import {scope, provide, plugin} from 'midway';

@scope('Singleton')
@provide('model.object')
export class BucketInfoModel {

    constructor(@plugin('mongoose') mongoose) {
        return this.buildBucketModel(mongoose);
    }

    buildBucketModel(mongoose): any {

        const toObjectOptions: object = {
            transform(doc, ret, options) {
                return omit(ret, ['_id', 'fileOss']);
            }
        };

        const objectScheme = new mongoose.Schema({
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
            toJSON: toObjectOptions,
            toObject: toObjectOptions
        });

        objectScheme.index({bucketId: 1, objectName: 1}, {unique: true});

        return mongoose.model('objects', objectScheme);
    }
}
