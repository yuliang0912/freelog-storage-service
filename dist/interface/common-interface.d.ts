import { ValidatorResult } from 'jsonschema';
export interface NodeInfo {
    nodeId: number;
    nodeName: string;
    nodeDomain: string;
}
export declare enum JsonObjectOperationTypeEnum {
    AppendOrReplace = "AppendOrReplace",
    Remove = "Remove"
}
/**
 * 针对json文件流的编辑操作
 */
export interface JsonObjectOperation {
    key: string;
    type: JsonObjectOperationTypeEnum;
    value?: string | number | null | object | [];
    isExecute?: boolean;
}
/**
 * 针对object做校验的基础接口
 */
export interface IJsonSchemaValidate {
    validate(instance: [] | object): ValidatorResult;
}
