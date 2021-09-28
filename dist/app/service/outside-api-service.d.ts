import { IOutsideApiService, ResourceInfo, NodeInfo, ResourceDependencyTreeInfo } from '../../interface/common-interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class OutsideApiService implements IOutsideApiService {
    ctx: FreelogContext;
    /**
     * 批量获取资源
     * @param resourceNames
     * @param options
     */
    getResourceListByNames(resourceNames: string[], options?: object): Promise<ResourceInfo[]>;
    /**
     * 获取节点信息
     * @param nodeId
     * @param options
     */
    getNodeInfoById(nodeId: number, options?: object): Promise<NodeInfo>;
    /**
     * 通过节点名称获取节点新
     * @param nodeName
     * @param options
     */
    getNodeInfoByName(nodeName: string, options?: object): Promise<NodeInfo>;
    /**
     * 通过域名获取节点信息
     * @param nodeDomain
     * @param options
     */
    getNodeInfoByDomain(nodeDomain: string, options?: object): Promise<NodeInfo>;
    /**
     * 批量获取节点
     * @param nodeIds
     * @param nodeDomains
     */
    getNodeList(nodeIds?: number[], nodeDomains?: string[]): Promise<NodeInfo[]>;
    /**
     * 获取资源依赖树
     * @param resourceIdOrName
     * @param options
     */
    getResourceDependencyTree(resourceIdOrName: string, options?: object): Promise<ResourceDependencyTreeInfo[]>;
}
