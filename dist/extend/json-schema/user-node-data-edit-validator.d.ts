import { ValidatorResult } from 'jsonschema';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';
import { IJsonSchemaValidate } from '../../interface/common-interface';
export declare class UserNodeDataEditValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 用户节点数据操作校验
     * @param operations
     * @returns {ValidatorResult}
     */
    validate(operations: any): ValidatorResult;
    /**
     * 注册所有的校验
     * @private
     */
    __registerValidators__(): void;
}
