import { FileStorageInfo, IFileStorageService, FilePropertyAnalyzeInfo } from '../../interface/file-storage-info-interface';
export declare class FileStorageService implements IFileStorageService {
    ctx: any;
    ossClient: any;
    uploadConfig: any;
    filePropertyAnalyzeHandler: any;
    fileStorageProvider: any;
    systemAnalysisRecordProvider: any;
    userNodeDataFileOperation: any;
    fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any;
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
    uploadUserNodeDataFile(fileStream: any): Promise<FileStorageInfo>;
    /**
     * 上传文件
     * @param fileStream
     * @returns {Promise<void>}
     * @private
     */
    _uploadFileToTemporaryDirectory(fileStream: any): Promise<FileStorageInfo>;
    /**
     * 文件流排空
     * @param fileStream
     * @returns {Promise<any>}
     */
    fileStreamErrorHandler(fileStream: any): Promise<any>;
    /**
     * 复制文件
     * @param oldObjectKey
     * @param newObjectKey
     * @returns {Promise<Promise<any>>}
     */
    copyFile(oldObjectKey: any, newObjectKey: any): Promise<any>;
    /**
     * 根据sha1值获取文件
     * @param {string} sha1
     * @returns {Promise<FileStorageInfo>}
     */
    findBySha1(sha1: string): Promise<FileStorageInfo>;
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
}
