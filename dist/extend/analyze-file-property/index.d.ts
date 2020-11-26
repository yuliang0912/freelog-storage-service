export declare class FilePropertyAnalyzerHandler {
    ctx: any;
    readonly resourceAnalyzeHandlerMap: Map<string, any>;
    get supportAnalyzeResourceTypes(): string[];
    /**
     * 获取资源文件属性
     * @param src
     * @param resourceType
     */
    analyzeFileProperty(src: any, resourceType: string): Promise<{
        fileProperty: any;
        analyzeStatus: number;
        error: object;
    }>;
    /**
     * 获取图片基础属性
     * @param src
     */
    _imageFileAnalyzeHandle(src: any): Promise<object>;
}
