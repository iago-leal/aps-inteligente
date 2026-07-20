import { defineConfig } from "vitest/config";

// Suíte de contrato (nível `contract` da pirâmide; RF-04 da feature 002):
// os testes fazem fetch contra um servidor de pé — local (`npm run build && npm start`)
// ou o alvo apontado por API_BASE_URL. Vive fora do include da suíte padrão
// (vitest.config.ts) porque exige o build de produção; no CI roda no job de contrato.
export default defineConfig({
  test: {
    include: ["tests/contract/**/*.test.ts"],
    environment: "node",
    globals: true,
  },
});
