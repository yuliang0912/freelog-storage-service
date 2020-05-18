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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BucketInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
let BucketInfoModel = /** @class */ (() => {
    let BucketInfoModel = class BucketInfoModel {
        constructor(mongoose) {
            return this.buildBucketModel(mongoose);
        }
        buildBucketModel(mongoose) {
            const toObjectOptions = {
                transform(doc, ret, options) {
                    return lodash_1.omit(ret, ['_id', 'bucketUniqueKey']);
                }
            };
            const bucketScheme = new mongoose.Schema({
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
                toJSON: toObjectOptions,
                toObject: toObjectOptions
            });
            bucketScheme.index({ bucketName: 1, userId: 1 });
            bucketScheme.index({ bucketUniqueKey: 1 }, { unique: true });
            bucketScheme.virtual('bucketId').get(function () {
                return this.id;
            });
            return mongoose.model('buckets', bucketScheme);
        }
    };
    BucketInfoModel = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.bucket'),
        __param(0, midway_1.plugin('mongoose')),
        __metadata("design:paramtypes", [Object])
    ], BucketInfoModel);
    return BucketInfoModel;
})();
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9tb2RlbC9idWNrZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTRCO0FBQzVCLG1DQUE4QztBQUk5QztJQUFBLElBQWEsZUFBZSxHQUE1QixNQUFhLGVBQWU7UUFFeEIsWUFBZ0MsUUFBUTtZQUNwQyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsZ0JBQWdCLENBQUMsUUFBUTtZQUVyQixNQUFNLGVBQWUsR0FBVztnQkFDNUIsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTztvQkFDdkIsT0FBTyxhQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDakQsQ0FBQzthQUNKLENBQUM7WUFFRixNQUFNLFlBQVksR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ3JDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDMUMsc0RBQXNEO2dCQUN0RCwyREFBMkQ7Z0JBQzNELGVBQWUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDL0MsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDO2dCQUN2QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUN2RSxpQkFBaUIsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUM3RCxhQUFhLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQzthQUM1RCxFQUFFO2dCQUNDLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7Z0JBQzlELE1BQU0sRUFBRSxlQUFlO2dCQUN2QixRQUFRLEVBQUUsZUFBZTthQUM1QixDQUFDLENBQUM7WUFFSCxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQTtZQUM5QyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUMsZUFBZSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFFekQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ2pDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQTtZQUVGLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDbkQsQ0FBQztLQUNKLENBQUE7SUF2Q1ksZUFBZTtRQUYzQixjQUFLLENBQUMsV0FBVyxDQUFDO1FBQ2xCLGdCQUFPLENBQUMsY0FBYyxDQUFDO1FBR1AsV0FBQSxlQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7O09BRnRCLGVBQWUsQ0F1QzNCO0lBQUQsc0JBQUM7S0FBQTtBQXZDWSwwQ0FBZSJ9