import { IObjectStorageService, ObjectStorageInfo, CreateObjectStorageOptions, CreateUserNodeDataObjectOptions } from '../../interface/object-storage-interface';
import { IBucketService, BucketInfo } from '../../interface/bucket-interface';
import { FileStorageInfo, IFileStorageService } from '../../interface/file-storage-info-interface';
export declare class ObjectStorageService implements IObjectStorageService {
    ctx: any;
    ossClient: any;
    uploadConfig: any;
    bucketService: IBucketService;
    objectStorageProvider: any;
    systemAnalysisRecordProvider: any;
    fileStorageService: IFileStorageService;
    /**
     * 创建文件对象
     * @param {BucketInfo} bucketInfo
     * @param {CreateObjectStorageInfoOptions} options
     * @returns {Promise<ObjectStorageInfo>}
     */
    createObject(bucketInfo: BucketInfo, options: CreateObjectStorageOptions): Promise<ObjectStorageInfo>;
    /**
     * 创建用户节点数据
     * @param {CreateUserNodeDataObjectOptions} options
     * @returns {Promise<ObjectStorageInfo>}
     */
    createUserNodeObject(options: CreateUserNodeDataObjectOptions): Promise<ObjectStorageInfo>;
    /**
     * 更新用户存储数据
     * @param {ObjectStorageInfo} oldObjectStorageInfo - 现有的对象存储信息
     * @param {FileStorageInfo} newFileStorageInfo - 新的文件存储信息
     * @returns {Promise<ObjectStorageInfo>}
     */
    updateObject(oldObjectStorageInfo: ObjectStorageInfo, newFileStorageInfo: FileStorageInfo): Promise<ObjectStorageInfo>;
    deleteObject(objectStorageInfo: ObjectStorageInfo): Promise<boolean>;
    findOne(condition: object): Promise<ObjectStorageInfo>;
    find(condition: object): Promise<ObjectStorageInfo[]>;
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<ObjectStorageInfo[]>;
    count(condition: object): Promise<number>;
}
