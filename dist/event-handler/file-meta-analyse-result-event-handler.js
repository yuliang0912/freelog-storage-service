"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileMetaAnalyseResultEventHandler = void 0;
const midway_1 = require("midway");
// import {FileStorageInfo} from '../interface/file-storage-info-interface';
/**
 * 文件meta分析结果处理
 */
let FileMetaAnalyseResultEventHandler = class FileMetaAnalyseResultEventHandler {
    constructor() {
        this.consumerGroupId = 'freelog-storage-service#file-meta-event-handle-group-temp';
        this.subscribeTopicName = 'file-meta-analyse-result-topic'; // 'file-meta-analyse-result-topic';
        this.messageHandle = this.messageHandle.bind(this);
    }
    /**
     * 消息处理
     * @param payload
     */
    async messageHandle(payload) {
        const { message } = payload;
        const eventInfo = JSON.parse(message.value.toString());
        await this.fileStorageProvider.updateOne({ sha1: eventInfo.sha1 }, {
            metaAnalyzeStatus: eventInfo.code === 0 ? 2 : 3,
            metaInfo: eventInfo.fileMeta
        });
        // 把分析的mime直接设置到阿里云OSS上
        // const storageInfo: FileStorageInfo = await this.fileStorageProvider.findOne({sha1: eventInfo.sha1});
        // const ossClient = this.objectStorageServiceClient.setBucket(storageInfo.storageInfo.bucket).build();
        // ossClient.
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileMetaAnalyseResultEventHandler.prototype, "fileStorageProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileMetaAnalyseResultEventHandler.prototype, "objectStorageServiceClient", void 0);
FileMetaAnalyseResultEventHandler = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [])
], FileMetaAnalyseResultEventHandler);
exports.FileMetaAnalyseResultEventHandler = FileMetaAnalyseResultEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1tZXRhLWFuYWx5c2UtcmVzdWx0LWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9maWxlLW1ldGEtYW5hbHlzZS1yZXN1bHQtZXZlbnQtaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFFQSxtQ0FBeUQ7QUFHekQsNEVBQTRFO0FBRTVFOztHQUVHO0FBR0gsSUFBYSxpQ0FBaUMsR0FBOUMsTUFBYSxpQ0FBaUM7SUFVMUM7UUFIQSxvQkFBZSxHQUFHLDJEQUEyRCxDQUFDO1FBQzlFLHVCQUFrQixHQUFHLGdDQUFnQyxDQUFDLENBQUUsb0NBQW9DO1FBR3hGLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBMkI7UUFDM0MsTUFBTSxFQUFDLE9BQU8sRUFBQyxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLFNBQVMsR0FBMkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDL0UsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUMsRUFBRTtZQUM3RCxpQkFBaUIsRUFBRSxTQUFTLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtTQUMvQixDQUFDLENBQUM7UUFDSCx1QkFBdUI7UUFDdkIsdUdBQXVHO1FBQ3ZHLHVHQUF1RztRQUN2RyxhQUFhO0lBQ2pCLENBQUM7Q0FDSixDQUFBO0FBM0JHO0lBREMsZUFBTSxFQUFFOzs4RUFDbUM7QUFFNUM7SUFEQyxlQUFNLEVBQUU7O3FGQUNrQjtBQUxsQixpQ0FBaUM7SUFGN0MsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQzs7R0FDZCxpQ0FBaUMsQ0E4QjdDO0FBOUJZLDhFQUFpQyJ9