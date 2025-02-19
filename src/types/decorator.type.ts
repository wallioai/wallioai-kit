import z from "zod";

/**
 * Parameters for the UseFunction decorator
 */
export interface UseFunctionDecoratorParams {
  /**
   * The name of the function
   */
  name: string;

  /**
   * The description of the function
   */
  description: string;

  /**
   * The schema of the function
   */
  schema: z.ZodSchema;
}

/**
 * Metadata for Agents adapters
 */
export interface AdapterMetadata {
  /**
   * The name of the adapter
   */
  name: string;

  /**
   * The description of the adapter
   */
  description: string;

  /**
   * The schema of the adapter
   */
  schema: z.ZodSchema;

  /**
   * The function to invoke the adapter
   */
  invoke: (...args: any[]) => any;

  /**
   * The wallet provider to use for the adapter
   */
  account: boolean;
}

/**
 * A map of adapter names to their metadata
 */
export type StoredAdapterMetadata = Map<string, AdapterMetadata>;
