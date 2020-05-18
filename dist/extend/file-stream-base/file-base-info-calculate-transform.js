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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1iYXNlLWluZm8tY2FsY3VsYXRlLXRyYW5zZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvZmlsZS1zdHJlYW0tYmFzZS9maWxlLWJhc2UtaW5mby1jYWxjdWxhdGUtdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFpQztBQUNqQyxtQ0FBa0M7QUFDbEMsbUNBQTREO0FBRTVELE1BQU0sOEJBQStCLFNBQVEsa0JBQVM7SUFNbEQsWUFBWSxTQUFTLEdBQUcsTUFBTSxFQUFFLFFBQVEsR0FBRyxLQUFLO1FBQzVDLEtBQUssRUFBRSxDQUFDO1FBTlosYUFBUSxHQUFHLENBQUMsQ0FBQztRQU9ULElBQUksQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLENBQUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxtQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxVQUFVLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRO1FBQ2hDLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzQixRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUTtRQUNYLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNoRixRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7Q0FDSjtBQUVELFNBQWdCLDhCQUE4QixDQUFDLE9BQTRCO0lBQ3ZFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsTUFBTSxFQUFFLFFBQVEsR0FBRyxLQUFLLEVBQWtDLEVBQUU7UUFDNUUsT0FBTyxJQUFJLDhCQUE4QixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuRSxDQUFDLENBQUM7QUFDTixDQUFDO0FBSkQsd0VBSUM7QUFFRCx3QkFBZSxDQUFDLENBQUM7UUFDYixFQUFFLEVBQUUsZ0NBQWdDO1FBQ3BDLFFBQVEsRUFBRSw4QkFBOEI7S0FDM0MsQ0FBQyxDQUFDLENBQUEifQ==