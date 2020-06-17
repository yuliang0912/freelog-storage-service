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
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const egg_freelog_base_1 = require("egg-freelog-base");
const FileOssManager = require("egg-freelog-base/app/extend/file-oss/index");
let ObjectStorageServiceClient = class ObjectStorageServiceClient {
    constructor(uploadConfig) {
        this.__cacheMap__ = new Map();
        this.bucket = 'freelog-shenzhen';
        this.provider = 'aliOss';
        if (!uploadConfig) {
            throw new egg_freelog_base_1.ApplicationError('uploadConfig is not found');
        }
        this.uploadConfig = lodash_1.cloneDeep(uploadConfig);
    }
    setProvider(provider) {
        this.provider = provider;
        return this;
    }
    setBucket(bucket) {
        this.bucket = bucket;
        return this;
    }
    build() {
        this.config = this.uploadConfig[this.provider];
        if (!lodash_1.isObject(this.config)) {
            throw new egg_freelog_base_1.ApplicationError('param provider is invalid');
        }
        this.config['bucket'] = this.bucket;
        const key = this.provider + this.bucket + this.provider;
        if (!this.__cacheMap__.has(key)) {
            const clientConfig = {
                uploadConfig: { [this.provider]: this.config }
            };
            const client = new FileOssManager(clientConfig);
            client.config = lodash_1.cloneDeep(this.config);
            this.__cacheMap__.set(key, client);
        }
        return this.__cacheMap__.get(key);
    }
};
ObjectStorageServiceClient = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('objectStorageServiceClient'),
    __param(0, midway_1.config('uploadConfig')),
    __metadata("design:paramtypes", [Object])
], ObjectStorageServiceClient);
exports.ObjectStorageServiceClient = ObjectStorageServiceClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2Utc2VydmljZS1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5kL29iamVjdC1zdG9yYWdlLXNlcnZpY2UtY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE4QztBQUM5QyxtQ0FBMkM7QUFDM0MsdURBQWtEO0FBQ2xELDZFQUE2RTtBQUk3RSxJQUFhLDBCQUEwQixHQUF2QyxNQUFhLDBCQUEwQjtJQVNuQyxZQUFvQyxZQUFZO1FBTnZDLGlCQUFZLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUUzQixXQUFNLEdBQUcsa0JBQWtCLENBQUM7UUFDNUIsYUFBUSxHQUFHLFFBQVEsQ0FBQztRQUl2QixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsTUFBTSxJQUFJLG1DQUFnQixDQUFDLDJCQUEyQixDQUFDLENBQUM7U0FDM0Q7UUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLGtCQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUFnQjtRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsU0FBUyxDQUFDLE1BQWM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUs7UUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxpQkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN4QixNQUFNLElBQUksbUNBQWdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUMzRDtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN4RCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxZQUFZLEdBQUc7Z0JBQ2pCLFlBQVksRUFBRSxFQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUM7YUFDL0MsQ0FBQztZQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxNQUFNLEdBQUcsa0JBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBQ0osQ0FBQTtBQTNDWSwwQkFBMEI7SUFGdEMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLDRCQUE0QixDQUFDO0lBVXJCLFdBQUEsZUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFBOztHQVQxQiwwQkFBMEIsQ0EyQ3RDO0FBM0NZLGdFQUEwQiJ9