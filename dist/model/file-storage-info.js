"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
// 文件实际存储信息
let FileStorageInfoModel = /** @class */ (() => {
    var FileStorageInfoModel_1;
    let FileStorageInfoModel = FileStorageInfoModel_1 = class FileStorageInfoModel extends mongoose_model_base_1.MongooseModelBase {
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
                timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
                toJSON: FileStorageInfoModel_1.toObjectOptions,
                toObject: FileStorageInfoModel_1.toObjectOptions
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
        static get toObjectOptions() {
            return {
                getters: true,
                virtuals: true,
                transform(doc, ret) {
                    return lodash_1.omit(ret, ['_id', 'id']);
                }
            };
        }
    };
    FileStorageInfoModel = FileStorageInfoModel_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.fileStorageInfo')
    ], FileStorageInfoModel);
    return FileStorageInfoModel;
})();
exports.FileStorageInfoModel = FileStorageInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvZmlsZS1zdG9yYWdlLWluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQTRCO0FBQzVCLG1DQUFzQztBQUN0QywrREFBNEU7QUFFNUUsV0FBVztBQUdYOztJQUFBLElBQWEsb0JBQW9CLDRCQUFqQyxNQUFhLG9CQUFxQixTQUFRLHVDQUFpQjtRQUV2RCxrQkFBa0I7WUFDZCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDckQsTUFBTSxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDMUMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUNwQyxRQUFRLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3hDLGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzlELGVBQWUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBQztnQkFDakcsV0FBVyxFQUFFO29CQUNULE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztvQkFDdEMsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO29CQUN0QyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7aUJBQzVDO2FBQ0osRUFBRTtnQkFDQyxVQUFVLEVBQUUsS0FBSztnQkFDakIsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFDO2dCQUM5RCxNQUFNLEVBQUUsc0JBQW9CLENBQUMsZUFBZTtnQkFDNUMsUUFBUSxFQUFFLHNCQUFvQixDQUFDLGVBQWU7YUFDakQsQ0FBQyxDQUFDO1lBRUgsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBRTlDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNoQyxNQUFNLEVBQUMsZUFBZSxFQUFFLFdBQVcsRUFBQyxHQUFHLElBQUksQ0FBQztnQkFDNUMsSUFBSSxlQUFlLEtBQUssVUFBVSxFQUFFO29CQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7aUJBQ3JDO2dCQUNELE9BQU8sVUFBVSxXQUFXLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsaUJBQWlCLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN0SSxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELE1BQU0sS0FBSyxlQUFlO1lBQ3RCLE9BQU87Z0JBQ0gsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHO29CQUNkLE9BQU8sYUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSixDQUFBO0lBM0NZLG9CQUFvQjtRQUZoQyxjQUFLLENBQUMsV0FBVyxDQUFDO1FBQ2xCLGdCQUFPLENBQUMsdUJBQXVCLENBQUM7T0FDcEIsb0JBQW9CLENBMkNoQztJQUFELDJCQUFDO0tBQUE7QUEzQ1ksb0RBQW9CIn0=