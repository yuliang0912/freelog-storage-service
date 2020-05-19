import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

// 文件实际存储信息
@scope('Singleton')
@provide('model.fileStorageInfo')
export class BucketInfoModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {
        const isInternal = this.uploadConfig.aliOss.internal;
        const objectScheme = new this.mongoose.Schema({
            sha1: {type: String, required: true},
            fileSize: {type: Number, required: true},
            referencedQuantity: {type: Number, default: 1, required: true},
            serviceProvider: {type: String, required: false, enum: ['aliOss', 'amazonS3'], default: 'aliOss'},
            storageInfo: {
                region: {type: String, required: true}, // 区域
                bucket: {type: String, required: true}, // bucket
                objectKey: {type: String, required: true}, // 实际存储的objectKey与用户端不同,此处为系统生成
            }
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate'}
        });

        objectScheme.index({sha1: 1}, {unique: true});

        objectScheme.virtual('fileUrl').get(function (this: any) {
            const {serviceProvider, storageInfo} = this;
            if (serviceProvider === 'amazonS3') {
                throw new Error('not implements');
            }
            return `http://${storageInfo.bucket}.${storageInfo.region}${isInternal ? '-internal' : ''}.aliyuncs.com/${storageInfo.objectKey}`;
        })

        return this.mongoose.model('file-storage-infos', objectScheme);
    }
}
