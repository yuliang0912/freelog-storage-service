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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const midway_1 = require("midway");
const MongoBaseOperation = require("egg-freelog-database/lib/database/mongo-base-operation");
let SystemAnalysisRecordProvider = /** @class */ (() => {
    let SystemAnalysisRecordProvider = class SystemAnalysisRecordProvider extends MongoBaseOperation {
        constructor(model) {
            super(model);
        }
    };
    SystemAnalysisRecordProvider = __decorate([
        midway_1.provide(),
        midway_1.scope('Singleton'),
        __param(0, midway_1.inject('model.systemAnalysisRecords')),
        __metadata("design:paramtypes", [Object])
    ], SystemAnalysisRecordProvider);
    return SystemAnalysisRecordProvider;
})();
exports.default = SystemAnalysisRecordProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLWFuYWx5c2lzLXJlY29yZC1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvZGF0YS1wcm92aWRlci9zeXN0ZW0tYW5hbHlzaXMtcmVjb3JkLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQThDO0FBQzlDLDZGQUE2RjtBQUk3RjtJQUFBLElBQXFCLDRCQUE0QixHQUFqRCxNQUFxQiw0QkFBNkIsU0FBUSxrQkFBa0I7UUFDeEUsWUFBbUQsS0FBSztZQUNwRCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakIsQ0FBQztLQUNKLENBQUE7SUFKb0IsNEJBQTRCO1FBRmhELGdCQUFPLEVBQUU7UUFDVCxjQUFLLENBQUMsV0FBVyxDQUFDO1FBRUYsV0FBQSxlQUFNLENBQUMsNkJBQTZCLENBQUMsQ0FBQTs7T0FEakMsNEJBQTRCLENBSWhEO0lBQUQsbUNBQUM7S0FBQTtrQkFKb0IsNEJBQTRCIn0=