"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNodeDataFileOperation = void 0;
const stream_json_1 = require("stream-json");
const midway_1 = require("midway");
const StreamObject_1 = require("stream-json/streamers/StreamObject");
const sendToWormhole = require('stream-wormhole');
let UserNodeDataFileOperation = /** @class */ (() => {
    let UserNodeDataFileOperation = class UserNodeDataFileOperation {
        /**
         * 从jsonFileStream中提取指定的json
         * @param {module:stream.internal.Readable} readableStream
         * @param {string[]} fields
         * @returns {Promise<void>}
         */
        pick(readableStream, fields) {
            if (!fields || !fields.length) {
                return readableStream;
            }
            const streamToObject = StreamObject_1.streamObject();
            const streamToJsonParse = stream_json_1.parser();
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
        edit(readableStream, operations) {
            if (!operations || !operations.length) {
                return readableStream;
            }
            return readableStream.pipe(stream_json_1.parser()).pipe(StreamObject_1.streamObject()).pipe(this.jsonObjectReplaceTransformStream(operations));
        }
        /**
         * 检查json对象
         * @param {module:stream.internal.Readable} readableStream
         * @returns {Promise<boolean>}
         */
        checkJsonObject(readableStream) {
            return this.jsonFileStreamCheck(readableStream);
        }
    };
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Function)
    ], UserNodeDataFileOperation.prototype, "jsonFileStreamCheck", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Function)
    ], UserNodeDataFileOperation.prototype, "jsonObjectPickTransformStream", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Function)
    ], UserNodeDataFileOperation.prototype, "jsonObjectReplaceTransformStream", void 0);
    UserNodeDataFileOperation = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('userNodeDataFileOperation')
    ], UserNodeDataFileOperation);
    return UserNodeDataFileOperation;
})();
exports.UserNodeDataFileOperation = UserNodeDataFileOperation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3VzZXItbm9kZS1kYXRhLWZpbGUtaGFuZGxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSw2Q0FBbUM7QUFDbkMsbUNBQThDO0FBQzlDLHFFQUFnRTtBQUVoRSxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUdsRDtJQUFBLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO1FBU2xDOzs7OztXQUtHO1FBQ0gsSUFBSSxDQUFDLGNBQXdCLEVBQUUsTUFBZ0I7WUFDM0MsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQzNCLE9BQU8sY0FBYyxDQUFDO2FBQ3pCO1lBQ0QsTUFBTSxjQUFjLEdBQUcsMkJBQVksRUFBRSxDQUFDO1lBQ3RDLE1BQU0saUJBQWlCLEdBQUcsb0JBQU0sRUFBRSxDQUFDO1lBQ25DLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRSxDQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQ3pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUMvQixjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQy9CLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDL0IsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUMvQixjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDdEMsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ25HLE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILElBQUksQ0FBQyxjQUF3QixFQUFFLFVBQWlDO1lBQzVELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO2dCQUNuQyxPQUFPLGNBQWMsQ0FBQzthQUN6QjtZQUNELE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxvQkFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQVksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3RILENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsZUFBZSxDQUFDLGNBQXdCO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FDSixDQUFBO0lBckRHO1FBREMsZUFBTSxFQUFFOzswRUFDMkQ7SUFFcEU7UUFEQyxlQUFNLEVBQUU7O29GQUN3RTtJQUVqRjtRQURDLGVBQU0sRUFBRTs7dUZBQzhGO0lBUDlGLHlCQUF5QjtRQUZyQyxjQUFLLENBQUMsV0FBVyxDQUFDO1FBQ2xCLGdCQUFPLENBQUMsMkJBQTJCLENBQUM7T0FDeEIseUJBQXlCLENBd0RyQztJQUFELGdDQUFDO0tBQUE7QUF4RFksOERBQXlCIn0=