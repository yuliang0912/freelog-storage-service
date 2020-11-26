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
exports.BucketController = void 0;
const midway_1 = require("midway");
const bucket_interface_1 = require("../../interface/bucket-interface");
const egg_freelog_base_1 = require("egg-freelog-base");
let BucketController = class BucketController {
    async index() {
        const { ctx } = this;
        const bucketType = ctx.checkQuery('bucketType').optional().toInt().in([0, 1, 2]).default(0).value;
        ctx.validateParams();
        const condition = { userId: ctx.userId };
        if (bucketType) {
            condition['bucketType'] = bucketType;
        }
        await this.bucketService.find(condition).then(ctx.success);
    }
    async createdCount() {
        const { ctx } = this;
        const condition = {
            userId: ctx.userId,
            bucketType: bucket_interface_1.BucketTypeEnum.UserStorage
        };
        await this.bucketService.count(condition).then(ctx.success);
    }
    async create() {
        const { ctx } = this;
        // 只允许小写字母、数字、中划线（-），且不能以短横线开头或结尾
        const bucketName = ctx.checkBody('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();
        // 系统级存储bucket不能通过API创建.由对应的业务来处理
        const bucketInfo = {
            bucketName, bucketType: bucket_interface_1.BucketTypeEnum.UserStorage,
            userId: ctx.userId
        };
        await this.bucketService.createBucket(bucketInfo).then(ctx.success);
    }
    async destroy() {
        const { ctx } = this;
        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();
        await this.bucketService.deleteBucket(bucketName).then(ctx.success);
    }
    async isExistBucketName() {
        const { ctx } = this;
        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();
        await this.bucketService.count({ bucketName }).then(data => ctx.success(Boolean(data)));
    }
    async spaceStatistics() {
        const { ctx } = this;
        await this.bucketService.spaceStatistics(ctx.userId).then(ctx.success);
    }
    async show() {
        const { ctx } = this;
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        ctx.validateParams();
        const condition = {
            userId: ctx.userId, bucketName
        };
        await this.bucketService.findOne(condition).then(ctx.success);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], BucketController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], BucketController.prototype, "bucketService", void 0);
__decorate([
    midway_1.get('/'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "index", null);
__decorate([
    midway_1.get('/Count') // 需要首字母大写,避免和bucketName冲突
    ,
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "createdCount", null);
__decorate([
    midway_1.post('/'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "create", null);
__decorate([
    midway_1.del('/:bucketName'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "destroy", null);
__decorate([
    midway_1.get('/:bucketName/isExist'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "isExistBucketName", null);
__decorate([
    midway_1.get('/spaceStatistics'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "spaceStatistics", null);
__decorate([
    midway_1.get('/:bucketName'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "show", null);
BucketController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v1/storages/buckets')
], BucketController);
exports.BucketController = BucketController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2J1Y2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBbUU7QUFDbkUsdUVBQTRGO0FBQzVGLHVEQUE0RjtBQUk1RixJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQVN6QixLQUFLLENBQUMsS0FBSztRQUNQLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxVQUFVLEdBQVcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMxRyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckIsTUFBTSxTQUFTLEdBQUcsRUFBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBQyxDQUFDO1FBQ3ZDLElBQUksVUFBVSxFQUFFO1lBQ1osU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLFVBQVUsQ0FBQztTQUN4QztRQUNELE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBSUQsS0FBSyxDQUFDLFlBQVk7UUFDZCxNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sU0FBUyxHQUFHO1lBQ2QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLFVBQVUsRUFBRSxpQ0FBYyxDQUFDLFdBQVc7U0FDekMsQ0FBQztRQUNGLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMs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