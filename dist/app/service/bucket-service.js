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
const lodash_1 = require("lodash");
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
     * @param nodeDomains
     */
    async clearUserNodeData(bucketInfo, nodeDomains) {
        const condition = { bucketId: bucketInfo.bucketId };
        if (!lodash_1.isEmpty(nodeDomains || [])) {
            condition.objectName = { $in: nodeDomains.map(x => `${x}.ncfg`) };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvYnVja2V0LXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUN2Qyx1RUFBNEY7QUFDNUYsdURBQW9HO0FBRXBHLG1DQUErQjtBQUcvQixJQUFhLGFBQWEscUJBQTFCLE1BQWEsYUFBYTtJQUExQjtRQVFJLDRCQUF1QixHQUFHLENBQUMsQ0FBQztJQTRMaEMsQ0FBQztJQTFMRzs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFzQjtRQUVyQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLEtBQUssaUNBQWMsQ0FBQyxXQUFXLEVBQUU7WUFDdEQsTUFBTSxJQUFJLGdDQUFhLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUNsRTtRQUNELE1BQU0sa0JBQWtCLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztZQUMvRCxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFLGlDQUFjLENBQUMsV0FBVztTQUN6QyxDQUFDLENBQUM7UUFDSCxJQUFJLGtCQUFrQixJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtZQUNwRCxNQUFNLElBQUksbUNBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMkNBQTJDLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN0STtRQUVELFVBQVUsQ0FBQyxlQUFlLEdBQUcsZUFBYSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sV0FBVyxHQUFXLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBQyxlQUFlLEVBQUUsVUFBVSxDQUFDLGVBQWUsRUFBQyxDQUFDLENBQUM7UUFDN0csSUFB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