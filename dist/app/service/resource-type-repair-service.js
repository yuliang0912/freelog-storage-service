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
const outside_api_service_1 = require("./outside-api-service");
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
        await this.fileStorageProvider.find({}).then(async (list) => {
            for (const fileStorageInfo of list) {
                let filename = 'unknow';
                if (fileStorageInfo.fileExtNames.length) {
                    filename += fileStorageInfo.fileExtNames[0];
                }
                this.fileStorageService.sendAnalyzeFilePropertyTask(fileStorageInfo, filename).then();
                // const fileExtSet = new Set<string>();
                // await this.outsideApiService.getResourceVersionBySha1(fileStorageInfo.sha1).then(list => {
                //     list.forEach(x => fileExtSet.add(this.getFileExt(x.filename)));
                // });
                // await this.objectStorageProvider.find({sha1: fileStorageInfo.sha1}, 'objectName').then(list => {
                //     list.forEach(x => fileExtSet.add(this.getFileExt(x.objectName)));
                // });
                // const fileExtNames = uniq([...fileExtSet.values()].filter(x => x?.length));
                // this.fileStorageProvider.updateOne({sha1: fileStorageInfo.sha1}, {
                //     fileExtNames
                // }).then();
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
__decorate([
    midway_1.inject(),
    __metadata("design:type", outside_api_service_1.OutsideApiService)
], ResourceTypeRepairService.prototype, "outsideApiService", void 0);
ResourceTypeRepairService = __decorate([
    midway_1.provide()
], ResourceTypeRepairService);
exports.ResourceTypeRepairService = ResourceTypeRepairService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdHlwZS1yZXBhaXItc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS10eXBlLXJlcGFpci1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUV2QyxtQ0FBNkI7QUFFN0IsaUVBQTBEO0FBQzFELCtEQUF3RDtBQUd4RCxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUF5QjtJQVVsQyxLQUFLLENBQUMsa0JBQWtCO1FBQ3BCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLEVBQUU7WUFDbEUsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQ3JCLE1BQU0sWUFBWSxHQUFHLGNBQUssQ0FBUyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ3RGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNyRjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUssQ0FBQyx5QkFBeUI7UUFDM0IsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLEVBQUU7WUFDdEQsS0FBSyxNQUFNLGVBQWUsSUFBSSxJQUFJLEVBQUU7Z0JBQ2hDLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQztnQkFDeEIsSUFBSSxlQUFlLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRTtvQkFDckMsUUFBUSxJQUFJLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQy9DO2dCQUNELElBQUksQ0FBQyxrQkFBa0IsQ0FBQywyQkFBMkIsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3RGLHdDQUF3QztnQkFDeEMsNkZBQTZGO2dCQUM3RixzRUFBc0U7Z0JBQ3RFLE1BQU07Z0JBQ04sbUdBQW1HO2dCQUNuRyx3RUFBd0U7Z0JBQ3hFLE1BQU07Z0JBQ04sOEVBQThFO2dCQUM5RSxxRUFBcUU7Z0JBQ3JFLG1CQUFtQjtnQkFDbkIsYUFBYTthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQVFKLENBQUE7QUE5Q0c7SUFEQyxlQUFNLEVBQUU7O3dFQUNxQztBQUU5QztJQURDLGVBQU0sRUFBRTs7c0VBQytDO0FBRXhEO0lBREMsZUFBTSxFQUFFOzhCQUNXLHlDQUFrQjtxRUFBQztBQUV2QztJQURDLGVBQU0sRUFBRTs4QkFDVSx1Q0FBaUI7b0VBQUM7QUFSNUIseUJBQXlCO0lBRHJDLGdCQUFPLEVBQUU7R0FDRyx5QkFBeUIsQ0FnRHJDO0FBaERZLDhEQUF5QiJ9