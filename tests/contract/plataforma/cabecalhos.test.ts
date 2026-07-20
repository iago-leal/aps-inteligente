import { describe, expect, test } from "vitest";

// Contrato dos cabeçalhos de segurança do shell (feature 002, RF-07; RN-06;
// reconstituição do bloco headers() de ebad6a5). Exige o BUILD DE PRODUÇÃO de pé
// (npm run build && npm start): em `next dev` a CSP é desligada para o HMR.

const BASE = process.env.API_BASE_URL ?? "http://localhost:3000";

describe("GET / — cabeçalhos de segurança", () => {
  test("página raiz responde 200", async () => {
    const resposta = await fetch(`${BASE}/`);
    expect(resposta.status).toBe(200);
  });

  test("CSP sem terceiros presente em produção", async () => {
    const resposta = await fetch(`${BASE}/`);
    const csp = resposta.headers.get("content-security-policy");

    expect(csp).not.toBeNull();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    // Sem terceiros: nenhuma origem externa declarada na política.
    expect(csp).not.toMatch(/https?:\/\//);
  });

  test("Referrer-Policy: no-referrer", async () => {
    const resposta = await fetch(`${BASE}/`);
    expect(resposta.headers.get("referrer-policy")).toBe("no-referrer");
  });

  test("X-Content-Type-Options: nosniff", async () => {
    const resposta = await fetch(`${BASE}/`);
    expect(resposta.headers.get("x-content-type-options")).toBe("nosniff");
  });
});
