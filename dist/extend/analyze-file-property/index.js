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
let FilePropertyAnalyzerHandler = /** @class */ (() => {
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
    return FilePropertyAnalyzerHandler;
})();
exports.FilePropertyAnalyzerHandler = FilePropertyAnalyzerHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL2FuYWx5emUtZmlsZS1wcm9wZXJ0eS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsMENBQTBDO0FBQzFDLHVEQUFrRDtBQUNsRCxtQ0FBNEI7QUFHNUI7SUFBQSxJQUFhLDJCQUEyQixHQUF4QyxNQUFhLDJCQUEyQjtRQUF4QztZQUlhLDhCQUF5QixHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQTRDdkcsQ0FBQztRQTFDRyxJQUFJLDJCQUEyQjtZQUMzQixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCxLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLFlBQW9CO1lBQy9DLFlBQVksR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDMUMsTUFBTSxNQUFNLEdBQVEsRUFBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQzFELE9BQU8sTUFBTSxDQUFDO2FBQ2pCO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqRSxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO2dCQUMvQixNQUFNLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ1gsTUFBTSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7Z0JBQ3pCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLFlBQVksY0FBYyxDQUFDO1lBQ2hELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUc7WUFFN0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMxQyxNQUFNLElBQUksbUNBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1lBQzlFLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxhQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM3RCxDQUFDO0tBQ0osQ0FBQTtJQTlDRztRQURDLGVBQU0sRUFBRTs7NERBQ0w7SUFGSywyQkFBMkI7UUFEdkMsZ0JBQU8sQ0FBQyw0QkFBNEIsQ0FBQztPQUN6QiwyQkFBMkIsQ0FnRHZDO0lBQUQsa0NBQUM7S0FBQTtBQWhEWSxrRUFBMkIifQ==