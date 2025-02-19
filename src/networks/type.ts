/**
 * Network is the network that the wallet provider is connected to.
 */
export interface Network {
  /*
   * The name of the current network
   */
  name?: string;

  /**
   * The protocol family of the network.
   */
  protocolFamily: string;

  /*
   * The Chain ID of the current network
   */
  chainId?: string;

  /*
   * The currency of the current network
   */
  currency?: string;
}
