export enum Chain {
  ABSTRACT = "abstract",
  ARBITRUM = "arbitrum",
  AVALANCHE = "avalanche",
  BASE = "base",
  BERACHAIN = "berachain",
  BITROCK = "bitrock",
  BNBCHAIN = "bsc",
  CRONOS = "cronos",
  CRONOS_ZKEVM = "cronoszkEVM",
  CROSS_FI = "crossFi",
  ETHEREUM = "ethereum",
  FANTOM = "fantom",
  GNOSIS = "gnosis",
  HECO = "heco",
  HYPER_EVM = "hyperEVM",
  METIS = "metis",
  NEON = "neon",
  LINEA = "linea",
  OPBNB = "opBNB",
  OPTIMISM = "optimism",
  POLYGON = "polygon",
  POLYGON_ZKEVM = "polygonzkEVM",
  SEI = "sei",
  SONIC = "sonic",
  STORY = "story",
  TRON = "tron",
}

export const ChainById = {
  [Chain.ABSTRACT]: 2741,
  [Chain.ARBITRUM]: 42161,
  [Chain.AVALANCHE]: 43114,
  [Chain.BASE]: 8453,
  [Chain.BERACHAIN]: 80094,
  [Chain.BITROCK]: 7171,
  [Chain.BNBCHAIN]: 56,
  [Chain.CRONOS]: 25,
  [Chain.CRONOS_ZKEVM]: 388,
  [Chain.CROSS_FI]: 4158,
  [Chain.ETHEREUM]: 1,
  [Chain.FANTOM]: 250,
  [Chain.GNOSIS]: 100,
  [Chain.HECO]: 128,
  [Chain.HYPER_EVM]: 999,
  [Chain.LINEA]: 59144,
  [Chain.METIS]: 1088,
  [Chain.NEON]: 245022934,
  [Chain.OPBNB]: 204,
  [Chain.OPTIMISM]: 10,
  [Chain.POLYGON]: 137,
  [Chain.POLYGON_ZKEVM]: 1101,
  [Chain.SEI]: 1329,
  [Chain.SONIC]: 146,
  [Chain.STORY]: 1514,
  [Chain.TRON]: 728126428,
};

export const MainnetChains = Object.keys(ChainById).map(value => value);

export const getChainMap = (chainId: number) => {
  return Object.keys(ChainById).find(c => ChainById[c] === chainId);
};

export const getRpc = (rpcUrls: string[]) => {
  return rpcUrls[Math.floor(Math.random() * rpcUrls.length)];
};
