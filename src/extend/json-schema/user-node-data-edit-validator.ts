import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';
import {IJsonSchemaValidate} from '../../interface/common-interface';

@scope('Singleton')
@provide('userNodeDataEditValidator')
export class UserNodeDataEditValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 用户节点数据操作校验
     * @param operations
     * @returns {ValidatorResult}
     */
    validate(operations): ValidatorResult {
        return super.validate(operations, super.getSchema('/keyValuePairArraySchema'));
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
