"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceFileLibraryModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let ResourceFileLibraryModel = /** @class */ (() => {
    var ResourceFileLibraryModel_1;
    let ResourceFileLibraryModel = ResourceFileLibraryModel_1 = class ResourceFileLibraryModel extends mongoose_model_base_1.MongooseModelBase {
        buildMongooseModel() {
            const customMetaScheme = new this.mongoose.Schema({
                key: { type: String, required: true },
                value: { type: this.mongoose.Schema.Types.Mixed, required: true },
                writable: { type: Boolean, required: true } // 是否可编辑
            }, { _id: false });
            const BaseDependencyScheme = new this.mongoose.Schema({
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
                versionRange: { type: String, required: true },
            }, { _id: false });
            const UpcastResourceSchema = new this.mongoose.Schema({
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
            }, { _id: false });
            const BaseContractInfo = new this.mongoose.Schema({
                policyId: { type: String, required: true },
                contractId: { type: String, required: true },
            }, { _id: false });
            const ResolveResourceSchema = new this.mongoose.Schema({
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
                contracts: [BaseContractInfo],
            }, { _id: false });
            const resourceFileLibraryScheme = new this.mongoose.Schema({
                versionId: { type: String, required: true },
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
                version: { type: String, required: true },
                userId: { type: Number, required: false },
                resourceType: { type: String, required: true },
                fileSha1: { type: String, required: true },
                dependencies: { type: [BaseDependencyScheme], required: false },
                description: { type: String, default: '', required: false },
                upcastResources: { type: [UpcastResourceSchema], required: false },
                resolveResources: { type: [ResolveResourceSchema], required: false },
                systemMeta: {},
                customMeta: { type: [customMetaScheme], required: false },
            }, {
                versionKey: false,
                timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
                toJSON: ResourceFileLibraryModel_1.toObjectOptions,
                toObject: ResourceFileLibraryModel_1.toObjectOptions
            });
            resourceFileLibraryScheme.index({ userId: 1 });
            return this.mongoose.model('resource-file-library', resourceFileLibraryScheme);
        }
        static get toObjectOptions() {
            return {
                transform(doc, ret, options) {
                    return lodash_1.omit(ret, ['_id', 'sign']);
                }
            };
        }
    };
    ResourceFileLibraryModel = ResourceFileLibraryModel_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.ResourceVersionModel') // 此model可能考虑不要
    ], ResourceFileLibraryModel);
    return ResourceFileLibraryModel;
})();
exports.ResourceFileLibraryModel = ResourceFileLibraryModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3Jlc291cmNlL3Jlc291cmNlLXZlcnNpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUE0QjtBQUM1QixtQ0FBc0M7QUFDdEMsK0RBQTRFO0FBSTVFOztJQUFBLElBQWEsd0JBQXdCLGdDQUFyQyxNQUFhLHdCQUF5QixTQUFRLHVDQUFpQjtRQUUzRCxrQkFBa0I7WUFFZCxNQUFNLGdCQUFnQixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzlDLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDbkMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDL0QsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsUUFBUTthQUNyRCxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFFakIsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUNsRCxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzFDLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDNUMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2FBQy9DLEVBQUUsRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUVqQixNQUFNLG9C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