"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const midway_1 = require("midway");
const Verifier = require("stream-json/utils/Verifier");
const index_1 = require("egg-freelog-base/index");
const StreamArray = require('stream-json/streamers/StreamArray');
function jsonFileStreamCheck(context) {
    return (readableStream) => {
        const verifier = new Verifier();
        const streamArray = readableStream.pipe(StreamArray.withParser());
        readableStream.pipe(verifier);
        return new Promise((resolve, reject) => {
            verifier.on('error', () => {
                readableStream.destroy();
                reject(new index_1.ApplicationError('node data file is only support json-object'));
            });
            // 只有解析到json文件流中包含数组,才会触发data事件
            streamArray.on('data', (data) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1vYmplY3Qtc3RyZWFtLWNoZWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC91c2VyLW5vZGUtZGF0YS1maWxlLWhhbmRsZXIvanNvbi1vYmplY3Qtc3RyZWFtLWNoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQTREO0FBQzVELHVEQUF1RDtBQUN2RCxrREFBd0Q7QUFFeEQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFFakUsU0FBZ0IsbUJBQW1CLENBQUMsT0FBNEI7SUFDNUQsT0FBTyxDQUFDLGNBQXdCLEVBQW9CLEVBQUU7UUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNoQyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFBO1FBQ2pFLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0JBQ3RCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxDQUFDLElBQUksd0JBQWdCLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDO1lBQ0gsK0JBQStCO1lBQy9CLFdBQVcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQzVCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxDQUFDLElBQUksd0JBQWdCLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFBO1lBQ0Ysb0ZBQW9GO1lBQ3BGLGNBQWMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQW5CRCxrREFtQkM7QUFFRCx3QkFBZSxDQUFDLENBQUM7UUFDYixFQUFFLEVBQUUscUJBQXFCO1FBQ3pCLFFBQVEsRUFBRSxtQkFBbUI7S0FDaEMsQ0FBQyxDQUFDLENBQUEifQ==