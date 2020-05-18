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
const midway_1 = require("midway");
// 文件实际存储信息
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
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL21vZGVsL2ZpbGUtc3RvcmFnZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXNEO0FBRXRELFdBQVc7QUFHWCxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBRXhCLFlBQWdDLFFBQVEsRUFBMEIsWUFBWTtRQUMxRSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELGdCQUFnQixDQUFDLFFBQVEsRUFBRSxTQUFjO1FBQ3JDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQzdDLE1BQU0sWUFBWSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNyQyxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDcEMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3hDLGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDOUQsZUFBZSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFDO1lBQ2pHLFdBQVcsRUFBRTtnQkFDVCxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3RDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDdEMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2FBQzVDO1NBQ0osRUFBRTtZQUNDLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUM7U0FDeEMsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBRTlDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ2hDLE1BQU0sRUFBQyxlQUFlLEVBQUUsV0FBVyxFQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzVDLElBQUksZUFBZSxLQUFLLFVBQVUsRUFBRTtnQkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2FBQ3JDO1lBQ0QsT0FBTyxVQUFVLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxpQkFBaUIsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RJLENBQUMsQ0FBQyxDQUFBO1FBRUYsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FDSixDQUFBO0FBbkNZLGVBQWU7SUFGM0IsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLHVCQUF1QixDQUFDO0lBR2hCLFdBQUEsZUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBLEVBQVksV0FBQSxlQUFNLENBQUMsY0FBYyxDQUFDLENBQUE7O0dBRnhELGVBQWUsQ0FtQzNCO0FBbkNZLDBDQUFlIn0=