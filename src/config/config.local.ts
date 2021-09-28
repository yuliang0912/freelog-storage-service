export const development = {
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

export default () => {
    const config: any = {};

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
