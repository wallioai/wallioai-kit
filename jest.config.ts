/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  coveragePathIgnorePatterns: ["node_modules", "dist", "docs", "index.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["./src/**"],
  coverageReporters: ["html"],
  verbose: true,
  maxWorkers: 1,
  passWithNoTests: true,
};

export default config;
