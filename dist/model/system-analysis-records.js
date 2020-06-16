"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemAnalysisRecords = void 0;
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let SystemAnalysisRecords = class SystemAnalysisRecords extends mongoose_model_base_1.MongooseModelBase {
    buildMongooseModel() {
        const SystemAnalysisRecordScheme = new this.mongoose.Schema({
            sha1: { type: String, required: true },
            resourceType: { type: String, required: true },
            provider: { type: String, required: true },
            systemProperty: { type: this.mongoose.Schema.Types.Mixed, required: false, default: {} },
            error: { type: String, required: false },
            status: { type: Number, required: true },
        }, {
            minimize: false,
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' }
        });
        SystemAnalysisRecordScheme.index({ sha1: 1, resourceType: 1, provider: 1 }, { unique: true });
        return this.mongoose.model('system-analysis-records', SystemAnalysisRecordScheme);
    }
};
SystemAnalysisRecords = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.systemAnalysisRecords')
], SystemAnalysisRecords);
exports.SystemAnalysisRecords = SystemAnalysisRecords;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLWFuYWx5c2lzLXJlY29yZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvc3lzdGVtLWFuYWx5c2lzLXJlY29yZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLCtEQUE0RTtBQUk1RSxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFzQixTQUFRLHVDQUFpQjtJQUV4RCxrQkFBa0I7UUFDZCxNQUFNLDBCQUEwQixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDeEQsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3BDLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUM1QyxRQUFRLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDeEMsY0FBYyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDO1lBQ3RGLEtBQUssRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQztZQUN0QyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7U0FDekMsRUFBRTtZQUNDLFFBQVEsRUFBRSxLQUFLO1lBQ2YsVUFBVSxFQUFFLEtBQUs7WUFDakIsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFDO1NBQ2pFLENBQUMsQ0FBQztRQUVILDBCQUEwQixDQUFDLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUUxRixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFDdEYsQ0FBQztDQUNKLENBQUE7QUFwQlkscUJBQXFCO0lBRmpDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyw2QkFBNkIsQ0FBQztHQUMxQixxQkFBcUIsQ0FvQmpDO0FBcEJZLHNEQUFxQiJ9