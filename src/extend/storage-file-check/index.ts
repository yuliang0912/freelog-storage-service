import {createHash} from 'crypto';
import {getType} from 'mime';
import {providerWrapper, IApplicationContext} from 'midway';
import {FileSystemMeta} from '../../interface/storage-object-interface';

export interface IFileCheck {
    check(fileStream: object): Promise<object>;
}

async function baseFileCheckHandle(fileStream): Promise<FileSystemMeta> {
    let fileSize = 0;
    const sha1sum = createHash('sha1')
    let mimeType = getType(fileStream.filename);
    if (!mimeType) {
        mimeType = fileStream.mimeType;
    }
    return new Promise((resolve, reject) => {
        fileStream.on('data', chunk => {
            sha1sum.update(chunk)
            fileSize += chunk.length;
        }).on('end', () => resolve({
            sha1: sha1sum.digest('hex'), fileSize, mimeType, filename: fileStream.filename.trim()
        })).on('error', reject);
    });
}

async function getCheckByResourceType(context, resourceType): Promise<IFileCheck> {
    if (resourceType === 'image') {
        return context.getAsync('imageFileCheck');
    }
    return null;
}

export function storageFileCheck(context: IApplicationContext) {
    return async (fileStream, resourceType): Promise<FileSystemMeta> => {
        const checkHandler = await getCheckByResourceType(context, resourceType);
        const task1 = baseFileCheckHandle(fileStream);
        const task2 = checkHandler ? checkHandler.check(fileStream) : undefined;
        return Promise.all([task1, task2]).then(([fileBaseInfo, checkInfo]) => {
            return Object.assign(fileBaseInfo, checkInfo);
        });
    };
}

providerWrapper([{
    id: 'storageFileCheck',
    provider: storageFileCheck,
}]);
