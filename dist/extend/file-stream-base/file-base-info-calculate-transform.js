"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileBaseInfoCalculateTransform = void 0;
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
        this.emit('fileSize', this.fileSize);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1iYXNlLWluZm8tY2FsY3VsYXRlLXRyYW5zZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvZmlsZS1zdHJlYW0tYmFzZS9maWxlLWJhc2UtaW5mby1jYWxjdWxhdGUtdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFpQztBQUNqQyxtQ0FBa0M7QUFDbEMsbUNBQTREO0FBRTVELE1BQU0sOEJBQStCLFNBQVEsa0JBQVM7SUFNbEQsWUFBWSxTQUFTLEdBQUcsTUFBTSxFQUFFLFFBQVEsR0FBRyxLQUFLO1FBQzVDLEtBQUssRUFBRSxDQUFDO1FBTlosYUFBUSxHQUFHLENBQUMsQ0FBQztRQU9ULElBQUksQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLENBQUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxtQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxVQUFVLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRO1FBQ2hDLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVE7UUFDWCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDaEYsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0NBQ0o7QUFFRCxTQUFnQiw4QkFBOEIsQ0FBQyxPQUE0QjtJQUN2RSxPQUFPLENBQUMsU0FBUyxHQUFHLE1BQU0sRUFBRSxRQUFRLEdBQUcsS0FBSyxFQUFrQyxFQUFFO1FBQzVFLE9BQU8sSUFBSSw4QkFBOEIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbkUsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUpELHdFQUlDO0FBRUQsd0JBQWUsQ0FBQyxDQUFDO1FBQ2IsRUFBRSxFQUFFLGdDQUFnQztRQUNwQyxRQUFRLEVBQUUsOEJBQThCO0tBQzNDLENBQUMsQ0FBQyxDQUFBIn0=