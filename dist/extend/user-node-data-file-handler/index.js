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
const stream_json_1 = require("stream-json");
const midway_1 = require("midway");
const StreamObject_1 = require("stream-json/streamers/StreamObject");
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
        return readableStream.pipe(stream_json_1.parser()).pipe(StreamObject_1.streamObject()).pipe(this.jsonObjectPickTransformStream(fields));
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
exports.UserNodeDataFileOperation = UserNodeDataFileOperation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3VzZXItbm9kZS1kYXRhLWZpbGUtaGFuZGxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLDZDQUFtQztBQUNuQyxtQ0FBOEM7QUFDOUMscUVBQWdFO0FBS2hFLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBU2xDOzs7OztPQUtHO0lBQ0gsSUFBSSxDQUFDLGNBQXdCLEVBQUUsTUFBZ0I7UUFDM0MsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDM0IsT0FBTyxjQUFjLENBQUM7U0FDekI7UUFDRCxPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsb0JBQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLDJCQUFZLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMvRyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxJQUFJLENBQUMsY0FBd0IsRUFBRSxVQUFpQztRQUM1RCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNuQyxPQUFPLGNBQWMsQ0FBQztTQUN6QjtRQUNELE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxvQkFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQVksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ3RILENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUFDLGNBQXdCO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDSixDQUFBO0FBeENHO0lBREMsZUFBTSxFQUFFOztzRUFDMkQ7QUFFcEU7SUFEQyxlQUFNLEVBQUU7O2dGQUN3RTtBQUVqRjtJQURDLGVBQU0sRUFBRTs7bUZBQzhGO0FBUDlGLHlCQUF5QjtJQUZyQyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMsMkJBQTJCLENBQUM7R0FDeEIseUJBQXlCLENBMkNyQztBQTNDWSw4REFBeUIifQ==