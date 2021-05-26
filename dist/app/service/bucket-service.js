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
exports.BucketService = void 0;
const midway_1 = require("midway");
const bucket_interface_1 = require("../../interface/bucket-interface");
const egg_freelog_base_1 = require("egg-freelog-base");
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
            throw new egg_freelog_base_1.ArgumentError('please check code param:bucketType!');
        }
        const createdBucketCount = await this.bucketProvider.count({
            userId: bucketInfo.userId,
            bucketType: bucket_interface_1.BucketTypeEnum.UserStorage
        });
        if (createdBucketCount >= this.bucketCreatedLimitCount) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('bucket-create-count-limit-validate-failed', this.bucketCreatedLimitCount.toString()));
        }
        bucketInfo.bucketUniqueKey = BucketService_1.generateBucketUniqueKey(bucketInfo);
        const existBucket = await this.bucketProvider.findOne({ bucketUniqueKey: bucketInfo.bucketUniqueKey });
        if (existBucket) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('bucket-name-create-duplicate-error'));
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
            throw new egg_freelog_base_1.ArgumentError('please check code param:bucketType!');
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
        const userId = this.ctx.userId;
        const bucketInfo = await this.bucketProvider.findOne({ bucketName, userId });
        this.ctx.entityNullValueAndUserAuthorizationCheck(bucketInfo, {
            msg: this.ctx.gettext('params-validate-failed', 'bucketName'),
            data: { bucketName }
        });
        if (bucketInfo.totalFileSize > 0) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('bucket-delete-validate-error'));
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
     * @param condition
     * @param args
     */
    async find(condition, ...args) {
        return this.bucketProvider.find(condition, ...args);
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
     * @param newObjectStorageInfo
     * @param oldObjectStorageInfo
     */
    replaceStorageObjectEventHandle(newObjectStorageInfo, oldObjectStorageInfo) {
        if (oldObjectStorageInfo.systemProperty.fileSize === newObjectStorageInfo.systemProperty.fileSize) {
            return;
        }
        if (oldObjectStorageInfo.bucketId !== newObjectStorageInfo.bucketId || oldObjectStorageInfo.objectName !== newObjectStorageInfo.objectName) {
            throw new egg_freelog_base_1.ArgumentError('code logic error');
        }
        this.bucketProvider.updateOne({ _id: newObjectStorageInfo.bucketId }, {
            $inc: {
                totalFileSize: newObjectStorageInfo.systemProperty.fileSize - oldObjectStorageInfo.systemProperty.fileSize
            }
        }).then();
    }
    /**
     * bucket新增对象事件处理
     * @param {ObjectStorageInfo} objectStorageInfo
     */
    addStorageObjectEventHandle(objectStorageInfo) {
        this.bucketProvider.updateOne({ _id: objectStorageInfo.bucketId }, {
            $inc: { totalFileQuantity: 1, totalFileSize: objectStorageInfo.systemProperty.fileSize }
        }).then();
    }
    /**
     * 删除存储对象,自动移除所占的空间
     * @param {ObjectStorageInfo} objectStorageInfo
     */
    deleteStorageObjectEventHandle(objectStorageInfo) {
        this.bucketProvider.updateOne({ _id: objectStorageInfo.bucketId }, {
            $inc: { totalFileQuantity: -1, totalFileSize: -objectStorageInfo.systemProperty.fileSize }
        }).then();
    }
    batchDeleteStorageObjectEventHandle(bucketInfo, deletedFileQuantity, totalFileSize) {
        this.bucketProvider.updateOne({ _id: bucketInfo.bucketId }, {
            $inc: { totalFileQuantity: -deletedFileQuantity, totalFileSize: -totalFileSize }
        }).then();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvYnVja2V0LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUN2Qyx1RUFBNEY7QUFDNUYsdURBQW9HO0FBSXBHLElBQWEsYUFBYSxxQkFBMUIsTUFBYSxhQUFhO0lBQTFCO1FBTUksNEJBQXVCLEdBQUcsQ0FBQyxDQUFDO0lBNktoQyxDQUFDO0lBM0tHOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQXNCO1FBRXJDLElBQUksVUFBVSxDQUFDLFVBQVUsS0FBSyxpQ0FBYyxDQUFDLFdBQVcsRUFBRTtZQUN0RCxNQUFNLElBQUksZ0NBQWEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1NBQ2xFO1FBQ0QsTUFBTSxrQkFBa0IsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO1lBQy9ELE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUUsaUNBQWMsQ0FBQyxXQUFXO1NBQ3pDLENBQUMsQ0FBQztRQUNILElBQUksa0JBQWtCLElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO1lBQ3BELE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywyQ0FBMkMsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3RJO1FBRUQsVUFBVSxDQUFDLGVBQWUsR0FBRyxlQUFhLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0UsTUFBTSxXQUFXLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQztRQUM3RyxJQUFJLFdBQVcsRUFBRTtZ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