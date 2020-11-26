import { IApplicationContext } from 'midway';
declare const StreamBase: any;
declare class JsonObjectPickTransformStream extends StreamBase {
    constructor(pickFields: string[], options?: {});
    _transform(chunk: any, encoding: any, callback: any): any;
    _flush(callback: any): void;
}
export declare function jsonObjectPickTransformStream(_context: IApplicationContext): (pickFields: string[], options?: {}) => JsonObjectPickTransformStream;
export {};
