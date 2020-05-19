"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BucketInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let BucketInfoModel = /** @class */ (() => {
    var BucketInfoModel_1;
    let BucketInfoModel = BucketInfoModel_1 = class BucketInfoModel extends mongoose_model_base_1.MongooseModelBase {
        buildMongooseModel() {
            const objectScheme = new this.mongoose.Schema({
                sha1: { type: String, required: true },
                objectName: { type: String, required: true },
                bucketId: { type: String, required: true },
                bucketName: { type: String, required: true },
                resourceType: { type: String, required: true },
                systemMeta: {},
                customMeta: {} // 自定义meta,例如颜色,排序,或者依赖等信息
            }, {
                versionKey: false,
                timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
                toJSON: BucketInfoModel_1.toObjectOptions,
                toObject: BucketInfoModel_1.toObjectOptions
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
    BucketInfoModel = BucketInfoModel_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.object')
    ], BucketInfoModel);
    return BucketInfoModel;
})();
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL21vZGVsL3N0b3JhZ2Utb2JqZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUE0QjtBQUM1QixtQ0FBc0M7QUFDdEMsK0RBQTRFO0FBSTVFOztJQUFBLElBQWEsZUFBZSx1QkFBNUIsTUFBYSxlQUFnQixTQUFRLHVDQUFpQjtRQUVsRCxrQkFBa0I7WUFDZCxNQUFNLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUMxQyxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3BDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDMUMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUN4QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzFDLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDNUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ2QsVUFBVSxFQUFFLEVBQUUsQ0FBQywwQkFBMEI7YUFDNUMsRUFBRTtnQkFDQyxVQUFVLEVBQUUsS0FBSztnQkFDakIsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFDO2dCQUM5RCxNQUFNLEVBQUUsaUJBQWUsQ0FBQyxlQUFlO2dCQUN2QyxRQUFRLEVBQUUsaUJBQWUsQ0FBQyxlQUFlO2FBQzVDLENBQUMsQ0FBQztZQUVILFlBQVksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ3hDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUVILFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBRWpFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxNQUFNLEtBQUssZUFBZTtZQUN0QixPQUFPO2dCQUNILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRztvQkFDZCxPQUFPLGFBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSixDQUFBO0lBbENZLGVBQWU7UUFGM0IsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLGNBQWMsQ0FBQztPQUNYLGVBQWUsQ0FrQzNCO0lBQUQsc0JBQUM7S0FBQTtBQWxDWSwwQ0FBZSJ9