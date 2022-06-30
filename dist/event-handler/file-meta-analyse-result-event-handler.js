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
        if (eventInfo.sha1 === 'a4a36fb2163edf82e74b4c923c0ba003050fcb3c') {
            console.log('event', JSON.stringify(message));
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1tZXRhLWFuYWx5c2UtcmVzdWx0LWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9maWxlLW1ldGEtYW5hbHlzZS1yZXN1bHQtZXZlbnQtaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFFQSxtQ0FBeUQ7QUFHekQsNEVBQTRFO0FBRTVFOztHQUVHO0FBR0gsSUFBYSxpQ0FBaUMsR0FBOUMsTUFBYSxpQ0FBaUM7SUFVMUM7UUFIQSxvQkFBZSxHQUFHLDJEQUEyRCxDQUFDO1FBQzlFLHVCQUFrQixHQUFHLGdDQUFnQyxDQUFDLENBQUUsb0NBQW9DO1FBR3hGLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBMkI7UUFDM0MsTUFBTSxFQUFDLE9BQU8sRUFBQyxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLFNBQVMsR0FBMkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDL0UsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLDBDQUEwQyxFQUFFO1lBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNqRDtRQUNELE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxFQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFDLEVBQUU7WUFDN0QsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7U0FDL0IsQ0FBQyxDQUFDO1FBQ0gsdUJBQXVCO1FBQ3ZCLHVHQUF1RztRQUN2Ryx1R0FBdUc7UUFDdkcsYUFBYTtJQUNqQixDQUFDO0NBQ0osQ0FBQTtBQTlCRztJQURDLGVBQU0sRUFBRTs7OEVBQ21DO0FBRTVDO0lBREMsZUFBTSxFQUFFOztxRkFDa0I7QUFMbEIsaUNBQWlDO0lBRjdDLGdCQUFPLEVBQUU7SUFDVCxjQUFLLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUM7O0dBQ2QsaUNBQWlDLENBaUM3QztBQWpDWSw4RUFBaUMifQ==