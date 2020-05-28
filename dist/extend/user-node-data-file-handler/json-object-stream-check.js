"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonFileStreamCheck = void 0;
const midway_1 = require("midway");
const Verifier = require("stream-json/utils/Verifier");
const index_1 = require("egg-freelog-base/index");
const sendToWormhole = require('stream-wormhole');
const StreamArray = require('stream-json/streamers/StreamArray');
function jsonFileStreamCheck(context) {
    return (readableStream) => {
        const verifier = new Verifier();
        const streamArray = StreamArray.withParser();
        readableStream.pipe(verifier);
        readableStream.pipe(streamArray);
        return new Promise((resolve, reject) => {
            verifier.on('error', () => {
                sendToWormhole(readableStream);
                reject(new index_1.ApplicationError('node data file is only support json-object'));
            });
            // 只有解析到json文件流中包含数组,才会触发data事件
            streamArray.on('data', () => {
                sendToWormhole(readableStream);
                reject(new index_1.ApplicationError('node data file is only support json-object.'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1vYmplY3Qtc3RyZWFtLWNoZWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC91c2VyLW5vZGUtZGF0YS1maWxlLWhhbmRsZXIvanNvbi1vYmplY3Qtc3RyZWFtLWNoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLG1DQUE0RDtBQUM1RCx1REFBdUQ7QUFDdkQsa0RBQXdEO0FBRXhELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBRWpFLFNBQWdCLG1CQUFtQixDQUFDLE9BQTRCO0lBQzVELE9BQU8sQ0FBQyxjQUF3QixFQUFvQixFQUFFO1FBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFDaEMsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzdDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUIsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtnQkFDdEIsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMvQixNQUFNLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7WUFDL0UsQ0FBQyxDQUFDLENBQUM7WUFDSCwrQkFBK0I7WUFDL0IsV0FBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO2dCQUN4QixjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxJQUFJLHdCQUFnQixDQUFDLDZDQUE2QyxDQUFDLENBQUMsQ0FBQztZQUNoRixDQUFDLENBQUMsQ0FBQztZQUNILG9GQUFvRjtZQUNwRixjQUFjLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztBQUNOLENBQUM7QUFwQkQsa0RBb0JDO0FBRUQsd0JBQWUsQ0FBQyxDQUFDO1FBQ2IsRUFBRSxFQUFFLHFCQUFxQjtRQUN6QixRQUFRLEVBQUUsbUJBQW1CO0tBQ2hDLENBQUMsQ0FBQyxDQUFDIn0=