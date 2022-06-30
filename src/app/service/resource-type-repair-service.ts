import {inject, provide} from 'midway';
import {IMongodbOperation} from 'egg-freelog-base';
import {first} from 'lodash';
import {FileStorageInfo} from '../../interface/file-storage-info-interface';
import {FileStorageService} from './file-storage-service';
import {OutsideApiService} from './outside-api-service';

@provide()
export class ResourceTypeRepairService {
    @inject()
    objectStorageProvider: IMongodbOperation<any>;
    @inject()
    fileStorageProvider: IMongodbOperation<FileStorageInfo>;
    @inject()
    fileStorageService: FileStorageService;
    @inject()
    outsideApiService: OutsideApiService;

    async resourceTypeRepair() {
        this.objectStorageProvider.find({}, 'resourceType').then(async list => {
            for (const item of list) {
                const resourceType = first<string>(item.resourceType) === '' ? [] : item.resourceType;
                this.objectStorageProvider.updateOne({_id: item.objectId}, {resourceType}).then();
            }
        });
    }

    async fileStorageMetaInfoRepair() {
        await this.fileStorageProvider.find({}).then(async list => {
            for (const fileStorageInfo of list) {
                let filename = 'unknow';
                if (fileStorageInfo.fileExtNames.length) {
                    filename += fileStorageInfo.fileExtNames[0];
                }
                if (fileStorageInfo.sha1 === 'a4a36fb2163edf82e74b4c923c0ba003050fcb3c') {
                    console.log(fileStorageInfo.sha1, filename);
                }
                this.fileStorageService.sendAnalyzeFilePropertyTask(fileStorageInfo, filename).then();
                // const fileExtSet = new Set<string>();
                // await this.outsideApiService.getResourceVersionBySha1(fileStorageInfo.sha1).then(list => {
                //     list.forEach(x => fileExtSet.add(this.getFileExt(x.filename)));
                // });
                // await this.objectStorageProvider.find({sha1: fileStorageInfo.sha1}, 'objectName').then(list => {
                //     list.forEach(x => fileExtSet.add(this.getFileExt(x.objectName)));
                // });
                // const fileExtNames = uniq([...fileExtSet.values()].filter(x => x?.length));
                // this.fileStorageProvider.updateOne({sha1: fileStorageInfo.sha1}, {
                //     fileExtNames
                // }).then();
            }
        });
    }

    // private getFileExt(filename: string) {
    //     if (!filename || filename.indexOf('.') <= 0) {
    //         return null;
    //     }
    //     return filename.substring(filename.lastIndexOf('.'));
    // }
}
