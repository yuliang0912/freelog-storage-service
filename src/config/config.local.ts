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

    config.middleware = [
        'errorHandler', 'localUserIdentity'
    ];

    config.localIdentity = {
        userId: 50021,
        username: 'yuliang'
    };

    return config;
};
