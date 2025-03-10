import { type Chain } from "viem/chains";
import { type Network } from "./type";
import * as chains from "viem/chains";

/**
 * Get a chain from the viem chains object
 *
 * @param id - The chain ID
 * @returns The chain
 */
export const getChain = (id: string): Chain => {
  const chainList = Object.values(chains);
  return chainList.find(chain => chain.id === parseInt(id)) as Chain;
};

/**
 * Get the network of a chain
 *
 * @param chain - The chain
 * @returns The network
 */
export const getNetworkInfo = (chain: Chain): Network => {
  return {
    name: chain.name,
    protocolFamily: "evm" as const,
    chainId: chain.id.toString(),
    currency: chain.nativeCurrency.symbol,
  };
};
