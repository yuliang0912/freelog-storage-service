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
exports.BucketService = void 0;
const midway_1 = require("midway");
const bucket_interface_1 = require("../interface/bucket-interface");
const error_1 = require("egg-freelog-base/error");
let BucketService = /** @class */ (() => {
    var BucketService_1;
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
         * bucket使用数据统计
         * @param {number} userId
         * @returns {Promise<any>}
         */
        async spaceStatistics(userId) {
            const storageLimit = 5368709120; // 目前限制为5G
            const [statisticsInfo] = await this.bucketProvider.aggregate([{
                    $match: { userId, bucketType: bucket_interface_1.BucketTypeEnum.UserStorage }
                }, {
                    $group: { _id: '$userId', totalFileSize: { $sum: '$totalFileSize' }, bucketCount: { $sum: 1 } }
                }]);
            if (!statisticsInfo) {
                return { storageLimit, bucketCount: 0, totalFileSize: 0 };
            }
            return {
                storageLimit,
                bucketCount: statisticsInfo['bucketCount'],
                totalFileSize: statisticsInfo['totalFileSize']
            };
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
            this.bucketProvider.updateOne({ _id: newStorageObject.bucketId }, {
                $inc: {
                    totalFileSize: newStorageObject.systemMeta.fileSize - oldStorageObject.systemMeta.fileSize
                }
            });
        }
        /**
         * bucket新增对象事件处理
         * @param {StorageObject} storageObject
         */
        addStorageObjectEventHandle(storageObject) {
            this.bucketProvider.updateOne({ _id: storageObject.bucketId }, {
                $inc: { totalFileQuantity: 1, totalFileSize: storageObject.systemMeta.fileSize }
            });
        }
        /**
         * 删除存储对象,自动移除所占的空间
         * @param {StorageObject} storageObject
         */
        deleteStorageObjectEventHandle(storageObject) {
            this.bucketProvider.updateOne({ _id: storageObject.bucketId }, {
                $inc: { totalFileQuantity: -1, totalFileSize: -storageObject.systemMeta.fileSize }
            });
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
    return BucketService;
})();
exports.BucketService = BucketService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZS9idWNrZXQtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsb0VBQXlGO0FBQ3pGLGtEQUF1RTtBQUl2RTs7SUFBQSxJQUFhLGFBQWEscUJBQTFCLE1BQWEsYUFBYTtRQUExQjtZQU1JLDRCQUF1QixHQUFHLENBQUMsQ0FBQztRQXVLaEMsQ0FBQztRQXJLRzs7OztXQUlHO1FBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFzQjtZQUVyQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLEtBQUssaUNBQWMsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RELE1BQU0sSUFBSSxxQkFBYSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7YUFDbEU7WUFDRCxNQUFNLGtCQUFrQixHQUFXLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7Z0JBQy9ELE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTTtnQkFDekIsVUFBVSxFQUFFLGlDQUFjLENBQUMsV0FBVzthQUN6QyxDQUFDLENBQUM7WUFDSCxJQUFJLGtCQUFrQixJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFDcEQsTUFBTSxJQUFJLHdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDJDQUEyQyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7YUFDM0g7WUFFRCxVQUFVLENBQUMsZUFBZSxHQUFHLGVBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMvRSxNQUFNLFdBQVcsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDO1lBQzdHLElBQUksV0FBVyxFQUFFO2dCQUNiLE1BQU0sSUFB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