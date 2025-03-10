# wallioai-kit  

## 🚀 Overview  
**wallioai-kit** is a powerful NPM package that enables AI agents to seamlessly interact with blockchain assets. It provides **wallet management, cross-chain bridging, DeFi lending and borrowing, and real-time market data** through an intuitive API.  

Compatible with any AI language model (**ChatGPT, ClaudeAI, DeepSeek, and more**), wallioai-kit allows AI-powered applications to **autonomously manage wallets, execute transactions, bridge assets, and optimize DeFi strategies**.  

It powers the **[Wallio AI Agent](https://wallio.xyz)**, making **crypto transactions as easy as natural language commands**.  

---

## 📦 Installation  
```sh
npm install wallioai-kit
```

## 👨‍💻 Usage
```js
import { Wallio } from "wallioai-kit";
import {
  walletAdapterProvider,
  dlnAdapterProvider,
} from "wallioai-kit/adapters";
import { ViemAccount } from "wallioai-kit/accounts";
import { generateLangChainTools } from "wallioai-kit/tools";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient } from "viem";
import { sonic } from "viem/chains";
import { ChatOpenAI } from "@langchain/openai";

const account = privateKeyToAccount("");
const client = createWalletClient({
    account,
    chain: sonic,
    transport: http(""),
});

const walletProvider = new ViemAccount(client);
const wallio = await Wallio.init({
    account: walletProvider,
    adapters: [
        walletAdapterProvider(),
        dlnAdapterProvider(),
    ],
});
const tools = await generateLangChainTools(wallio);

const chat = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
  apiKey: OPEN_AI_KEY,
});

const agent = createReactAgent({
    llm: chat,
    tools,
    prompt: new SystemMessage(`Modifier`),
});

```