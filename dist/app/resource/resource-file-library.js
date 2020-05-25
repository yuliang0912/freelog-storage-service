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
            const resourceFileLibraryScheme = new this.mongoose.Schema({
                sha1: { type: String, unique: true, required: true },
                storageId: { type: String, required: true },
                userId: { type: Number, required: false },
                resourceType: { type: String, required: true },
                fileSize: { type: Number, required: true },
                sign: { type: String, required: true },
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
        midway_1.provide('model.resourceFileLibraryModel') // 此model可能考虑不要
    ], ResourceFileLibraryModel);
    return ResourceFileLibraryModel;
})();
exports.ResourceFileLibraryModel = ResourceFileLibraryModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtZmlsZS1saWJyYXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9yZXNvdXJjZS9yZXNvdXJjZS1maWxlLWxpYnJhcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQTRCO0FBQzVCLG1DQUFzQztBQUN0QywrREFBNEU7QUFJNUU7O0lBQUEsSUFBYSx3QkFBd0IsZ0NBQXJDLE1BQWEsd0JBQXlCLFNBQVEsdUNBQWlCO1FBRTNELGtCQUFrQjtZQUNkLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDdkQsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ2xELFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDekMsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDO2dCQUN2QyxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzVDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDeEMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2FBQ3ZDLEVBQUU7Z0JBQ0MsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUM7Z0JBQ3JDLE1BQU0sRUFBRSwwQkFBd0IsQ0FBQyxlQUFlO2dCQUNoRCxRQUFRLEVBQUUsMEJBQXdCLENBQUMsZUFBZTthQUNyRCxDQUFDLENBQUM7WUFFSCx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQTtZQUU1QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLHlCQUF5QixDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVELE1BQU0sS0FBSyxlQUFlO1lBQ3RCLE9BQU87Z0JBQ0gsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTztvQkFDdkIsT0FBTyxhQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLENBQUM7YUFDSixDQUFDO1FBQ04sQ0FBQztLQUNKLENBQUE7SUE3Qlksd0JBQXdCO1FBRnBDLGNBQUssQ0FBQyxXQUFXLENBQUM7UUFDbEIsZ0JBQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLGVBQWU7T0FDN0Msd0JBQXdCLENBNkJwQztJQUFELCtCQUFDO0tBQUE7QUE3QlksNERBQXdCIn0=