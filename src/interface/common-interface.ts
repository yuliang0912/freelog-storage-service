import {ValidatorResult} from 'jsonschema';

export interface NodeInfo {
    nodeId: number;
    nodeName: string;
    nodeDomain: string;
}

export enum JsonObjectOperationTypeEnum {
    SetOrReplace = 'SetOrReplace',
    Remove = 'Remove'
}

export interface JsonObjectOperation {
    key: string;
    type: JsonObjectOperationTypeEnum;
    value?: string | number | null | object | [];
    isExecute?: boolean;
}

export interface IJsonSchemaValidate {
    validate(instance: [] | object): ValidatorResult;
}
