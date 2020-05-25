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
exports.FileStorageController = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
let FileStorageController = /** @class */ (() => {
    let FileStorageController = class FileStorageController {
        async show(ctx) {
            const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
            ctx.validateParams();
            await this.fileStorageService.findBySha1(sha1).then(ctx.success);
        }
        async uploadFile(ctx) {
            const fileStream = await ctx.getFileStream({ requireFile: false });
            if (!fileStream || !fileStream.filename) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'file'));
            }
            const fileStorageInfo = await this.fileStorageService.upload(fileStream).catch(error => {
                return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                    throw error;
                });
            });
            ctx.success({ sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize });
        }
    };
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], FileStorageController.prototype, "fileStorageService", void 0);
    __decorate([
        midway_1.get('/:sha1'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.InternalClient),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], FileStorageController.prototype, "show", null);
    __decorate([
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        midway_1.post('/upload'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], FileStorageController.prototype, "uploadFile", null);
    FileStorageController = __decorate([
        midway_1.provide(),
        midway_1.controller('/v1/storages/files')
    ], FileStorageController);
    return FileStorageController;
})();
exports.FileStorageController = FileStorageController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2ZpbGUtc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEQ7QUFDOUQsdURBQTBFO0FBQzFFLGtGQUFxRTtBQUtyRTtJQUFBLElBQWEscUJBQXFCLEdBQWxDLE1BQWEscUJBQXFCO1FBTzlCLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRztZQUVWLE1BQU0sSUFBSSxHQUFXLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3BFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVyQixNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBSUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHO1lBQ2hCLE1BQU0sVUFBVSxHQUFHLE1BQU0sR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFO2dCQUNyQyxNQUFNLElBQUksZ0NBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlDQUFpQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDbkY7WUFDRCxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNuRixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO29CQUMzRSxNQUFNLEtBQUssQ0FBQztnQkFDaEIsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQTtZQUNGLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsZUFBZSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQztLQUNKLENBQUE7SUExQkc7UUFEQyxlQUFNLEVBQUU7O3FFQUMrQjtJQUl4QztRQUZDLFlBQUcsQ0FBQyxRQUFRLENBQUM7UUFDYix5Q0FBZSxDQUFDLGlDQUFjLENBQUM7Ozs7cURBTy9CO0lBSUQ7UUFGQyx5Q0FBZSxDQUFDLDRCQUFTLENBQUM7UUFDMUIsYUFBSSxDQUFDLFNBQVMsQ0FBQzs7OzsyREFZZjtJQTVCUSxxQkFBcUI7UUFGakMsZ0JBQU8sRUFBRTtRQUNULG1CQUFVLENBQUMsb0JBQW9CLENBQUM7T0FDcEIscUJBQXFCLENBNkJqQztJQUFELDRCQUFDO0tBQUE7QUE3Qlksc0RBQXFCIn0=