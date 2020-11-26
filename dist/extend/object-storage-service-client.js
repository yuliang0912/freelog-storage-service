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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStorageServiceClient = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
let ObjectStorageServiceClient = class ObjectStorageServiceClient {
    constructor(uploadConfig) {
        this.__cacheMap__ = new Map();
        this.provider = 'aliOss';
        this.bucket = 'freelog-shenzhen';
        if (!uploadConfig) {
            throw new egg_freelog_base_1.ApplicationError('uploadConfig is not found');
        }
        this.uploadConfig = lodash_1.cloneDeep(uploadConfig);
    }
    // 目前只支持阿里云
    // setProvider(provider: string) {
    //     this.provider = provider;
    //     return this;
    // }
    setBucket(bucket) {
        this.bucket = bucket;
        return this;
    }
    build() {
        const clientConfig = this.uploadConfig[this.provider];
        if (!lodash_1.isObject(clientConfig)) {
            throw new egg_freelog_base_1.ApplicationError('param provider is invalid');
        }
        const key = this.provider + this.bucket + this.provider;
        if (!this.__cacheMap__.has(key)) {
            clientConfig['bucket'] = this.bucket;
            const client = this.aliOssClient(clientConfig);
            client['config'] = lodash_1.cloneDeep(clientConfig);
            this.__cacheMap__.set(key, client);
        }
        return this.__cacheMap__.get(key);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Function)
], ObjectStorageServiceClient.prototype, "aliOssClient", void 0);
ObjectStorageServiceClient = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('objectStorageServiceClient'),
    __param(0, midway_1.config('uploadConfig')),
    __metadata("design:paramtypes", [Object])
], ObjectStorageServiceClient);
exports.ObjectStorageServiceClient = ObjectStorageServiceClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2Utc2VydmljZS1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5kL29iamVjdC1zdG9yYWdlLXNlcnZpY2UtY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUEyQztBQUMzQyxtQ0FBc0Q7QUFDdEQsdURBQXlFO0FBSXpFLElBQWEsMEJBQTBCLEdBQXZDLE1BQWEsMEJBQTBCO0lBV25DLFlBQW9DLFlBQVk7UUFMdkMsaUJBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTNCLGFBQVEsR0FBRyxRQUFRLENBQUM7UUFDcEIsV0FBTSxHQUFHLGtCQUFrQixDQUFDO1FBRy9CLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDZixNQUFNLElBQUksbUNBQWdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUMzRDtRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsa0JBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsV0FBVztJQUNYLGtDQUFrQztJQUNsQyxnQ0FBZ0M7SUFDaEMsbUJBQW1CO0lBQ25CLElBQUk7SUFFSixTQUFTLENBQUMsTUFBYztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsS0FBSztRQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxpQkFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1NBQzNEO1FBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzdCLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGtCQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBQ0osQ0FBQTtBQXhDRztJQURDLGVBQU0sRUFBRTs7Z0VBQ3VDO0FBSHZDLDBCQUEwQjtJQUZ0QyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMsNEJBQTRCLENBQUM7SUFZckIsV0FBQSxlQUFNLENBQUMsY0FBYyxDQUFDLENBQUE7O0dBWDFCLDBCQUEwQixDQTJDdEM7QUEzQ1ksZ0VBQTBCIn0=