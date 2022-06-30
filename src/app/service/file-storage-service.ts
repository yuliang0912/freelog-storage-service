import {v4} from 'uuid';
import {inject, provide} from 'midway';
import {ApplicationError, FreelogContext, IMongodbOperation} from 'egg-freelog-base';
import {
    FileStorageInfo, IFileStorageService, ServiceProviderEnum, FilePropertyAnalyzeInfo
} from '../../interface/file-storage-info-interface';
import {isString, difference} from 'lodash';
import {PassThrough, Stream} from 'stream';
import {IBucketService} from '../../interface/bucket-interface';
import {KafkaClient} from '../../kafka/client';
import {isNullOrUndefined} from 'egg-freelog-base/lib/freelog-common-func';

const sendToWormhole = require('stream-wormhole');

@provide('fileStorageService')
export class FileStorageService implements IFileStorageService {

    @inject()
    ctx: FreelogContext;
    @inject()
    kafkaClient: KafkaClient;
    @inject()
    filePropertyAnalyzeHandler;
    @inject()
    userNodeDataFileOperation;
    @inject()
    objectStorageServiceClient;
    @inject()
    bucketService: IBucketService;
    @inject()
    systemAnalysisRecordProvider: IMongodbOperation<any>;
    @inject()
    fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any;
    @inject()
    fileStorageProvider: IMongodbOperation<FileStorageInfo>;

    /**
     * 上传文件,并分析文件属性
     * @param fileStream
     * @param resourceType
     * @returns {Promise<FileStorageInfo>}
     */
    async upload(fileStream, resourceType): Promise<FileStorageInfo> {
        const tempFileStorageInfo = await this._uploadFileToTemporaryDirectory(fileStream, true);
        const fileStorage = await this._copyFileAndSaveFileStorageInfo(tempFileStorageInfo, 'resource-file-storage');
        this.sendAnalyzeFilePropertyTask(fileStorage, fileStream.filename).then();
        return fileStorage;
    }

    /**
     * 上传用户节点数据文件
     * @param userNodeData
     */
    async uploadUserNodeDataFile(userNodeData: object): Promise<FileStorageInfo> {

        let bufferStream = null;
        if (!(userNodeData instanceof Stream)) {
            const userNodeDataJsonBuffer = Buffer.from(JSON.stringify(userNodeData));
            if (userNodeDataJsonBuffer.length > 536870912) {
                throw new ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
            }
            bufferStream = new PassThrough();
            bufferStream.end(userNodeDataJsonBuffer);
        } else {
            bufferStream = userNodeData;
        }

        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(bufferStream, false);
        fileStorageInfo.metaAnalyzeStatus = 2;
        fileStorageInfo.metaInfo.mime = 'application/json';
        return this._copyFileAndSaveFileStorageInfo(fileStorageInfo, 'user-node-data');
    }

    /**
     * 上传图片
     * @param fileStream
     * @returns {Promise<string>}
     */
    async uploadImage(fileStream): Promise<string> {
        let mime = {};
        const resourceType = 'image';
        const fileStorageInfo = await this._uploadFileToTemporaryDirectory(fileStream, false);
        if (this.isCanAnalyzeFileProperty(resourceType)) {
            const analyzeResult = await this.analyzeFileProperty(fileStorageInfo, resourceType);
            if (analyzeResult.status === 2) {
                throw new ApplicationError(analyzeResult.error);
            }
            if (!['jpg', 'jpe', 'jpeg', 'png', 'gif'].includes(analyzeResult.systemProperty.type?.toLocaleString())) {
                throw new ApplicationError('图片只支持jpg、jpe、jpeg、png、gif格式');
            }
            mime = analyzeResult.systemProperty.mime;
        }
        // 不允许超过2M
        if (fileStorageInfo.fileSize > 5242880) {
            throw new ApplicationError(this.ctx.gettext('user-node-data-file-size-limit-error'));
        }

        const objectKey = `preview-image/${fileStorageInfo.sha1}${fileStream.filename.includes('.') ? fileStream.filename.substr(fileStream.filename.lastIndexOf('.')) : ''}`;
        const temporaryFileStream = await this.getFileStream(fileStorageInfo);

        await this.objectStorageServiceClient.setBucket('freelog-image').build()
            .putStream(objectKey, temporaryFileStream, {headers: {'Content-Type': mime}});

        return `https://image.freelog.com/${objectKey}`;
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
     * @param sha1
     * @param args
     */
    async findBySha1(sha1: string, ...args): Promise<FileStorageInfo> {
        return this.fileStorageProvider.findOne({sha1}, ...args);
    }

    /**
     * 批量查找
     * @param condition
     * @param args
     */
    async find(condition: object, ...args): Promise<FileStorageInfo[]> {
        return this.fileStorageProvider.find(condition, ...args);
    }

    /**
     * 获取签名的文件URL读取路径
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {string}
     */
    getSignatureUrl(fileStorageInfo: FileStorageInfo): string {
        const ossClient = this.objectStorageServiceClient.setBucket(fileStorageInfo.storageInfo.bucket).build();
        return ossClient.client.signatureUrl(fileStorageInfo.storageInfo.objectKey, {
            method: 'GET', expires: 180
        });
    }

    /**
     * 获取文件流
     * @param {FileStorageInfo} fileStorageInfo
     * @returns {any}
     */
    async getFileStream(fileStorageInfo: FileStorageInfo): Promise<any> {
        const ossClient = this.objectStorageServiceClient.setBucket(fileStorageInfo.storageInfo.bucket).build();
        return ossClient.getStream(fileStorageInfo.storageInfo.objectKey).then(res => res.stream);
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
        if (cacheResult) {
            return cacheResult;
        }
        const signatureUrl = this.getSignatureUrl(fileStorageInfo);
        const analyzeResult = await this.filePropertyAnalyzeHandler.analyzeFileProperty(signatureUrl, resourceType);
        if (analyzeResult.analyzeStatus === 3) {
            return analyzeResult;
        }
        cacheResult = await this.systemAnalysisRecordProvider.create({
            sha1: fileStorageInfo.sha1, resourceType, provider: analyzeResult.provider,
            systemProperty: analyzeResult.fileProperty,
            error: analyzeResult.error ? analyzeResult.error.message : '',
            status: analyzeResult.analyzeStatus
        });
        return cacheResult;
    }

    /**
     * 分析文件属性(有专门的分析服务)
     * @param fileStorageInfo
     * @param filename
     */
    async sendAnalyzeFilePropertyTask(fileStorageInfo: FileStorageInfo, filename: string) {
        if (!isNullOrUndefined(fileStorageInfo.metaInfo)) {
            return true;
        }
        return this.kafkaClient.send({
            acks: -1,
            topic: 'file-meta-analyse-task-topic',
            messages: [{
                key: fileStorageInfo.sha1,
                value: JSON.stringify({
                    sha1: fileStorageInfo.sha1,
                    fileSize: fileStorageInfo.fileSize,
                    serviceProvider: fileStorageInfo.serviceProvider,
                    storageInfo: fileStorageInfo.storageInfo,
                    filename,
                    attachData: {userId: this.ctx.userId}
                })
            }]
        }).then(() => {
            return this.fileStorageProvider.updateOne({sha1: fileStorageInfo.sha1}, {
                metaAnalyzeStatus: 1
            });
        });
    }

    /**
     * 上传文件到临时目录
     * @param fileStream
     * @param isCheckSpace
     * @param meta
     */
    async _uploadFileToTemporaryDirectory(fileStream, isCheckSpace: boolean, meta = null): Promise<FileStorageInfo> {
        const temporaryObjectKey = `temporary_upload/${v4().replace(/-/g, '')}`.toLowerCase();
        const fileBaseInfoTransform = this.fileBaseInfoCalculateTransform('sha1', 'hex');
        const ossClient = this.objectStorageServiceClient.setBucket('freelog-shenzhen').build();
        await ossClient.putStream(temporaryObjectKey, fileStream.pipe(fileBaseInfoTransform), meta);

        if (isCheckSpace) {
            const spaceStatisticInfo = await this.bucketService.spaceStatistics(this.ctx.userId);
            if (spaceStatisticInfo.storageLimit - spaceStatisticInfo.totalFileSize < fileBaseInfoTransform.fileSize) {
                throw new ApplicationError(this.ctx.gettext('storage_full'));
            }
        }

        const fileExtName = this.getFileExt(fileStream.filename);
        // 此处代码后期需要等egg-freelog-base优化
        const {region, bucket} = ossClient.config;
        return {
            sha1: fileBaseInfoTransform.hashAlgorithmValue,
            fileSize: fileBaseInfoTransform.fileSize,
            serviceProvider: ServiceProviderEnum.AliOss,
            metaAnalyzeStatus: 0,
            fileExtNames: fileExtName ? [fileExtName] : [],
            metaInfo: {
                fileSize: fileBaseInfoTransform.fileSize
            },
            storageInfo: {
                region, bucket, objectKey: temporaryObjectKey
            }
        };
    }

    /**
     * 复制文件(临时目录copy到正式目录),并且保存文件信息入库
     * @param fileStorageInfo
     * @param targetDirectory
     * @param bucketName
     */
    async _copyFileAndSaveFileStorageInfo(fileStorageInfo: FileStorageInfo, targetDirectory, bucketName = 'freelog-shenzhen') {
        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            if (difference(fileStorageInfo.fileExtNames, existingFileStorageInfo.fileExtNames).length) {
                await this.fileStorageProvider.updateOne({sha1: fileStorageInfo.sha1}, {
                    $addToSet: {fileExtNames: fileStorageInfo.fileExtNames},
                });
                existingFileStorageInfo.fileExtNames.push(...fileStorageInfo.fileExtNames);
            }
            return existingFileStorageInfo;
        }
        const temporaryObjectKey = fileStorageInfo.storageInfo.objectKey;
        const objectKey = `${targetDirectory}/${fileStorageInfo.sha1}`;
        const ossClient = this.objectStorageServiceClient.setBucket(bucketName).build();
        await ossClient.copyObject(objectKey, temporaryObjectKey);
        fileStorageInfo.storageInfo.objectKey = objectKey;
        return this.fileStorageProvider.create(fileStorageInfo);
    }

    private getFileExt(filename: string) {
        if (!filename || filename.indexOf('.') <= 0) {
            return null;
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
