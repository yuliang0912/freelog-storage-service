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
        constructor(model) {
            super(model);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9kYXRhLXByb3ZpZGVyL2J1Y2tldC1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE4QztBQUM5Qyw2RkFBNkY7QUFJN0Y7SUFBQSxJQUFxQixjQUFjLEdBQW5DLE1BQXFCLGNBQWUsU0FBUSxrQkFBa0I7UUFDMUQsWUFBb0MsS0FBSztZQUNyQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakIsQ0FBQztLQUNKLENBQUE7SUFKb0IsY0FBYztRQUZsQyxnQkFBTyxFQUFFO1FBQ1QsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUVGLFdBQUEsZUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFBOztPQURsQixjQUFjLENBSWxDO0lBQUQscUJBQUM7S0FBQTtrQkFKb0IsY0FBYyJ9