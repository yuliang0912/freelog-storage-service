import { KafkaClient } from './client';
import { FileMetaAnalyseResultEventHandler } from '../event-handler/file-meta-analyse-result-event-handler';
export declare class KafkaStartup {
    kafkaConfig: any;
    kafkaClient: KafkaClient;
    fileMetaAnalyseResultEventHandler: FileMetaAnalyseResultEventHandler;
    /**
     * 启动,连接kafka-producer,订阅topic
     */
    startUp(): Promise<void>;
    /**
     * 订阅
     */
    subscribeTopics(): Promise<void>;
}
