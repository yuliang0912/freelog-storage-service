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
let SystemAnalysisRecords = /** @class */ (() => {
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
    return SystemAnalysisRecords;
})();
exports.SystemAnalysisRecords = SystemAnalysisRecords;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLWFuYWx5c2lzLXJlY29yZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvc3lzdGVtLWFuYWx5c2lzLXJlY29yZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLCtEQUE0RTtBQUk1RTtJQUFBLElBQWEscUJBQXFCLEdBQWxDLE1BQWEscUJBQXNCLFNBQVEsdUNBQWlCO1FBRXhELGtCQUFrQjtZQUNkLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDeEQsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUNwQyxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzVDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDeEMsY0FBYyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDO2dCQUN0RixLQUFLLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUM7Z0JBQ3RDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQzthQUN6QyxFQUFFO2dCQUNDLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7YUFDakUsQ0FBQyxDQUFDO1lBRUgsMEJBQTBCLENBQUMsS0FBSyxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBRTFGLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztRQUN0RixDQUFDO0tBQ0osQ0FBQTtJQXBCWSxxQkFBcUI7UUFGakMsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLDZCQUE2QixDQUFDO09BQzFCLHFCQUFxQixDQW9CakM7SUFBRCw0QkFBQztLQUFBO0FBcEJZLHNEQUFxQiJ9