import {CryptoHelper} from 'egg-freelog-base';
import mongoose from 'egg-freelog-base/database/mongoose';

export default class AppBootHook {
    private readonly app;

    public constructor(app) {
        this.app = app;
    }

    async willReady() {
        this.decodeOssConfig();
        await mongoose(this.app).then(() => {
            return this.app.applicationContext.getAsync('kafkaStartup');
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
