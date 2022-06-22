"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.development = void 0;
const kafkajs_1 = require("kafkajs");
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
    config.gatewayUrl = 'http://api.testfreelog.com';
    config.localIdentity = {
        userId: 50031,
        username: 'yuliang'
    };
    config.kafka = {
        enable: true,
        clientId: 'freelog-storage-service',
        logLevel: kafkajs_1.logLevel.ERROR,
        brokers: ['192.168.2.195:9092']
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcubG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQWlDO0FBRXBCLFFBQUEsV0FBVyxHQUFHO0lBQ3ZCLFNBQVMsRUFBRTtRQUNQLEtBQUs7UUFDTCxLQUFLO1FBQ0wsU0FBUztRQUNULFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFVBQVU7UUFDVixjQUFjO0tBQ2pCO0lBQ0QsZUFBZSxFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUVGLGtCQUFlLEdBQUcsRUFBRTtJQUNoQixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFFdkIsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLHNCQUFzQixFQUFFLDRCQUE0QixFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFFdkcsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLEdBQUcsRUFBRSxtQ0FBbUM7S0FDM0MsQ0FBQztJQUVGLE1BQU0sQ0FBQyxRQUFRLEdBQUc7UUFDZCxHQUFHLEVBQUUsc09BQXNPO0tBQzlPLENBQUM7SUFFRixzQkFBc0I7SUFDdEIsbURBQW1EO0lBQ25ELEtBQUs7SUFFTCxNQUFNLENBQUMsVUFBVSxHQUFHLDRCQUE0QixDQUFDO0lBRWpELE1BQU0sQ0FBQyxhQUFhLEdBQUc7UUFDbkIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsU0FBUztLQUN0QixDQUFDO0lBRUYsTUFBTSxDQUFDLEtBQUssR0FBRztRQUNYLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFLHlCQUF5QjtRQUNuQyxRQUFRLEVBQUUsa0JBQVEsQ0FBQyxLQUFLO1FBQ3hCLE9BQU8sRUFBRSxDQUFDLG9CQUFvQixDQUFDO0tBQ2xDLENBQUM7SUFFRixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUMifQ==