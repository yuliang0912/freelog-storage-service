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
    async list() {
        const { ctx } = this;
        const sha1s = ctx.checkQuery('sha1').exist().toLowercase().isSplitSha1().toSplitArray().len(1, 100).value;
        ctx.validateParams();
        const sha1Map = await this.fileStorageService.find({ sha1: { $in: sha1s } }).then(list => {
            return new Map(list.map(x => [x.sha1, lodash_1.pick(x, ['sha1', 'fileSize', 'metaInfo', 'metaAnalyzeStatus'])]));
        });
        ctx.success(sha1s.map(sha1 => {
            const item = sha1Map.has(sha1) ? sha1Map.get(sha1) : null;
            return Object.assign({ sha1 }, item);
        }));
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
    midway_1.get('/list/info'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "list", null);
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