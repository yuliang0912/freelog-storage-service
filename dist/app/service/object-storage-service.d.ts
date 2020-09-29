import { IObjectStorageService, ObjectStorageInfo, CreateObjectStorageOptions, CreateUserNodeDataObjectOptions, ObjectDependencyInfo, UpdateObjectStorageOptions, CommonObjectDependencyTreeInfo } from '../../interface/object-storage-interface';
import { IBucketService, BucketInfo } from '../../interface/bucket-interface';
import { FileStorageInfo, IFileStorageService } from '../../interface/file-storage-info-interface';
import { IOutsideApiService, PageResult } from '../../interface/common-interface';
export declare class ObjectStorageService implements IObjectStorageService {
    ctx: any;
    ossClient: any;
    uploadConfig: any;
    storageCommonGenerator: any;
    objectStorageProvider: any;
    systemAnalysisRecordProvider: any;
    bucketService: IBucketService;
    fileStorageService: IFileStorageService;
    outsideApiService: IOutsideApiService;
    /**
     * 创建存储对象(存在时,则替换)
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
    createOrUpdateUserNodeObject(objectStorageInfo: ObjectStorageInfo, options: CreateUserNodeDataObjectOptions): Promise<ObjectStorageInfo>;
    /**
     * 更新用户存储数据
     * @param {ObjectStorageInfo} oldObjectStorageInfo - 现有的对象存储信息
     * @param {FileStorageInfo} newFileStorageInfo - 新的文件存储信息
     * @returns {Promise<ObjectStorageInfo>}
     */
    updateObject(oldObjectStorageInfo: ObjectStorageInfo, options: UpdateObjectStorageOptions): Promise<ObjectStorageInfo>;
    /**
     * 根据名称获取bucket
     * @param objectFullNames
     * @param args
     */
    getObjectListByFullNames(objectFullNames: string[], ...args: any[]): Promise<ObjectStorageInfo[]>;
    /**
     * 删除存储对象
     * @param objectStorageInfo
     */
    deleteObject(objectStorageInfo: ObjectStorageInfo): Promise<boolean>;
    /**
     * 批量删除存储对象
     * @param bucketInfo
     * @param objectIds
     */
    batchDeleteObjects(bucketInfo: BucketInfo, objectIds: string[]): Promise<boolean>;
    /**
     * 根据bucketName和objectName查询
     * @param bucketName
     * @param objectName
     * @param args
     */
    findOneByName(bucketName: string, objectName: string, ...args: any[]): Promise<ObjectStorageInfo>;
    /**
     * 通过ID或者名称查找对象
     * @param objectIdOrFullName
     * @param args
     */
    findOneByObjectIdOrName(objectIdOrFullName: string, ...args: any[]): Promise<ObjectStorageInfo>;
    findOne(condition: object, ...args: any[]): Promise<ObjectStorageInfo>;
    find(condition: object, ...args: any[]): Promise<ObjectStorageInfo[]>;
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult<ObjectStorageInfo>>;
    count(condition: object): Promise<number>;
    findAll(condition: object, page: number, pageSize: number): Promise<{
        page: number;
        pageSize: number;
        totalItem: any;
        dataList: any[];
    }>;
    /**
     * 获取对象依赖树
     * @param objectStorageInfo
     * @param isContainRootNode
     */
    getDependencyTree(objectStorageInfo: ObjectStorageInfo, isContainRootNode: boolean): Promise<CommonObjectDependencyTreeInfo[]>;
    /**
     * 生成存储对象的系统属性
     * @param fileStorageInfo
     * @param resourceType
     * @private
     */
    _buildObjectSystemProperty(fileStorageInfo: FileStorageInfo, objectName: string, resourceType: string, analyzeFileErrorHandle?: (error: any) => void): Promise<object>;
    /**
     * 构建存储对象依赖树
     * @param dependencies
     * @private
     */
    _buildObjectDependencyTree(dependencies: ObjectDependencyInfo[]): Promise<CommonObjectDependencyTreeInfo[]>;
    /**
     * 检查依赖信息
     * @param dependencyInfo
     * @returns {Promise<{releases: Array, mocks: Array}>}
     * @private
     */
    _checkDependencyInfo(dependencies: ObjectDependencyInfo[]): Promise<void>;
    /**
     * 检查循环依赖(新建或者更新名称时,都需要做检查)
     * @param objectName
     * @param dependencies
     * @param deep
     * @private
     */
    _cycleDependCheck(objectName: string, dependencies: ObjectDependencyInfo[], deep: number): Promise<{
        ret: boolean;
        deep?: number;
    }>;
}
