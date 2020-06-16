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
     * @param {string} resourceType
     * @returns {Promise<{fileProperty: any; analyzeStatus: number; error: object}>}
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
     * @param src, URL or readable stream
     * @returns {Promise<object>}
     */
    async _imageFileAnalyzeHandle(src) {
        const result = await probe(src).catch(error => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL2FuYWx5emUtZmlsZS1wcm9wZXJ0eS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsMENBQTBDO0FBQzFDLHVEQUFrRDtBQUNsRCxtQ0FBNEI7QUFHNUIsSUFBYSwyQkFBMkIsR0FBeEMsTUFBYSwyQkFBMkI7SUFBeEM7UUFJYSw4QkFBeUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUE0Q3ZHLENBQUM7SUExQ0csSUFBSSwyQkFBMkI7UUFDM0IsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxZQUFvQjtRQUMvQyxZQUFZLEdBQUcsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFDLE1BQU0sTUFBTSxHQUFRLEVBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzFELE9BQU8sTUFBTSxDQUFDO1NBQ2pCO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNqRSxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDL0IsTUFBTSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7WUFDL0IsTUFBTSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1gsTUFBTSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUE7UUFDRixNQUFNLENBQUMsUUFBUSxHQUFHLEdBQUcsWUFBWSxjQUFjLENBQUM7UUFDaEQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsdUJBQXVCLENBQUMsR0FBRztRQUU3QixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDMUMsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztRQUM5RSxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sYUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztDQUNKLENBQUE7QUE5Q0c7SUFEQyxlQUFNLEVBQUU7O3dEQUNMO0FBRkssMkJBQTJCO0lBRHZDLGdCQUFPLENBQUMsNEJBQTRCLENBQUM7R0FDekIsMkJBQTJCLENBZ0R2QztBQWhEWSxrRUFBMkIifQ==