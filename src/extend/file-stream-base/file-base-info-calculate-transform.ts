import {Transform} from 'stream';
import {createHash} from 'crypto';
import {IApplicationContext, providerWrapper} from 'midway';

class FileBaseInfoCalculateTransform extends Transform {
    fileSize = 0;
    hashAlgorithm;
    hashAlgorithmEncoding: string;
    hashAlgorithmValue: string;

    constructor(algorithm = 'sha1', encoding = 'hex') {
        super();
        this.hashAlgorithmEncoding = encoding;
        this.hashAlgorithm = createHash(algorithm);
    }

    _transform(chunk, encoding, callback) {
        this.fileSize += chunk.length;
        this.hashAlgorithm.update(chunk)
        this.push(chunk, encoding);
        this.emit('fileSize', this.fileSize);
        callback();
    }

    _final(callback) {
        this.hashAlgorithmValue = this.hashAlgorithm.digest(this.hashAlgorithmEncoding);
        callback();
    }
}

export function fileBaseInfoCalculateTransform(context: IApplicationContext) {
    return (algorithm = 'sha1', encoding = 'hex'): FileBaseInfoCalculateTransform => {
        return new FileBaseInfoCalculateTransform(algorithm, encoding);
    };
}

providerWrapper([{
    id: 'fileBaseInfoCalculateTransform',
    provider: fileBaseInfoCalculateTransform,
}])
