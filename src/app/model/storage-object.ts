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
                return omit(ret, ['_id']);
            }
        };

        const objectScheme = new mongoose.Schema({
            sha1: {type: String, required: true},
            objectName: {type: String, required: true},
            bucketName: {type: String, required: true},
            resourceType: {type: String, required: true},
            systemMeta: {}, //  系统meta,例如图片的宽高等
            customMeta: {}, // 自定义meta,例如颜色,排序,或者依赖等信息
            fileOss: {
                serviceProvider: {type: String, required: false, enum: ['aliOss', 'amazonS3'], default: 'aliOss'},
                filename: {type: String, required: true},
                objectKey: {type: String, required: true},
                bucket: {type: String, required: true},
                region: {type: String, required: true},
                url: {type: String, required: true}
            },
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: toObjectOptions,
            toObject: toObjectOptions
        });

        objectScheme.index({bucketName: 1, objectName: 1}, {unique: true});

        return mongoose.model('objects', objectScheme);
    }
}
