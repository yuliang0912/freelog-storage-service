import {ValidatorResult} from 'jsonschema';

export interface NodeInfo {
    nodeId: number;
    nodeName: string;
    nodeDomain: string;
}

export enum JsonObjectOperationTypeEnum {
    AppendOrReplace = 'AppendOrReplace',
    Remove = 'Remove'
}

export interface ResourceInfo {
    resourceId?: string;
    resourceName: string;
    resourceType: string;
    userId: number;
    username: string;
    resourceVersions: any[];
    baseUpcastResources: object[];
    intro?: string;
    coverImages?: string[];
    policies?: any[];
    status: number;
    latestVersion?: string;
    tags?: string[];
}

/**
 * 针对json文件流的编辑操作
 */
export interface JsonObjectOperation {
    key: string;
    type: JsonObjectOperationTypeEnum;
    value?: string | number | null | object | [];
    isExecute?: boolean;
}

export interface ResourceDependencyTreeInfo {
    resourceId: string;
    resourceName: string;
    version: string;
    versions: string[];
    versionRange: string;
    resourceType: string;
    versionId: string;
    fileSha1: string;
    baseUpcastResources: any[];
    dependencies: ResourceDependencyTreeInfo[];
}

/**
 * 针对object做校验的基础接口
 */
export interface IJsonSchemaValidate {
    validate(instance: [] | object): ValidatorResult;
}

export interface IOutsideApiService {

    getResourceListByNames(resourceNames: string[], options?: object): Promise<ResourceInfo[]>;

    getNodeInfoById(nodeId: number, options?: object): Promise<NodeInfo>;

    getNodeInfoByName(nodeName: string, options?: object): Promise<NodeInfo>;

    getNodeInfoByDomain(nodeDomain: string, options?: object): Promise<NodeInfo>;

    getNodeList(nodeIds?: number[], nodeDomains?: string[]): Promise<NodeInfo[]>

    getResourceDependencyTree(resourceId: string, options?: object): Promise<ResourceDependencyTreeInfo[]>;
}
