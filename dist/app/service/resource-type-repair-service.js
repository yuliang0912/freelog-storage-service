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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceTypeRepairService = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const file_storage_service_1 = require("./file-storage-service");
let ResourceTypeRepairService = class ResourceTypeRepairService {
    async resourceTypeRepair() {
        this.objectStorageProvider.find({}, 'resourceType').then(async (list) => {
            for (const item of list) {
                const resourceType = lodash_1.first(item.resourceType) === '' ? [] : item.resourceType;
                this.objectStorageProvider.updateOne({ _id: item.objectId }, { resourceType }).then();
            }
        });
    }
    async fileStorageMetaInfoRepair() {
        await this.fileStorageProvider.find({}).then(list => {
            for (const fileStorageInfo of list) {
                if (!fileStorageInfo.metaInfo) {
                    this.fileStorageService.sendAnalyzeFilePropertyTask(fileStorageInfo, 'unknown');
                }
            }
        });
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceTypeRepairService.prototype, "objectStorageProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceTypeRepairService.prototype, "fileStorageProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", file_storage_service_1.FileStorageService)
], ResourceTypeRepairService.prototype, "fileStorageService", void 0);
ResourceTypeRepairService = __decorate([
    midway_1.provide()
], ResourceTypeRepairService);
exports.ResourceTypeRepairService = ResourceTypeRepairService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdHlwZS1yZXBhaXItc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS10eXBlLXJlcGFpci1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUV2QyxtQ0FBNkI7QUFFN0IsaUVBQTBEO0FBRzFELElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBUWxDLEtBQUssQ0FBQyxrQkFBa0I7UUFDcEIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsRUFBRTtZQUNsRSxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksRUFBRTtnQkFDckIsTUFBTSxZQUFZLEdBQUcsY0FBSyxDQUFTLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztnQkFDdEYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3JGO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLHlCQUF5QjtRQUMzQixNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hELEtBQUssTUFBTSxlQUFlLElBQUksSUFBSSxFQUFFO2dCQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLDJCQUEyQixDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQztpQkFDbkY7YUFDSjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUF4Qkc7SUFEQyxlQUFNLEVBQUU7O3dFQUNxQztBQUU5QztJQURDLGVBQU0sRUFBRTs7c0VBQytDO0FBRXhEO0lBREMsZUFBTSxFQUFFOzhCQUNXLHlDQUFrQjtxRUFBQztBQU45Qix5QkFBeUI7SUFEckMsZ0JBQU8sRUFBRTtHQUNHLHlCQUF5QixDQTBCckM7QUExQlksOERBQXlCIn0=