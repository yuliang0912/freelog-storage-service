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
exports.UserNodeDataEditValidator = void 0;
const midway_1 = require("midway");
const freelogCommonJsonSchema = require("egg-freelog-base/app/extend/json-schema/common-json-schema");
let UserNodeDataEditValidator = /** @class */ (() => {
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
    return UserNodeDataEditValidator;
})();
exports.UserNodeDataEditValidator = UserNodeDataEditValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub2RlLWRhdGEtZWRpdC12YWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL2pzb24tc2NoZW1hL3VzZXItbm9kZS1kYXRhLWVkaXQtdmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE0QztBQUU1QyxzR0FBc0c7QUFLdEc7SUFBQSxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUEwQixTQUFRLHVCQUF1QjtRQUNsRTs7OztXQUlHO1FBQ0gsUUFBUSxDQUFDLFVBQVU7WUFDZixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1FBQ25GLENBQUM7UUFFRDs7O1dBR0c7UUFFSCxzQkFBc0I7WUFFbEIsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDWixFQUFFLEVBQUUsMEJBQTBCO2dCQUM5QixJQUFJLEVBQUUsT0FBTztnQkFDYixXQUFXLEVBQUUsSUFBSTtnQkFDakIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2FBQ3ZDLENBQUMsQ0FBQTtZQUVGLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ1osRUFBRSxFQUFFLHFCQUFxQjtnQkFDekIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsVUFBVSxFQUFFO29CQUNSLEtBQUssRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztvQkFDdkMsS0FBSyxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2lCQUN2QzthQUNKLENBQUMsQ0FBQztRQUNQLENBQUM7S0FDSixDQUFBO0lBcEJHO1FBREMsYUFBSSxFQUFFOzs7OzJFQW9CTjtJQWxDUSx5QkFBeUI7UUFGckMsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLDJCQUEyQixDQUFDO09BQ3hCLHlCQUF5QixDQW1DckM7SUFBRCxnQ0FBQztLQUFBO0FBbkNZLDhEQUF5QiJ9