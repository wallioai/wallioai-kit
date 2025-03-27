export { W as Wallio } from './wallio-D4DR5B6O.js';
export { R as Result, W as WallioConfig } from './type-B5Vx42-T.js';
import * as viem from 'viem';
import * as chains from 'viem/chains';
import { Chain } from 'viem/chains';
import { N as Network } from './adapter-CqNtFdIs.js';
export { a as Chain, C as ChainById, M as MainnetChains, g as getChainMap, b as getRpc } from './constant-iRRZsjM7.js';
import 'zod';

/**
 * Get a chain from the viem chains object
 *
 * @param id - The chain ID
 * @returns The chain
 */
declare const getChain: (id: string) => Chain;
/**
 * Get the network of a chain
 *
 * @param chain - The chain
 * @returns The network
 */
declare const getNetworkInfo: (chain: Chain) => Network;
declare const prepareChain: (chain?: Chain, chainRpcs?: Record<string, string[]>) => {
    blockExplorers?: {
        [key: string]: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
        default: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
    } | undefined;
    contracts?: chains.Prettify<{
        [key: string]: viem.ChainContract | {
            [sourceId: number]: viem.ChainContract | undefined;
        } | undefined;
    } & {
        ensRegistry?: viem.ChainContract | undefined;
        ensUniversalResolver?: viem.ChainContract | undefined;
        multicall3?: viem.ChainContract | undefined;
        universalSignatureVerifier?: viem.ChainContract | undefined;
    }> | undefined;
    id: number;
    name: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: {
        readonly default: {
            readonly http: readonly string[];
            readonly webSocket: readonly string[] | undefined;
        };
    };
    sourceId?: number | undefined;
    testnet?: boolean | undefined;
    custom?: Record<string, unknown> | undefined;
    fees?: viem.ChainFees<viem.ChainFormatters | undefined> | undefined;
    formatters?: viem.ChainFormatters | undefined;
    serializers?: viem.ChainSerializers<viem.ChainFormatters | undefined, viem.TransactionSerializable> | undefined;
} | undefined;

export { Network, getChain, getNetworkInfo, prepareChain };
