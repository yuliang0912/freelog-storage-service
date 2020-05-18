import {IApplicationContext, providerWrapper} from 'midway';
import {JsonObjectOperationTypeEnum, JsonObjectOperation} from '../../interface/common-interface';

const StreamBase = require('stream-json/streamers/StreamBase');

class JsonObjectReplaceTransformStream extends StreamBase {

    alreadyWriteObjectCount = 0;
    replaceOrAddObjects = [];
    removeObjectKeys = [];

    constructor(objectOperations: JsonObjectOperation[] = [], options = {}) {
        super(options);
        this.initial(objectOperations);
    }

    static make(objectOperations: JsonObjectOperation[] = [], options = {}) {
        return new JsonObjectReplaceTransformStream(objectOperations, options);
    }

    initial(objectOperations: JsonObjectOperation[]) {
        this.push(`{`); // 防止一个object-key也不存在时,也可以正常生成空的json文件
        this.removeObjectKeys = objectOperations.filter(x => x.type === JsonObjectOperationTypeEnum.Remove).map(x => x.key);
        this.replaceOrAddObjects = objectOperations.filter(x => x.type === JsonObjectOperationTypeEnum.AppendOrReplace).map(x => Object({
            key: x.key,
            value: x.value
        }));
    }

    transformObjectToJSONString(chunk: { key: string, value: any }) {
        if (this.alreadyWriteObjectCount++ === 0) {
            this.push(`"${chunk.key}":${JSON.stringify(chunk.value)}`);
        } else {
            this.push(`,"${chunk.key}":${JSON.stringify(chunk.value)}`);
        }
    }

    _transform(chunk, encoding, callback) {
        if (chunk.key === null) {
            return callback(new Error('stream must be from stream-json-object'));
        }
        if (this.removeObjectKeys.includes(chunk.key)) {
            return callback();
        }
        const replaceOperation = this.replaceOrAddObjects.find(x => x.key === chunk.key);
        if (replaceOperation) {
            chunk.value = replaceOperation.value;
            replaceOperation.isExecute = true;
        }
        this.transformObjectToJSONString({key: chunk.key, value: chunk.value});
        callback();
    }

    _flush(callback) {
        this.replaceOrAddObjects.filter(x => !x.isExecute).forEach(addObject => {
            this.transformObjectToJSONString({key: addObject.key, value: addObject.value});
        });
        this.push(`}`);
        callback();
    }
}

export function jsonObjectReplaceTransformStream(context: IApplicationContext) {
    return (objectOperations: JsonObjectOperation[] = [], options = {}): JsonObjectReplaceTransformStream => {
        return new JsonObjectReplaceTransformStream(objectOperations, options);
    };
}

providerWrapper([{
    id: 'jsonObjectReplaceTransformStream',
    provider: jsonObjectReplaceTransformStream,
}])
