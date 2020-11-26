import {validRange} from 'semver';
import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import {IJsonSchemaValidate, CommonJsonSchema} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export class ObjectDependencyValidator extends CommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 用户节点数据操作校验
     * @param operations
     * @returns {ValidatorResult}
     */
    validate(operations): ValidatorResult {
        return super.validate(operations, this.schemas['/resourceDependencySchema']);
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
                }
            }
        });
    }
}
