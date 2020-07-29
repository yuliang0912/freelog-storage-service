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
        await this.fileStorageService.uploadImage(fileStream).then(url => ctx.success({ url })).catch(error => {
            return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                throw error;
            });
        });
    }
    async fileIsExist(ctx) {
        const sha1 = ctx.checkQuery('sha1').exist().isSha1().toLowercase().value;
        ctx.validateParams();
        await this.fileStorageService.findBySha1(sha1).then(fileStorageInfo => ctx.success(Boolean(fileStorageInfo)));
    }
    async show(ctx) {
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        ctx.validateParams();
        await this.fileStorageService.findBySha1(sha1).then(ctx.success);
    }
    // @visitorIdentity(InternalClient)
    async fileProperty(ctx) {
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        const resourceType = ctx.checkQuery('resourceType').exist().isResourceType().toLow().value;
        ctx.validateParams();
        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, ctx.gettext('file-storage-entity-not-found'));
        const analyzeResult = await this.fileStorageService.analyzeFileProperty(fileStorageInfo, resourceType);
        if (analyzeResult.status === 1) {
            return ctx.success(Object.assign({ fileSize: fileStorageInfo.fileSize }, analyzeResult.systemProperty));
        }
        if (analyzeResult.status === 2) {
            return ctx.error(new egg_freelog_base_1.ApplicationError(analyzeResult.error));
        }
        ctx.success({ fileSize: fileStorageInfo.fileSize });
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
    midway_1.post('/uploadImage'),
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
__decorate([
    midway_1.get('/:sha1/property'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "fileProperty", null);
FileStorageController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v1/storages/files')
], FileStorageController);
exports.FileStorageController = FileStorageController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2ZpbGUtc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEQ7QUFDOUQsdURBQTRGO0FBQzVGLGtGQUFxRTtBQUtyRSxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtJQU85QixLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUc7UUFDaEIsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUMsV0FBVyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7WUFDckMsTUFBTSxJQUFJLGdDQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUNyQyxNQUFNLFlBQVksR0FBVyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNyRyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckIsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakcsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDM0UsTUFBTSxLQUFLLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFD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