import { IApplicationContext } from 'midway';
import { JsonObjectOperation } from '../../interface/common-interface';
declare const StreamBase: any;
declare class JsonObjectReplaceTransformStream extends StreamBase {
    alreadyWriteObjectCount: number;
    replaceOrAddObjects: any[];
    removeObjectKeys: any[];
    constructor(objectOperations?: JsonObjectOperation[], options?: {});
    static make(objectOperations?: JsonObjectOperation[], options?: {}): JsonObjectReplaceTransformStream;
    initial(objectOperations: JsonObjectOperation[]): void;
    transformObjectToJSONString(chunk: {
        key: string;
        value: any;
    }): void;
    _transform(chunk: any, encoding: any, callback: any): any;
    _flush(callback: any): void;
}
export declare function jsonObjectReplaceTransformStream(_context: IApplicationContext): (objectOperations?: JsonObjectOperation[], options?: {}) => JsonObjectReplaceTransformStream;
export {};
