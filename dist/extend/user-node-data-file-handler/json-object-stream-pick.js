"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1vYmplY3Qtc3RyZWFtLXBpY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3VzZXItbm9kZS1kYXRhLWZpbGUtaGFuZGxlci9qc29uLW9iamVjdC1zdHJlYW0tcGljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9DQUFvQztBQUNwQyxtQ0FBNEQ7QUFFNUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7QUFFL0QsTUFBTSw2QkFBOEIsU0FBUSxVQUFVO0lBQ2xELFlBQVksVUFBb0IsRUFBRSxPQUFPLEdBQUcsRUFBRTtRQUMxQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxvQ0FBb0M7SUFDeEQsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVE7UUFDaEMsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNqRSxPQUFPLFFBQVEsRUFBRSxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzlEO2FBQU07WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDL0Q7UUFDRCxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUTtRQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZixRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7Q0FDSjtBQUVELFNBQWdCLDZCQUE2QixDQUFDLE9BQTRCO0lBQ3RFLE9BQU8sQ0FBQyxVQUFvQixFQUFFLE9BQU8sR0FBRyxFQUFFLEVBQWlDLEVBQUU7UUFDekUsT0FBTyxJQUFJLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRSxDQUFDLENBQUM7QUFDTixDQUFDO0FBSkQsc0VBSUM7QUFFRCx3QkFBZSxDQUFDLENBQUM7UUFDYixFQUFFLEVBQUUsK0JBQStCO1FBQ25DLFFBQVEsRUFBRSw2QkFBNkI7S0FDMUMsQ0FBQyxDQUFDLENBQUEifQ==