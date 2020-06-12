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
const bucket_interface_1 = require("../../interface/bucket-interface");
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
        replaceStorageObjectEventHandle(newObjectStorageInfo, oldObjectStorageInfo) {
            if (oldObjectStorageInfo.systemProperty.fileSize === newObjectStorageInfo.systemProperty.fileSize) {
                return;
            }
            if (oldObjectStorageInfo.bucketId !== newObjectStorageInfo.bucketId || oldObjectStorageInfo.objectName !== newObjectStorageInfo.objectName) {
                throw new error_1.ArgumentError('code logic error');
            }
            this.bucketProvider.updateOne({ _id: newObjectStorageInfo.bucketId }, {
                $inc: {
                    totalFileSize: newObjectStorageInfo.systemProperty.fileSize - oldObjectStorageInfo.systemProperty.fileSize
                }
            });
        }
        /**
         * bucket新增对象事件处理
         * @param {ObjectStorageInfo} objectStorageInfo
         */
        addStorageObjectEventHandle(objectStorageInfo) {
            this.bucketProvider.updateOne({ _id: objectStorageInfo.bucketId }, {
                $inc: { totalFileQuantity: 1, totalFileSize: objectStorageInfo.systemProperty.fileSize }
            });
        }
        /**
         * 删除存储对象,自动移除所占的空间
         * @param {ObjectStorageInfo} objectStorageInfo
         */
        deleteStorageObjectEventHandle(objectStorageInfo) {
            this.bucketProvider.updateOne({ _id: objectStorageInfo.bucketId }, {
                $inc: { totalFileQuantity: -1, totalFileSize: -objectStorageInfo.systemProperty.fileSize }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvYnVja2V0LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXVDO0FBQ3ZDLHVFQUE0RjtBQUM1RixrREFBdUU7QUFJdkU7O0lBQUEsSUFBYSxhQUFhLHFCQUExQixNQUFhLGFBQWE7UUFBMUI7WUFNSSw0QkFBdUIsR0FBRyxDQUFDLENBQUM7UUF1S2hDLENBQUM7UUFyS0c7Ozs7V0FJRztRQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBc0I7WUFFckMsSUFBSSxVQUFVLENBQUMsVUFBVSxLQUFLLGlDQUFjLENBQUMsV0FBVyxFQUFFO2dCQUN0RCxNQUFNLElBQUkscUJBQWEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO2FBQ2xFO1lBQ0QsTUFBTSxrQkFBa0IsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO2dCQUMvRCxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07Z0JBQ3pCLFVBQVUsRUFBRSxpQ0FBYyxDQUFDLFdBQVc7YUFDekMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ3BELE1BQU0sSUFBSSx3QkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywyQ0FBMkMsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO2FBQzNIO1lBRUQsVUFBVSxDQUFDLGVBQWUsR0FBRyxlQUFhLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0UsTUFBTSxXQUFXLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQztZQUM3RyxJQUFJLFdBQVcsRUFBRTtnQkFDYixN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