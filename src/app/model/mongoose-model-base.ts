import {config, plugin} from 'midway';

export class MongooseModelBase implements IMongooseModelBase {

    protected mongoose;
    protected uploadConfig;

    constructor(@plugin('mongoose') mongoose, @config('uploadConfig') uploadConfig) {
        this.mongoose = mongoose;
        this.uploadConfig = uploadConfig;
        return this.buildMongooseModel();
    }

    buildMongooseModel(...args): any {
        throw new Error('not implemented');
    }
}

export interface IMongooseModelBase {
    buildMongooseModel(...args): any;
}
