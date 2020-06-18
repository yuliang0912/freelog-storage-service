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
        ctx.success({ sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize });
    }
    async uploadImage(ctx) {
        const fileStream = await ctx.getFileStream({ requireFile: false });
        if (!fileStream || !fileStream.filename) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'file'));
        }
        const fileStorageInfo = await this.fileStorageService.uploadImage(fileStream).catch(error => {
            return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                throw error;
            });
        });
        ctx.success({ sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize });
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
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    midway_1.post('/upload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "uploadFile", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
    midway_1.get('/uploadImage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "uploadImage", null);
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
exports.FileStorageController = FileStorageController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2ZpbGUtc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEQ7QUFDOUQsdURBQTBFO0FBQzFFLGtGQUFxRTtBQUtyRSxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtJQU85QixLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUc7UUFDaEIsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUMsV0FBVyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7WUFDckMsTUFBTSxJQUFJLGdDQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUNyQyxNQUFNLFlBQVksR0FBVyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNyRyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckIsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakcsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDM0UsTUFBTSxLQUFLLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFD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