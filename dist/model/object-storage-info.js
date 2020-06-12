"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStorageInfo = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let ObjectStorageInfo = /** @class */ (() => {
    var ObjectStorageInfo_1;
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
            objectScheme.virtual('storageObjectId').get(function () {
                return this.id;
            });
            objectScheme.index({ bucketId: 1, objectName: 1 }, { unique: true });
            return this.mongoose.model('objects', objectScheme);
        }
        static get toObjectOptions() {
            return {
                transform(doc, ret) {
                    return lodash_1.omit(ret, ['_id']);
                }
            };
        }
    };
    ObjectStorageInfo = ObjectStorageInfo_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.objectStorageInfo')
    ], ObjectStorageInfo);
    return ObjectStorageInfo;
})();
exports.ObjectStorageInfo = ObjectStorageInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2UtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9vYmplY3Qtc3RvcmFnZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUE0QjtBQUM1QixtQ0FBc0M7QUFDdEMsK0RBQTRFO0FBSTVFOztJQUFBLElBQWEsaUJBQWlCLHlCQUE5QixNQUFhLGlCQUFrQixTQUFRLHVDQUFpQjtRQUVwRCxrQkFBa0I7WUFDZCxNQUFNLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUMxQyxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3BDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDMUMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUN4QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzFDLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDO2dCQUMxRCxjQUFjLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUM7Z0JBQ3RGLGNBQWMsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBQyxDQUFDLDBCQUEwQjthQUNwSCxFQUFFO2dCQUNDLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7Z0JBQzlELE1BQU0sRUFBRSxtQkFBaUIsQ0FBQyxlQUFlO2dCQUN6QyxRQUFRLEVBQUUsbUJBQWlCLENBQUMsZUFBZTthQUM5QyxDQUFDLENBQUM7WUFFSCxZQUFZLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUN4QyxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUVqRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsTUFBTSxLQUFLLGVBQWU7WUFDdEIsT0FBTztnQkFDSCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUc7b0JBQ2QsT0FBTyxhQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsQ0FBQzthQUNKLENBQUM7UUFDTixDQUFDO0tBQ0osQ0FBQTtJQW5DWSxpQkFBaUI7UUFGN0IsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLHlCQUF5QixDQUFDO09BQ3RCLGlCQUFpQixDQW1DN0I7SUFBRCx3QkFBQztLQUFBO0FBbkNZLDhDQUFpQiJ9