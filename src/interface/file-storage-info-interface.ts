import {IMongodbOperation} from 'egg-freelog-base';

export enum ServiceProviderEnum {AliOss = 'aliOss', AmazonS3 = 'amazonS3'}

export declare interface AliOssInfo {
    region: string;
    bucket: string;
    objectKey: string;
}

export declare interface AmazonS3Info {
    region: string;
    bucket: string;
    objectKey: string;
}

export declare interface FileStorageInfo {
    sha1: string;
    fileSize: number;
    referencedQuantity?: number;
    serviceProvider: ServiceProviderEnum;
    storageInfo: AliOssInfo | AmazonS3Info;
    // 0:未解析 1:解析中 2:解析成功 3:解析失败
    metaAnalyzeStatus?: number;
    fileExtNames: string[];
    metaInfo?: {
        [key: string]: number | string;
    };
}

export interface FilePropertyAnalyzeInfo {
    sha1: string;
    resourceType: string[];
    provider: string;
    status: number;
    error?: string;
    systemProperty?: {
        [propertyName: string]: any;
    };
}

export declare interface IFileStorageService {
    fileStorageProvider: IMongodbOperation<FileStorageInfo>;

    upload(fileStream, resourceType): Promise<FileStorageInfo>;

    uploadUserNodeDataFile(userNodeDate): Promise<FileStorageInfo>;

    uploadImage(fileStream): Promise<string>;

    find(condition: object, ...args): Promise<FileStorageInfo[]>;

    findBySha1(sha1: string): Promise<FileStorageInfo>;

    fileStreamErrorHandler(fileStream): Promise<any>;

    isCanAnalyzeFileProperty(resourceType: string): boolean;

    getSignatureUrl(fileStorageInfo: FileStorageInfo, options?: object): string;

    getFileStream(fileStorageInfo: FileStorageInfo): Promise<any>;

    // analyzeFileProperty(fileStorageInfo: FileStorageInfo, resourceType: string): Promise<FilePropertyAnalyzeInfo>;
}
