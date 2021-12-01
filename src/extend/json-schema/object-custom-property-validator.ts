import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import {IJsonSchemaValidate, CommonJsonSchema} from 'egg-freelog-base';

/**
 * http://json-schema.org/understanding-json-schema/
 */
@provide()
@scope('Singleton')
export class ObjectCustomPropertyValidator extends CommonJsonSchema implements IJsonSchemaValidate {

    /**
     * 资源自定义属性格式校验
     * @param {object[]} operations 依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations: object[]): ValidatorResult {
        return super.validate(operations, this.schemas['/customPropertySchema']);
    }

    /**
     * 注册所有的校验
     * @private
     */
    @init()
    registerValidators() {
        super.addSchema({
            id: '/customPropertySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 30, // 最多允许填写30个自定义字段
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    remark: {type: 'string', required: true, minLength: 0, maxLength: 50},
                    key: {
                        type: 'string', required: true, minLength: 1, maxLength: 15,
                        pattern: '^[a-zA-Z0-9_]{1,20}$'
                    },
                    defaultValue: {
                        // 考虑到UI文本框输入,目前限定为字符串.后期可能修改为any
                        type: 'string', required: true, minLength: 0, maxLength: 30
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
}
