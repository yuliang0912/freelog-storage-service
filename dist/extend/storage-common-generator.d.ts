export declare class StorageCommonGenerator {
    registerMimeTypeMap(): void;
    /**
     * 生成资源唯一key
     * @param bucketName
     * @param objectName
     */
    generateObjectUniqueKey(bucketName: string, objectName: string): string;
    generateMimeType(objectName: string): string;
}
