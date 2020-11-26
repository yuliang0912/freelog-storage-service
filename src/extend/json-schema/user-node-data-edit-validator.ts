import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import {IJsonSchemaValidate, CommonJsonSchema} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export class UserNodeDataEditValidator extends CommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 用户节点数据操作校验
     * @param operations
     * @returns {ValidatorResult}
     */
    validate(operations): ValidatorResult {
        return super.validate(operations, this.schemas['/keyValuePairArraySchema']);
    }

    /**
     * 注册所有的校验
     * @private
     */
    @init()
    __registerValidators__() {

        super.addSchema({
            id: '/keyValuePairArraySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 50,
            items: {$ref: '/keyValuePairSchema'}
        });

        super.addSchema({
            id: '/keyValuePairSchema',
            type: 'object',
            additionalProperties: false,
            properties: {
                field: {required: true, type: 'string'},
                value: {required: true, type: 'any'}
            }
        });
    }
}
