import {v4} from 'uuid';
import {config, plugin, inject, provide} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import {
    FileStorageInfo, IFileStorageService, ServiceProviderEnum, AliOssInfo, FilePropertyAnalyzeInfo
} from '../../interface/file-storage-info-interface';
import {isString} from 'lodash';

const sendToWormhole = require('stream-wormhole');

@provide('fileStorageService')
export class FileStorageService implements IFileStorageService {

    @inject()
    ctx;
    @plugin()
    ossClient;
    @config('uploadConfig')
    uploadConfig;
    @inject()
    filePropertyAnalyzeHandler;
    @inject()
    fileStorageProvider;
    @inject()
    systemAnalysisRecordProvider;
    @inject()
    userNodeDataFileOperation;
    @inject()
    fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any;

    /**
     * 上传文件,并分析文件属性
     * @param fileStream
     * @param resourceType
     * @returns {Promise<FileStorageInfo>}
     */
    async upload(fileStream, resourceType): Promise<FileStorageInfo> {

        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(fileStream);
        if (this.isCanAnalyzeFileProperty(resourceType)) {
            await this.analyzeFileProperty(fileStorageInfo, resourceType);
        }

        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            return existingFileStorageInfo;
        }

        const temporaryObjectKey = fileStorageInfo.storageInfo.objectKey;
        const objectKey = `user-file-storage/${fileStorageInfo.sha1}`;
        await this.copyFile(temporaryObjectKey, objectKey);
        fileStorageInfo.storageInfo.objectKey = objectKey;

        return this.fileStorageProvider.create(fileStorageInfo);
    }

    /**
     * 上传用户节点数据文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    async uploadUserNodeDataFile(fileStream): Promise<FileStorageInfo> {

        const fileStreamCheckTask = this.userNodeDataFileOperation.checkJsonObject(fileStream);
        const fileStreamUploadTask = this._uploadFileToTemporaryDirectory(fileStream);

        const [fileStorageInfo] = await Promise.all([fileStreamUploadTask, fileStreamCheckTask]);

        if (fileStorageInfo.fileSize > 524288) {
            throw new ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
        }

        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            return existingFileStorageInfo;
        }

        const temporaryObjectKey = fileStorageInfo.storageInfo.objectKey;
        const objectKey = `user-file-storage/${fileStorageInfo.sha1}`;
        await this.copyFile(temporaryObjectKey, objectKey);
        fileStorageInfo.storageInfo.objectKey = objectKey;

        return this.fileStorageProvider.create(fileStorageInfo);
    }

    /**
     * 上传文件
     * @param fileStream
     * @returns {Promise<void>}
     * @private
     */
    async _uploadFileToTemporaryDirectory(fileStream): Promise<FileStorageInfo> {

        if (!fileStream.filename) {
            throw new ApplicationError('upload file error,filename not existing');
        }
        const temporaryObjectKey = `temporary_upload/${v4().replace(/-/g, '')}`.toLowerCase();
        const fileBaseInfoTransform = this.fileBaseInfoCalculateTransform('sha1', 'hex');
        await this.ossClient.putStream(temporaryObjectKey, fileStream.pipe(fileBaseInfoTransform));

        const aliOssStorageInfo: AliOssInfo = {
            region: this.uploadConfig.aliOss.region,
            bucket: this.uploadConfig.aliOss.bucket,
            objectKey: temporaryObjectKey
        };

        return {
            sha1: fileBaseInfoTransform.hashAlgorithmValue,
            fileSize: fileBaseInfoTransform.fileSize,
            serviceProvider: ServiceProviderEnum.AliOss,
            storageInfo: aliOssStorageInfo,
            fileUrl: `http://${aliOssStorageInfo.bucket}.${aliOssStorageInfo.region}${this.uploadConfig.aliOss.internal ? '-internal' : ''}.aliyuncs.com/${aliOssStorageInfo.objectKey}`
        };
    }

    /**
     * 文件流排空
     * @param fileStream
     * @returns {Promise<any>}
     */
    async fileStreamErrorHandler(fileStream) {
        if (!fileStream) {
            return {};
        }
        return sendToWormhole(fileStream);
    }

    /**
     * 复制文件
     * @param oldObjectKey
     * @param newObjectKey
     * @returns {Promise<Promise<any>>}
     */
    async copyFile(oldObjectKey, newObjectKey) {
        return this.ossClient.copyFile(newObjectKey, oldObjectKey);
    }

    /**
     * 根据sha1值获取文件
     * @param {string} sha1
     * @returns {Promise<FileStorageInfo>}
     */
    async findBySha1(sha1: string): Promise<FileStorageInfo> {
        return this.fileStorageProvider.findOne({sha1});
    }

    /**
     * 判断是否支持分析目标资源类型
     * @param {string} resourceType
     * @returns boolean
     */
    isCanAnalyzeFileProperty(resourceType: string): boolean {
        if (!isString(resourceType)) {
            return false;
        }
        return this.filePropertyAnalyzeHandler.supportAnalyzeResourceTypes.includes(resourceType.toLowerCase());
    }

    /**
     * 分析并缓存文件属性
     * @param {FileStorageInfo} fileStorageInfo
     * @param {string} resourceType
     * @returns {Promise<object>}
     * @private
     */
    async analyzeFileProperty(fileStorageInfo: FileStorageInfo, resourceType: string): Promise<FilePropertyAnalyzeInfo> {
        let cacheResult = await this.systemAnalysisRecordProvider.findOne({sha1: fileStorageInfo.sha1, resourceType});
        if (cacheResult && cacheResult.status === 2) {
            return Promise.reject(cacheResult.error);
        } else if (cacheResult) {
            return cacheResult;
        }
        const analyzeResult = await this.filePropertyAnalyzeHandler.analyzeFileProperty(fileStorageInfo.fileUrl, resourceType);
        cacheResult = await this.systemAnalysisRecordProvider.create({
            sha1: fileStorageInfo.sha1, resourceType, provider: analyzeResult.provider,
            systemProperty: analyzeResult.fileProperty,
            error: analyzeResult.error ? analyzeResult.error.message : '',
            status: analyzeResult.analyzeStatus
        });
        if (analyzeResult.analyzeStatus === 2) {
            return Promise.reject(analyzeResult.error);
        }
        return cacheResult;
    }
}
