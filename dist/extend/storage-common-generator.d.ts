export declare class StorageCommonGenerator {
    registerMimeTypeMap(): void;
    /**
     * 生成资源唯一key
     * @param {string} resourceName
     * @returns {string}
     */
    generateObjectUniqueKey(bucketName: string, objectName: string): string;
    generateMimeType(objectName: string): string;
}
