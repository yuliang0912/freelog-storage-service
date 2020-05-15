import {v4} from 'uuid';
import {config, plugin, inject, provide} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import {
    FileStorageInfo, IFileStorageService, ServiceProviderEnum, AliOssInfo
} from '../interface/file-storage-info-interface';
import {finished as streamFinished} from 'stream';

const sendToWormhole = require('stream-wormhole');

@provide('fileStorageService')
export class FileStorageService implements IFileStorageService {

    @plugin()
    ossClient;
    @config('uploadConfig')
    uploadConfig;
    @inject()
    fileStorageProvider;
    @inject()
    userNodeDataFileOperation;
    @inject()
    fileBaseInfoCalculateTransform: (algorithm?: string, encoding?: string) => any;

    /**
     * 上传文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    async upload(fileStream): Promise<FileStorageInfo> {

        const fileStorageInfo = await this._uploadFile(fileStream);

        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            return existingFileStorageInfo;
        }

        return this.fileStorageProvider.create(fileStorageInfo);
    }

    /**
     * 上传用户节点数据文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    async uploadUserNodeDataFile(fileStream): Promise<FileStorageInfo> {

        const fileStreamCheckTask = this.userNodeDataFileOperation.checkJsonObject(fileStream);
        const fileStreamUploadTask = this._uploadFile(fileStream);

        const [fileStorageInfo] = await Promise.all([fileStreamUploadTask, fileStreamCheckTask]);

        const existingFileStorageInfo = await this.findBySha1(fileStorageInfo.sha1);
        if (existingFileStorageInfo) {
            return existingFileStorageInfo;
        }

        return this.fileStorageProvider.create(fileStorageInfo);
    }

    /**
     * 上传文件
     * @param fileStream
     * @param checkTasks
     * @returns {Promise<void>}
     * @private
     */
    async _uploadFile(fileStream): Promise<FileStorageInfo> {
        if (!fileStream.filename) {
            throw new ApplicationError('upload file error,filename not existing');
        }
        const temporaryObjectKey = `temporary_upload/${v4().replace(/-/g, '')}`.toLowerCase();
        const fileBaseInfoTransform = this.fileBaseInfoCalculateTransform('sha1', 'hex');
        await this.ossClient.putStream(temporaryObjectKey, fileStream.pipe(fileBaseInfoTransform));
        const objectKey = `user-file-storage/${fileBaseInfoTransform.hashAlgorithmValue}`;
        await this.copyFile(temporaryObjectKey, objectKey);

        const aliOssStorageInfo: AliOssInfo = {
            region: this.uploadConfig.aliOss.region,
            bucket: this.uploadConfig.aliOss.bucket,
            objectKey
        };

        const fileStorageInfo: FileStorageInfo = {
            sha1: fileBaseInfoTransform.hashAlgorithmValue,
            fileSize: fileBaseInfoTransform.fileSize,
            serviceProvider: ServiceProviderEnum.AliOss,
            storageInfo: aliOssStorageInfo
        };
        return fileStorageInfo;
    }

    async fileStreamErrorHandler(fileStream) {
        streamFinished(fileStream, (error) => {
            if (error) {
                sendToWormhole(fileStream);
            }
        });
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
}
