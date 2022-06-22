import { IKafkaSubscribeMessageHandle } from '../interface/common-interface';
import { EachMessagePayload } from 'kafkajs';
import { IMongodbOperation } from 'egg-freelog-base';
/**
 * 文件meta分析结果处理
 */
export declare class FileMetaAnalyseResultEventHandler implements IKafkaSubscribeMessageHandle {
    fileStorageProvider: IMongodbOperation<any>;
    consumerGroupId: string;
    subscribeTopicName: string;
    constructor();
    /**
     * 消息处理
     * @param payload
     */
    messageHandle(payload: EachMessagePayload): Promise<void>;
}
