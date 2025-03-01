import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: [
    "src/index.ts",
    "src/tools/index.ts",
    "src/accounts/index.ts",
    "src/adapters/index.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist",
  clean: true,
});
