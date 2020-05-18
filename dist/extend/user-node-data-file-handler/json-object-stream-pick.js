"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonObjectPickTransformStream = void 0;
// import {Transform} from 'stream';
const midway_1 = require("midway");
const StreamBase = require('stream-json/streamers/StreamBase');
class JsonObjectPickTransformStream extends StreamBase {
    constructor(pickFields, options = {}) {
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
        }
        else {
            this.push(`,"${chunk.key}":${JSON.stringify(chunk.value)}`);
        }
        callback();
    }
    _flush(callback) {
        this.push(`}`);
        callback();
    }
}
function jsonObjectPickTransformStream(context) {
    return (pickFields, options = {}) => {
        return new JsonObjectPickTransformStream(pickFields, options);
    };
}
exports.jsonObjectPickTransformStream = jsonObjectPickTransformStream;
midway_1.providerWrapper([{
        id: 'jsonObjectPickTransformStream',
        provider: jsonObjectPickTransformStream,
    }]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1vYmplY3Qtc3RyZWFtLXBpY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3VzZXItbm9kZS1kYXRhLWZpbGUtaGFuZGxlci9qc29uLW9iamVjdC1zdHJlYW0tcGljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvQ0FBb0M7QUFDcEMsbUNBQTREO0FBRTVELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0FBRS9ELE1BQU0sNkJBQThCLFNBQVEsVUFBVTtJQUNsRCxZQUFZLFVBQW9CLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFDMUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLHVCQUF1QixHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsb0NBQW9DO0lBQ3hELENBQUM7SUFFRCxVQUFVLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRO1FBQ2hDLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDakUsT0FBTyxRQUFRLEVBQUUsQ0FBQztTQUNyQjtRQUNELElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM5RDthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQy9EO1FBQ0QsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVE7UUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0NBQ0o7QUFFRCxTQUFnQiw2QkFBNkIsQ0FBQyxPQUE0QjtJQUN0RSxPQUFPLENBQUMsVUFBb0IsRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFpQyxFQUFFO1FBQ3pFLE9BQU8sSUFBSSw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEUsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUpELHNFQUlDO0FBRUQsd0JBQWUsQ0FBQyxDQUFDO1FBQ2IsRUFBRSxFQUFFLCtCQUErQjtRQUNuQyxRQUFRLEVBQUUsNkJBQTZCO0tBQzFDLENBQUMsQ0FBQyxDQUFBIn0=