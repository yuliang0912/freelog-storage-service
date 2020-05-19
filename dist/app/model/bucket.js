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
                toJSON: this.toObjectOptions,
                toObject: this.toObjectOptions
            });
            bucketScheme.index({ bucketName: 1, userId: 1 });
            bucketScheme.index({ bucketUniqueKey: 1 }, { unique: true });
            bucketScheme.virtual('bucketId').get(function () {
                return this.id;
            });
            return this.mongoose.model('buckets', bucketScheme);
        }
        get toObjectOptions() {
            return {
                transform(doc, ret, options) {
                    return lodash_1.omit(ret, ['_id', 'bucketUniqueKey']);
                }
            };
        }
    };
    BucketInfoModel = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.bucket')
    ], BucketInfoModel);
    return BucketInfoModel;
})();
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9tb2RlbC9idWNrZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQTRCO0FBQzVCLG1DQUFzQztBQUN0QywrREFBNEU7QUFJNUU7SUFBQSxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFnQixTQUFRLHVDQUFpQjtRQUVsRCxrQkFBa0I7WUFDZCxNQUFNLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUMxQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzFDLHNEQUFzRDtnQkFDdEQsMkRBQTJEO2dCQUMzRCxlQUFlLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQy9DLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQztnQkFDdkMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDdkUsaUJBQWlCLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDN0QsYUFBYSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7YUFDNUQsRUFBRTtnQkFDQyxVQUFVLEVBQUUsS0FBSztnQkFDakIsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFDO2dCQUM5RCxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWU7Z0JBQzVCLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZTthQUNqQyxDQUFDLENBQUM7WUFFSCxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQTtZQUM5QyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUMsZUFBZSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFFekQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ2pDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQTtZQUVGLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxJQUFJLGVBQWU7WUFDZixPQUFPO2dCQUNILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU87b0JBQ3ZCLE9BQU8sYUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELENBQUM7YUFDSixDQUFDO1FBQ04sQ0FBQztLQUNKLENBQUE7SUFwQ1ksZUFBZTtRQUYzQixjQUFLLENBQUMsV0FBVyxDQUFDO1FBQ2xCLGdCQUFPLENBQUMsY0FBYyxDQUFDO09BQ1gsZUFBZSxDQW9DM0I7SUFBRCxzQkFBQztLQUFBO0FBcENZLDBDQUFlIn0=