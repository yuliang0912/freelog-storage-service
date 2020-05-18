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
const midway_1 = require("midway");
const bucket_interface_1 = require("../../interface/bucket-interface");
const egg_freelog_base_1 = require("egg-freelog-base");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
let BucketController = class BucketController {
    async index(ctx) {
        const bucketType = ctx.checkQuery('bucketType').optional().toInt().in([0, 1, 2]).default(0).value;
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
        // const bucketType: number = ctx.checkBody('bucketType').optional().toInt().in([BucketTypeEnum.UserStorage, BucketTypeEnum.SystemStorage]).default(BucketTypeEnum.UserStorage).value;
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
    /**
     * 获取bucket详情
     * @param ctx
     * @returns {Promise<void>}
     */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2J1Y2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLG1DQUFtRTtBQUNuRSx1RUFBNEY7QUFDNUYsdURBQTJEO0FBQzNELGtGQUFxRTtBQUlyRSxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQU96QixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUc7UUFFWCxNQUFNLFVBQVUsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRTFHLE1BQU0sU0FBUyxHQUFHO1lBQ2QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTTtTQUM3QixDQUFBO1FBQ0QsSUFBSSxVQUFVLEVBQUU7WUFDWixTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDO1NBQ3hDO1FBQ0QsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFJRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUc7UUFDbEIsTUFBTSxTQUFTLEdBQUc7WUFDZCxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNO1lBQzFCLFVBQVUsRUFBRSxpQ0FBYyxDQUFDLFdBQVc7U0FDekMsQ0FBQTtRQUNELE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBSUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHO1FBRVosaUNBQWlDO1FBQ2pDLE1BQU0sVUFBVSxHQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDMUYsc0xBQXNMO1FBQ3RMLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyQixpQ0FBaUM7UUFDakMsTUFBTSxVQUFVLEdBQWU7WUFDM0IsVUFBVSxFQUFFLFVBQVUsRUFBRSxpQ0FBYyxDQUFDLFdBQVc7WUFDbEQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTTtTQUM3QixDQUFDO1FBRUYsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFJRCxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUc7UUFFYixNQUFNLFVBQVUsR0FBVyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsS0FBSyxDQUFDO1FBQzFGLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyQixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUlELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHO1FBRXZCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDcEYsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRUQ7Ozs7T0FJRztJQUdILEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRztRQUVWLE1BQU0sVUFBVSxHQUFXLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3RGLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyQixNQUFNLFNBQVMsR0FBRztZQUNkLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVO1NBQ3pDLENBQUE7UUFDRCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEUsQ0FBQztDQUNKLENBQUE7QUFsRkc7SUFEQyxlQUFNLEVBQUU7O3VEQUNxQjtBQUk5QjtJQUZDLFlBQUcsQ0FBQyxHQUFHLENBQUM7SUFDUix5Q0FBZSxDQUFDLDRCQUFTLEdBQUcsaUNBQWMsQ0FBQzs7Ozs2Q0FZM0M7QUFJRDtJQUZDLFlBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQywwQkFBMEI7O0lBQ3hDLHlDQUFlLENBQUMsNEJBQVMsQ0FBQzs7OztvREFPMUI7QUFJRDtJQUZDLGFBQUksQ0FBQyxHQUFHLENBQUM7SUFDVCx5Q0FBZSxDQUFDLDRCQUFTLENBQUM7Ozs7OENBZTFCO0FBSUQ7SUFGQyxZQUFHLENBQUMsY0FBYyxDQUFDO0lBQ25CLHlDQUFlLENBQUMsNEJBQVMsQ0FBQzs7OzsrQ0FPMUI7QUFJRDtJQUZDLFlBQUcsQ0FBQyxzQkFBc0IsQ0FBQztJQUMzQix5Q0FBZSxDQUFDLDRCQUFTLEdBQUcsaUNBQWMsQ0FBQzs7Ozt5REFPM0M7QUFTRDtJQUZDLFlBQUcsQ0FBQyxjQUFjLENBQUM7SUFDbkIseUNBQWUsQ0FBQyw0QkFBUyxDQUFDOzs7OzRDQVUxQjtBQXBGUSxnQkFBZ0I7SUFGNUIsZ0JBQU8sRUFBRTtJQUNULG1CQUFVLENBQUMsc0JBQXNCLENBQUM7R0FDdEIsZ0JBQWdCLENBcUY1QjtBQXJGWSw0Q0FBZ0IifQ==