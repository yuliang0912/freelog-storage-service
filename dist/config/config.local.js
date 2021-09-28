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
    config.middleware = ['errorAutoSnapHandler', 'gatewayIdentityInfoHandler', 'localIdentityInfoHandler'];
    config.mongoose = {
        url: 'mongodb://127.0.0.1:27017/storage'
    };
    config.mongoose = {
        url: `mongodb://storage_service:QzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk=@dds-wz9ac40fee5c09441604-pub.mongodb.rds.aliyuncs.com:3717,dds-wz9ac40fee5c09442584-pub.mongodb.rds.aliyuncs.com:3717/test-storages?replicaSet=mgset-44484047`
    };
    // config.mongoose = {
    //     url: 'mongodb://39.108.77.211:30772/storage'
    // };
    config.localIdentity = {
        userId: 50028,
        username: 'yuliang'
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcubG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQWEsUUFBQSxXQUFXLEdBQUc7SUFDdkIsU0FBUyxFQUFFO1FBQ1AsS0FBSztRQUNMLEtBQUs7UUFDTCxTQUFTO1FBQ1QsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsVUFBVTtRQUNWLGNBQWM7S0FDakI7SUFDRCxlQUFlLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsa0JBQWUsR0FBRyxFQUFFO0lBQ2hCLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2QixNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsc0JBQXNCLEVBQUUsNEJBQTRCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztJQUV2RyxNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsR0FBRyxFQUFFLG1DQUFtQztLQUMzQyxDQUFDO0lBRUYsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLEdBQUcsRUFBRSxzT0FBc087S0FDOU8sQ0FBQztJQUVGLHNCQUFzQjtJQUN0QixtREFBbUQ7SUFDbkQsS0FBSztJQUVMLE1BQU0sQ0FBQyxhQUFhLEdBQUc7UUFDbkIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsU0FBUztLQUN0QixDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDIn0=