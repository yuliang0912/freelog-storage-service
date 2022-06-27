import {omit, isUndefined, isArray, isEmpty} from 'lodash';
import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';

@scope('Singleton')
@provide('model.objectStorageInfo')
export class ObjectStorageInfo extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {

        const BaseDependencyScheme = new this.mongoose.Schema({
            name: {type: String, required: true},
            type: {type: String, required: true},
            versionRange: {type: String, required: true},
        }, {_id: false});

        // 自定义属性描述器主要面向继承者,例如展品需要对资源中的自定义属性进行编辑
        const CustomPropertyDescriptorScheme = new this.mongoose.Schema({
            key: {type: String, required: true},
            defaultValue: {type: this.mongoose.Schema.Types.Mixed, required: true},
            type: {type: String, required: true, enum: ['editableText', 'readonlyText', 'radio', 'checkbox', 'select']}, // 类型目前分为: 可编辑文本框,不可编辑文本框,单选框,多选框,下拉选择框
            candidateItems: {type: [String], required: false}, // 选项列表
            remark: {type: String, required: false, default: ''}, // 备注,对外显示信息,例如字段说明或者用途信息等
        }, {_id: false});

        const objectScheme = new this.mongoose.Schema({
            userId: {type: Number, required: true},
            sha1: {type: String, required: true},
            objectName: {type: String, required: true}, // 取值于文件名
            bucketId: {type: String, required: true},
            bucketName: {type: String, required: true},
            resourceType: {type: [String], required: false, default: []}, // 类型可以为空
            uniqueKey: {type: String, required: true},
            systemProperty: {type: this.mongoose.Schema.Types.Mixed, required: false, default: {}}, //  系统meta,例如图片的宽高等
            customPropertyDescriptors: {type: [CustomPropertyDescriptorScheme], default: [], required: false},
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

        objectScheme.virtual('customProperty').get(function (this: any) {
            if (isUndefined(this.customPropertyDescriptors) || !isArray(this.customPropertyDescriptors)) {
                return undefined; // 不查询customPropertyDescriptors时,不自动生成customProperty
            }
            const customProperty = {} as any;
            if (!isEmpty(this.customPropertyDescriptors)) {
                for (const {key, defaultValue} of this.customPropertyDescriptors) {
                    customProperty[key] = defaultValue;
                }
            }
            return customProperty;
        });

        objectScheme.index({userId: 1});
        objectScheme.index({uniqueKey: 1}, {unique: true});
        objectScheme.index({bucketId: 1, objectName: 1}, {unique: true});

        return this.mongoose.model('objects', objectScheme);
    }

    static get toObjectOptions() {
        return {
            getters: true,
            transform(doc, ret) {
                return omit(ret, ['_id', 'id', 'uniqueKey']);
            }
        };
    }
}
