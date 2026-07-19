import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      models: path.resolve(import.meta.dirname, "models"),
      interface: path.resolve(import.meta.dirname, "interface"),
    },
  },
  test: {
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.{ts,tsx}",
      "tests/regression/**/*.test.ts",
    ],
    environment: "node",
    coverage: {
      provider: "v8",
      // Cobertura ≥ 90% exigida apenas no domínio (RNF-04 do motor; categoria Produto).
      include: ["models/**"],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
    },
  },
});
