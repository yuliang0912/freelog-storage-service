/// <reference types="node" />
import { Transform } from 'stream';
import { IApplicationContext } from 'midway';
declare class FileBaseInfoCalculateTransform extends Transform {
    fileSize: number;
    hashAlgorithm: any;
    hashAlgorithmEncoding: string;
    hashAlgorithmValue: string;
    constructor(algorithm?: string, encoding?: string);
    _transform(chunk: any, encoding: any, callback: any): void;
    _final(callback: any): void;
}
export declare function fileBaseInfoCalculateTransform(_context: IApplicationContext): (algorithm?: string, encoding?: string) => FileBaseInfoCalculateTransform;
export {};
