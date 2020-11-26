import { ValidatorResult } from 'jsonschema';
import { IJsonSchemaValidate, CommonJsonSchema } from 'egg-freelog-base';
export declare class ObjectDependencyValidator extends CommonJsonSchema implements IJsonSchemaValidate {
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
    registerValidators(): void;
}
