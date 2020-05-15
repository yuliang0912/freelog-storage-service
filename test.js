const {Transform} = require('stream');

const {stringer} = require('stream-json/Stringer');
const {parser} = require('stream-json');
const {chain} = require('stream-chain');
const {pick} = require('stream-json/filters/Pick');
const {ignore} = require('stream-json/filters/Ignore');
const fs = require('fs');
const {streamObject} = require('stream-json/streamers/StreamObject');

const StreamBase = require('stream-json/streamers/StreamBase');

class ReplaceTransformStream extends StreamBase {

    constructor(options) {
        super(options);
        this.count = 0;
    }

    static make(options) {
        return new ReplaceTransformStream(options)
    }

    _transform(chunk, encoding, callback) {
        if (this.count++ === 0) {
            this.push(`{`);
            this.push(`"${chunk.key}":${JSON.stringify(chunk.value)}`)
        } else {
            this.push(`,"${chunk.key}":${JSON.stringify(chunk.value)}`)
        }
        callback()
    }

    _flush(callback) {
        this.push(`}`);
        callback()
    }
}


function main() {
    const fileStream = fs.createReadStream('D:\\工作\\package.json')
    const sObject = fileStream.pipe(parser()).pipe(streamObject())

    const replace = sObject.pipe(ReplaceTransformStream.make());

    replace.pipe(fs.createWriteStream('D:\\工作\\test.txt'))

    //sObject.on('data', console.log)
}

main()

