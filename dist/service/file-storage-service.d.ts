import { FileStorageInfo, IFileStorageService } from '../interface/file-storage-info-interface';
export declare class FileStorageService implements IFileStorageService {
    ctx: any;
    ossClient: any;
    uploadConfig: any;
    fileStorageProvider: any;
    userNodeDataFileOperation: any;
    fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any;
    /**
     * 上传文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    upload(fileStream: any): Promise<FileStorageInfo>;
    /**
     * 上传用户节点数据文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    uploadUserNodeDataFile(fileStream: any): Promise<FileStorageInfo>;
    /**
     * 上传文件
     * @param fileStream
     * @param checkTasks
     * @returns {Promise<void>}
     * @private
     */
    _uploadFile(fileStream: any): Promise<FileStorageInfo>;
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
}
