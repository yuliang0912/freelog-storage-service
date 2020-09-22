import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';
import {IJsonSchemaValidate} from '../../interface/common-interface';
import {validRange} from 'semver';

@provide()
@scope('Singleton')
export class ObjectDependencyValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 用户节点数据操作校验
     * @param operations
     * @returns {ValidatorResult}
     */
    validate(operations): ValidatorResult {
        return super.validate(operations, super.getSchema('/resourceDependencySchema'));
    }

    /**
     * 注册所有的校验
     * @private
     */
    @init()
    registerValidators() {

        super.registerCustomFormats('versionRange', (input) => {
            input = input.trim();
            return validRange(input);
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
                    name: {type: 'string', required: true},
                    type: {type: 'string', required: true, enum: ['resource', 'object']},
                    versionRange: {type: 'string', required: false, format: 'versionRange'},
                    // versionRangeType: {type: 'integer', required: false, enum: [1, 2]}  // 1:选择 2:自定义
                }
            }
        });
    }
}
