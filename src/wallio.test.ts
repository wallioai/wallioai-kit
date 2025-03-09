import { z } from "zod";
import { AdapterProvider, UseFunction } from "./adapters";
import { BaseAccount } from "./accounts";
import { Wallio } from "./wallio";

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
describe("wallio", () => {
  let adapter: MockAdapter;
  let account: MockAccount;
  let wallio: Wallio;

  beforeEach(async () => {
    account = new MockAccount();
    adapter = new MockAdapter();
    wallio = await Wallio.init({ account, adapters: [adapter] });
  });

  test("should initialize with provided account and adapters", () => {
    expect(wallio.account).toBe(account);
    expect(wallio.adapters).toContain(adapter);
  });

  test("should throw an error if no account is provided", async () => {
    //@ts-ignore
    await expect(Wallio.init({ adapters: [adapter] })).rejects.toThrow("provide an account");
  });

  test("should retrieve functions from adapters", () => {
    const functions = wallio.getFunctions();
    expect(functions).toHaveLength(1);
    expect(functions[0].name).toBe("MockAdapter_mockFunction");
  });
});
