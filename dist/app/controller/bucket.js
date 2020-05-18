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
    return BucketController;
})();
exports.BucketController = BucketController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2J1Y2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBbUU7QUFDbkUsdUVBQTRGO0FBQzVGLHVEQUEyRDtBQUMzRCxrRkFBcUU7QUFJckU7SUFBQSxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtRQU96QixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUc7WUFDWCxNQUFNLFVBQVUsR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBRTFHLE1BQU0sU0FBUyxHQUFHO2dCQUNkLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU07YUFDN0IsQ0FBQztZQUNGLElBQUksVUFBVSxFQUFFO2dCQUNaLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxVQUFVLENBQUM7YUFDeEM7WUFDRCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUlELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRztZQUNsQixNQUFNLFNBQVMsR0FBRztnQkFDZCxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNO2dCQUMxQixVQUFVLEVBQUUsaUNBQWMsQ0FBQyxXQUFXO2FBQ3pDLENBQUM7WUFDRixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7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