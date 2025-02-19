import { BaseAccount } from "../accounts";
import { IAdapter, StoredAdapterMetadata } from "../types";
import { FUNCTION_DECORATOR_KEY } from "./decorator";

/**
 * AdapterProvider is the abstract base class for all adapters.
 *
 * @abstract
 */
export abstract class AdapterProvider<
  IBaseAccount extends BaseAccount = BaseAccount
> {
  /**
   * The name of the adapter provider.
   */
  public readonly name: string;

  /**
   * The adapter provider functions to combine.
   */
  public readonly adapterFunctions: AdapterProvider<IBaseAccount>[];

  /**
   * The constructor for the adapter provider.
   *
   * @param name - The name of the adapter provider.
   * @param adapterFunctions - The adapter provider functions to combine.
   */
  constructor(name: string, adapterFunctions: AdapterProvider<IBaseAccount>[]) {
    this.name = name;
    this.adapterFunctions = adapterFunctions;
  }

  /**
   * Gets the functions of the adapter provider bound to the given account.
   *
   * @param account - The base account provider.
   * @returns The functions of the adapter provider.
   */
  getFunctions(account: IBaseAccount): IAdapter[] {
    const adapters: IAdapter[] = [];

    const adapterFunctions = [this, ...this.adapterFunctions];

    for (const adapterfunction of adapterFunctions) {
      const adaptersMetadataMap: StoredAdapterMetadata | undefined =
        Reflect.getMetadata(
          FUNCTION_DECORATOR_KEY,
          adapterfunction.constructor
        );

      if (!adaptersMetadataMap) {
        if (!(adapterfunction instanceof AdapterProvider)) {
          console.warn(
            `Warning: ${adapterfunction} is not an instance of AdapterProvider.`
          );
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
          invoke: (schemaArgs) => {
            const args: unknown[] = [];
            if (adapterMetadata.account) {
              args[0] = account;
            }

            args.push(schemaArgs);

            return adapterMetadata.invoke.apply(adapterfunction, args);
          },
        });
      }
    }

    return adapters;
  }
}
