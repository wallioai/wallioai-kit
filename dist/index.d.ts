export { W as Wallio } from './wallio-CHa3-kzI.js';
export { R as Result, W as WallioConfig } from './type-dp34ZYhZ.js';
import { Chain } from 'viem/chains';
import { N as Network } from './adapter-06DuPPG-.js';
import 'zod';

declare const ChainById: {
    abstract: number;
    arbitrum: number;
    avalanche: number;
    base: number;
    berachain: number;
    bitrock: number;
    bsc: number;
    cronos: number;
    cronoszkEVM: number;
    crossFi: number;
    ethereum: number;
    fantom: number;
    gnosis: number;
    heco: number;
    hyperEVM: number;
    linea: number;
    metis: number;
    neon: number;
    opBNB: number;
    optimism: number;
    polygon: number;
    polygonzkEVM: number;
    sei: number;
    sonic: number;
    story: number;
    tron: number;
};
declare const getChainMap: (chainId: number) => string | undefined;

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

export { ChainById, Network, getChain, getChainMap, getNetworkInfo };
