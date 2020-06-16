"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BucketInfoModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BucketInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
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
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVsL2J1Y2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsbUNBQTRCO0FBQzVCLG1DQUFzQztBQUN0QywrREFBNEU7QUFJNUUsSUFBYSxlQUFlLHVCQUE1QixNQUFhLGVBQWdCLFNBQVEsdUNBQWlCO0lBRWxELGtCQUFrQjtRQUNkLE1BQU0sWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDMUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQzFDLHNEQUFzRDtZQUN0RCwyREFBMkQ7WUFDM0QsZUFBZSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQy9DLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQztZQUN2QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3ZFLGlCQUFpQixFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDN0QsYUFBYSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7U0FDNUQsRUFBRTtZQUNDLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBQztZQUM5RCxNQUFNLEVBQUUsaUJBQWUsQ0FBQyxlQUFlO1lBQ3ZDLFFBQVEsRUFBRSxpQkFBZSxDQUFDLGVBQWU7U0FDNUMsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7UUFDL0MsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBRXpELFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxNQUFNLEtBQUssZUFBZTtRQUN0QixPQUFPO1lBQ0gsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHO2dCQUNkLE9BQU8sYUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDakQsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQXBDWSxlQUFlO0lBRjNCLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyxjQUFjLENBQUM7R0FDWCxlQUFlLENBb0MzQjtBQXBDWSwwQ0FBZSJ9