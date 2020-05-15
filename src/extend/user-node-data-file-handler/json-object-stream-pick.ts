// import {Transform} from 'stream';
import {IApplicationContext, providerWrapper} from 'midway';

const StreamBase = require('stream-json/streamers/StreamBase');

class JsonObjectPickTransformStream extends StreamBase {
    constructor(pickFields: string[], options = {}) {
        super(options);
        this.alreadyWriteObjectCount = 0;
        this.pickFields = pickFields;
        this.push(`{`); // 防止无法获取object-key时,也可以正常生成空的json文件
    }

    _transform(chunk, encoding, callback) {
        if (chunk.key === undefined || !this.pickFields.includes(chunk.key)) {
            return callback();
        }
        if (this.alreadyWriteObjectCount++ === 0) {
            this.push(`"${chunk.key}":${JSON.stringify(chunk.value)}`);
        } else {
            this.push(`,"${chunk.key}":${JSON.stringify(chunk.value)}`);
        }
        callback();
    }

    _flush(callback) {
        this.push(`}`);
        callback();
    }
}

export function jsonObjectPickTransformStream(context: IApplicationContext) {
    return (pickFields: string[], options = {}): JsonObjectPickTransformStream => {
        return new JsonObjectPickTransformStream(pickFields, options);
    };
}

providerWrapper([{
    id: 'jsonObjectPickTransformStream',
    provider: jsonObjectPickTransformStream,
}])
