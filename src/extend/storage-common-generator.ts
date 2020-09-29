import {init, scope, provide} from 'midway';
import {md5} from 'egg-freelog-base/app/extend/helper/crypto_helper';
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
     * @param {string} resourceName
     * @returns {string}
     */
    generateObjectUniqueKey(bucketName: string, objectName: string): string {
        if (!isString(bucketName) || !isString(objectName) || !bucketName.length || !objectName.length) {
            throw new Error('please check args');
        }
        return md5(`${bucketName}/${objectName}`);
    }

    generateMimeType(objectName: string): string {
        return mime.getType(objectName) ?? 'application/octet-stream';
    }
}
