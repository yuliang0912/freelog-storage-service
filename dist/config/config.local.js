"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcubG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBYSxRQUFBLFdBQVcsR0FBRztJQUN2QixTQUFTLEVBQUU7UUFDUCxLQUFLO1FBQ0wsS0FBSztRQUNMLFNBQVM7UUFDVCxRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixVQUFVO1FBQ1YsY0FBYztLQUNqQjtJQUNELGVBQWUsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFFRixrQkFBZSxHQUFHLEVBQUU7SUFDaEIsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO0lBRXZCLE1BQU0sQ0FBQyxVQUFVLEdBQUc7UUFDaEIsY0FBYyxFQUFFLG1CQUFtQjtLQUN0QyxDQUFDO0lBRUYsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLEdBQUcsRUFBRSxtQ0FBbUM7S0FDM0MsQ0FBQztJQUVGLE1BQU0sQ0FBQyxhQUFhLEdBQUc7UUFDbkIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsU0FBUztLQUN0QixDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDIn0=