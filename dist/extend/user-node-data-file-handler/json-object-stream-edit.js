"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function jsonObjectReplaceTransformStream(context) {
    return (objectOperations = [], options = {}) => {
        return new JsonObjectReplaceTransformStream(objectOperations, options);
    };
}
exports.jsonObjectReplaceTransformStream = jsonObjectReplaceTransformStream;
midway_1.providerWrapper([{
        id: 'jsonObjectReplaceTransformStream',
        provider: jsonObjectReplaceTransformStream,
    }]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1vYmplY3Qtc3RyZWFtLWVkaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3VzZXItbm9kZS1kYXRhLWZpbGUtaGFuZGxlci9qc29uLW9iamVjdC1zdHJlYW0tZWRpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE0RDtBQUM1RCx1RUFBa0c7QUFFbEcsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7QUFFL0QsTUFBTSxnQ0FBaUMsU0FBUSxVQUFVO0lBTXJELFlBQVksbUJBQTBDLEVBQUUsRUFBRSxPQUFPLEdBQUcsRUFBRTtRQUNsRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFMbkIsNEJBQXVCLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLHdCQUFtQixHQUFHLEVBQUUsQ0FBQztRQUN6QixxQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFJbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUEwQyxFQUFFLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFDbEUsT0FBTyxJQUFJLGdDQUFnQyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxPQUFPLENBQUMsZ0JBQXVDO1FBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxzQ0FBc0M7UUFDdEQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssOENBQTJCLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BILElBQUksQ0FBQyxtQkFBbUIsR0FBRyxnQkFBZ0IsQ0FB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