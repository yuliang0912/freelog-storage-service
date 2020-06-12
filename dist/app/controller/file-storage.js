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
        async uploadFile(ctx) {
            const fileStream = await ctx.getFileStream({ requireFile: false });
            if (!fileStream || !fileStream.filename) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'file'));
            }
            ctx.request.body = fileStream.fields;
            const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLow().value;
            ctx.validateParams();
            const fileStorageInfo = await this.fileStorageService.upload(fileStream, resourceType).catch(error => {
                return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                    throw error;
                });
            });
            ctx.success({ sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize, resourceType });
        }
        async fileIsExist(ctx) {
            const sha1 = ctx.checkQuery('sha1').exist().isResourceId().toLowercase().value;
            ctx.validateParams();
            await this.fileStorageService.findBySha1(sha1).then(fileStorageInfo => ctx.success(Boolean(fileStorageInfo)));
        }
        async show(ctx) {
            const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
            ctx.validateParams();
            await this.fileStorageService.findBySha1(sha1).then(ctx.success);
        }
    };
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], FileStorageController.prototype, "fileStorageService", void 0);
    __decorate([
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
        midway_1.post('/upload'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], FileStorageController.prototype, "uploadFile", null);
    __decorate([
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
        midway_1.get('/fileIsExist'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], FileStorageController.prototype, "fileIsExist", null);
    __decorate([
        midway_1.get('/:sha1'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.InternalClient),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], FileStorageController.prototype, "show", null);
    FileStorageController = __decorate([
        midway_1.provide(),
        midway_1.controller('/v1/storages/files')
    ], FileStorageController);
    return FileStorageController;
})();
exports.FileStorageController = FileStorageController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2ZpbGUtc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEQ7QUFDOUQsdURBQTBFO0FBQzFFLGtGQUFxRTtBQUtyRTtJQUFBLElBQWEscUJBQXFCLEdBQWxDLE1BQWEscUJBQXFCO1FBTzlCLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRztZQUNoQixNQUFNLFVBQVUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBQyxXQUFXLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRTtnQkFDckMsTUFBTSxJQUFJLGdDQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ25GO1lBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztZQUNyQyxNQUFNLFlBQVksR0FBVyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNyRyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDckIsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pHLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7b0JBQzNFLE1BQU0sS0FBSyxDQUFDO2dCQUNoQixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFBO1lBQ0YsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFDLElBQUksRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBQyxDQUFDLENBQUM7UUFDaEcsQ0FBQztRQUlELEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRztZQUNqQixNQUFNLElBQUksR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUN2RixHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFckIsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsSCxDQUFDO1FBSUQsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHO1lBQ1YsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDNUQsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLENBQUM7S0FDSixDQUFBO0lBcENHO1FBREMsZUFBTSxFQUFFOztxRUFDK0I7SUFJeEM7UUFGQyx5Q0FBZSxDQUFDLDRCQUFTLEdBQUcsaUNBQWMsQ0FBQztRQUMzQyxhQUFJLENBQUMsU0FBUyxDQUFDOzs7OzJEQWVmO0lBSUQ7UUFGQyx5Q0FBZSxDQUFDLDRCQUFTLEdBQUcsaUNBQWMsQ0FBQztRQUMzQyxZQUFHLENBQUMsY0FBYyxDQUFDOzs7OzREQU1uQjtJQUlEO1FBRkMsWUFBRyxDQUFDLFFBQVEsQ0FBQztRQUNiLHlDQUFlLENBQUMsaUNBQWMsQ0FBQzs7OztxREFLL0I7SUF0Q1EscUJBQXFCO1FBRmpDLGdCQUFPLEVBQUU7UUFDVCxtQkFBVSxDQUFDLG9CQUFvQixDQUFDO09BQ3BCLHFCQUFxQixDQXVDakM7SUFBRCw0QkFBQztLQUFBO0FBdkNZLHNEQUFxQiJ9