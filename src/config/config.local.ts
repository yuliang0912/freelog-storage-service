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

    // config.mongoose = {
    //     url: 'mongodb://39.108.77.211:30772/storage'
    // };

    config.localIdentity = {
        userId: 50028,
        username: 'yuliang'
    };

    return config;
};
