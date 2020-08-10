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
const lodash_1 = require("lodash");
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
    // @visitorIdentity(InternalClient)
    async download(ctx) {
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        const attachmentName = ctx.checkQuery('attachmentName').optional().type('string').value;
        ctx.validateParams();
        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, ctx.gettext('file-storage-entity-not-found'));
        const fileStream = await this.fileStorageService.getFileStream(fileStorageInfo);
        ctx.body = fileStream;
        if (lodash_1.isString(attachmentName) && attachmentName.length) {
            ctx.attachment(attachmentName);
        }
        ctx.set('content-length', fileStorageInfo.fileSize);
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
    midway_1.post('/uploadImage'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
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
__decorate([
    midway_1.get('/:sha1/download'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "download", null);
FileStorageController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v1/storages/files')
], FileStorageController);
exports.FileStorageController = FileStorageController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2ZpbGUtc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBOEQ7QUFDOUQsdURBQTRGO0FBQzVGLGtGQUFxRTtBQUVyRSxtQ0FBZ0M7QUFJaEMsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUFPOUIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHO1FBQ2hCLE1BQU0sVUFBVSxHQUFHLE1BQU0sR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFO1lBQ3JDLE1BQU0sSUFBSSxnQ0FBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUNuRjtRQUNELEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDckMsTUFBTSxZQUFZLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDckcsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pHLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQzNFLE1BQU0sS0FBSyxDQUFDO1lBQ2hCLENBQUMs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