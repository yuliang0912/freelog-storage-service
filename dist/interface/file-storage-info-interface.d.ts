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
}
export declare interface FileStorageInfo {
    sha1: string;
    fileSize: number;
    referencedQuantity?: number;
    serviceProvider: ServiceProviderEnum;
    storageInfo: AliOssInfo | AmazonS3Info;
}
export declare interface IFileStorageService {
    upload(fileStream: any): Promise<FileStorageInfo>;
    uploadUserNodeDataFile(fileStream: any): Promise<FileStorageInfo>;
    findBySha1(sha1: string): Promise<FileStorageInfo>;
    fileStreamErrorHandler(fileStream: any): void;
}
