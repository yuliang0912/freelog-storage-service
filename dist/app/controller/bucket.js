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
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
let BucketController = class BucketController {
    async index(ctx) {
        const bucketType = ctx.checkQuery('bucketType').optional().toInt().in([0, 1, 2]).default(0).value;
        ctx.validateParams();
        const condition = {
            userId: ctx.request.userId
        };
        if (bucketType) {
            condition['bucketType'] = bucketType;
        }
        await this.bucketService.find(condition).then(ctx.success);
    }
    async createdCount(ctx) {
        const condition = {
            userId: ctx.request.userId,
            bucketType: bucket_interface_1.BucketTypeEnum.UserStorage
        };
        await this.bucketService.count(condition).then(ctx.success);
    }
    async create(ctx) {
        // 只允许小写字母、数字、中划线（-），且不能以短横线开头或结尾
        const bucketName = ctx.checkBody('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();
        // 系统级存储bucket不能通过API创建.由对应的业务来处理
        const bucketInfo = {
            bucketName, bucketType: bucket_interface_1.BucketTypeEnum.UserStorage,
            userId: ctx.request.userId
        };
        await this.bucketService.createBucket(bucketInfo).then(ctx.success);
    }
    async destroy(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();
        await this.bucketService.deleteBucket(bucketName).then(ctx.success);
    }
    async isExistBucketName(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isStrictBucketName().value;
        ctx.validateParams();
        await this.bucketService.count({ bucketName }).then(data => ctx.success(Boolean(data)));
    }
    async spaceStatistics(ctx) {
        await this.bucketService.spaceStatistics(ctx.request.userId).then(ctx.success);
    }
    async show(ctx) {
        const bucketName = ctx.checkParams('bucketName').exist().isBucketName().value;
        ctx.validateParams();
        const condition = {
            userId: ctx.request.userId, bucketName
        };
        await this.bucketService.findOne(condition).then(ctx.success);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], BucketController.prototype, "bucketService", void 0);
__decorate([
    midway_1.get('/'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "index", null);
__decorate([
    midway_1.get('/Count') // 需要首字母大写,避免和bucketName冲突
    ,
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "createdCount", null);
__decorate([
    midway_1.post('/'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "create", null);
__decorate([
    midway_1.del('/:bucketName'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "destroy", null);
__decorate([
    midway_1.get('/:bucketName/isExist'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "isExistBucketName", null);
__decorate([
    midway_1.get('/spaceStatistics'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "spaceStatistics", null);
__decorate([
    midway_1.get('/:bucketName'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BucketController.prototype, "show", null);
BucketController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v1/storages/buckets')
], BucketController);
exports.BucketController = BucketController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2J1Y2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBbUU7QUFDbkUsdUVBQTRGO0FBQzVGLHVEQUEyRDtBQUMzRCxrRkFBcUU7QUFJckUsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBZ0I7SUFPekIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO1FBQ1gsTUFBTSxVQUFVLEdBQVcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMxRyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckIsTUFBTSxTQUFTLEdBQUc7WUFDZCxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNO1NBQzdCLENBQUM7UUFDRixJQUFJLFVBQVUsRUFBRTtZQUNaLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxVQUFVLENBQUM7U0FDeEM7UUFDRCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUlELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRztRQUNsQixNQUFNLFNBQVMsR0FBRztZQUNkLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU07WUFDMUIsVUFBVSxFQUFFLGlDQUFjLENBQUMsV0FBVztTQUN6QyxDQUFDO1FBQ0YsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FB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