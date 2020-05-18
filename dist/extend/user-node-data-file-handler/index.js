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
    return UserNodeDataFileOperation;
})();
exports.UserNodeDataFileOperation = UserNodeDataFileOperation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3VzZXItbm9kZS1kYXRhLWZpbGUtaGFuZGxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSw2Q0FBbUM7QUFDbkMsbUNBQThDO0FBQzlDLHFFQUFnRTtBQUtoRTtJQUFBLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO1FBU2xDOzs7OztXQUtHO1FBQ0gsSUFBSSxDQUFDLGNBQXdCLEVBQUUsTUFBZ0I7WUFDM0MsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQzNCLE9BQU8sY0FBYyxDQUFDO2FBQ3pCO1lBQ0QsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLG9CQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQywyQkFBWSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDL0csQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsSUFBSSxDQUFDLGNBQXdCLEVBQUUsVUFBaUM7WUFDNUQsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7Z0JBQ25DLE9BQU8sY0FBYyxDQUFDO2FBQ3pCO1lBQ0QsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLG9CQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQywyQkFBWSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDdEgsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxlQUFlLENBQUMsY0FBd0I7WUFDcEMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEQsQ0FBQztLQUNKLENBQUE7SUF4Q0c7UUFEQyxlQUFNLEVBQUU7OzBFQUMyRDtJQUVwRTtRQURDLGVBQU0sRUFBRTs7b0ZBQ3dFO0lBRWpGO1FBREMsZUFBTSxFQUFFOzt1RkFDOEY7SUFQOUYseUJBQXlCO1FBRnJDLGNBQUssQ0FBQyxXQUFXLENBQUM7UUFDbEIsZ0JBQU8sQ0FBQywyQkFBMkIsQ0FBQztPQUN4Qix5QkFBeUIsQ0EyQ3JDO0lBQUQsZ0NBQUM7S0FBQTtBQTNDWSw4REFBeUIifQ==