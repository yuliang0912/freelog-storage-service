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
            const BaseReleaseScheme = new this.mongoose.Schema({
                releaseId: { type: String, required: true },
                releaseName: { type: String, required: true }
            }, { _id: false });
            const resourceFileLibraryScheme = new this.mongoose.Schema({
                versionId: { type: String, required: true },
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
                version: { type: String, required: true },
                userId: { type: Number, required: false },
                resourceType: { type: String, required: true },
                fileSha1: { type: String, required: true },
                systemMeta: {},
                customMeta: { type: [customMetaScheme], required: false },
                description: { type: String, default: '', required: false },
                dependencies: { type: [BaseReleaseScheme], required: false },
            }, {
                versionKey: false,
                timestamps: { createdAt: 'createDate' },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtaW5mb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3Jlc291cmNlL3Jlc291cmNlLWluZm9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUE0QjtBQUM1QixtQ0FBc0M7QUFDdEMsK0RBQTRFO0FBSTVFOztJQUFBLElBQWEsd0JBQXdCLGdDQUFyQyxNQUFhLHdCQUF5QixTQUFRLHVDQUFpQjtRQUUzRCxrQkFBa0I7WUFFZCxNQUFNLGdCQUFnQixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzlDLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDbkMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDL0QsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsUUFBUTthQUNyRCxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFFakIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUMvQyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3pDLFdBQVcsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQzthQUM5QyxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFFakIsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUN2RCxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3pDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDMUMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUM1QyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3ZDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQztnQkFDdkMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUM1QyxRQUFRLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3hDLFVBQVUsRUFBRSxFQUFFO2dCQUNkLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQztnQkFDdkQsV0FBVyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUM7Z0JBQ3pELFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQzthQUM3RCxFQUFFO2dCQUNDLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFDO2dCQUNyQyxNQUFNLEVBQUUsMEJBQXdCLENBQUMsZUFBZTtnQkFDaEQsUUFBUSxFQUFFLDBCQUF3QixDQUFDLGVBQWU7YUFDckQsQ0FBQyxDQUFDO1lBRUgseUJBQXlCLENBQUMsS0FBSyxDQUFDLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUE7WUFFNUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1FBQ25GLENBQUM7UUFFRCxNQUFNLEtBQUssZUFBZTtZQUN0QixPQUFPO2dCQUNILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU87b0JBQ3ZCLE9BQU8sYUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSixDQUFBO0lBOUNZLHdCQUF3QjtRQUZwQyxjQUFLLENBQUMsV0FBVyxDQUFDO1FBQ2xCLGdCQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxlQUFlO09BQ3pDLHdCQUF3QixDQThDcEM7SUFBRCwrQkFBQztLQUFBO0FBOUNZLDREQUF3QiJ9