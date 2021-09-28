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
     * 清空用户节点数据
     * @param bucketInfo
     * @param nodeInfo
     */
    async clearUserNodeData(bucketInfo, nodeInfo) {
        const condition = { bucketId: bucketInfo.bucketId };
        if (nodeInfo) {
            condition.objectName = `${nodeInfo.nodeDomain}.ncfg`;
        }
        const task1 = this.bucketProvider.updateOne({ _id: bucketInfo.bucketId }, { totalFileSize: 0 });
        const task2 = this.objectStorageProvider.deleteMany(condition);
        return Promise.all([task1, task2]).then(() => true);
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
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], BucketService.prototype, "objectStorageProvider", void 0);
BucketService = BucketService_1 = __decorate([
    midway_1.provide('bucketService')
], BucketService);
exports.BucketService = BucketService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvYnVja2V0LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUN2Qyx1RUFBNEY7QUFDNUYsdURBQW9HO0FBS3BHLElBQWEsYUFBYSxxQkFBMUIsTUFBYSxhQUFhO0lBQTFCO1FBUUksNEJBQXVCLEdBQUcsQ0FBQyxDQUFDO0lBNExoQyxDQUFDO0lBMUxHOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQXNCO1FBRXJDLElBQUksVUFBVSxDQUFDLFVBQVUsS0FBSyxpQ0FBYyxDQUFDLFdBQVcsRUFBRTtZQUN0RCxNQUFNLElBQUksZ0NBQWEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1NBQ2xFO1FBQ0QsTUFBTSxrQkFBa0IsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO1lBQy9ELE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUUsaUNBQWMsQ0FBQyxXQUFXO1NBQ3pDLENBQUMsQ0FBQztRQUNILElBQUksa0JBQWtCLElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO1lBQ3BELE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywyQ0FBMkMsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3RJO1FBRUQsVUFBVSxDQUFDLGVBQWUsR0FBRyxlQUFhLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0UsTUFBTSxXQUFXLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQztRQUM3RyxJQUFJLFdBQVcsRUFBRTtZ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