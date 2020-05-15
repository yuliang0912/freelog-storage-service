import {Readable, Transform} from 'stream';
import {parser} from 'stream-json';
import {provide, inject, scope} from 'midway';
import {streamObject} from 'stream-json/streamers/StreamObject';
import {JsonObjectOperation} from '../../interface/common-interface';

@scope('Singleton')
@provide('userNodeDataFileOperation')
export class UserNodeDataFileOperation {

    @inject()
    jsonFileStreamCheck: (readableStream: Readable) => Promise<boolean>;
    @inject()
    jsonObjectPickTransformStream: (pickFields: string[], options?: {}) => Transform;
    @inject()
    jsonObjectReplaceTransformStream: (objectOperations: JsonObjectOperation[], options?: {}) => Transform;

    /**
     * 从jsonFileStream中提取指定的json
     * @param {module:stream.internal.Readable} readableStream
     * @param {string[]} fields
     * @returns {Promise<void>}
     */
    pick(readableStream: Readable, fields: string[]): Readable | Transform {
        if (!fields || !fields.length) {
            return readableStream;
        }
        return readableStream.pipe(parser()).pipe(streamObject()).pipe(this.jsonObjectPickTransformStream(fields));
    }

    /**
     * 编辑json对象,返回转换之后的文件流
     * @param {module:stream.internal.Readable} readableStream
     * @param {JsonObjectOperation[]} operations
     * @returns {module:stream.internal.Transform}
     */
    edit(readableStream: Readable, operations: JsonObjectOperation[]): Readable | Transform {
        if (!operations || !operations.length) {
            return readableStream;
        }
        return readableStream.pipe(parser()).pipe(streamObject()).pipe(this.jsonObjectReplaceTransformStream(operations));
    }

    /**
     * 检查json对象
     * @param {module:stream.internal.Readable} readableStream
     * @returns {Promise<boolean>}
     */
    checkJsonObject(readableStream: Readable): Promise<boolean> {
        return this.jsonFileStreamCheck(readableStream);
    }
}
