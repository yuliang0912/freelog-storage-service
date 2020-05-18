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
const midway_1 = require("midway");
// 文件实际存储信息
let BucketInfoModel = /** @class */ (() => {
    let BucketInfoModel = class BucketInfoModel {
        constructor(mongoose, uploadConfig) {
            return this.buildBucketModel(mongoose, uploadConfig);
        }
        buildBucketModel(mongoose, ossConfig) {
            const isInternal = ossConfig.aliOss.internal;
            const objectScheme = new mongoose.Schema({
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
            return mongoose.model('file-storage-infos', objectScheme);
        }
    };
    BucketInfoModel = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.fileStorageInfo'),
        __param(0, midway_1.plugin('mongoose')), __param(1, midway_1.config('uploadConfig')),
        __metadata("design:paramtypes", [Object, Object])
    ], BucketInfoModel);
    return BucketInfoModel;
})();
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL21vZGVsL2ZpbGUtc3RvcmFnZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFzRDtBQUV0RCxXQUFXO0FBR1g7SUFBQSxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO1FBRXhCLFlBQWdDLFFBQVEsRUFBMEIsWUFBWTtZQUMxRSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELGdCQUFnQixDQUFDLFFBQVEsRUFBRSxTQUFjO1lBQ3JDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQzdDLE1BQU0sWUFBWSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDckMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUNwQyxRQUFRLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3hDLGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzlELGVBQWUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBQztnQkFDakcsV0FBVyxFQUFFO29CQUNULE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztvQkFDdEMsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO29CQUN0QyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7aUJBQzVDO2FBQ0osRUFBRTtnQkFDQyxVQUFVLEVBQUUsS0FBSztnQkFDakIsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBQzthQUN4QyxDQUFDLENBQUM7WUFFSCxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFFOUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ2hDLE1BQU0sRUFBQyxlQUFlLEVBQUUsV0FBVyxFQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUM1QyxJQUFJLGVBQWUsS0FBSyxVQUFVLEVBQUU7b0JBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDckM7Z0JBQ0QsT0FBTyxVQUFVLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxpQkFBaUIsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3RJLENBQUMsQ0FBQyxDQUFBO1lBRUYsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzlELENBQUM7S0FDSixDQUFBO0lBbkNZLGVBQWU7UUFGM0IsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLHVCQUF1QixDQUFDO1FBR2hCLFdBQUEsZUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBLEVBQVksV0FBQSxlQUFNLENBQUMsY0FBYyxDQUFDLENBQUE7O09BRnhELGVBQWUsQ0FtQzNCO0lBQUQsc0JBQUM7S0FBQTtBQW5DWSwwQ0FBZSJ9