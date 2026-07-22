// RF-05 (feature 004-estilo-primer-nas-telas): harness e2e com verificação de
// acessibilidade. Roda sempre contra o build de produção — o mesmo artefato que a
// Vercel serve —, nunca contra o dev server, para que a linha de base de
// acessibilidade e a CSP observadas sejam as reais.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
