"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonObjectReplaceTransformStream = void 0;
const midway_1 = require("midway");
const common_interface_1 = require("../../interface/common-interface");
const StreamBase = require('stream-json/streamers/StreamBase');
class JsonObjectReplaceTransformStream extends StreamBase {
    constructor(objectOperations = [], options = {}) {
        super(options);
        this.alreadyWriteObjectCount = 0;
        this.replaceOrAddObjects = [];
        this.removeObjectKeys = [];
        this.initial(objectOperations);
    }
    static make(objectOperations = [], options = {}) {
        return new JsonObjectReplaceTransformStream(objectOperations, options);
    }
    initial(objectOperations) {
        this.push(`{`); // 防止一个object-key也不存在时,也可以正常生成空的json文件
        this.removeObjectKeys = objectOperations.filter(x => x.type === common_interface_1.JsonObjectOperationTypeEnum.Remove).map(x => x.key);
        this.replaceOrAddObjects = objectOperations.filter(x => x.type === common_interface_1.JsonObjectOperationTypeEnum.AppendOrReplace).map(x => Object({
            key: x.key,
            value: x.value
        }));
    }
    transformObjectToJSONString(chunk) {
        if (this.alreadyWriteObjectCount++ === 0) {
            this.push(`"${chunk.key}":${JSON.stringify(chunk.value)}`);
        }
        else {
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
        this.transformObjectToJSONString({ key: chunk.key, value: chunk.value });
        callback();
    }
    _flush(callback) {
        this.replaceOrAddObjects.filter(x => !x.isExecute).forEach(addObject => {
            this.transformObjectToJSONString({ key: addObject.key, value: addObject.value });
        });
        this.push(`}`);
        callback();
    }
}
function jsonObjectReplaceTransformStream(_context) {
    return (objectOperations = [], options = {}) => {
        return new JsonObjectReplaceTransformStream(objectOperations, options);
    };
}
exports.jsonObjectReplaceTransformStream = jsonObjectReplaceTransformStream;
midway_1.providerWrapper([{
        id: 'jsonObjectReplaceTransformStream',
        provider: jsonObjectReplaceTransformStream,
    }]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1vYmplY3Qtc3RyZWFtLWVkaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3VzZXItbm9kZS1kYXRhLWZpbGUtaGFuZGxlci9qc29uLW9iamVjdC1zdHJlYW0tZWRpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBNEQ7QUFDNUQsdUVBQWtHO0FBRWxHLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0FBRS9ELE1BQU0sZ0NBQWlDLFNBQVEsVUFBVTtJQU1yRCxZQUFZLG1CQUEwQyxFQUFFLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFDbEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBTG5CLDRCQUF1QixHQUFHLENBQUMsQ0FBQztRQUM1Qix3QkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDekIscUJBQWdCLEdBQUcsRUFBRSxDQUFDO1FBSWxCLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBMEMsRUFBRSxFQUFFLE9BQU8sR0FBRyxFQUFFO1FBQ2xFLE9BQU8sSUFBSSxnQ0FBZ0MsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsT0FBTyxDQUFDLGdCQUF1QztRQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsc0NBQXNDO1FBQ3RELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLDhDQUEyQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwSCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsZ0JBQWdCLENB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