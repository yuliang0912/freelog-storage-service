"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FileStorageInfoModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
// 文件实际存储信息
let FileStorageInfoModel = FileStorageInfoModel_1 = class FileStorageInfoModel extends mongoose_model_base_1.MongooseModelBase {
    buildMongooseModel() {
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
exports.FileStorageInfoModel = FileStorageInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvZmlsZS1zdG9yYWdlLWluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1DQUE0QjtBQUM1QixtQ0FBc0M7QUFDdEMsK0RBQTRFO0FBRTVFLFdBQVc7QUFHWCxJQUFhLG9CQUFvQiw0QkFBakMsTUFBYSxvQkFBcUIsU0FBUSx1Q0FBaUI7SUFFdkQsa0JBQWtCO1FBQ2QsTUFBTSxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMxQyxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDcEMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3hDLGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDOUQsZUFBZSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFDO1lBQ2pHLFdBQVcsRUFBRTtnQkFDVCxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3RDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDdEMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2FBQzVDO1NBQ0osRUFBRTtZQUNDLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBQztZQUM5RCxNQUFNLEVBQUUsc0JBQW9CLENBQUMsZUFBZTtZQUM1QyxRQUFRLEVBQUUsc0JBQW9CLENBQUMsZUFBZTtTQUNqRCxDQUFDLENBQUM7UUFFSCxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFFOUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsTUFBTSxLQUFLLGVBQWU7UUFDdEIsT0FBTztZQUNILE9BQU8sRUFBRSxJQUFJO1lBQ2IsUUFBUSxFQUFFLElBQUk7WUFDZCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUc7Z0JBQ2QsT0FBTyxhQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEMsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTtBQWxDWSxvQkFBb0I7SUFGaEMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLHVCQUF1QixDQUFDO0dBQ3BCLG9CQUFvQixDQWtDaEM7QUFsQ1ksb0RBQW9CIn0=