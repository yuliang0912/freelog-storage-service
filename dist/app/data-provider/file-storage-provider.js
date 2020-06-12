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
let FileStorageProvider = /** @class */ (() => {
    let FileStorageProvider = class FileStorageProvider extends MongoBaseOperation {
        constructor(model) {
            super(model);
        }
    };
    FileStorageProvider = __decorate([
        midway_1.provide(),
        midway_1.scope('Singleton'),
        __param(0, midway_1.inject('model.fileStorageInfo')),
        __metadata("design:paramtypes", [Object])
    ], FileStorageProvider);
    return FileStorageProvider;
})();
exports.default = FileStorageProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9kYXRhLXByb3ZpZGVyL2ZpbGUtc3RvcmFnZS1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE4QztBQUM5Qyw2RkFBNkY7QUFJN0Y7SUFBQSxJQUFxQixtQkFBbUIsR0FBeEMsTUFBcUIsbUJBQW9CLFNBQVEsa0JBQWtCO1FBQy9ELFlBQTZDLEtBQUs7WUFDOUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pCLENBQUM7S0FDSixDQUFBO0lBSm9CLG1CQUFtQjtRQUZ2QyxnQkFBTyxFQUFFO1FBQ1QsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUVGLFdBQUEsZUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUE7O09BRDNCLG1CQUFtQixDQUl2QztJQUFELDBCQUFDO0tBQUE7a0JBSm9CLG1CQUFtQiJ9