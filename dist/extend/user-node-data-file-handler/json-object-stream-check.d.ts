import { Readable } from 'stream';
import { IApplicationContext } from 'midway';
export declare function jsonFileStreamCheck(_context: IApplicationContext): (readableStream: Readable) => Promise<boolean>;
