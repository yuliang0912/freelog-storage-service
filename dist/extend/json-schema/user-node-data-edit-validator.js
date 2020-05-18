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
const midway_1 = require("midway");
const freelogCommonJsonSchema = require("egg-freelog-base/app/extend/json-schema/common-json-schema");
let UserNodeDataEditValidator = class UserNodeDataEditValidator extends freelogCommonJsonSchema {
    /**
     * 用户节点数据操作校验
     * @param operations
     * @returns {ValidatorResult}
     */
    validate(operations) {
        return super.validate(operations, super.getSchema('/keyValuePairArraySchema'));
    }
    /**
     * 注册所有的校验
     * @private
     */
    __registerValidators__() {
        super.addSchema({
            id: '/keyValuePairArraySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 50,
            items: { $ref: '/keyValuePairSchema' }
        });
        super.addSchema({
            id: '/keyValuePairSchema',
            type: 'object',
            additionalProperties: false,
            properties: {
                field: { required: true, type: 'string' },
                value: { required: true, type: 'any' }
            }
        });
    }
};
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserNodeDataEditValidator.prototype, "__registerValidators__", null);
UserNodeDataEditValidator = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('userNodeDataEditValidator')
], UserNodeDataEditValidator);
exports.UserNodeDataEditValidator = UserNodeDataEditValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtZWRpdC12YWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL2pzb24tc2NoZW1hL3VzZXItbm9kZS1kYXRhLWVkaXQtdmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTRDO0FBRTVDLHNHQUFzRztBQUt0RyxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUEwQixTQUFRLHVCQUF1QjtJQUNsRTs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLFVBQVU7UUFDZixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFRDs7O09BR0c7SUFFSCxzQkFBc0I7UUFFbEIsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNaLEVBQUUsRUFBRSwwQkFBMEI7WUFDOUIsSUFBSSxFQUFFLE9BQU87WUFDYixXQUFXLEVBQUUsSUFBSTtZQUNqQixRQUFRLEVBQUUsRUFBRTtZQUNaLEtBQUssRUFBRSxFQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBQztTQUN2QyxDQUFDLENBQUE7UUFFRixLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ1osRUFBRSxFQUFFLHFCQUFxQjtZQUN6QixJQUFJLEVBQUUsUUFBUTtZQUNkLG9CQUFvQixFQUFFLEtBQUs7WUFDM0IsVUFBVSxFQUFFO2dCQUNSLEtBQUssRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDdkMsS0FBSyxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2FBQ3ZDO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUFwQkc7SUFEQyxhQUFJLEVBQUU7Ozs7dUVBb0JOO0FBbENRLHlCQUF5QjtJQUZyQyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMsMkJBQTJCLENBQUM7R0FDeEIseUJBQXlCLENBbUNyQztBQW5DWSw4REFBeUIifQ==