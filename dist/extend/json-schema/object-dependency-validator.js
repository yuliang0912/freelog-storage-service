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
exports.ObjectDependencyValidator = void 0;
const semver_1 = require("semver");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
let ObjectDependencyValidator = class ObjectDependencyValidator extends egg_freelog_base_1.CommonJsonSchema {
    /**
     * 用户节点数据操作校验
     * @param operations
     * @returns {ValidatorResult}
     */
    validate(operations) {
        return super.validate(operations, this.schemas['/resourceDependencySchema']);
    }
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators() {
        super.registerCustomFormats('versionRange', (input) => {
            input = input.trim();
            return semver_1.validRange(input);
        });
        super.addSchema({
            id: '/resourceDependencySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 100,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    name: { type: 'string', required: true },
                    type: { type: 'string', required: true, enum: ['resource', 'object'] },
                    versionRange: { type: 'string', required: false, format: 'versionRange' },
                }
            }
        });
    }
};
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ObjectDependencyValidator.prototype, "registerValidators", null);
ObjectDependencyValidator = __decorate([
    midway_1.provide(),
    midway_1.scope('Singleton')
], ObjectDependencyValidator);
exports.ObjectDependencyValidator = ObjectDependencyValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LWRlcGVuZGVuY3ktdmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9qc29uLXNjaGVtYS9vYmplY3QtZGVwZW5kZW5jeS12YWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWtDO0FBQ2xDLG1DQUE0QztBQUU1Qyx1REFBdUU7QUFJdkUsSUFBYSx5QkFBeUIsR0FBdEMsTUFBYSx5QkFBMEIsU0FBUSxtQ0FBZ0I7SUFDM0Q7Ozs7T0FJRztJQUNILFFBQVEsQ0FBQyxVQUFVO1FBQ2YsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsa0JBQWtCO1FBRWQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ2xELEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckIsT0FBTyxtQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNaLEVBQUUsRUFBRSwyQkFBMkI7WUFDL0IsSUFBSSxFQUFFLE9BQU87WUFDYixXQUFXLEVBQUUsSUFBSTtZQUNqQixRQUFRLEVBQUUsR0FBRztZQUNiLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxvQkFBb0IsRUFBRSxLQUFLO2dCQUMzQixVQUFVLEVBQUU7b0JBQ1IsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO29CQUN0QyxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFDO29CQUNwRSxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBQztpQkFDMUU7YUFDSjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBeEJHO0lBREMsYUFBSSxFQUFFOzs7O21FQXdCTjtBQXRDUSx5QkFBeUI7SUFGckMsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxXQUFXLENBQUM7R0FDTix5QkFBeUIsQ0F1Q3JDO0FBdkNZLDhEQUF5QiJ9