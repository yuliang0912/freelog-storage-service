/// <reference types="node" />
import { Readable, Transform } from 'stream';
import { JsonObjectOperation } from '../../interface/common-interface';
export declare class UserNodeDataFileOperation {
    jsonFileStreamCheck: (readableStream: Readable) => Promise<boolean>;
    jsonObjectPickTransformStream: (pickFields: string[], options?: {}) => Transform;
    jsonObjectReplaceTransformStream: (objectOperations: JsonObjectOperation[], options?: {}) => Transform;
    /**
     * 从jsonFileStream中提取指定的json
     * @param {module:stream.internal.Readable} readableStream
     * @param {string[]} fields
     * @returns {Promise<void>}
     */
    pick(readableStream: Readable, fields: string[]): Readable | Transform;
    /**
     * 编辑json对象,返回转换之后的文件流
     * @param {module:stream.internal.Readable} readableStream
     * @param {JsonObjectOperation[]} operations
     * @returns {module:stream.internal.Transform}
     */
    edit(readableStream: Readable, operations: JsonObjectOperation[]): Readable | Transform;
    /**
     * 检查json对象
     * @param {module:stream.internal.Readable} readableStream
     * @returns {Promise<boolean>}
     */
    checkJsonObject(readableStream: Readable): Promise<boolean>;
}
