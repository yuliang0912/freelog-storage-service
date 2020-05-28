import {Readable, Transform} from 'stream';
import {parser} from 'stream-json';
import {provide, inject, scope} from 'midway';
import {streamObject} from 'stream-json/streamers/StreamObject';
import {JsonObjectOperation} from '../../interface/common-interface';
const sendToWormhole = require('stream-wormhole');
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
        const streamToObject = streamObject();
        const streamToJsonParse = parser();
        const jsonObjectPick = this.jsonObjectPickTransformStream(fields);
        [streamToObject, streamToJsonParse, jsonObjectPick].forEach(item => {
            item.once('error', (error) => {
                transform.emit('error', error);
                sendToWormhole(streamToObject);
                sendToWormhole(readableStream);
                sendToWormhole(jsonObjectPick);
                sendToWormhole(streamToJsonParse);
            });
        });
        const transform = readableStream.pipe(streamToJsonParse).pipe(streamToObject).pipe(jsonObjectPick);
        return transform;
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
