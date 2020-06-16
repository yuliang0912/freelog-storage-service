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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXN0b3JhZ2Utc2VydmljZS1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5kL29iamVjdC1zdG9yYWdlLXNlcnZpY2UtY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE4QztBQUM5QyxtQ0FBMkM7QUFDM0MsdURBQWtEO0FBQ2xELDZFQUE2RTtBQUk3RSxJQUFhLDBCQUEwQixHQUF2QyxNQUFhLDBCQUEwQjtJQVNuQyxZQUFvQyxZQUFZO1FBTnZDLGlCQUFZLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUczQixhQUFRLEdBQUcsUUFBUSxDQUFDO1FBSXZCLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDZixNQUFNLElBQUksbUNBQWdCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUMzRDtRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsa0JBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQWdCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxTQUFTLENBQUMsTUFBYztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsS0FBSztRQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGlCQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1NBQzNEO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3hELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM3QixNQUFNLFlBQVksR0FBRztnQkFDakIsWUFBWSxFQUFFLEVBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQzthQUMvQyxDQUFDO1lBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLE1BQU0sR0FBRyxrQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDdEM7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FDSixDQUFBO0FBM0NZLDBCQUEwQjtJQUZ0QyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMsNEJBQTRCLENBQUM7SUFVckIsV0FBQSxlQUFNLENBQUMsY0FBYyxDQUFDLENBQUE7O0dBVDFCLDBCQUEwQixDQTJDdEM7QUEzQ1ksZ0VBQTBCIn0=