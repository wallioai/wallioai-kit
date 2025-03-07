import { z } from "zod";
import { supportedChains } from "../constants";
import { zeroAddress } from "viem";

// Please select the source and destination tokens from the list below for the bridging process:

// ### Source Tokens:
// 1. **ETH** - `0x0000000000000000000000000000000000000000`
// 2. **USDT** - `0xdac17f958d2ee523a2206206994597c13d831ec7`
// 3. **BNB** - `0x418d75f65a02b3d53b2418fb8e1fe493759c7605`
// 4. **USDC** - `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`
// 5. **STETH** - `0xae7ab96520de3a18e5e111b5eaab095312d7fe84`
// 6. **WBTC** - `0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`
// 7. **LINK** - `0x514910771af9ca656af840dff83e8264ecf986ca`
// 8. **WSTETH** - `0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0`
// 9. **LEO** - `0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3`
// 10. **SHIB** - `0xfcaf0e4498e78d65526a507360f755178b804ba8`

// ### Destination Tokens:
// 1. **BNB** - `0x0000000000000000000000000000000000000000`
// 2. **LINK** - `0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd`
// 3. **TON** - `0x76a797a59ba2c17726896976b7b3747bfd1d220f`
// 4. **OM** - `0xf78d2e7936f5fe18308a3b2951a93b6c4a41f5e2`
// 5. **UNI** - `0xbf5140a22578168fd562dccf235e5d43a02ce9b1`
// 6. **PEPE** - `0xef00278d7eadf3b2c05267a2f185e468ad7eab7d`
// 7. **AAVE** - `0xfb6115445bff7b52feb98650c87f44907e58f802`
// 8. **ATOM** - `0x0eb3a705fc54725037cc9e008bdede697f62f335`
// 9. **FDUSD** - `0xc5f0f7b66764f6ec8c8dff7ba683102295e16409`
// 10. **FET** - `0x031b41e504677879370e9dbcf937283a8691fa7f`

// If the token you want to bridge to isn't on the list, kindly provide the token address.

/**
 * Input schema for bridging tokens on deBridge
 */
export const bridgeTokenSchema = z.object({
  sourceChain: z
    .enum(supportedChains.map(sc => sc) as [string, ...string[]])
    .describe("Chain name from where to execute the transaction"),
  sourceTokenAddress: z
    .string()
    .default(zeroAddress)
    .optional()
    .describe("The token address that will be bridged. use default address if not provided"),
  destinationChain: z
    .enum(supportedChains.map(sc => sc) as [string, ...string[]])
    .describe("Chain name to where the source chain sends transaction"),
  destinationTokenAddress: z
    .string()
    .default(zeroAddress)
    .optional()
    .describe(
      "The token address that will be recieved after the bridge. use default address if not provided",
    ),
  to: z
    .string()
    .optional()
    .default(zeroAddress)
    .describe(`The address of the receiver. use default address if not provided.`),
  amount: z.string().describe("Amount of tokens in decimal format"),
  isConfirmed: z
    .boolean()
    .default(false)
    .describe("Never ask for confirmation except if I ask you to"),
});
