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
let ObjectStorageProvider = /** @class */ (() => {
    let ObjectStorageProvider = class ObjectStorageProvider extends MongoBaseOperation {
        constructor(model) {
            super(model);
        }
    };
    ObjectStorageProvider = __decorate([
        midway_1.provide(),
        midway_1.scope('Singleton'),
        __param(0, midway_1.inject('model.objectStorageInfo')),
        __metadata("design:paramtypes", [Object])
    ], ObjectStorageProvider);
    return ObjectStorageProvider;
})();
exports.default = ObjectStorageProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2UtcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2RhdGEtcHJvdmlkZXIvb2JqZWN0LXN0b3JhZ2UtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEM7QUFDOUMsNkZBQTZGO0FBSTdGO0lBQUEsSUFBcUIscUJBQXFCLEdBQTFDLE1BQXFCLHFCQUFzQixTQUFRLGtCQUFrQjtRQUNqRSxZQUErQyxLQUFLO1lBQ2hELEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQixDQUFDO0tBQ0osQ0FBQTtJQUpvQixxQkFBcUI7UUFGekMsZ0JBQU8sRUFBRTtRQUNULGNBQUssQ0FBQyxXQUFXLENBQUM7UUFFRixXQUFBLGVBQU0sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBOztPQUQ3QixxQkFBcUIsQ0FJekM7SUFBRCw0QkFBQztLQUFBO2tCQUpvQixxQkFBcUIifQ==