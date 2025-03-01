export { D as DexAi } from './dexai-D27axkCr.js';
export { D as DexAiConfig, R as Result } from './type-m6lDjsKl.js';
import { Chain } from 'viem/chains';
import { N as Network } from './adapter-06DuPPG-.js';
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

export { Network, getChain, getNetworkInfo };
