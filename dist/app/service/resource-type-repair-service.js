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
let ResourceTypeRepairService = class ResourceTypeRepairService {
    async resourceTypeRepair() {
        this.objectStorageProvider.find({}, 'resourceType').then(async (list) => {
            for (const item of list) {
                const resourceType = lodash_1.first(item.resourceType) === '' ? [] : item.resourceType;
                this.objectStorageProvider.updateOne({ _id: item.objectId }, { resourceType }).then();
            }
        });
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceTypeRepairService.prototype, "objectStorageProvider", void 0);
ResourceTypeRepairService = __decorate([
    midway_1.provide()
], ResourceTypeRepairService);
exports.ResourceTypeRepairService = ResourceTypeRepairService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdHlwZS1yZXBhaXItc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS10eXBlLXJlcGFpci1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUV2QyxtQ0FBNkI7QUFHN0IsSUFBYSx5QkFBeUIsR0FBdEMsTUFBYSx5QkFBeUI7SUFJbEMsS0FBSyxDQUFDLGtCQUFrQjtRQUNwQixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxFQUFFO1lBQ2xFLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxFQUFFO2dCQUNyQixNQUFNLFlBQVksR0FBRyxjQUFLLENBQVMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUN0RixJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDckY7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBVkc7SUFEQyxlQUFNLEVBQUU7O3dFQUNxQztBQUZyQyx5QkFBeUI7SUFEckMsZ0JBQU8sRUFBRTtHQUNHLHlCQUF5QixDQVlyQztBQVpZLDhEQUF5QiJ9