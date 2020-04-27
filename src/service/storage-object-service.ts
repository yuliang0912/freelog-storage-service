import {v4} from 'uuid';
import {provide, config, plugin, inject} from 'midway';
import {ApplicationError} from 'egg-freelog-base';
import {
    IStorageObjectService, StorageObject, UpdateFileOptions,
    FileOssInfo, ServiceProviderEnum
} from '../interface/storage-object-interface';

const sendToWormhole = require('stream-wormhole')

@provide('storageObjectService')
export class StorageObjectService implements IStorageObjectService {
    @plugin()
    ossClient;
    @config('uploadConfig')
    uploadConfig;
    @inject()
    storageObjectProvider;
    @inject()
    storageFileCheck;

    async createObject(updateFileOptions: UpdateFileOptions): Promise<StorageObject> {

        const objectKey = `User/${updateFileOptions.userId}/${v4().replace(/-/g, '')}`.toLowerCase()
        // const fileCheckAsync = ctx.helper.resourceFileCheck({fileStream, resourceType})
        const fileCheckTask = this.storageFileCheck(updateFileOptions.fileStream, updateFileOptions.resourceType);
        const fileUploadTask = this.ossClient.putStream(objectKey, updateFileOptions.fileStream);

        const [fileMateInfo, ossResponseData] = await Promise.all([fileCheckTask, fileUploadTask]).catch(error => {
            sendToWormhole(updateFileOptions.fileStream)
            throw new ApplicationError(error.toString(), error);
        })

        const fileOssInfo: FileOssInfo = {
            url: ossResponseData.url,
            objectKey: ossResponseData.name,
            filename: updateFileOptions.fileStream['filename'],
            bucket: this.uploadConfig.aliOss.bucket,
            region: this.uploadConfig.aliOss.region,
            serviceProvider: ServiceProviderEnum.AliOss
        }

        const storageObject: StorageObject = {
            sha1: fileMateInfo.sha1,
            objectName: fileOssInfo.filename,
            bucketName: updateFileOptions.bucketName,
            resourceType: updateFileOptions.resourceType,
            fileOss: fileOssInfo,
            systemMeta: fileMateInfo
        };

        return this.storageObjectProvider.create(storageObject);
    }

    async findOne(condition: object): Promise<StorageObject> {
        return this.storageObjectProvider.findOne(condition);
    }

    async find(condition: object): Promise<StorageObject[]> {
        return this.storageObjectProvider.find(condition);
    }

    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<StorageObject[]> {
        return this.storageObjectProvider.findPageList(condition, page, pageSize, projection.join(''), orderBy);
    }

    async count(condition: object): Promise<number> {
        return this.storageObjectProvider.count(condition);
    }
}
