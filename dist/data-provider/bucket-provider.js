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
let BucketProvider = /** @class */ (() => {
    let BucketProvider = class BucketProvider extends MongoBaseOperation {
        constructor(bucketModel) {
            super(bucketModel);
        }
    };
    BucketProvider = __decorate([
        midway_1.provide(),
        midway_1.scope('Singleton'),
        __param(0, midway_1.inject('model.bucket')),
        __metadata("design:paramtypes", [Object])
    ], BucketProvider);
    return BucketProvider;
})();
exports.default = BucketProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGEtcHJvdmlkZXIvYnVja2V0LXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQThDO0FBQzlDLDZGQUE2RjtBQUk3RjtJQUFBLElBQXFCLGNBQWMsR0FBbkMsTUFBcUIsY0FBZSxTQUFRLGtCQUFrQjtRQUMxRCxZQUFvQyxXQUFXO1lBQzNDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2QixDQUFDO0tBQ0osQ0FBQTtJQUpvQixjQUFjO1FBRmxDLGdCQUFPLEVBQUU7UUFDVCxjQUFLLENBQUMsV0FBVyxDQUFDO1FBRUYsV0FBQSxlQUFNLENBQUMsY0FBYyxDQUFDLENBQUE7O09BRGxCLGNBQWMsQ0FJbEM7SUFBRCxxQkFBQztLQUFBO2tCQUpvQixjQUFjIn0=