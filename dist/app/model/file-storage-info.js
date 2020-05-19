"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BucketInfoModel = void 0;
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
// 文件实际存储信息
let BucketInfoModel = /** @class */ (() => {
    let BucketInfoModel = class BucketInfoModel extends mongoose_model_base_1.MongooseModelBase {
        buildMongooseModel() {
            const isInternal = this.uploadConfig.aliOss.internal;
            const objectScheme = new this.mongoose.Schema({
                sha1: { type: String, required: true },
                fileSize: { type: Number, required: true },
                referencedQuantity: { type: Number, default: 1, required: true },
                serviceProvider: { type: String, required: false, enum: ['aliOss', 'amazonS3'], default: 'aliOss' },
                storageInfo: {
                    region: { type: String, required: true },
                    bucket: { type: String, required: true },
                    objectKey: { type: String, required: true },
                }
            }, {
                versionKey: false,
                timestamps: { createdAt: 'createDate' }
            });
            objectScheme.index({ sha1: 1 }, { unique: true });
            objectScheme.virtual('fileUrl').get(function () {
                const { serviceProvider, storageInfo } = this;
                if (serviceProvider === 'amazonS3') {
                    throw new Error('not implements');
                }
                return `http://${storageInfo.bucket}.${storageInfo.region}${isInternal ? '-internal' : ''}.aliyuncs.com/${storageInfo.objectKey}`;
            });
            return this.mongoose.model('file-storage-infos', objectScheme);
        }
    };
    BucketInfoModel = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.fileStorageInfo')
    ], BucketInfoModel);
    return BucketInfoModel;
})();
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL21vZGVsL2ZpbGUtc3RvcmFnZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUFzQztBQUN0QywrREFBNEU7QUFFNUUsV0FBVztBQUdYO0lBQUEsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZ0IsU0FBUSx1Q0FBaUI7UUFFbEQsa0JBQWtCO1lBQ2QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ3JELE1BQU0sWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzFDLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDcEMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUN4QyxrQkFBa0IsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUM5RCxlQUFlLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUM7Z0JBQ2pHLFdBQVcsRUFBRTtvQkFDVCxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7b0JBQ3RDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztvQkFDdEMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2lCQUM1QzthQUNKLEVBQUU7Z0JBQ0MsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUM7YUFDeEMsQ0FBQyxDQUFDO1lBRUgsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBRTlDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNoQyxNQUFNLEVBQUMsZUFBZSxFQUFFLFdBQVcsRUFBQyxHQUFHLElBQUksQ0FBQztnQkFDNUMsSUFBSSxlQUFlLEtBQUssVUFBVSxFQUFFO29CQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7aUJBQ3JDO2dCQUNELE9BQU8sVUFBVSxXQUFXLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsaUJBQWlCLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN0SSxDQUFDLENBQUMsQ0FBQTtZQUVGLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDbkUsQ0FBQztLQUNKLENBQUE7SUEvQlksZUFBZTtRQUYzQixjQUFLLENBQUMsV0FBVyxDQUFDO1FBQ2xCLGdCQUFPLENBQUMsdUJBQXVCLENBQUM7T0FDcEIsZUFBZSxDQStCM0I7SUFBRCxzQkFBQztLQUFBO0FBL0JZLDBDQUFlIn0=