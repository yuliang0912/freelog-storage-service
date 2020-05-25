"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonFileStreamCheck = void 0;
const midway_1 = require("midway");
const Verifier = require("stream-json/utils/Verifier");
const index_1 = require("egg-freelog-base/index");
const StreamArray = require('stream-json/streamers/StreamArray');
function jsonFileStreamCheck(context) {
    const fileBaseInfoCalculateTransform = context.get('fileBaseInfoCalculateTransform');
    return (readableStream) => {
        const verifier = new Verifier();
        const streamArray = StreamArray.withParser();
        const baseInfo = fileBaseInfoCalculateTransform('sha1', 'hex');
        readableStream.pipe(baseInfo);
        readableStream.pipe(verifier);
        readableStream.pipe(streamArray);
        return new Promise((resolve, reject) => {
            verifier.on('error', () => {
                readableStream.destroy();
                reject(new index_1.ApplicationError('node data file is only support json-object'));
            });
            baseInfo.on('fileSize', (fileSize) => {
                if (fileSize <= 524288) {
                    return;
                }
                reject(new index_1.ApplicationError('node data file size limit: 512kb'));
            });
            // 只有解析到json文件流中包含数组,才会触发data事件
            streamArray.on('data', () => {
                readableStream.destroy();
                reject(new index_1.ApplicationError('node data file is only support json-object'));
            });
            // streamArray.on('error', (error) => reject(error)).on('end', () => resolve(true));
            readableStream.on('error', (error) => reject(error)).on('end', () => resolve(true));
        });
    };
}
exports.jsonFileStreamCheck = jsonFileStreamCheck;
midway_1.providerWrapper([{
        id: 'jsonFileStreamCheck',
        provider: jsonFileStreamCheck,
    }]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1vYmplY3Qtc3RyZWFtLWNoZWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC91c2VyLW5vZGUtZGF0YS1maWxlLWhhbmRsZXIvanNvbi1vYmplY3Qtc3RyZWFtLWNoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLG1DQUE0RDtBQUM1RCx1REFBdUQ7QUFDdkQsa0RBQXdEO0FBRXhELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBRWpFLFNBQWdCLG1CQUFtQixDQUFDLE9BQTRCO0lBQzVELE1BQU0sOEJBQThCLEdBQW1ELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUNySSxPQUFPLENBQUMsY0FBd0IsRUFBb0IsRUFBRTtRQUNsRCxNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM3QyxNQUFNLFFBQVEsR0FBRyw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0QsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlCLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0JBQ3RCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxDQUFDLElBQUksd0JBQWdCLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDO1lBQ0gsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDakMsSUFBSSxRQUFRLElBQUksTUFBTSxFQUFFO29CQUNwQixPQUFPO2lCQUNWO2dCQUNELE1BQU0sQ0FBQyxJQUFJLHdCQUFnQixDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxDQUFDLENBQUMsQ0FBQztZQUNILCtCQUErQjtZQUMvQixXQUFXLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQ3hCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxDQUFDLElBQUksd0JBQWdCLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDO1lBQ0gsb0ZBQW9GO1lBQ3BGLGNBQWMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQTdCRCxrREE2QkM7QUFFRCx3QkFBZSxDQUFDLENBQUM7UUFDYixFQUFFLEVBQUUscUJBQXFCO1FBQ3pCLFFBQVEsRUFBRSxtQkFBbUI7S0FDaEMsQ0FBQyxDQUFDLENBQUMifQ==