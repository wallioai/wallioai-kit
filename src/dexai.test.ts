import { z } from "zod";
import { AdapterProvider, UseFunction } from "./adapters";
import { BaseAccount } from "./accounts";
import { DexAi } from "./dexai";

class MockAccount extends BaseAccount {
  getAddress() {
    return "0xMockAddress";
  }
  getNetwork() {
    return { name: "MockNet", chainId: "1", protocolFamily: "evm" };
  }
  getName() {
    return "MockAccount";
  }
  async getBalance() {
    return BigInt(1000);
  }
  async nativeTransfer(to, value) {
    return "0xMockTxHash";
  }
}

class MockAdapter extends AdapterProvider {
  constructor() {
    super("MockAdapter", []);
  }

  @UseFunction({
    name: "mockFunction",
    description: "A mock function",
    schema: z.object({}),
  })
  mockFunction(account) {
    return [
      {
        name: "mockFunction",
        description: "A mock function",
        schema: {},
        invoke: async () => "mock result",
      },
    ];
  }
}
describe("dexai", () => {
  let adapter: MockAdapter;
  let account: MockAccount;
  let dexAi: DexAi;

  beforeEach(async () => {
    account = new MockAccount();
    adapter = new MockAdapter();
    dexAi = await DexAi.init({ account, adapters: [adapter] });
  });

  test("should initialize with provided account and adapters", () => {
    expect(dexAi.account).toBe(account);
    expect(dexAi.adapters).toContain(adapter);
  });

  test("should throw an error if no account is provided", async () => {
    //@ts-ignore
    await expect(DexAi.init({ adapters: [adapter] })).rejects.toThrow("provide an account");
  });

  test("should retrieve functions from adapters", () => {
    const functions = dexAi.getFunctions();
    expect(functions).toHaveLength(1);
    expect(functions[0].name).toBe("MockAdapter_mockFunction");
  });
});
