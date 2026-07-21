import { loadEnvConfig } from "@next/env";
import { defineConfig } from "vitest/config";

// Carrega o env com o loader do próprio Next (feature 003; RN-04). Em NODE_ENV=test
// o loader ignora .env.local por design e lê .env.test; variáveis já presentes no
// ambiente (ex.: DATABASE_URL do job de CI) têm precedência sobre os arquivos.
// A mutação de process.env não alcança os workers do vitest; a variável desce via test.env.
const { combinedEnv } = loadEnvConfig(process.cwd());

// Suíte de contrato (nível `contract` da pirâmide; RF-04 da feature 002):
// os testes fazem fetch contra um servidor de pé — local (`npm run build && npm start`)
// ou o alvo apontado por API_BASE_URL. Vive fora do include da suíte padrão
// (vitest.config.ts) porque exige o build de produção; no CI roda no job de contrato.
export default defineConfig({
  test: {
    include: ["tests/contract/**/*.test.ts"],
    environment: "node",
    globals: true,
    env: {
      ...(combinedEnv.DATABASE_URL && {
        DATABASE_URL: combinedEnv.DATABASE_URL,
      }),
    },
  },
});
