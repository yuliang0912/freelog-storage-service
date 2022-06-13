export default (appInfo: any) => {
    const config: any = {};

    config.keys = appInfo.name;

    config.cluster = {
        listen: {
            port: 7002,
            workers: 3
        }
    };

    config.middleware = ['errorAutoSnapHandler', 'gatewayIdentityInfoHandler'];

    config.onerror = {
        all(err, ctx) {
            ctx.type = 'application/json';
            ctx.body = JSON.stringify({ret: -1, errCode: 1, msg: err.toString(), data: null});
            ctx.status = 500;
        }
    };

    config.i18n = {
        enable: true,
        defaultLocale: 'zh-CN'
    };

    config.security = {
        xframe: {
            enable: false,
        },
        csrf: {
            enable: false,
        }
    };

    config.bodyParser = {
        enable: true,
        enableTypes: ['json', 'form', 'text'],
        formLimit: '50mb',
    };

    config.multipart = {
        autoFields: false,
        defaultCharset: 'utf8',
        fieldNameSize: 100,
        fieldSize: '100kb',
        fields: 20,
        fileSize: '200mb',
        files: 10,
        fileExtensions: [],
        whitelist: (fileName) => true,
    };

    config.uploadConfig = {
        aliOss: {
            enable: true,
            isCryptographic: true,
            accessKeyId: 'TFRBSTRGcGNBRWdCWm05UHlON3BhY0tU',
            accessKeySecret: 'M2NBYmRwQ1VESnpCa2ZDcnVzN1d2SXc1alhmNDNF',
            bucket: 'freelog-shenzhen',
            internal: false,
            region: 'oss-cn-shenzhen',
            timeout: 180000
        },
        amzS3: {}
    };

    config.clientCredentialInfo = {
        clientId: 1002,
        publicKey: 'ad472200bda12d65666df7b97282a7c6',
        privateKey: '9d3761da71ee041e648cafb2e322d968'
    };

    return config;
};
