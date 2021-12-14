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
exports.ObjectCustomPropertyValidator = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
/**
 * http://json-schema.org/understanding-json-schema/
 */
let ObjectCustomPropertyValidator = class ObjectCustomPropertyValidator extends egg_freelog_base_1.CommonJsonSchema {
    /**
     * 资源自定义属性格式校验
     * @param {object[]} operations 依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations) {
        return super.validate(operations, this.schemas['/customPropertySchema']);
    }
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators() {
        super.addSchema({
            id: '/customPropertySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 30,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    remark: { type: 'string', required: true, minLength: 0, maxLength: 50 },
                    key: {
                        type: 'string', required: true, minLength: 1, maxLength: 15,
                        pattern: '^[a-zA-Z0-9_]{1,20}$'
                    },
                    defaultValue: {
                        // 考虑到UI文本框输入,目前限定为字符串.后期可能修改为any
                        type: 'string', required: true, minLength: 0, maxLength: 140
                    },
                    type: {
                        type: 'string',
                        required: true,
                        enum: ['editableText', 'readonlyText', 'radio', 'checkbox', 'select']
                    },
                    candidateItems: {
                        type: 'array',
                        required: false,
                        uniqueItems: true,
                        maxItems: 30,
                        items: {
                            type: 'string', minLength: 1, maxLength: 500, required: true,
                        }
                    }
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
], ObjectCustomPropertyValidator.prototype, "registerValidators", null);
ObjectCustomPropertyValidator = __decorate([
    midway_1.provide(),
    midway_1.scope('Singleton')
], ObjectCustomPropertyValidator);
exports.ObjectCustomPropertyValidator = ObjectCustomPropertyValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LWN1c3RvbS1wcm9wZXJ0eS12YWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL2pzb24tc2NoZW1hL29iamVjdC1jdXN0b20tcHJvcGVydHktdmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE0QztBQUU1Qyx1REFBdUU7QUFFdkU7O0dBRUc7QUFHSCxJQUFhLDZCQUE2QixHQUExQyxNQUFhLDZCQUE4QixTQUFRLG1DQUFnQjtJQUUvRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLFVBQW9CO1FBQ3pCLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVEOzs7T0FHRztJQUVILGtCQUFrQjtRQUNkLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDWixFQUFFLEVBQUUsdUJBQXVCO1lBQzNCLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLElBQUk7WUFDakIsUUFBUSxFQUFFLEVBQUU7WUFDWixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLElBQUk7Z0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsVUFBVSxFQUFFO29CQUNSLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUM7b0JBQ3JFLEdBQUcsRUFBRTt3QkFDRCxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTt3QkFDM0QsT0FBTyxFQUFFLHNCQUFzQjtxQkFDbEM7b0JBQ0QsWUFBWSxFQUFFO3dCQUNWLGlDQUFpQzt3QkFDakMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUc7cUJBQy9EO29CQUNELElBQUksRUFBRTt3QkFDRixJQUFJLEVBQUUsUUFBUTt3QkFDZCxRQUFRLEVBQUUsSUFBSTt3QkFDZCxJQUFJLEVBQUUsQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDO3FCQUN4RTtvQkFDRCxjQUFjLEVBQUU7d0JBQ1osSUFBSSxFQUFFLE9BQU87d0JBQ2IsUUFBUSxFQUFFLEtBQUs7d0JBQ2YsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLFFBQVEsRUFBRSxFQUFFO3dCQUNaLEtBQUssRUFBRTs0QkFDSCxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSTt5QkFDL0Q7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBdENHO0lBREMsYUFBSSxFQUFFOzs7O3VFQXNDTjtBQXJEUSw2QkFBNkI7SUFGekMsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxXQUFXLENBQUM7R0FDTiw2QkFBNkIsQ0FzRHpDO0FBdERZLHNFQUE2QiJ9