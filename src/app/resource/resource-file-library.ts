import {omit} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.resourceFileLibraryModel') // 此model可能考虑不要
export class ResourceFileLibraryModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {
        const resourceFileLibraryScheme = new this.mongoose.Schema({
            sha1: {type: String, unique: true, required: true},
            storageId: {type: String, required: true}, // 存储ID,对应存储服务的file-storage
            userId: {type: Number, required: false},
            resourceType: {type: String, required: true},
            fileSize: {type: Number, required: true}, // 资源文件大小
            sign: {type: String, required: true}, // 当前文件库信息签名(sha1,storageId,userId,resourceType,fileSize)
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
