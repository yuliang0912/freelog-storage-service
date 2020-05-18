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
                    return lodash_1.omit(ret, ['_id', 'fileOss']);
                }
            };
            const objectScheme = new mongoose.Schema({
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
                toJSON: toObjectOptions,
                toObject: toObjectOptions
            });
            objectScheme.index({ bucketId: 1, objectName: 1 }, { unique: true });
            return mongoose.model('objects', objectScheme);
        }
    };
    BucketInfoModel = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.object'),
        __param(0, midway_1.plugin('mongoose')),
        __metadata("design:paramtypes", [Object])
    ], BucketInfoModel);
    return BucketInfoModel;
})();
exports.BucketInfoModel = BucketInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL21vZGVsL3N0b3JhZ2Utb2JqZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE0QjtBQUM1QixtQ0FBOEM7QUFJOUM7SUFBQSxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO1FBRXhCLFlBQWdDLFFBQVE7WUFDcEMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELGdCQUFnQixDQUFDLFFBQVE7WUFFckIsTUFBTSxlQUFlLEdBQVc7Z0JBQzVCLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU87b0JBQ3ZCLE9BQU8sYUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO2FBQ0osQ0FBQztZQUVGLE1BQU0sWUFBWSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDckMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUNwQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDeEMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUMxQyxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzVDLFVBQVUsRUFBRSxFQUFFO2dCQUNkLFVBQVUsRUFBRSxFQUFFLENBQUMsMEJBQTBCO2FBQzVDLEVBQUU7Z0JBQ0MsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBQztnQkFDOUQsTUFBTSxFQUFFLGVBQWU7Z0JBQ3ZCLFFBQVEsRUFBRSxlQUFlO2FBQzVCLENBQUMsQ0FBQztZQUVILFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBRWpFLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDbkQsQ0FBQztLQUNKLENBQUE7SUFqQ1ksZUFBZTtRQUYzQixjQUFLLENBQUMsV0FBVyxDQUFDO1FBQ2xCLGdCQUFPLENBQUMsY0FBYyxDQUFDO1FBR1AsV0FBQSxlQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7O09BRnRCLGVBQWUsQ0FpQzNCO0lBQUQsc0JBQUM7S0FBQTtBQWpDWSwwQ0FBZSJ9