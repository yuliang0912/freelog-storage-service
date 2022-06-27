export declare enum ServiceProviderEnum {
    AliOss = "aliOss",
    AmazonS3 = "amazonS3"
}
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
    metaAnalyzeStatus?: number;
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
    upload(fileStream: any, resourceType: any): Promise<FileStorageInfo>;
    uploadUserNodeDataFile(userNodeDate: any): Promise<FileStorageInfo>;
    uploadImage(fileStream: any): Promise<string>;
    find(condition: object, ...args: any[]): Promise<FileStorageInfo[]>;
    findBySha1(sha1: string): Promise<FileStorageInfo>;
    fileStreamErrorHandler(fileStream: any): Promise<any>;
    isCanAnalyzeFileProperty(resourceType: string): boolean;
    getSignatureUrl(fileStorageInfo: FileStorageInfo): string;
    getFileStream(fileStorageInfo: FileStorageInfo): Promise<any>;
}
