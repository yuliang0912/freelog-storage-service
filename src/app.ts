import {CryptoHelper} from 'egg-freelog-base';

export default class AppBootHook {
    private readonly app;

    public constructor(app) {
        this.app = app;
        // this.test().then();
    }

    async willReady() {
        this.decodeOssConfig();
        process.on('uncaughtException', function (error) {
            console.log('uncaughtException', error.message);
        });
    }

    decodeOssConfig() {
        const aliOss = this.app.config.uploadConfig.aliOss;
        if (aliOss.isCryptographic) {
            aliOss.accessKeyId = CryptoHelper.base64Decode(aliOss.accessKeyId);
            aliOss.accessKeySecret = CryptoHelper.base64Decode(aliOss.accessKeySecret);
        }
    }
}
