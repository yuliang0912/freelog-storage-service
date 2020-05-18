"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const crypto_1 = require("crypto");
const midway_1 = require("midway");
class FileBaseInfoCalculateTransform extends stream_1.Transform {
    constructor(algorithm = 'sha1', encoding = 'hex') {
        super();
        this.fileSize = 0;
        this.hashAlgorithmEncoding = encoding;
        this.hashAlgorithm = crypto_1.createHash(algorithm);
    }
    _transform(chunk, encoding, callback) {
        this.fileSize += chunk.length;
        this.hashAlgorithm.update(chunk);
        this.push(chunk, encoding);
        callback();
    }
    _final(callback) {
        this.hashAlgorithmValue = this.hashAlgorithm.digest(this.hashAlgorithmEncoding);
        callback();
    }
}
function fileBaseInfoCalculateTransform(context) {
    return (algorithm = 'sha1', encoding = 'hex') => {
        return new FileBaseInfoCalculateTransform(algorithm, encoding);
    };
}
exports.fileBaseInfoCalculateTransform = fileBaseInfoCalculateTransform;
midway_1.providerWrapper([{
        id: 'fileBaseInfoCalculateTransform',
        provider: fileBaseInfoCalculateTransform,
    }]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1iYXNlLWluZm8tY2FsY3VsYXRlLXRyYW5zZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvZmlsZS1zdHJlYW0tYmFzZS9maWxlLWJhc2UtaW5mby1jYWxjdWxhdGUtdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQWlDO0FBQ2pDLG1DQUFrQztBQUNsQyxtQ0FBNEQ7QUFFNUQsTUFBTSw4QkFBK0IsU0FBUSxrQkFBUztJQU1sRCxZQUFZLFNBQVMsR0FBRyxNQUFNLEVBQUUsUUFBUSxHQUFHLEtBQUs7UUFDNUMsS0FBSyxFQUFFLENBQUM7UUFOWixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBT1QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLFFBQVEsQ0FBQztRQUN0QyxJQUFJLENBQUMsYUFBYSxHQUFHLG1CQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVE7UUFDaEMsSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNCLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRO1FBQ1gsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2hGLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBRUQsU0FBZ0IsOEJBQThCLENBQUMsT0FBNEI7SUFDdkUsT0FBTyxDQUFDLFNBQVMsR0FBRyxNQUFNLEVBQUUsUUFBUSxHQUFHLEtBQUssRUFBa0MsRUFBRTtRQUM1RSxPQUFPLElBQUksOEJBQThCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ25FLENBQUMsQ0FBQztBQUNOLENBQUM7QUFKRCx3RUFJQztBQUVELHdCQUFlLENBQUMsQ0FBQztRQUNiLEVBQUUsRUFBRSxnQ0FBZ0M7UUFDcEMsUUFBUSxFQUFFLDhCQUE4QjtLQUMzQyxDQUFDLENBQUMsQ0FBQSJ9