import { FileStorageInfo, IFileStorageService, FilePropertyAnalyzeInfo } from '../../interface/file-storage-info-interface';
export declare class FileStorageService implements IFileStorageService {
    ctx: any;
    filePropertyAnalyzeHandler: any;
    fileStorageProvider: any;
    systemAnalysisRecordProvider: any;
    userNodeDataFileOperation: any;
    fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any;
    objectStorageServiceClient: any;
    /**
     * 上传文件,并分析文件属性
     * @param fileStream
     * @param resourceType
     * @returns {Promise<FileStorageInfo>}
     */
    upload(fileStream: any, resourceType: any): Promise<FileStorageInfo>;
    /**
     * 上传用户节点数据文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    uploadUserNodeDataFile(userNodeData: object): Promise<FileStorageInfo>;
    /**
     * 上传图片
     * @param fileStream
     * @returns {Promise<string>}
     */
    uploadImage(fileStream: any): Promise<string>;
    /**
     * 文件流排空
     * @param fileStream
     * @returns {Promise<any>}
     */
    fileStreamErrorHandler(fileStream: any): Promise<any>;
    /**
     * 根据sha1值获取文件
     * @param {string} sha1
     * @returns {Promise<FileStorageInfo>}
     */
    findBySha1(sha1: string): Promise<FileStorageInfo>;
    /**
     * 获取签名的文件URL读取路径
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {string}
     */
    getSignatureUrl(fileStorageInfo: FileStorageInfo): string;
    /**
     * 获取文件流
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {any}
     */
    getFileStream(fileStorageInfo: FileStorageInfo): Promise<any>;
    /**
     * 判断是否支持分析目标资源类型
     * @param {string} resourceType
     * @returns boolean
     */
    isCanAnalyzeFileProperty(resourceType: string): boolean;
    /**
     * 分析并缓存文件属性
     * @param {FileStorageInfo} fileStorageInfo
     * @param {string} resourceType
     * @returns {Promise<object>}
     * @private
     */
    analyzeFileProperty(fileStorageInfo: FileStorageInfo, resourceType: string): Promise<FilePropertyAnalyzeInfo>;
    /**
     * 上传文件到临时目录
     * @param fileStream
     * @returns {Promise<void>}
     * @private
     */
    _uploadFileToTemporaryDirectory(fileStream: any, meta?: any): Promise<FileStorageInfo>;
    /**
     * 复制文件(临时目录copy到正式目录),并且保存文件信息入库
     * @param {FileStorageInfo} fileStorageInfo
     * @param targetDirectory
     * @returns {Promise<any>}
     * @private
     */
    _copyFileAndSaveFileStorageInfo(fileStorageInfo: FileStorageInfo, targetDirectory: any, bucketName?: string): Promise<any>;
}
