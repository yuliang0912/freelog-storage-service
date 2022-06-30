import {IFileMetaAnalyseResult, IKafkaSubscribeMessageHandle} from '../interface/common-interface';
import {EachMessagePayload} from 'kafkajs';
import {inject, provide, scope, ScopeEnum} from 'midway';
import {IMongodbOperation} from 'egg-freelog-base';

// import {FileStorageInfo} from '../interface/file-storage-info-interface';

/**
 * 文件meta分析结果处理
 */
@provide()
@scope(ScopeEnum.Singleton)
export class FileMetaAnalyseResultEventHandler implements IKafkaSubscribeMessageHandle {

    @inject()
    fileStorageProvider: IMongodbOperation<any>;
    @inject()
    objectStorageServiceClient;

    consumerGroupId = 'freelog-storage-service#file-meta-event-handle-group-temp';
    subscribeTopicName = 'file-meta-analyse-result-topic';  // 'file-meta-analyse-result-topic';

    constructor() {
        this.messageHandle = this.messageHandle.bind(this);
    }

    /**
     * 消息处理
     * @param payload
     */
    async messageHandle(payload: EachMessagePayload): Promise<void> {
        const {message} = payload;
        const eventInfo: IFileMetaAnalyseResult = JSON.parse(message.value.toString());
        await this.fileStorageProvider.updateOne({sha1: eventInfo.sha1}, {
            metaAnalyzeStatus: eventInfo.code === 0 ? 2 : 3,
            metaInfo: eventInfo.fileMeta
        });
        // 把分析的mime直接设置到阿里云OSS上
        // const storageInfo: FileStorageInfo = await this.fileStorageProvider.findOne({sha1: eventInfo.sha1});
        // const ossClient = this.objectStorageServiceClient.setBucket(storageInfo.storageInfo.bucket).build();
        // ossClient.
    }
}
