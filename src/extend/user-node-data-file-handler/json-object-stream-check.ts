import {Readable} from 'stream';
import {IApplicationContext, providerWrapper} from 'midway';
import * as Verifier from 'stream-json/utils/Verifier';
import {ApplicationError} from 'egg-freelog-base/index';

const StreamArray = require('stream-json/streamers/StreamArray');

export function jsonFileStreamCheck(context: IApplicationContext) {
    const fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any = context.get('fileBaseInfoCalculateTransform');
    return (readableStream: Readable): Promise<boolean> => {
        const verifier = new Verifier();
        const streamArray = StreamArray.withParser();
        const baseInfo = fileBaseInfoCalculateTransform('sha1', 'hex');
        readableStream.pipe(baseInfo);
        readableStream.pipe(verifier);
        readableStream.pipe(streamArray);
        return new Promise((resolve, reject) => {
            verifier.on('error', () => {
                readableStream.destroy();
                reject(new ApplicationError('node data file is only support json-object'));
            });
            baseInfo.on('fileSize', (fileSize) => {
                if (fileSize <= 524288) {
                    return;
                }
                reject(new ApplicationError('node data file size limit: 512kb'));
            });
            // 只有解析到json文件流中包含数组,才会触发data事件
            streamArray.on('data', () => {
                readableStream.destroy();
                reject(new ApplicationError('node data file is only support json-object'));
            });
            // streamArray.on('error', (error) => reject(error)).on('end', () => resolve(true));
            readableStream.on('error', (error) => reject(error)).on('end', () => resolve(true));
        });
    };
}

providerWrapper([{
    id: 'jsonFileStreamCheck',
    provider: jsonFileStreamCheck,
}]);
