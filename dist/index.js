var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/dexai.ts
var _DexAi = class _DexAi {
  /**
  * Initializes a new DexAi instance
  *
  * @param config - Configuration options for the DexAi
  * @param config.account - The wallet account to use
  * @param config.adapters - The adapter providers to use
  */
  constructor(config) {
    __publicField(this, "account");
    __publicField(this, "adapters");
    this.account = config.account;
    this.adapters = config.adapters;
  }
  static async init(config) {
    const { account } = config;
    if (!account) {
      throw new Error("provide an account");
    }
    return new _DexAi(config);
  }
  /**
  * Returns the adapters available to the DexAi.
  *
  * @returns An array of adapters
  */
  getFunctions() {
    const adapters = [];
    for (const actionProvider of this.adapters) {
      adapters.push(...actionProvider.getFunctions(this.account));
    }
    return adapters;
  }
};
__name(_DexAi, "DexAi");
var DexAi = _DexAi;

// src/accounts/base.account.ts
var _BaseAccount = class _BaseAccount {
  constructor() {
  }
};
__name(_BaseAccount, "BaseAccount");
var BaseAccount = _BaseAccount;

// src/accounts/viem.account.ts
import { createPublicClient, encodeFunctionData, http, parseEther } from "viem";

// src/networks/evm.network.ts
import * as chains from "viem/chains";
var getChain = /* @__PURE__ */ __name((id) => {
  const chainList = Object.values(chains);
  return chainList.find((chain) => chain.id === parseInt(id));
}, "getChain");
var getNetworkInfo = /* @__PURE__ */ __name((chain) => {
  return {
    name: chain.name,
    protocolFamily: "evm",
    chainId: chain.id.toString(),
    currency: chain.nativeCurrency.symbol
  };
}, "getNetworkInfo");

// src/accounts/utils/getTransactionGas.ts
function getTransactionGas(feeData, feeDataMultiplier, gasLimit, gasLimitMultiplier) {
  const maxFeePerGas = BigInt(Math.round(Number(feeData.maxFeePerGas) * feeDataMultiplier));
  const maxPriorityFeePerGas = BigInt(Math.round(Number(feeData.maxPriorityFeePerGas) * feeDataMultiplier));
  const gasPrice = BigInt(Math.round(Number(gasLimit) * gasLimitMultiplier));
  return {
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice
  };
}
__name(getTransactionGas, "getTransactionGas");

// src/accounts/utils/validateEvmAccount.ts
var validateEvmAccount = /* @__PURE__ */ __name(({ account }) => {
  if (!account) return {
    success: false,
    errorMessage: "Wallet not connected"
  };
  return {
    success: true,
    data: {
      account
    }
  };
}, "validateEvmAccount");

// src/accounts/viem.account.ts
var _ViemAccount = class _ViemAccount extends BaseAccount {
  constructor(client) {
    super();
    __publicField(this, "publicClient");
    __publicField(this, "walletClient");
    __publicField(this, "gasLimitMultiplier");
    __publicField(this, "feePerGasMultiplier");
    this.walletClient = client;
    this.publicClient = createPublicClient({
      chain: this.walletClient.chain,
      transport: http("")
    });
    this.gasLimitMultiplier = Math.max(1.2, 1);
    this.feePerGasMultiplier = Math.max(1, 1);
  }
  getAddress() {
    return this.walletClient.account?.address ?? "";
  }
  getNetwork() {
    return getNetworkInfo(this.walletClient.chain);
  }
  getName() {
    return "viem";
  }
  async getBalance() {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Account not found");
    }
    return this.publicClient.getBalance({
      address: account.address
    });
  }
  async nativeTransfer(to, value) {
    const atomicAmount = parseEther(value);
    const hash = await this.sendTransaction({
      to,
      value: atomicAmount
    });
    const receipt = await this.waitForTransactionReceipt(hash);
    if (!receipt) {
      throw new Error("Transaction failed");
    }
    return receipt.transactionHash;
  }
  async sendTransaction(transaction) {
    const { account, chain: accountChain } = this.walletClient;
    if (!account) {
      throw new Error("Account not initialized");
    }
    const chain = transaction.chain ?? accountChain;
    if (!chain) {
      throw new Error("Chain not initialized");
    }
    let chainPublicClient = this.publicClient;
    if (transaction.chain) {
      this.publicClient = createPublicClient({
        chain: transaction.chain,
        transport: http("")
      });
      chainPublicClient = this.publicClient;
    }
    if (!chainPublicClient) {
      throw new Error("Chain not initialized");
    }
    const feeData = await chainPublicClient.estimateFeesPerGas();
    const gasLimit = await chainPublicClient.estimateGas({
      account,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data
    });
    const { gasPrice } = getTransactionGas(feeData, this.feePerGasMultiplier, gasLimit, this.gasLimitMultiplier);
    return this.walletClient.sendTransaction({
      account,
      chain,
      data: transaction.data,
      to: transaction.to,
      value: transaction.value,
      gasPrice,
      kzg: void 0
    });
  }
  async waitForTransactionReceipt(txHash, chain) {
    const chainToUse = chain ?? this.walletClient.chain;
    const client = this.getClient(chainToUse);
    return await client.waitForTransactionReceipt({
      hash: txHash
    });
  }
  async readContract(params) {
    const chainToUse = params.chain ?? this.walletClient.chain;
    const client = this.getClient(chainToUse);
    return client.readContract(params);
  }
  async writeContract(params) {
    const { account, chain: accountChain } = this.walletClient;
    if (!account) {
      throw new Error("Account not initialized");
    }
    const chain = params.chain ?? accountChain;
    const { address, abi, functionName, args, value } = params;
    const encodedData = encodeFunctionData({
      abi,
      functionName,
      args
    });
    const hash = await this.sendTransaction({
      to: address,
      data: encodedData,
      ...value && {
        value
      },
      chain
    });
    const receipt = await this.waitForTransactionReceipt(hash);
    if (!receipt) {
      throw new Error("Transaction failed");
    }
    return receipt.transactionHash;
  }
  async signTransaction(transaction) {
    const txParams = {
      account: this.walletClient.account,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      chain: this.walletClient.chain
    };
    return this.walletClient.signTransaction(txParams);
  }
  async signMessage(message, chain) {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Account not initialized");
    }
    const originalChain = this.walletClient.chain;
    if (chain) {
      this.walletClient.chain = chain;
    }
    try {
      return this.walletClient.signMessage({
        account,
        message
      });
    } finally {
      if (chain) {
        this.walletClient.chain = originalChain;
      }
    }
  }
  async signTypedData(typedData, chain) {
    const originalChain = this.walletClient.chain;
    if (chain) {
      this.walletClient.chain = chain;
    }
    try {
      return this.walletClient.signTypedData({
        account: this.walletClient.account,
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message
      });
    } finally {
      if (chain) {
        this.walletClient.chain = originalChain;
      }
    }
  }
  getClient(chain) {
    if (!chain) {
      throw new Error("Chain not initialized");
    }
    return createPublicClient({
      chain,
      transport: http("")
    });
  }
};
__name(_ViemAccount, "ViemAccount");
var ViemAccount = _ViemAccount;

// src/adapters/decorator.ts
import "reflect-metadata";
var FUNCTION_DECORATOR_KEY = Symbol("adapter:function");
function UseFunction(params) {
  return (target, propertyKey, descriptor) => {
    const prefixedActionName = `${target.constructor.name}_${params.name}`;
    const originalMethod = descriptor.value;
    const { isBaseAccount } = validateAdapterFunctionArguments(target, propertyKey);
    descriptor.value = function(...args) {
      return originalMethod.apply(this, args);
    };
    const existingMetadata = Reflect.getMetadata(FUNCTION_DECORATOR_KEY, target.constructor) || /* @__PURE__ */ new Map();
    const metaData = {
      name: prefixedActionName,
      description: params.description,
      schema: params.schema,
      invoke: descriptor.value,
      account: isBaseAccount
    };
    existingMetadata.set(propertyKey, metaData);
    Reflect.defineMetadata(FUNCTION_DECORATOR_KEY, existingMetadata, target.constructor);
    return target;
  };
}
__name(UseFunction, "UseFunction");
function validateAdapterFunctionArguments(target, propertyKey) {
  const className = target instanceof Object ? target.constructor.name : void 0;
  const params = Reflect.getMetadata("design:paramtypes", target, propertyKey);
  if (params == null) {
    throw new Error(`Failed to get parameters for adapter function ${propertyKey} on class ${className}`);
  }
  if (params.length > 2) {
    throw new Error(`Adapter function ${propertyKey} on class ${className} has more than 2 parameters`);
  }
  const baseAccountParam = params.find((param) => {
    if (!param || !param.prototype) {
      return false;
    }
    if (param === BaseAccount) return true;
    return param.prototype instanceof BaseAccount;
  });
  return {
    isBaseAccount: !!baseAccountParam
  };
}
__name(validateAdapterFunctionArguments, "validateAdapterFunctionArguments");

// src/adapters/adapter.ts
var _AdapterProvider = class _AdapterProvider {
  /**
  * The constructor for the adapter provider.
  *
  * @param name - The name of the adapter provider.
  * @param adapterFunctions - The adapter provider functions to combine.
  */
  constructor(name, adapterFunctions) {
    /**
    * The name of the adapter provider.
    */
    __publicField(this, "name");
    /**
    * The adapter provider functions to combine.
    */
    __publicField(this, "adapterFunctions");
    this.name = name;
    this.adapterFunctions = adapterFunctions;
  }
  /**
  * Gets the functions of the adapter provider bound to the given account.
  *
  * @param account - The base account provider.
  * @returns The functions of the adapter provider.
  */
  getFunctions(account) {
    const adapters = [];
    const adapterFunctions = [
      this,
      ...this.adapterFunctions
    ];
    for (const adapterfunction of adapterFunctions) {
      const adaptersMetadataMap = Reflect.getMetadata(FUNCTION_DECORATOR_KEY, adapterfunction.constructor);
      if (!adaptersMetadataMap) {
        if (!(adapterfunction instanceof _AdapterProvider)) {
          console.warn(`Warning: ${adapterfunction} is not an instance of AdapterProvider.`);
        } else {
          console.warn(`Warning: ${adapterfunction} has no actions.`);
        }
        continue;
      }
      for (const adapterMetadata of adaptersMetadataMap.values()) {
        adapters.push({
          name: adapterMetadata.name,
          description: adapterMetadata.description,
          schema: adapterMetadata.schema,
          invoke: /* @__PURE__ */ __name((schemaArgs) => {
            const args = [];
            if (adapterMetadata.account) {
              args[0] = account;
            }
            args.push(schemaArgs);
            return adapterMetadata.invoke.apply(adapterfunction, args);
          }, "invoke")
        });
      }
    }
    return adapters;
  }
};
__name(_AdapterProvider, "AdapterProvider");
var AdapterProvider = _AdapterProvider;

// src/adapters/providers/venus/index.ts
import z2 from "zod";

// src/adapters/providers/venus/schemas/borrow.schema.ts
import { z } from "zod";
import { EVM as EVM2 } from "@heyanon/sdk";

// src/adapters/providers/venus/constants.ts
import { Chain, EVM } from "@heyanon/sdk";
var { ChainIds } = EVM.constants;
var supportedChains = [
  ChainIds[Chain.BSC],
  ChainIds[Chain.ETHEREUM],
  ChainIds[Chain.BASE]
];
var supportedPools = [
  "CORE",
  "DEFI"
];
var XVS_STAKE_ADDRESS = {
  [ChainIds.bsc]: "0x051100480289e704d20e9DB4804837068f3f9204",
  [ChainIds.ethereum]: "0xA0882C2D5DF29233A092d2887A258C2b90e9b994",
  [ChainIds.base]: "0x708B54F2C3f3606ea48a8d94dab88D9Ab22D7fCd"
};
var XVS_STAKE_POOL = BigInt(0);
var XVS_TOKEN = {
  [ChainIds.bsc]: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
  [ChainIds.base]: "0xebB7873213c8d1d9913D8eA39Aa12d74cB107995",
  [ChainIds.ethereum]: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A"
};
var ORACLE_ADDRESS = {
  [ChainIds.bsc]: "0x6592b5DE802159F3E74B2486b091D11a8256ab8A",
  [ChainIds.base]: "0xcBBf58bD5bAdE357b634419B70b215D5E9d6FbeD",
  [ChainIds.ethereum]: "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94"
};
var DEFI_POOL_MARKET_TOKENS = {
  [ChainIds.bsc]: {
    ALPACA: {
      address: "0x02c5Fb0F26761093D297165e902e96D08576D344"
    },
    ANKR: {
      address: "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362"
    },
    ankrBNB: {
      address: "0x53728FD51060a85ac41974C6C3Eb1DaE42776723"
    },
    BSW: {
      address: "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379"
    },
    PLANET: {
      address: "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be"
    },
    TWT: {
      address: "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F"
    },
    USDD: {
      address: "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0"
    },
    USDT: {
      address: "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854"
    }
  }
};
var CORE_POOL_MARKET_TOKENS = {
  [ChainIds.bsc]: {
    AAVE: {
      address: "0x26DA28954763B92139ED49283625ceCAf52C6f94"
    },
    ADA: {
      address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec"
    },
    BCH: {
      address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176"
    },
    BETH: {
      address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07"
    },
    BNB: {
      address: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
      chainBased: true
    },
    BTCB: {
      address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B"
    },
    BUSD: {
      address: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D"
    },
    CAKE: {
      address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c"
    },
    DAI: {
      address: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1"
    },
    DOT: {
      address: "0x1610bc33319e9398de5f57B33a5b184c806aD217"
    },
    FDUSD: {
      address: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba"
    },
    FIL: {
      address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343"
    },
    LINK: {
      address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f"
    },
    LTC: {
      address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B"
    },
    LUNA: {
      address: "0xb91A659E88B51474767CD97EF3196A3e7cEDD2c8"
    },
    SXP: {
      address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0"
    },
    SolvBTC: {
      address: "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea"
    },
    TRX: {
      address: "0xC5D3466aA484B040eE977073fcF337f2c00071c1"
    },
    TUSD: {
      address: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E"
    },
    TWT: {
      address: "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc"
    },
    UNI: {
      address: "0x27FF564707786720C71A2e5c1490A63266683612"
    },
    USDC: {
      address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8"
    },
    USDT: {
      address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255"
    },
    WBETH: {
      address: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0"
    },
    XRP: {
      address: "0xB248a295732e0225acd3337607cc01068e3b9c10"
    },
    XVS: {
      address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D"
    },
    THE: {
      address: "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f"
    }
  },
  [ChainIds.ethereum]: {
    BAL: {
      address: "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8"
    },
    crvUSD: {
      address: "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202"
    },
    DAI: {
      address: "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657"
    },
    eBTC: {
      address: "0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2"
    },
    EIGEN: {
      address: "0x256AdDBe0a387c98f487e44b85c29eb983413c5e"
    },
    FRAX: {
      address: "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95"
    },
    LBTC: {
      address: "0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91"
    },
    sFRAX: {
      address: "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe"
    },
    SUSDS: {
      address: "0xE36Ae842DbbD7aE372ebA02C8239cd431cC063d6"
    },
    TUSD: {
      address: "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b"
    },
    USDC: {
      address: "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb"
    },
    USDS: {
      address: "0x0c6B19287999f1e31a5c0a44393b24B62D2C0468"
    },
    USDT: {
      address: "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E"
    },
    WBTC: {
      address: "0x8716554364f20BCA783cb2BAA744d39361fd1D8d"
    },
    WETH: {
      address: "0x7c8ff7d2A1372433726f879BD945fFb250B94c65"
    }
  },
  [ChainIds.base]: {
    USDC: {
      address: "0x3cb752d175740043Ec463673094e06ACDa2F9a2e"
    },
    cbBTC: {
      address: "0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72"
    },
    WETH: {
      address: "0xEB8A79bD44cF4500943bf94a2b4434c95C008599"
    },
    wsuperOETHb: {
      address: "0x75201D81B3B0b9D17b179118837Be37f64fc4930"
    }
  }
};
var BLOCKS_PER_YEAR = {
  [ChainIds.bsc]: BigInt(10512e3),
  [ChainIds.ethereum]: BigInt(2628e3),
  [ChainIds.base]: BigInt(15768e3)
};
var POOLS = {
  CORE: {
    comptroller: {
      [ChainIds.bsc]: "0xfD36E2c2a6789Db23113685031d7F16329158384",
      [ChainIds.base]: "0x0C7973F9598AA62f9e03B94E92C967fD5437426C",
      [ChainIds.ethereum]: "0x687a01ecF6d3907658f7A7c714749fAC32336D1B"
    },
    poolTokens: CORE_POOL_MARKET_TOKENS
  },
  DEFI: {
    comptroller: {
      [ChainIds.bsc]: "0x3344417c9360b963ca93A4e8305361AEde340Ab9"
    },
    poolTokens: DEFI_POOL_MARKET_TOKENS
  }
};

// src/adapters/providers/venus/schemas/borrow.schema.ts
var { getChainName } = EVM2.utils;
var borrowTokenSchema = z.object({
  chainName: z.enum(supportedChains.map(getChainName)).describe("Chain name where to execute the transaction"),
  tokenSymbol: z.string().describe("The token symbol that is involved in the transaction."),
  pool: z.enum(supportedPools).describe("The Pool in which the transaction will be executed."),
  amount: z.string().describe("Amount of tokens in decimal format")
});

// src/adapters/providers/venus/utils.ts
import { EVM as EVM3 } from "@heyanon/sdk";
var { getChainFromName } = EVM3.utils;
var validateAndGetTokenDetails = /* @__PURE__ */ __name(({ chainName, pool, tokenSymbol }) => {
  const poolDetails = POOLS[pool];
  const chainId = getChainFromName(chainName);
  if (!chainId) return {
    success: false,
    errorMessage: `Unsupported chain name: ${chainName}`
  };
  if (supportedChains.indexOf(chainId) === -1 || !poolDetails.poolTokens[chainId]) return {
    success: false,
    errorMessage: `Protocol is not supported on ${chainName}`
  };
  if (!poolDetails.comptroller[chainId]) return {
    success: false,
    errorMessage: `Pool ${pool} not supported on ${chainName}`
  };
  const tokenDetails = poolDetails.poolTokens[chainId][tokenSymbol.toUpperCase()];
  if (!tokenDetails) return {
    success: false,
    errorMessage: `Token ${tokenSymbol} not found on chain ${chainName}`
  };
  const comptroller = poolDetails.comptroller[chainId];
  const tokenAddress = tokenDetails.address;
  const isChainBased = tokenDetails.chainBased;
  const blocksPerYear = BLOCKS_PER_YEAR[chainId];
  if (!blocksPerYear) {
    return {
      success: false,
      errorMessage: `Blocks per year not configured for chain ${chainName}`
    };
  }
  return {
    success: true,
    data: {
      chainId,
      comptroller,
      tokenAddress,
      isChainBased,
      blocksPerYear
    }
  };
}, "validateAndGetTokenDetails");

// src/adapters/providers/venus/functions/borrow.ts
import { toResult } from "@heyanon/sdk";

// src/adapters/providers/venus/abis/vComptrollerAbi.ts
var vComptrollerAbi = [
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "action",
        type: "string"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "pauseState",
        type: "bool"
      }
    ],
    name: "ActionPaused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      },
      {
        indexed: false,
        internalType: "string",
        name: "action",
        type: "string"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "pauseState",
        type: "bool"
      }
    ],
    name: "ActionPaused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "state",
        type: "bool"
      }
    ],
    name: "ActionProtocolPaused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "venusDelta",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "venusBorrowIndex",
        type: "uint256"
      }
    ],
    name: "DistributedBorrowerVenus",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "supplier",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "venusDelta",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "venusSupplyIndex",
        type: "uint256"
      }
    ],
    name: "DistributedSupplierVenus",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "error",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "info",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "detail",
        type: "uint256"
      }
    ],
    name: "Failure",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "MarketEntered",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "MarketExited",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      }
    ],
    name: "MarketListed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isVenus",
        type: "bool"
      }
    ],
    name: "MarketVenus",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldCloseFactorMantissa",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newCloseFactorMantissa",
        type: "uint256"
      }
    ],
    name: "NewCloseFactor",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldCollateralFactorMantissa",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newCollateralFactorMantissa",
        type: "uint256"
      }
    ],
    name: "NewCollateralFactor",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldLiquidationIncentiveMantissa",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newLiquidationIncentiveMantissa",
        type: "uint256"
      }
    ],
    name: "NewLiquidationIncentive",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldMaxAssets",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newMaxAssets",
        type: "uint256"
      }
    ],
    name: "NewMaxAssets",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldPauseGuardian",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "newPauseGuardian",
        type: "address"
      }
    ],
    name: "NewPauseGuardian",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract PriceOracle",
        name: "oldPriceOracle",
        type: "address"
      },
      {
        indexed: false,
        internalType: "contract PriceOracle",
        name: "newPriceOracle",
        type: "address"
      }
    ],
    name: "NewPriceOracle",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract VAIControllerInterface",
        name: "oldVAIController",
        type: "address"
      },
      {
        indexed: false,
        internalType: "contract VAIControllerInterface",
        name: "newVAIController",
        type: "address"
      }
    ],
    name: "NewVAIController",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldVAIMintRate",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newVAIMintRate",
        type: "uint256"
      }
    ],
    name: "NewVAIMintRate",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldVenusRate",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newVenusRate",
        type: "uint256"
      }
    ],
    name: "NewVenusRate",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newSpeed",
        type: "uint256"
      }
    ],
    name: "VenusSpeedUpdated",
    type: "event"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address[]",
        name: "vTokens",
        type: "address[]"
      }
    ],
    name: "_addVenusMarkets",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract Unitroller",
        name: "unitroller",
        type: "address"
      }
    ],
    name: "_become",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "_borrowGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      }
    ],
    name: "_dropVenusMarket",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "_mintGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "newCloseFactorMantissa",
        type: "uint256"
      }
    ],
    name: "_setCloseFactor",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "newCollateralFactorMantissa",
        type: "uint256"
      }
    ],
    name: "_setCollateralFactor",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "newLiquidationIncentiveMantissa",
        type: "uint256"
      }
    ],
    name: "_setLiquidationIncentive",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "newMaxAssets",
        type: "uint256"
      }
    ],
    name: "_setMaxAssets",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "newPauseGuardian",
        type: "address"
      }
    ],
    name: "_setPauseGuardian",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract PriceOracle",
        name: "newOracle",
        type: "address"
      }
    ],
    name: "_setPriceOracle",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "bool",
        name: "state",
        type: "bool"
      }
    ],
    name: "_setProtocolPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract VAIControllerInterface",
        name: "vaiController_",
        type: "address"
      }
    ],
    name: "_setVAIController",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "newVAIMintRate",
        type: "uint256"
      }
    ],
    name: "_setVAIMintRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "venusRate_",
        type: "uint256"
      }
    ],
    name: "_setVenusRate",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      }
    ],
    name: "_supportMarket",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "accountAssets",
    outputs: [
      {
        internalType: "contract VToken",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "allMarkets",
    outputs: [
      {
        internalType: "contract VToken",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256"
      }
    ],
    name: "borrowAllowed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "borrowGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256"
      }
    ],
    name: "borrowVerify",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        internalType: "contract VToken",
        name: "vToken",
        type: "address"
      }
    ],
    name: "checkMembership",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "holder",
        type: "address"
      },
      {
        internalType: "contract VToken[]",
        name: "vTokens",
        type: "address[]"
      }
    ],
    name: "claimVenus",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "holder",
        type: "address"
      }
    ],
    name: "claimVenus",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address[]",
        name: "holders",
        type: "address[]"
      },
      {
        internalType: "contract VToken[]",
        name: "vTokens",
        type: "address[]"
      },
      {
        internalType: "bool",
        name: "borrowers",
        type: "bool"
      },
      {
        internalType: "bool",
        name: "suppliers",
        type: "bool"
      }
    ],
    name: "claimVenus",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "closeFactorMantissa",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "comptrollerImplementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address[]",
        name: "vTokens",
        type: "address[]"
      }
    ],
    name: "enterMarkets",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vTokenAddress",
        type: "address"
      }
    ],
    name: "exitMarket",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "getAccountLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getAllMarkets",
    outputs: [
      {
        internalType: "contract VToken[]",
        name: "",
        type: "address[]"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "getAssetsIn",
    outputs: [
      {
        internalType: "contract VToken[]",
        name: "",
        type: "address[]"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getBlockNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        internalType: "address",
        name: "vTokenModify",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "redeemTokens",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256"
      }
    ],
    name: "getHypotheticalAccountLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "minter",
        type: "address"
      }
    ],
    name: "getMintableVAI",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getVAIMintRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getXVSAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "isComptroller",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vTokenBorrowed",
        type: "address"
      },
      {
        internalType: "address",
        name: "vTokenCollateral",
        type: "address"
      },
      {
        internalType: "address",
        name: "liquidator",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256"
      }
    ],
    name: "liquidateBorrowAllowed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vTokenBorrowed",
        type: "address"
      },
      {
        internalType: "address",
        name: "vTokenCollateral",
        type: "address"
      },
      {
        internalType: "address",
        name: "liquidator",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "actualRepayAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "seizeTokens",
        type: "uint256"
      }
    ],
    name: "liquidateBorrowVerify",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "vTokenBorrowed",
        type: "address"
      },
      {
        internalType: "address",
        name: "vTokenCollateral",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "actualRepayAmount",
        type: "uint256"
      }
    ],
    name: "liquidateCalculateSeizeTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "liquidationIncentiveMantissa",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "markets",
    outputs: [
      {
        internalType: "bool",
        name: "isListed",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "collateralFactorMantissa",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isVenus",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "maxAssets",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "minter",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "mintAmount",
        type: "uint256"
      }
    ],
    name: "mintAllowed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "mintGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "mintVAIAmount",
        type: "uint256"
      }
    ],
    name: "mintVAI",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "mintVAIGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "minter",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "actualMintAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "mintTokens",
        type: "uint256"
      }
    ],
    name: "mintVerify",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "mintedVAIOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "mintedVAIs",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "oracle",
    outputs: [
      {
        internalType: "contract PriceOracle",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "pauseGuardian",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "pendingAdmin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "pendingComptrollerImplementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "protocolPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "redeemer",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "redeemTokens",
        type: "uint256"
      }
    ],
    name: "redeemAllowed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "redeemer",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "redeemAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "redeemTokens",
        type: "uint256"
      }
    ],
    name: "redeemVerify",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "refreshVenusSpeeds",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "payer",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256"
      }
    ],
    name: "repayBorrowAllowed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "payer",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "actualRepayAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "borrowerIndex",
        type: "uint256"
      }
    ],
    name: "repayBorrowVerify",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "repayVAIAmount",
        type: "uint256"
      }
    ],
    name: "repayVAI",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "repayVAIGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vTokenCollateral",
        type: "address"
      },
      {
        internalType: "address",
        name: "vTokenBorrowed",
        type: "address"
      },
      {
        internalType: "address",
        name: "liquidator",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "seizeTokens",
        type: "uint256"
      }
    ],
    name: "seizeAllowed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "seizeGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vTokenCollateral",
        type: "address"
      },
      {
        internalType: "address",
        name: "vTokenBorrowed",
        type: "address"
      },
      {
        internalType: "address",
        name: "liquidator",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "seizeTokens",
        type: "uint256"
      }
    ],
    name: "seizeVerify",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "setMintedVAIOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "src",
        type: "address"
      },
      {
        internalType: "address",
        name: "dst",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "transferTokens",
        type: "uint256"
      }
    ],
    name: "transferAllowed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "transferGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "src",
        type: "address"
      },
      {
        internalType: "address",
        name: "dst",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "transferTokens",
        type: "uint256"
      }
    ],
    name: "transferVerify",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "vaiController",
    outputs: [
      {
        internalType: "contract VAIControllerInterface",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "vaiMintRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "venusAccrued",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "venusBorrowState",
    outputs: [
      {
        internalType: "uint224",
        name: "index",
        type: "uint224"
      },
      {
        internalType: "uint32",
        name: "block",
        type: "uint32"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "venusBorrowerIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "venusClaimThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "venusInitialIndex",
    outputs: [
      {
        internalType: "uint224",
        name: "",
        type: "uint224"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "venusRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "venusSpeeds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "venusSupplierIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "venusSupplyState",
    outputs: [
      {
        internalType: "uint224",
        name: "index",
        type: "uint224"
      },
      {
        internalType: "uint32",
        name: "block",
        type: "uint32"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];

// src/adapters/providers/venus/functions/borrow.ts
import { formatUnits, parseUnits } from "viem";

// src/adapters/providers/venus/abis/vOracleABI.ts
var vOrcaleABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "vBnbAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "vaiAddress",
        type: "address"
      },
      {
        internalType: "contract BoundValidatorInterface",
        name: "_boundValidator",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "address",
        name: "calledContract",
        type: "address"
      },
      {
        internalType: "string",
        name: "methodSignature",
        type: "string"
      }
    ],
    name: "Unauthorized",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8"
      }
    ],
    name: "Initialized",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldAccessControlManager",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAccessControlManager",
        type: "address"
      }
    ],
    name: "NewAccessControlManager",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "role",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "bool",
        name: "enable",
        type: "bool"
      }
    ],
    name: "OracleEnabled",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "oracle",
        type: "address"
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "role",
        type: "uint256"
      }
    ],
    name: "OracleSet",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferStarted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "Paused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "mainOracle",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "pivotOracle",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "fallbackOracle",
        type: "address"
      }
    ],
    name: "TokenConfigAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "Unpaused",
    type: "event"
  },
  {
    inputs: [],
    name: "BNB_ADDR",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "INVALID_PRICE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "accessControlManager",
    outputs: [
      {
        internalType: "contract IAccessControlManagerV8",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "boundValidator",
    outputs: [
      {
        internalType: "contract BoundValidatorInterface",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "enum ResilientOracle.OracleRole",
        name: "role",
        type: "uint8"
      },
      {
        internalType: "bool",
        name: "enable",
        type: "bool"
      }
    ],
    name: "enableOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "enum ResilientOracle.OracleRole",
        name: "role",
        type: "uint8"
      }
    ],
    name: "getOracle",
    outputs: [
      {
        internalType: "address",
        name: "oracle",
        type: "address"
      },
      {
        internalType: "bool",
        name: "enabled",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      }
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      }
    ],
    name: "getTokenConfig",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "asset",
            type: "address"
          },
          {
            internalType: "address[3]",
            name: "oracles",
            type: "address[3]"
          },
          {
            internalType: "bool[3]",
            name: "enableFlagsForOracles",
            type: "bool[3]"
          }
        ],
        internalType: "struct ResilientOracle.TokenConfig",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      }
    ],
    name: "getUnderlyingPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "accessControlManager_",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "accessControlManager_",
        type: "address"
      }
    ],
    name: "setAccessControlManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      },
      {
        internalType: "address",
        name: "oracle",
        type: "address"
      },
      {
        internalType: "enum ResilientOracle.OracleRole",
        name: "role",
        type: "uint8"
      }
    ],
    name: "setOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "asset",
            type: "address"
          },
          {
            internalType: "address[3]",
            name: "oracles",
            type: "address[3]"
          },
          {
            internalType: "bool[3]",
            name: "enableFlagsForOracles",
            type: "bool[3]"
          }
        ],
        internalType: "struct ResilientOracle.TokenConfig",
        name: "tokenConfig",
        type: "tuple"
      }
    ],
    name: "setTokenConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "asset",
            type: "address"
          },
          {
            internalType: "address[3]",
            name: "oracles",
            type: "address[3]"
          },
          {
            internalType: "bool[3]",
            name: "enableFlagsForOracles",
            type: "bool[3]"
          }
        ],
        internalType: "struct ResilientOracle.TokenConfig[]",
        name: "tokenConfigs_",
        type: "tuple[]"
      }
    ],
    name: "setTokenConfigs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      }
    ],
    name: "updateAssetPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vToken",
        type: "address"
      }
    ],
    name: "updatePrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "vBnb",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "vai",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

// src/adapters/providers/venus/abis/vBNBAbi.ts
var vBNBAbi = [
  {
    inputs: [
      {
        internalType: "contract ComptrollerInterface",
        name: "comptroller_",
        type: "address"
      },
      {
        internalType: "contract InterestRateModel",
        name: "interestRateModel_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "initialExchangeRateMantissa_",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "name_",
        type: "string"
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string"
      },
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8"
      },
      {
        internalType: "address payable",
        name: "admin_",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "cashPrior",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "interestAccumulated",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "borrowIndex",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalBorrows",
        type: "uint256"
      }
    ],
    name: "AccrueInterest",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "accountBorrows",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalBorrows",
        type: "uint256"
      }
    ],
    name: "Borrow",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "error",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "info",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "detail",
        type: "uint256"
      }
    ],
    name: "Failure",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "liquidator",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "address",
        name: "vTokenCollateral",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "seizeTokens",
        type: "uint256"
      }
    ],
    name: "LiquidateBorrow",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "minter",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "mintAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "mintTokens",
        type: "uint256"
      }
    ],
    name: "Mint",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldAdmin",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address"
      }
    ],
    name: "NewAdmin",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract ComptrollerInterface",
        name: "oldComptroller",
        type: "address"
      },
      {
        indexed: false,
        internalType: "contract ComptrollerInterface",
        name: "newComptroller",
        type: "address"
      }
    ],
    name: "NewComptroller",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract InterestRateModel",
        name: "oldInterestRateModel",
        type: "address"
      },
      {
        indexed: false,
        internalType: "contract InterestRateModel",
        name: "newInterestRateModel",
        type: "address"
      }
    ],
    name: "NewMarketInterestRateModel",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldPendingAdmin",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "newPendingAdmin",
        type: "address"
      }
    ],
    name: "NewPendingAdmin",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldReserveFactorMantissa",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newReserveFactorMantissa",
        type: "uint256"
      }
    ],
    name: "NewReserveFactor",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "redeemer",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "redeemAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "redeemTokens",
        type: "uint256"
      }
    ],
    name: "Redeem",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "payer",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "accountBorrows",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalBorrows",
        type: "uint256"
      }
    ],
    name: "RepayBorrow",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "benefactor",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "addAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newTotalReserves",
        type: "uint256"
      }
    ],
    name: "ReservesAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "admin",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reduceAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newTotalReserves",
        type: "uint256"
      }
    ],
    name: "ReservesReduced",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback"
  },
  {
    constant: false,
    inputs: [],
    name: "_acceptAdmin",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "reduceAmount",
        type: "uint256"
      }
    ],
    name: "_reduceReserves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract ComptrollerInterface",
        name: "newComptroller",
        type: "address"
      }
    ],
    name: "_setComptroller",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract InterestRateModel",
        name: "newInterestRateModel",
        type: "address"
      }
    ],
    name: "_setInterestRateModel",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address payable",
        name: "newPendingAdmin",
        type: "address"
      }
    ],
    name: "_setPendingAdmin",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "newReserveFactorMantissa",
        type: "uint256"
      }
    ],
    name: "_setReserveFactor",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "accrualBlockNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "accrueInterest",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "balanceOfUnderlying",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256"
      }
    ],
    name: "borrow",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "borrowBalanceCurrent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "borrowBalanceStored",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "borrowIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "borrowRatePerBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "comptroller",
    outputs: [
      {
        internalType: "contract ComptrollerInterface",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "exchangeRateCurrent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "exchangeRateStored",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "getAccountSnapshot",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getCash",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract ComptrollerInterface",
        name: "comptroller_",
        type: "address"
      },
      {
        internalType: "contract InterestRateModel",
        name: "interestRateModel_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "initialExchangeRateMantissa_",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "name_",
        type: "string"
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string"
      },
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8"
      }
    ],
    name: "initialize",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "interestRateModel",
    outputs: [
      {
        internalType: "contract InterestRateModel",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "isVToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "contract VToken",
        name: "vTokenCollateral",
        type: "address"
      }
    ],
    name: "liquidateBorrow",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "mint",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "pendingAdmin",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "redeemTokens",
        type: "uint256"
      }
    ],
    name: "redeem",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "redeemAmount",
        type: "uint256"
      }
    ],
    name: "redeemUnderlying",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "repayBorrow",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      }
    ],
    name: "repayBorrowBehalf",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "reserveFactorMantissa",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "liquidator",
        type: "address"
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "seizeTokens",
        type: "uint256"
      }
    ],
    name: "seize",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "supplyRatePerBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalBorrows",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "totalBorrowsCurrent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalReserves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "dst",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "src",
        type: "address"
      },
      {
        internalType: "address",
        name: "dst",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];

// src/adapters/providers/venus/functions/borrow.ts
async function borrow(account, args) {
  const { chainName, pool, tokenSymbol, amount } = args;
  const isConnected = validateEvmAccount({
    account
  });
  if (!isConnected.success) {
    return toResult(isConnected.errorMessage, true);
  }
  const tokenDetails = validateAndGetTokenDetails({
    chainName,
    pool,
    tokenSymbol
  });
  if (!tokenDetails.success) {
    return toResult(tokenDetails.errorMessage, true);
  }
  try {
    const result = await account.readContract({
      abi: vComptrollerAbi,
      address: tokenDetails.data.comptroller,
      functionName: "getAccountLiquidity",
      args: [
        account.getAddress()
      ],
      chain: getChain(tokenDetails.data.chainId.toString())
    });
    const [, liquidity] = result;
    const borrowLimitInUSD = parseFloat(formatUnits(liquidity, 18));
    if (borrowLimitInUSD <= 0) {
      return toResult("No available liquidity to borrow. Please supply a collateral", true);
    }
    const oracleAddress = ORACLE_ADDRESS[tokenDetails.data.chainId];
    if (!oracleAddress) {
      return toResult(`Oracle not configured for chain ${tokenDetails.data.chainId}`, true);
    }
    const tokenPriceInUSD = await account.readContract({
      abi: vOrcaleABI,
      address: oracleAddress,
      functionName: "getUnderlyingPrice",
      args: [
        tokenDetails.data.tokenAddress
      ],
      chain: getChain(tokenDetails.data.chainId.toString())
    });
    if (borrowLimitInUSD < parseFloat(formatUnits(tokenPriceInUSD, 18)) * parseFloat(amount)) {
      return toResult("Not enough borrow limit please supply more", true);
    }
    const tx = await account.writeContract({
      address: tokenDetails.data.tokenAddress,
      abi: vBNBAbi,
      functionName: "borrow",
      args: [
        parseUnits(amount, 18)
      ],
      chain: getChain(tokenDetails.data.chainId.toString())
    });
    return toResult(`Successfully borrowed ${amount} ${tokenSymbol}. Transaction Hash: ${tx}`);
  } catch (error) {
    return toResult(`Failed to borrow token: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
}
__name(borrow, "borrow");

// src/adapters/providers/venus/index.ts
function _ts_decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate, "_ts_decorate");
function _ts_metadata(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata, "_ts_metadata");
var _VenusAdapterProvider = class _VenusAdapterProvider extends AdapterProvider {
  constructor() {
    super("venus", []);
  }
  borrow(account, args) {
    return borrow(account, args);
  }
};
__name(_VenusAdapterProvider, "VenusAdapterProvider");
var VenusAdapterProvider = _VenusAdapterProvider;
_ts_decorate([
  UseFunction({
    name: "borrow",
    description: "Borrow a token from venus lending protocol on a particular chain.",
    schema: borrowTokenSchema
  }),
  _ts_metadata("design:type", Function),
  _ts_metadata("design:paramtypes", [
    typeof ViemAccount === "undefined" ? Object : ViemAccount,
    typeof z2 === "undefined" || typeof z2.infer === "undefined" ? Object : z2.infer
  ]),
  _ts_metadata("design:returntype", void 0)
], VenusAdapterProvider.prototype, "borrow", null);
var venusAdapterProvider = /* @__PURE__ */ __name(() => new VenusAdapterProvider(), "venusAdapterProvider");

// src/adapters/providers/wallet/index.ts
import z4 from "zod";

// src/adapters/providers/wallet/schemas/signMsg.schema.ts
import { z as z3 } from "zod";
var signMessageSchema = z3.object({
  message: z3.string().describe("The message to be signed")
});

// src/adapters/providers/wallet/functions/signMessage.ts
import { toResult as toResult2 } from "@heyanon/sdk";
async function signMessage(account, args) {
  if (!args.message) {
    return toResult2("There is no message to sign", true);
  }
  const signature = await account.signMessage(args.message);
  return toResult2(`Message successfully signed. Signature Hash: ${signature}`);
}
__name(signMessage, "signMessage");

// src/adapters/providers/wallet/index.ts
function _ts_decorate2(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate2, "_ts_decorate");
function _ts_metadata2(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata2, "_ts_metadata");
var _WalletAdapterProvider = class _WalletAdapterProvider extends AdapterProvider {
  constructor() {
    super("wallet", []);
  }
  signMessage(account, args) {
    return signMessage(account, args);
  }
};
__name(_WalletAdapterProvider, "WalletAdapterProvider");
var WalletAdapterProvider = _WalletAdapterProvider;
_ts_decorate2([
  UseFunction({
    name: "sign_message",
    description: "Sign a message using user wallet",
    schema: signMessageSchema
  }),
  _ts_metadata2("design:type", Function),
  _ts_metadata2("design:paramtypes", [
    typeof ViemAccount === "undefined" ? Object : ViemAccount,
    typeof z4 === "undefined" || typeof z4.infer === "undefined" ? Object : z4.infer
  ]),
  _ts_metadata2("design:returntype", void 0)
], WalletAdapterProvider.prototype, "signMessage", null);
var walletAdapterProvider = /* @__PURE__ */ __name(() => new WalletAdapterProvider(), "walletAdapterProvider");

// src/langchain/utils.ts
import { tool } from "@langchain/core/tools";
async function generateLangChainTools(agent) {
  const adapter = agent.getFunctions();
  return adapter.map((action) => tool(async (arg) => {
    const result = await action.invoke(arg);
    return result;
  }, {
    name: action.name,
    description: action.description,
    schema: action.schema
  }));
}
__name(generateLangChainTools, "generateLangChainTools");
export {
  AdapterProvider,
  BaseAccount,
  DexAi,
  UseFunction,
  ViemAccount,
  generateLangChainTools,
  getChain,
  getNetworkInfo,
  getTransactionGas,
  validateEvmAccount,
  venusAdapterProvider,
  walletAdapterProvider
};
