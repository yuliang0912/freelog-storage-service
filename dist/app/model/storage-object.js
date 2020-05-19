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
    let BucketInfoModel = class BucketInfoModel extends mongoose_model_base_1.MongooseModelBase {
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
                toJSON: this.toObjectOptions,
                toObject: this.toObjectOptions
            });
            objectScheme.index({ bucketId: 1, objectName: 1 }, { unique: true });
            return this.mongoose.model('objects', objectScheme);
        }
        get toObjectOptions() {
            return {
                transform(doc, ret, options) {
                    return lodash_1.omit(ret, ['_id']);
                }
            };
        }
    };
    BucketInfoModel = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.object')
    ], BucketInfoModel);
    return BucketInfoModel;
})();
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL21vZGVsL3N0b3JhZ2Utb2JqZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUE0QjtBQUM1QixtQ0FBc0M7QUFDdEMsK0RBQTRFO0FBSTVFO0lBQUEsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZ0IsU0FBUSx1Q0FBaUI7UUFFbEQsa0JBQWtCO1lBQ2QsTUFBTSxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDMUMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUNwQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDeEMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUMxQyxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzVDLFVBQVUsRUFBRSxFQUFFO2dCQUNkLFVBQVUsRUFBRSxFQUFFLENBQUMsMEJBQTBCO2FBQzVDLEVBQUU7Z0JBQ0MsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBQztnQkFDOUQsTUFBTSxFQUFFLElBQUksQ0FBQyxlQUFlO2dCQUM1QixRQUFRLEVBQUUsSUFBSSxDQUFDLGVBQWU7YUFDakMsQ0FBQyxDQUFDO1lBRUgsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFFakUsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELElBQUksZUFBZTtZQUNmLE9BQU87Z0JBQ0gsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTztvQkFDdkIsT0FBTyxhQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsQ0FBQzthQUNKLENBQUM7UUFDTixDQUFDO0tBQ0osQ0FBQTtJQTlCWSxlQUFlO1FBRjNCLGNBQUssQ0FBQyxXQUFXLENBQUM7UUFDbEIsZ0JBQU8sQ0FBQyxjQUFjLENBQUM7T0FDWCxlQUFlLENBOEIzQjtJQUFELHNCQUFDO0tBQUE7QUE5QlksMENBQWUifQ==