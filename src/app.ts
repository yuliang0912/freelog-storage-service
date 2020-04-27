import {base64Decode} from 'egg-freelog-base/app/extend/helper/crypto_helper';

export default class AppBootHook {
    private readonly app;

    public constructor(app) {
        this.app = app;
    }

    async willReady() {
        this.decodeOssConfig();
    }

    decodeOssConfig() {
        const aliOss = this.app.config.uploadConfig.aliOss;
        if (aliOss.isCryptographic) {
            aliOss.accessKeyId = base64Decode(aliOss.accessKeyId);
            aliOss.accessKeySecret = base64Decode(aliOss.accessKeySecret);
        }
    }
}
