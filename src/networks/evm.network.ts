import { type Chain } from "viem/chains";
import { type Network } from "./type";
import * as chains from "viem/chains";
import { defineChain } from "viem";

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

export const prepareChain = (chain?: Chain, chainRpcs: Record<string, string[]> = {}) => {
  if (!chain) return undefined;

  const { rpcUrls, ...props } = chain;
  const { default: defaultUrls, ...others } = rpcUrls;

  const chainId = chain.id.toString();
  const customRpcUrls = chainRpcs?.[chainId] ?? [];

  return defineChain({
    ...props,
    rpcUrls: {
      ...others,
      default: {
        http: [...customRpcUrls, ...defaultUrls.http],
        webSocket: defaultUrls.webSocket,
      },
    },
  });
};
