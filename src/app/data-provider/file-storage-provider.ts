import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';
import {FileStorageInfo} from '../../interface/file-storage-info-interface';

@provide()
@scope('Singleton')
export default class FileStorageProvider extends MongodbOperation<FileStorageInfo> {
    constructor(@inject('model.fileStorageInfo') model) {
        super(model);
    }
}
