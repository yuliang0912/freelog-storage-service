import {init, scope, provide} from 'midway';
import {CryptoHelper} from 'egg-freelog-base';
import {isString} from 'lodash';
import * as mime from 'mime';

@provide()
@scope('Singleton')
export class StorageCommonGenerator {

    @init()
    registerMimeTypeMap() {
        const typeMap = {
            'application/json': ['ncfg']
        };
        mime.define(typeMap);
    }

    /**
     * 生成资源唯一key
     * @param bucketName
     * @param objectName
     */
    generateObjectUniqueKey(bucketName: string, objectName: string): string {
        if (!isString(bucketName) || !isString(objectName) || !bucketName.length || !objectName.length) {
            throw new Error('please check args');
        }
        objectName = objectName.replace(/[\\|\/|:|\*|\?|"|<|>|\||\s|@|\$|#]/g, '_');
        return CryptoHelper.md5(`${bucketName}/${objectName}`);
    }

    generateMimeType(objectName: string): string {
        return mime.getType(objectName) ?? 'application/octet-stream';
    }
}
