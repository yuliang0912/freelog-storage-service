import {v4} from 'uuid';
import {inject, provide} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import {
    FileStorageInfo, IFileStorageService, ServiceProviderEnum, FilePropertyAnalyzeInfo
} from '../../interface/file-storage-info-interface';
import {isString} from 'lodash';

const sendToWormhole = require('stream-wormhole');

@provide('fileStorageService')
export class FileStorageService implements IFileStorageService {

    @inject()
    ctx;
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
    @inject()
    objectStorageServiceClient;

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
        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'resource-file-storage');
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
        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'user-node-data');
    }

    /**
     * 上传图片
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    async uploadImage(fileStream): Promise<FileStorageInfo> {

        const resourceType = 'image';
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(fileStream);
        if (this.isCanAnalyzeFileProperty(resourceType)) {
            await this.analyzeFileProperty(fileStorageInfo, resourceType);
        }
        // 不允许超过2M
        if (fileStorageInfo.fileSize > 2097152) {
            throw new ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
        }

        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'preview-image');
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
     * 根据sha1值获取文件
     * @param {string} sha1
     * @returns {Promise<FileStorageInfo>}
     */
    async findBySha1(sha1: string): Promise<FileStorageInfo> {
        return this.fileStorageProvider.findOne({sha1});
    }

    /**
     * 获取签名的文件URL读取路径
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {string}
     */
    getSignatureUrl(fileStorageInfo: FileStorageInfo): string {
        const ossClient = this.objectStorageServiceClient.setProvider(fileStorageInfo.serviceProvider).setBucket(fileStorageInfo.storageInfo.bucket).build();
        return ossClient.givenClient.client.signatureUrl(fileStorageInfo.storageInfo.objectKey, {
            method: 'GET', expires: 180
        });
    }

    /**
     * 获取文件流
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {any}
     */
    async getFileStream(fileStorageInfo: FileStorageInfo): Promise<any> {
        const ossClient = this.objectStorageServiceClient.setProvider(fileStorageInfo.serviceProvider).setBucket(fileStorageInfo.storageInfo.bucket).build();
        const {stream} = await ossClient.getStream(fileStorageInfo.storageInfo.objectKey);
        return stream;
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
        const signatureUrl = this.getSignatureUrl(fileStorageInfo);
        const analyzeResult = await this.filePropertyAnalyzeHandler.analyzeFileProperty(signatureUrl, resourceType);
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

    /**
     * 上传文件到临时目录
     * @param fileStream
     * @returns {Promise<void>}
     * @private
     */
    async _uploadFileToTemporaryDirectory(fileStream, bucketName = 'freelog-shenzhen'): Promise<FileStorageInfo> {
        if (!fileStream.filename) {
            throw new ApplicationError('upload file error,filename not existing');
        }

        const temporaryObjectKey = `temporary_upload/${v4().replace(/-/g, '')}`.toLowerCase();
        const fileBaseInfoTransform = this.fileBaseInfoCalculateTransform('sha1', 'hex');
        const ossClient = this.objectStorageServiceClient.setProvider('aliOss').setBucket(bucketName).build();
        await ossClient.putStream(temporaryObjectKey, fileStream.pipe(fileBaseInfoTransform));
        // 此处代码后期需要等egg-freelog-base优化
        const {region, bucket} = ossClient.config;
        return {
            sha1: fileBaseInfoTransform.hashAlgorithmValue,
            fileSize: fileBaseInfoTransform.fileSize,
            serviceProvider: ServiceProviderEnum.AliOss,
            storageInfo: {
                region, bucket, objectKey: temporaryObjectKey
            }
        };
    }

    /**
     * 复制文件(临时目录copy到正式目录),并且保存文件信息入库
     * @param {FileStorageInfo} fileStorageInfo
     * @param targetDirectory
     * @returns {Promise<any>}
     * @private
     */
    async _copyFileAndSaveFileStorageInfo(fileStorageInfo: FileStorageInfo, targetDirectory, bucketName = 'freelog-shenzhen') {
        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            return existingFileStorageInfo;
        }
        const temporaryObjectKey = fileStorageInfo.storageInfo.objectKey;
        const objectKey = `image-file-storage/${fileStorageInfo.sha1}`;

        const ossClient = this.objectStorageServiceClient.setProvider('aliOss').setBucket(bucketName).build();
        await ossClient.copyFile(objectKey, temporaryObjectKey);
        fileStorageInfo.storageInfo.objectKey = objectKey;
        return this.fileStorageProvider.create(fileStorageInfo);
    }
}
