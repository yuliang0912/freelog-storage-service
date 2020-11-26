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
exports.FilePropertyAnalyzerHandler = void 0;
const midway_1 = require("midway");
const probe = require("probe-image-size");
const egg_freelog_base_1 = require("egg-freelog-base");
const lodash_1 = require("lodash");
let FilePropertyAnalyzerHandler = class FilePropertyAnalyzerHandler {
    constructor() {
        this.resourceAnalyzeHandlerMap = new Map([['image', this._imageFileAnalyzeHandle.bind(this)]]);
    }
    get supportAnalyzeResourceTypes() {
        return [...this.resourceAnalyzeHandlerMap.keys()];
    }
    /**
     * 获取资源文件属性
     * @param src
     * @param resourceType
     */
    async analyzeFileProperty(src, resourceType) {
        resourceType = resourceType.toLowerCase();
        const result = { analyzeStatus: 3, fileProperty: null, error: null, provider: '' };
        if (!this.supportAnalyzeResourceTypes.includes(resourceType)) {
            return result;
        }
        const handler = this.resourceAnalyzeHandlerMap.get(resourceType);
        await handler(src).then(property => {
            result.fileProperty = property;
            result.analyzeStatus = 1;
        }).catch(err => {
            result.analyzeStatus = 2;
            result.error = err;
        });
        result.provider = `${resourceType}-analyze-com`;
        return result;
    }
    /**
     * 获取图片基础属性
     * @param src
     */
    async _imageFileAnalyzeHandle(src) {
        const result = await probe(src).catch(_error => {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('image-file-analyze-failed'));
        });
        return lodash_1.pick(result, ['width', 'height', 'type', 'mime']);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FilePropertyAnalyzerHandler.prototype, "ctx", void 0);
FilePropertyAnalyzerHandler = __decorate([
    midway_1.provide('filePropertyAnalyzeHandler')
], FilePropertyAnalyzerHandler);
exports.FilePropertyAnalyzerHandler = FilePropertyAnalyzerHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL2FuYWx5emUtZmlsZS1wcm9wZXJ0eS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsMENBQTBDO0FBQzFDLHVEQUFrRDtBQUNsRCxtQ0FBNEI7QUFHNUIsSUFBYSwyQkFBMkIsR0FBeEMsTUFBYSwyQkFBMkI7SUFBeEM7UUFJYSw4QkFBeUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUEwQ3ZHLENBQUM7SUF4Q0csSUFBSSwyQkFBMkI7UUFDM0IsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLFlBQW9CO1FBQy9DLFlBQVksR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUMsTUFBTSxNQUFNLEdBQVEsRUFBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFDLENBQUM7UUFDdEYsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDMUQsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMvQixNQUFNLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztZQUMvQixNQUFNLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDWCxNQUFNLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUN6QixNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxRQUFRLEdBQUcsR0FBRyxZQUFZLGNBQWMsQ0FBQztRQUNoRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUc7UUFFN0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzNDLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLGFBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7Q0FDSixDQUFBO0FBNUNHO0lBREMsZUFBTSxFQUFFOzt3REFDTDtBQUZLLDJCQUEyQjtJQUR2QyxnQkFBTyxDQUFDLDRCQUE0QixDQUFDO0dBQ3pCLDJCQUEyQixDQThDdkM7QUE5Q1ksa0VBQTJCIn0=