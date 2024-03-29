import {isEmpty} from 'lodash';
import {provide, inject} from 'midway';
import {IOutsideApiService, ResourceInfo, NodeInfo, ResourceDependencyTreeInfo} from '../../interface/common-interface';
import {FreelogContext} from 'egg-freelog-base';

@provide()
export class OutsideApiService implements IOutsideApiService {

    @inject()
    ctx: FreelogContext;

    /**
     * 批量获取资源
     * @param resourceNames
     * @param options
     */
    async getResourceListByNames(resourceNames: string[], options?: object): Promise<ResourceInfo[]> {
        if (isEmpty(resourceNames)) {
            return [];
        }
        // resourceNames = resourceNames.map(x => encodeURIComponent(x));
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/list?resourceNames=${resourceNames.toString()}&${optionParams.join('&')}`);
    }

    /**
     * 根据sha1获取资源版本号
     * @param sha1
     * @param options
     */
    async getResourceVersionBySha1(sha1: string, options?: object): Promise<Array<{ filename: string }>> {
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/files/${sha1}/versions/admin?${optionParams.join('&')}`);
    }

    /**
     * 获取节点信息
     * @param nodeId
     * @param options
     */
    async getNodeInfoById(nodeId: number, options?: object): Promise<NodeInfo> {
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/${nodeId}?${optionParams.join('&')}`);
    }

    /**
     * 通过节点名称获取节点新
     * @param nodeName
     * @param options
     */
    async getNodeInfoByName(nodeName: string, options?: object): Promise<NodeInfo> {
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/detail?nodeName=${nodeName}&${optionParams.join('&')}`);
    }

    /**
     * 通过域名获取节点信息
     * @param nodeDomain
     * @param options
     */
    async getNodeInfoByDomain(nodeDomain: string, options?: object): Promise<NodeInfo> {
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/detail?nodeDomain=${nodeDomain}&${optionParams.join('&')}`);
    }

    /**
     * 批量获取节点
     * @param nodeIds
     * @param nodeDomains
     */
    async getNodeList(nodeIds?: number[], nodeDomains?: string[]): Promise<NodeInfo[]> {
        let query = '';
        if (!isEmpty(nodeIds || [])) {
            query = `nodeIds=${nodeIds.toString()}`;
        } else if (!isEmpty(nodeDomains || [])) {
            query = `nodeDomains=${nodeDomains.toString()}`;
        } else {
            return [];
        }
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.nodeInfoV2}/list?${query}`);
    }

    /**
     * 获取资源依赖树
     * @param resourceIdOrName
     * @param options
     */
    async getResourceDependencyTree(resourceIdOrName: string, options?: object): Promise<ResourceDependencyTreeInfo[]> {
        resourceIdOrName = encodeURIComponent(resourceIdOrName);
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.resourceInfoV2}/${resourceIdOrName}/dependencyTree?${optionParams.join('&')}`);
    }
}
