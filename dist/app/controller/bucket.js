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
let BucketController = /** @class */ (() => {
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
            const bucketName = ctx.checkBody('bucketName').exist().isStrictBucketName().value;
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
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
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
    return BucketController;
})();
exports.BucketController = BucketController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2J1Y2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBbUU7QUFDbkUsdUVBQTRGO0FBQzVGLHVEQUEyRDtBQUMzRCxrRkFBcUU7QUFJckU7SUFBQSxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtRQU96QixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUc7WUFDWCxNQUFNLFVBQVUsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzFHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVyQixNQUFNLFNBQVMsR0FBRztnQkFDZCxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNO2FBQzdCLENBQUM7WUFDRixJQUFJLFVBQVUsRUFBRTtnQkFDWixTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDO2FBQ3hDO1lBQ0QsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFJRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUc7WUFDbEIsTUFBTSxTQUFTLEdBQUc7Z0JBQ2QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTTtnQkFDMUIsVUFBVSxFQUFFLGlDQUFjLENBQUMsV0FBVzthQUN6QyxDQUFDO1lBQ0YsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJ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