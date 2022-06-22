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
/**
 * 文件meta分析结果处理
 */
let FileMetaAnalyseResultEventHandler = class FileMetaAnalyseResultEventHandler {
    constructor() {
        this.consumerGroupId = 'freelog-storage-service#file-meta-event-handle-group';
        this.subscribeTopicName = 'file-meta-analyse-result-topic';
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
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], FileMetaAnalyseResultEventHandler.prototype, "fileStorageProvider", void 0);
FileMetaAnalyseResultEventHandler = __decorate([
    midway_1.provide(),
    midway_1.scope(midway_1.ScopeEnum.Singleton),
    __metadata("design:paramtypes", [])
], FileMetaAnalyseResultEventHandler);
exports.FileMetaAnalyseResultEventHandler = FileMetaAnalyseResultEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1tZXRhLWFuYWx5c2UtcmVzdWx0LWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9maWxlLW1ldGEtYW5hbHlzZS1yZXN1bHQtZXZlbnQtaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFFQSxtQ0FBeUQ7QUFHekQ7O0dBRUc7QUFHSCxJQUFhLGlDQUFpQyxHQUE5QyxNQUFhLGlDQUFpQztJQVExQztRQUhBLG9CQUFlLEdBQUcsc0RBQXNELENBQUM7UUFDekUsdUJBQWtCLEdBQUcsZ0NBQWdDLENBQUM7UUFHbEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUEyQjtRQUMzQyxNQUFNLEVBQUMsT0FBTyxFQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzFCLE1BQU0sU0FBUyxHQUEyQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMvRSxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBQyxFQUFFO1lBQzdELGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRO1NBQy9CLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBckJHO0lBREMsZUFBTSxFQUFFOzs4RUFDbUM7QUFIbkMsaUNBQWlDO0lBRjdDLGdCQUFPLEVBQUU7SUFDVCxjQUFLLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUM7O0dBQ2QsaUNBQWlDLENBd0I3QztBQXhCWSw4RUFBaUMifQ==