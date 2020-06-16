"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ObjectStorageInfo_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStorageInfo = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let ObjectStorageInfo = ObjectStorageInfo_1 = class ObjectStorageInfo extends mongoose_model_base_1.MongooseModelBase {
    buildMongooseModel() {
        const objectScheme = new this.mongoose.Schema({
            sha1: { type: String, required: true },
            objectName: { type: String, required: true },
            bucketId: { type: String, required: true },
            bucketName: { type: String, required: true },
            resourceType: { type: String, required: false, default: '' },
            systemProperty: { type: this.mongoose.Schema.Types.Mixed, required: false, default: {} },
            customProperty: { type: this.mongoose.Schema.Types.Mixed, required: false, default: {} } // 自定义meta,例如颜色,排序,或者依赖等信息
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
        objectScheme.index({ bucketId: 1, objectName: 1 }, { unique: true });
        return this.mongoose.model('objects', objectScheme);
    }
    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return lodash_1.assign({ objectId: doc.id }, lodash_1.omit(ret, ['_id']));
            }
        };
    }
};
ObjectStorageInfo = ObjectStorageInfo_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.objectStorageInfo')
], ObjectStorageInfo);
exports.ObjectStorageInfo = ObjectStorageInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2UtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9vYmplY3Qtc3RvcmFnZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxtQ0FBb0M7QUFDcEMsbUNBQXNDO0FBQ3RDLCtEQUE0RTtBQUk1RSxJQUFhLGlCQUFpQix5QkFBOUIsTUFBYSxpQkFBa0IsU0FBUSx1Q0FBaUI7SUFFcEQsa0JBQWtCO1FBQ2QsTUFBTSxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMxQyxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDcEMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN4QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDMUMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUM7WUFDMUQsY0FBYyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDO1lBQ3RGLGNBQWMsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBQyxDQUFDLDBCQUEwQjtTQUNwSCxFQUFFO1lBQ0MsUUFBUSxFQUFFLEtBQUs7WUFDZixVQUFVLEVBQUUsS0FBSztZQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7WUFDOUQsTUFBTSxFQUFFLG1CQUFpQixDQUFDLGVBQWU7WUFDekMsUUFBUSxFQUFFLG1CQUFpQixDQUFDLGVBQWU7U0FDOUMsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDakMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFFakUsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELE1BQU0sS0FBSyxlQUFlO1FBQ3RCLE9BQU87WUFDSCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUc7Z0JBQ2QsT0FBTyxlQUFNLENBQUMsRUFBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBQyxFQUFFLGFBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQW5DWSxpQkFBaUI7SUFGN0IsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLHlCQUF5QixDQUFDO0dBQ3RCLGlCQUFpQixDQW1DN0I7QUFuQ1ksOENBQWlCIn0=