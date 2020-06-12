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
                transform(doc, ret) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVsL2J1Y2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBNEI7QUFDNUIsbUNBQXNDO0FBQ3RDLCtEQUE0RTtBQUk1RTs7SUFBQSxJQUFhLGVBQWUsdUJBQTVCLE1BQWEsZUFBZ0IsU0FBUSx1Q0FBaUI7UUFFbEQsa0JBQWtCO1lBQ2QsTUFBTSxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDMUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUMxQyxzREFBc0Q7Z0JBQ3RELDJEQUEyRDtnQkFDM0QsZUFBZSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUMvQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUM7Z0JBQ3ZDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3ZFLGlCQUFpQixFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzdELGFBQWEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2FBQzVELEVBQUU7Z0JBQ0MsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBQztnQkFDOUQsTUFBTSxFQUFFLGlCQUFlLENBQUMsZUFBZTtnQkFDdkMsUUFBUSxFQUFFLGlCQUFlLENBQUMsZUFBZTthQUM1QyxDQUFDLENBQUM7WUFFSCxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUMvQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUMsZUFBZSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFFekQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ2pDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxNQUFNLEtBQUssZUFBZTtZQUN0QixPQUFPO2dCQUNILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRztvQkFDZCxPQUFPLGFBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSixDQUFBO0lBcENZLGVBQWU7UUFGM0IsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLGNBQWMsQ0FBQztPQUNYLGVBQWUsQ0FvQzNCO0lBQUQsc0JBQUM7S0FBQTtBQXBDWSwwQ0FBZSJ9