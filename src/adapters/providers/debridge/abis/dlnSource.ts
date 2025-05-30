export const dlnSourceAbi = [
  {
    inputs: [],
    name: "AdminBadRole",
    type: "error",
  },
  {
    inputs: [],
    name: "CallProxyBadRole",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "orderId",
        type: "bytes32",
      },
      {
        internalType: "uint48",
        name: "takeChainId",
        type: "uint48",
      },
      {
        internalType: "uint256",
        name: "submissionsChainIdFrom",
        type: "uint256",
      },
    ],
    name: "CriticalMismatchTakeChainId",
    type: "error",
  },
  {
    inputs: [],
    name: "EthTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "ExternalCallIsBlocked",
    type: "error",
  },
  {
    inputs: [],
    name: "GovMonitoringBadRole",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectOrderStatus",
    type: "error",
  },
  {
    inputs: [],
    name: "MismatchNativeGiveAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "MismatchedOrderId",
    type: "error",
  },
  {
    inputs: [],
    name: "MismatchedTransferAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "nativeSender",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "chainIdFrom",
        type: "uint256",
      },
    ],
    name: "NativeSenderBadRole",
    type: "error",
  },
  {
    inputs: [],
    name: "NotSupportedDstChain",
    type: "error",
  },
  {
    inputs: [],
    name: "ProposedFeeTooHigh",
    type: "error",
  },
  {
    inputs: [],
    name: "SignatureInvalidV",
    type: "error",
  },
  {
    inputs: [],
    name: "TheSameFromTo",
    type: "error",
  },
  {
    inputs: [],
    name: "Unauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "UnknownEngine",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongAddressLength",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongAffiliateFeeLength",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongArgument",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongAutoArgument",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongChain",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "received",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
    ],
    name: "WrongFixedFee",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "affiliateFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "giveTokenAddress",
        type: "address",
      },
    ],
    name: "AffiliateFeePaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "paidAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "giveTokenAddress",
        type: "address",
      },
    ],
    name: "ClaimedOrderCancel",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "giveAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "giveTokenAddress",
        type: "address",
      },
    ],
    name: "ClaimedUnlock",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "makerOrderNonce",
            type: "uint64",
          },
          {
            internalType: "bytes",
            name: "makerSrc",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "giveChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "giveTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "giveAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takeChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "takeTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "takeAmount",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "receiverDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "givePatchAuthoritySrc",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "orderAuthorityAddressDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedTakerDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedCancelBeneficiarySrc",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "externalCall",
            type: "bytes",
          },
        ],
        indexed: false,
        internalType: "struct DlnBase.Order",
        name: "order",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "affiliateFee",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nativeFixFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "percentFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "referralCode",
        type: "uint32",
      },
    ],
    name: "CreatedOrder",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint88",
        name: "oldGlobalFixedNativeFee",
        type: "uint88",
      },
      {
        indexed: false,
        internalType: "uint88",
        name: "newGlobalFixedNativeFee",
        type: "uint88",
      },
    ],
    name: "GlobalFixedNativeFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint16",
        name: "oldGlobalTransferFeeBps",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "newGlobalTransferFeeBps",
        type: "uint16",
      },
    ],
    name: "GlobalTransferFeeBpsUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "orderGiveFinalAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "finalPercentFee",
        type: "uint256",
      },
    ],
    name: "IncreasedGiveAmount",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "chainIdTo",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "dlnDestinationAddress",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "enum DlnBase.ChainEngine",
        name: "chainEngine",
        type: "uint8",
      },
    ],
    name: "SetDlnDestinationAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "enum DlnSource.OrderGiveStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
    ],
    name: "UnexpectedOrderStatusForCancel",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "enum DlnSource.OrderGiveStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
    ],
    name: "UnexpectedOrderStatusForClaim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
    ],
    name: "WithdrawnFee",
    type: "event",
  },
  {
    inputs: [],
    name: "BPS_DENOMINATOR",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "EVM_ADDRESS_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GOVMONITORING_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_ADDRESS_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SOLANA_ADDRESS_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SOLANA_CHAIN_ID",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "chainEngines",
    outputs: [
      {
        internalType: "enum DlnBase.ChainEngine",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "_orderIds",
        type: "bytes32[]",
      },
      {
        internalType: "address",
        name: "_beneficiary",
        type: "address",
      },
    ],
    name: "claimBatchCancel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "_orderIds",
        type: "bytes32[]",
      },
      {
        internalType: "address",
        name: "_beneficiary",
        type: "address",
      },
    ],
    name: "claimBatchUnlock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_beneficiary",
        type: "address",
      },
    ],
    name: "claimCancel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_beneficiary",
        type: "address",
      },
    ],
    name: "claimUnlock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "collectedFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "giveTokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "giveAmount",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "takeTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "takeAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takeChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "receiverDst",
            type: "bytes",
          },
          {
            internalType: "address",
            name: "givePatchAuthoritySrc",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "orderAuthorityAddressDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedTakerDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "externalCall",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedCancelBeneficiarySrc",
            type: "bytes",
          },
        ],
        internalType: "struct DlnSource.OrderCreation",
        name: "_orderCreation",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "_affiliateFee",
        type: "bytes",
      },
      {
        internalType: "uint32",
        name: "_referralCode",
        type: "uint32",
      },
      {
        internalType: "bytes",
        name: "_permitEnvelope",
        type: "bytes",
      },
    ],
    name: "createOrder",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "deBridgeGate",
    outputs: [
      {
        internalType: "contract IDeBridgeGate",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "dlnDestinationAddresses",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getChainId",
    outputs: [
      {
        internalType: "uint256",
        name: "cid",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "makerOrderNonce",
            type: "uint64",
          },
          {
            internalType: "bytes",
            name: "makerSrc",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "giveChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "giveTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "giveAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takeChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "takeTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "takeAmount",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "receiverDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "givePatchAuthoritySrc",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "orderAuthorityAddressDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedTakerDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedCancelBeneficiarySrc",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "externalCall",
            type: "bytes",
          },
        ],
        internalType: "struct DlnBase.Order",
        name: "_order",
        type: "tuple",
      },
    ],
    name: "getOrderId",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "giveOrders",
    outputs: [
      {
        internalType: "enum DlnSource.OrderGiveStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint160",
        name: "giveTokenAddress",
        type: "uint160",
      },
      {
        internalType: "uint88",
        name: "nativeFixFee",
        type: "uint88",
      },
      {
        internalType: "uint48",
        name: "takeChainId",
        type: "uint48",
      },
      {
        internalType: "uint208",
        name: "percentFee",
        type: "uint208",
      },
      {
        internalType: "uint256",
        name: "giveAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "affiliateBeneficiary",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "affiliateAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "givePatches",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "globalFixedNativeFee",
    outputs: [
      {
        internalType: "uint88",
        name: "",
        type: "uint88",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "globalTransferFeeBps",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IDeBridgeGate",
        name: "_deBridgeGate",
        type: "address",
      },
      {
        internalType: "uint88",
        name: "_globalFixedNativeFee",
        type: "uint88",
      },
      {
        internalType: "uint16",
        name: "_globalTransferFeeBps",
        type: "uint16",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "masterNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "makerOrderNonce",
            type: "uint64",
          },
          {
            internalType: "bytes",
            name: "makerSrc",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "giveChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "giveTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "giveAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takeChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "takeTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "takeAmount",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "receiverDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "givePatchAuthoritySrc",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "orderAuthorityAddressDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedTakerDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedCancelBeneficiarySrc",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "externalCall",
            type: "bytes",
          },
        ],
        internalType: "struct DlnBase.Order",
        name: "_order",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "_addGiveAmount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_permitEnvelope",
        type: "bytes",
      },
    ],
    name: "patchOrderGive",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_chainIdTo",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_dlnDestinationAddress",
        type: "bytes",
      },
      {
        internalType: "enum DlnBase.ChainEngine",
        name: "_chainEngine",
        type: "uint8",
      },
    ],
    name: "setDlnDestinationAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "unclaimedAffiliateETHFees",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "unexpectedOrderStatusForCancel",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "unexpectedOrderStatusForClaim",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint88",
        name: "_globalFixedNativeFee",
        type: "uint88",
      },
      {
        internalType: "uint16",
        name: "_globalTransferFeeBps",
        type: "uint16",
      },
    ],
    name: "updateGlobalFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "giveTokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "giveAmount",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "takeTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "takeAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takeChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "receiverDst",
            type: "bytes",
          },
          {
            internalType: "address",
            name: "givePatchAuthoritySrc",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "orderAuthorityAddressDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedTakerDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "externalCall",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedCancelBeneficiarySrc",
            type: "bytes",
          },
        ],
        internalType: "struct DlnSource.OrderCreation",
        name: "_orderCreation",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "_sender",
        type: "address",
      },
    ],
    name: "validateCreationOrder",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "makerOrderNonce",
            type: "uint64",
          },
          {
            internalType: "bytes",
            name: "makerSrc",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "giveChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "giveTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "giveAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takeChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "takeTokenAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "takeAmount",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "receiverDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "givePatchAuthoritySrc",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "orderAuthorityAddressDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedTakerDst",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "allowedCancelBeneficiarySrc",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "externalCall",
            type: "bytes",
          },
        ],
        internalType: "struct DlnBase.Order",
        name: "order",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_tokens",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "_beneficiary",
        type: "address",
      },
    ],
    name: "withdrawFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
