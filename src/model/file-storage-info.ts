import {omit} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

// 文件实际存储信息
@scope('Singleton')
@provide('model.fileStorageInfo')
export class FileStorageInfoModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {
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
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: FileStorageInfoModel.toObjectOptions,
            toObject: FileStorageInfoModel.toObjectOptions
        });

        objectScheme.index({sha1: 1}, {unique: true});

        return this.mongoose.model('file-storage-infos', objectScheme);
    }

    static get toObjectOptions() {
        return {
            getters: true,
            virtuals: true,
            transform(doc, ret) {
                return omit(ret, ['_id', 'id']);
            }
        };
    }
}
