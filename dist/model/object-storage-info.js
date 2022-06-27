"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ObjectStorageInfo_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStorageInfo = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
let ObjectStorageInfo = ObjectStorageInfo_1 = class ObjectStorageInfo extends mongoose_model_base_1.MongooseModelBase {
    constructor(mongoose) {
        super(mongoose);
    }
    buildMongooseModel() {
        const BaseDependencyScheme = new this.mongoose.Schema({
            name: { type: String, required: true },
            type: { type: String, required: true },
            versionRange: { type: String, required: true },
        }, { _id: false });
        // 自定义属性描述器主要面向继承者,例如展品需要对资源中的自定义属性进行编辑
        const CustomPropertyDescriptorScheme = new this.mongoose.Schema({
            key: { type: String, required: true },
            defaultValue: { type: this.mongoose.Schema.Types.Mixed, required: true },
            type: { type: String, required: true, enum: ['editableText', 'readonlyText', 'radio', 'checkbox', 'select'] },
            candidateItems: { type: [String], required: false },
            remark: { type: String, required: false, default: '' },
        }, { _id: false });
        const objectScheme = new this.mongoose.Schema({
            userId: { type: Number, required: true },
            sha1: { type: String, required: true },
            objectName: { type: String, required: true },
            bucketId: { type: String, required: true },
            bucketName: { type: String, required: true },
            resourceType: { type: [String], required: false, default: [] },
            uniqueKey: { type: String, required: true },
            systemProperty: { type: this.mongoose.Schema.Types.Mixed, required: false, default: {} },
            customPropertyDescriptors: { type: [CustomPropertyDescriptorScheme], default: [], required: false },
            dependencies: { type: [BaseDependencyScheme], required: false, default: [] },
        }, {
            minimize: false,
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ObjectStorageInfo_1.toObjectOptions,
            toObject: ObjectStorageInfo_1.toObjectOptions
        });
        objectScheme.virtual('objectId').get(function () {
            return this.id;
        });
        objectScheme.virtual('customProperty').get(function () {
            if (lodash_1.isUndefined(this.customPropertyDescriptors) || !lodash_1.isArray(this.customPropertyDescriptors)) {
                return undefined; // 不查询customPropertyDescriptors时,不自动生成customProperty
            }
            const customProperty = {};
            if (!lodash_1.isEmpty(this.customPropertyDescriptors)) {
                for (const { key, defaultValue } of this.customPropertyDescriptors) {
                    customProperty[key] = defaultValue;
                }
            }
            return customProperty;
        });
        objectScheme.index({ userId: 1 });
        objectScheme.index({ uniqueKey: 1 }, { unique: true });
        objectScheme.index({ bucketId: 1, objectName: 1 }, { unique: true });
        return this.mongoose.model('objects', objectScheme);
    }
    static get toObjectOptions() {
        return {
            getters: true,
            transform(doc, ret) {
                return lodash_1.omit(ret, ['_id', 'id', 'uniqueKey']);
            }
        };
    }
};
ObjectStorageInfo = ObjectStorageInfo_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.objectStorageInfo'),
    __param(0, midway_1.plugin('mongoose')),
    __metadata("design:paramtypes", [Object])
], ObjectStorageInfo);
exports.ObjectStorageInfo = ObjectStorageInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2UtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9vYmplY3Qtc3RvcmFnZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBMkQ7QUFDM0QsbUNBQThDO0FBQzlDLHVGQUFnRjtBQUloRixJQUFhLGlCQUFpQix5QkFBOUIsTUFBYSxpQkFBa0IsU0FBUSx1Q0FBaUI7SUFFcEQsWUFBZ0MsUUFBUTtRQUNwQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVELGtCQUFrQjtRQUVkLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNsRCxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDcEMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3BDLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztTQUMvQyxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7UUFFakIsdUNBQXVDO1FBQ3ZDLE1BQU0sOEJBQThCLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUM1RCxHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDbkMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN0RSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFF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