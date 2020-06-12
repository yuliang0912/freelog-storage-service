export declare class FilePropertyAnalyzerHandler {
    ctx: any;
    readonly resourceAnalyzeHandlerMap: Map<string, any>;
    get supportAnalyzeResourceTypes(): string[];
    /**
     * 获取资源文件属性
     * @param src
     * @param {string} resourceType
     * @returns {Promise<{fileProperty: any; analyzeStatus: number; error: object}>}
     */
    analyzeFileProperty(src: any, resourceType: string): Promise<{
        fileProperty: any;
        analyzeStatus: number;
        error: object;
    }>;
    /**
     * 获取图片基础属性
     * @param src, URL or readable stream
     * @returns {Promise<object>}
     */
    _imageFileAnalyzeHandle(src: any): Promise<object>;
}
