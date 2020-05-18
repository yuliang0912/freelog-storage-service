"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.development = void 0;
exports.development = {
    watchDirs: [
        'app',
        'lib',
        'service',
        'extend',
        'config',
        'app.ts',
        'agent.ts',
        'interface.ts',
    ],
    overrideDefault: true
};
exports.default = () => {
    const config = {};
    config.middleware = [
        'errorHandler', 'localUserIdentity'
    ];
    config.mongoose = {
        url: 'mongodb://127.0.0.1:27017/storage'
    };
    config.localIdentity = {
        userId: 50021,
        username: 'yuliang'
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcubG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQWEsUUFBQSxXQUFXLEdBQUc7SUFDdkIsU0FBUyxFQUFFO1FBQ1AsS0FBSztRQUNMLEtBQUs7UUFDTCxTQUFTO1FBQ1QsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsVUFBVTtRQUNWLGNBQWM7S0FDakI7SUFDRCxlQUFlLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsa0JBQWUsR0FBRyxFQUFFO0lBQ2hCLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2QixNQUFNLENBQUMsVUFBVSxHQUFHO1FBQ2hCLGNBQWMsRUFBRSxtQkFBbUI7S0FDdEMsQ0FBQztJQUVGLE1BQU0sQ0FBQyxRQUFRLEdBQUc7UUFDZCxHQUFHLEVBQUUsbUNBQW1DO0tBQzNDLENBQUM7SUFFRixNQUFNLENBQUMsYUFBYSxHQUFHO1FBQ25CLE1BQU0sRUFBRSxLQUFLO1FBQ2IsUUFBUSxFQUFFLFNBQVM7S0FDdEIsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyJ9