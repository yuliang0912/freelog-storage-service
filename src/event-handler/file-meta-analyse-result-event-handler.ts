import {IFileMetaAnalyseResult, IKafkaSubscribeMessageHandle} from '../interface/common-interface';
import {EachMessagePayload} from 'kafkajs';
import {inject, provide, scope, ScopeEnum} from 'midway';
import {IMongodbOperation} from 'egg-freelog-base';
import {getExtension} from 'mime';

/**
 * 文件meta分析结果处理
 */
@provide()
@scope(ScopeEnum.Singleton)
export class FileMetaAnalyseResultEventHandler implements IKafkaSubscribeMessageHandle {

    @inject()
    systemAnalysisRecordProvider: IMongodbOperation<any>;

    consumerGroupId = 'freelog-storage-service#file-meta-event-handle-group';
    subscribeTopicName = 'file-meta-analyse-task-result-topic';

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
        await this.systemAnalysisRecordProvider.create({
            sha1: eventInfo.sha1,
            fileExt: getExtension(eventInfo.filename),
            metaInfo: eventInfo.fileMeta ?? {},
            code: eventInfo.code,
            error: eventInfo.msg
        });
    }
}
