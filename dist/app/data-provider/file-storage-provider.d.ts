import { MongodbOperation } from 'egg-freelog-base';
import { FileStorageInfo } from '../../interface/file-storage-info-interface';
export default class FileStorageProvider extends MongodbOperation<FileStorageInfo> {
    constructor(model: any);
}
