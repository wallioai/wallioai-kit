import { FunctionReturn } from "../type";

export function toResult(data = "", error = false): FunctionReturn {
  return {
    success: !error,
    data: error ? `ERROR: ${data}` : data,
  };
}
