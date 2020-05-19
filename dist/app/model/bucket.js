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
            const bucketScheme = new this.mongoose.Schema({
                bucketName: { type: String, required: true },
                // 用于唯一性校验的排他索引,没有使用bucketName是考虑到不同用户的相同命名的系统存储bucket
                // 例如用户自己的则直接以bucketName作为索引.但是系统级的可能是userId/bucketName作为索引
                bucketUniqueKey: { type: String, required: true },
                userId: { type: Number, required: false },
                bucketType: { type: Number, enum: [1, 2, 3], default: 1, required: true },
                totalFileQuantity: { type: Number, default: 0, required: true },
                totalFileSize: { type: Number, default: 0, required: true },
            }, {
                versionKey: false,
                timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
                toJSON: BucketInfoModel_1.toObjectOptions,
                toObject: BucketInfoModel_1.toObjectOptions
            });
            bucketScheme.index({ bucketName: 1, userId: 1 });
            bucketScheme.index({ bucketUniqueKey: 1 }, { unique: true });
            bucketScheme.virtual('bucketId').get(function () {
                return this.id;
            });
            return this.mongoose.model('buckets', bucketScheme);
        }
        static get toObjectOptions() {
            return {
                transform(doc, ret, options) {
                    return lodash_1.omit(ret, ['_id', 'bucketUniqueKey']);
                }
            };
        }
    };
    BucketInfoModel = BucketInfoModel_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.bucket')
    ], BucketInfoModel);
    return BucketInfoModel;
})();
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9tb2RlbC9idWNrZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQTRCO0FBQzVCLG1DQUFzQztBQUN0QywrREFBNEU7QUFJNUU7O0lBQUEsSUFBYSxlQUFlLHVCQUE1QixNQUFhLGVBQWdCLFNBQVEsdUNBQWlCO1FBRWxELGtCQUFrQjtZQUNkLE1BQU0sWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzFDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDMUMsc0RBQXNEO2dCQUN0RCwyREFBMkQ7Z0JBQzNELGVBQWUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDL0MsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDO2dCQUN2QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUN2RSxpQkFBaUIsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUM3RCxhQUFhLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQzthQUM1RCxFQUFFO2dCQUNDLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7Z0JBQzlELE1BQU0sRUFBRSxpQkFBZSxDQUFDLGVBQWU7Z0JBQ3ZDLFFBQVEsRUFBRSxpQkFBZSxDQUFDLGVBQWU7YUFDNUMsQ0FBQyxDQUFDO1lBRUgsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUE7WUFDOUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBRXpELFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNqQyxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsTUFBTSxLQUFLLGVBQWU7WUFDdEIsT0FBTztnQkFDSCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPO29CQUN2QixPQUFPLGFBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSixDQUFBO0lBcENZLGVBQWU7UUFGM0IsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLGNBQWMsQ0FBQztPQUNYLGVBQWUsQ0FvQzNCO0lBQUQsc0JBQUM7S0FBQTtBQXBDWSwwQ0FBZSJ9