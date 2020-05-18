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
var BucketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
const midway_1 = require("midway");
const bucket_interface_1 = require("../interface/bucket-interface");
const error_1 = require("egg-freelog-base/error");
let BucketService = BucketService_1 = class BucketService {
    constructor() {
        this.bucketCreatedLimitCount = 5;
    }
    /**
     * 用户创建bucket
     * @param {BucketInfo} bucketInfo
     * @returns {Promise<BucketInfo>}
     */
    async createBucket(bucketInfo) {
        if (bucketInfo.bucketType !== bucket_interface_1.BucketTypeEnum.UserStorage) {
            throw new error_1.ArgumentError('please check code param:bucketType!');
        }
        const createdBucketCount = await this.bucketProvider.count({
            userId: bucketInfo.userId,
            bucketType: bucket_interface_1.BucketTypeEnum.UserStorage
        });
        if (createdBucketCount >= this.bucketCreatedLimitCount) {
            throw new error_1.ApplicationError(this.ctx.gettext('bucket-create-count-limit-validate-failed', this.bucketCreatedLimitCount));
        }
        bucketInfo.bucketUniqueKey = BucketService_1.generateBucketUniqueKey(bucketInfo);
        const existBucket = await this.bucketProvider.findOne({ bucketUniqueKey: bucketInfo.bucketUniqueKey });
        if (existBucket) {
            throw new error_1.ApplicationError(this.ctx.gettext('bucket-name-create-duplicate-error'));
        }
        return this.bucketProvider.create(bucketInfo);
    }
    /**
     * 系统创建bucket
     * @param {BucketInfo} bucketInfo
     * @returns {Promise<BucketInfo>}
     */
    async createOrFindSystemBucket(bucketInfo) {
        if (bucketInfo.bucketType !== bucket_interface_1.BucketTypeEnum.SystemStorage) {
            throw new error_1.ArgumentError('please check code param:bucketType!');
        }
        bucketInfo.bucketUniqueKey = BucketService_1.generateBucketUniqueKey(bucketInfo);
        const existBucket = await this.bucketProvider.findOne({ bucketUniqueKey: bucketInfo.bucketUniqueKey });
        if (existBucket) {
            // throw new ApplicationError(this.ctx.gettext('bucket-name-create-duplicate-error'));
            return existBucket;
        }
        return this.bucketProvider.create(bucketInfo);
    }
    /**
     * 删除bucket
     * @param bucketName
     * @returns {Promise<boolean>}
     */
    async deleteBucket(bucketName) {
        const userId = this.ctx.request.userId;
        const bucketInfo = await this.bucketProvider.findOne({ bucketName, userId });
        this.ctx.entityNullValueAndUserAuthorizationCheck(bucketInfo, {
            msg: this.ctx.gettext('params-validate-failed', 'bucketName'),
            data: { bucketName }
        });
        if (bucketInfo.totalFileSize > 0) {
            throw new error_1.ApplicationError({ msg: this.ctx.gettext('bucket-delete-validate-error') });
        }
        return this.bucketProvider.deleteOne({ bucketName: bucketInfo.bucketName }).then(data => Boolean(data.n));
    }
    /**
     * 查找单个bucket
     * @param {object} condition
     * @returns {Promise<BucketInfo>}
     */
    async findOne(condition) {
        return this.bucketProvider.findOne(condition);
    }
    /**
     * 查找多个bucket
     * @param {object} condition
     * @returns {Promise<BucketInfo>}
     */
    async find(condition) {
        return this.bucketProvider.find(condition);
    }
    /**
     * 查找统计数量
     * @param {object} condition
     * @returns {Promise<number>}
     */
    async count(condition) {
        return this.bucketProvider.count(condition);
    }
    /**
     * 生成唯一失败符
     * @param {BucketInfo} bucketInfo
     * @returns {string}
     */
    static generateBucketUniqueKey(bucketInfo) {
        return bucketInfo.bucketType === bucket_interface_1.BucketTypeEnum.UserStorage ? bucketInfo.bucketName : `${bucketInfo.userId}/${bucketInfo.bucketName}`;
    }
    /**
     * bucket中同一个object发生替换.重新计算整个bucket总文件大小
     * @param {StorageObject} newStorageObject
     * @param {StorageObject} oldStorageObject
     */
    replaceStorageObjectEventHandle(newStorageObject, oldStorageObject) {
        if (oldStorageObject.systemMeta.fileSize === newStorageObject.systemMeta.fileSize) {
            return;
        }
        if (oldStorageObject.bucketId !== newStorageObject.bucketId || oldStorageObject.objectName !== newStorageObject.objectName) {
            throw new error_1.ArgumentError('code logic error');
        }
        this.bucketProvider.updateOne({ bucketId: newStorageObject.bucketId }, {
            $inc: {
                totalFileSize: newStorageObject.systemMeta.fileSize - oldStorageObject.systemMeta.fileSize
            }
        });
    }
    /**
     * bucket新增文件事件处理
     * @param {StorageObject} storageObject
     */
    addStorageObjectEventHandle(storageObject) {
        this.bucketProvider.updateOne({ bucketId: storageObject.bucketId }, {
            $inc: { totalFileQuantity: 1, totalFileSize: storageObject.systemMeta.fileSize }
        });
    }
    deleteStorageObjectEventHandle(storageObject) {
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], BucketService.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], BucketService.prototype, "bucketProvider", void 0);
BucketService = BucketService_1 = __decorate([
    midway_1.provide('bucketService')
], BucketService);
exports.BucketService = BucketService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZS9idWNrZXQtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsb0VBQXlGO0FBQ3pGLGtEQUF1RTtBQUl2RSxJQUFhLGFBQWEscUJBQTFCLE1BQWEsYUFBYTtJQUExQjtRQU1JLDRCQUF1QixHQUFHLENBQUMsQ0FBQztJQTJJaEMsQ0FBQztJQXpJRzs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFzQjtRQUVyQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLEtBQUssaUNBQWMsQ0FBQyxXQUFXLEVBQUU7WUFDdEQsTUFBTSxJQUFJLHFCQUFhLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUNsRTtRQUNELE1BQU0sa0JBQWtCLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztZQUMvRCxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFLGlDQUFjLENBQUMsV0FBVztTQUN6QyxDQUFDLENBQUM7UUFDSCxJQUFJLGtCQUFrQixJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtZQUNwRCxNQUFNLElBQUksd0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMkNBQTJDLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztTQUMzSDtRQUVELFVBQVUsQ0FBQyxlQUFlLEdBQUcsZUFBYSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sV0FBVyxHQUFXLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBQyxlQUFlLEVBQUUsVUFBVSxDQUFDLGVBQWUsRUFBQyxDQUFDLENBQUM7UUFDN0csSUFBSSxXQUFXLEVBQUU7WUFDYixNQUFNLElBQUksd0JBQWdCLENB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