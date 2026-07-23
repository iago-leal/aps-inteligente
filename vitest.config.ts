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
    // O @primer/react importa .css de dentro do pacote; inliná-lo faz o Vite
    // processar esses imports (viram no-op no jsdom) em vez do ESM do Node falhar.
    server: { deps: { inline: [/@primer\//] } },
    // Polyfill de adoptedStyleSheets p/ o Tooltip do IconButton no jsdom (feature 011).
    // No-op em ambiente node (guardado por typeof no próprio arquivo).
    setupFiles: ["tests/apoio/setup-jsdom.ts"],
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
