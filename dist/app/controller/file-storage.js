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
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
let FileStorageController = class FileStorageController {
    async uploadFile() {
        const { ctx } = this;
        const fileStream = await ctx.getFileStream({ requireFile: false });
        if (!fileStream || !fileStream.filename) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed', 'file'));
        }
        ctx.request['body'] = fileStream.fields;
        const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLow().value;
        ctx.validateParams();
        const fileStorageInfo = await this.fileStorageService.upload(fileStream, resourceType).catch(error => {
            return this.fileStorageService.fileStreamErrorHandler(fileStream).finally(() => {
                throw error;
            });
        });
        ctx.success({ sha1: fileStorageInfo.sha1, fileSize: fileStorageInfo.fileSize });
    }
    async uploadImage() {
        const { ctx } = this;
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
    async fileIsExist() {
        const { ctx } = this;
        const sha1s = ctx.checkQuery('sha1').exist().toLowercase().isSplitSha1().toSplitArray().len(1, 100).value;
        ctx.validateParams();
        const sha1Map = await this.fileStorageService.find({ sha1: { $in: sha1s } }, 'sha1').then(list => {
            return new Map(list.map(x => [x.sha1, true]));
        });
        const result = sha1s.map(sha1 => Object({
            sha1, isExisting: sha1Map.has(sha1)
        }));
        ctx.success(result);
    }
    async fileSimpleInfo() {
        const { ctx } = this;
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        ctx.validateParams();
        await this.fileStorageService.findBySha1(sha1).then(data => {
            ctx.success(data ? lodash_1.pick(data, ['sha1', 'fileSize', 'metaInfo', 'metaAnalyzeStatus']) : null);
        });
    }
    async show() {
        const { ctx } = this;
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        ctx.validateParams();
        await this.fileStorageService.findBySha1(sha1).then(ctx.success);
    }
    async fileProperty() {
        throw new egg_freelog_base_1.ApplicationError('接口已停用');
        // const {ctx} = this;
        // const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        // const resourceType = ctx.checkQuery('resourceType').exist().isResourceType().toLow().value;
        // ctx.validateParams();
        //
        // const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        // ctx.entityNullObjectCheck(fileStorageInfo, {msg: ctx.gettext('file-storage-entity-not-found')});
        //
        // const analyzeResult = await this.fileStorageService.analyzeFileProperty(fileStorageInfo, resourceType);
        // if (analyzeResult.status === 1) {
        //     return ctx.success(Object.assign({fileSize: fileStorageInfo.fileSize}, analyzeResult.systemProperty));
        // }
        // if (analyzeResult.status === 2) {
        //     return ctx.error(new ApplicationError(analyzeResult.error));
        // }
        // ctx.success({fileSize: fileStorageInfo.fileSize});
    }
    // @visitorIdentityValidator(IdentityTypeEnum.InternalClient)
    async download() {
        const { ctx } = this;
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        const attachmentName = ctx.checkQuery('attachmentName').optional().type('string').value;
        ctx.validateParams();
        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, { msg: ctx.gettext('file-storage-entity-not-found') });
        try {
            ctx.body = await this.fileStorageService.getFileStream(fileStorageInfo);
            if (lodash_1.isString(attachmentName) && attachmentName.length) {
                ctx.attachment(attachmentName);
            }
            ctx.set('content-length', fileStorageInfo.fileSize.toString());
        }
        catch (error) {
            ctx.status = 410;
            throw new egg_freelog_base_1.ApplicationError(ctx.gettext('file_download_failed') + error.toString());
        }
    }
    async fileStorageUrl() {
        const { ctx } = this;
        const sha1 = ctx.checkParams('sha1').exist().isSha1().value;
        ctx.validateParams();
        const fileStorageInfo = await this.fileStorageService.findBySha1(sha1);
        ctx.entityNullObjectCheck(fileStorageInfo, { msg: ctx.gettext('file-storage-entity-not-found') });
        const options = {
            'content-type': fileStorageInfo.metaInfo.mime,
            'expires': 600
        };
        const url = this.fileStorageService.getSignatureUrl(fileStorageInfo, options);
        ctx.redirect(url);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileStorageController.prototype, "fileStorageService", void 0);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.post('/upload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "uploadFile", null);
__decorate([
    midway_1.post('/uploadImage'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "uploadImage", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    midway_1.get('/fileIsExist'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "fileIsExist", null);
__decorate([
    midway_1.get('/:sha1/info'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "fileSimpleInfo", null);
__decorate([
    midway_1.get('/:sha1'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "show", null);
__decorate([
    midway_1.get('/:sha1/property'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "fileProperty", null);
__decorate([
    midway_1.get('/:sha1/download'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "download", null);
__decorate([
    midway_1.get('/:sha1/storageUrl'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "fileStorageUrl", null);
FileStorageController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v1/storages/files')
], FileStorageController);
exports.FileStorageController = FileStorageController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zdG9yYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2ZpbGUtc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBc0M7QUFDdEMsbUNBQThEO0FBRTlELHVEQU0wQjtBQUkxQixJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtJQVM5QixLQUFLLENBQUMsVUFBVTtRQUNaLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUMsV0FBVyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7WUFDckMsTUFBTSxJQUFJLGdDQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBQ3hDLE1BQU0sWUFBWSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3JHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNyQixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqRyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO2dCQUMzRSxNQUFN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