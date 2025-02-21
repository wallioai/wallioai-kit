import { BaseAccount } from "../accounts";
import {
  type AdapterMetadata,
  type StoredAdapterMetadata,
  type UseFunctionDecoratorParams,
} from "../types/decorator.type";

import "reflect-metadata";

/**
 * Metadata key for the UseFunction decorator
 */
export const FUNCTION_DECORATOR_KEY = Symbol("adapter:function");

/**
 * Decorator to embed metadata on class methods to indicate they are adapters accessible to the agent
 *
 * @param params - The parameters for the adapter decorator
 * @returns A decorator function
 *
 * @example
 * ```typescript
 * class CustomAdapterName extends AdapterProvider {
 *   @UseFunction({ name: "my_function", description: "My function", schema: myFunctionSchema })
 *   public myFunction(args: z.infer<typeof myFunctionSchema>) {
 *     // ...
 *   }
 * }
 * ```
 */
export function UseFunction(params: UseFunctionDecoratorParams) {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const prefixedActionName = `${target.constructor.name}_${params.name}`;

    const originalMethod = descriptor.value;

    const { isBaseAccount } = validateAdapterFunctionArguments(target, propertyKey);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args);
    };

    const existingMetadata: StoredAdapterMetadata =
      Reflect.getMetadata(FUNCTION_DECORATOR_KEY, target.constructor) || new Map();

    const metaData: AdapterMetadata = {
      name: prefixedActionName,
      description: params.description,
      schema: params.schema,
      invoke: descriptor.value,
      account: isBaseAccount,
    };

    existingMetadata.set(propertyKey, metaData);

    Reflect.defineMetadata(FUNCTION_DECORATOR_KEY, existingMetadata, target.constructor);

    return target;
  };
}

/**
 * Validates the arguments of an adapter function
 *
 * @param target - The target object
 * @param propertyKey - The property key
 * @returns An object containing the wallet provider flag
 */
function validateAdapterFunctionArguments(
  target: object,
  propertyKey: string,
): {
  isBaseAccount: boolean;
} {
  const className = target instanceof Object ? target.constructor.name : undefined;

  const params = Reflect.getMetadata("design:paramtypes", target, propertyKey);

  if (params == null) {
    throw new Error(
      `Failed to get parameters for adapter function ${propertyKey} on class ${className}`,
    );
  }

  if (params.length > 2) {
    throw new Error(
      `Adapter function ${propertyKey} on class ${className} has more than 2 parameters`,
    );
  }

  const baseAccountParam = params.find(param => {
    if (!param || !param.prototype) {
      return false;
    }

    if (param === BaseAccount) return true;
    return param.prototype instanceof BaseAccount;
  });

  return {
    isBaseAccount: !!baseAccountParam,
  };
}
