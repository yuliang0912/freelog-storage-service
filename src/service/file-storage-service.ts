import {v4} from 'uuid';
import {createHash} from 'crypto';
import {config, plugin, inject, provide} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import {
    FileStorageInfo, IFileStorageService, ServiceProviderEnum, AliOssInfo
} from '../interface/file-storage-info-interface';

const sendToWormhole = require('stream-wormhole');

@provide('fileStorageService')
export class FileStorageService implements IFileStorageService {

    @plugin()
    ossClient;
    @config('uploadConfig')
    uploadConfig;
    @inject()
    fileStorageProvider;

    /**
     * 上传文件
     * @param fileStream
     * @returns {Promise<FileStorageInfo>}
     */
    async upload(fileStream): Promise<FileStorageInfo> {
        if (!fileStream.filename) {
            return sendToWormhole(fileStream).finally(() => {
                throw new ApplicationError('upload file error,filename not existing');
            });
        }
        const objectKey: string = `file-storage/${v4().replace(/-/g, '')}`.toLowerCase();
        const getBaseFileInfoTask = this.getBaseFileInfo(fileStream);
        const ossPutStreamTask: Promise<{ objectKey: string, url: string }> = this.ossClient.putStream(objectKey, fileStream);

        const [fileBaseInfo] = await Promise.all([getBaseFileInfoTask, ossPutStreamTask]).catch(error => {
            return sendToWormhole(fileStream).finally(() => {
                throw new ApplicationError(error.toString(), error);
            });
        });

        const existingFileStorageInfo = await this.findBySha1(fileBaseInfo.sha1);
        if (existingFileStorageInfo) {
            this.ossClient.deleteFile(objectKey).catch(error => {
                console.warn(`删除oss存储文件失败,objectKey:${objectKey}`, error);
            });
            return existingFileStorageInfo;
        }

        const newObjectKey = `user-file-storage/${fileBaseInfo.sha1}`;
        await this.copyFile(objectKey, newObjectKey);

        const aliOssStorageInfo: AliOssInfo = {
            region: this.uploadConfig.aliOss.region,
            bucket: this.uploadConfig.aliOss.bucket,
            objectKey: newObjectKey
        };

        const fileStorageInfo: FileStorageInfo = {
            sha1: fileBaseInfo.sha1,
            fileSize: fileBaseInfo.fileSize,
            serviceProvider: ServiceProviderEnum.AliOss,
            storageInfo: aliOssStorageInfo
        };

        return this.fileStorageProvider.create(fileStorageInfo);
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
     * 获取文件基础信息(sha1,fileSize)
     * @param fileStream
     * @returns {Promise<{sha1: string; fileSize: number}>}
     */
    async getBaseFileInfo(fileStream): Promise<{ sha1: string, fileSize: number }> {
        let fileSize = 0;
        const sha1sum = createHash('sha1');
        return new Promise((resolve, reject) => {
            fileStream.on('data', chunk => {
                sha1sum.update(chunk);
                fileSize += chunk.length;
            }).on('end', () => resolve({
                sha1: sha1sum.digest('hex'), fileSize
            })).on('error', reject);
        });
    }

}
