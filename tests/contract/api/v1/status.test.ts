import { describe, expect, test } from "vitest";
import manifesto from "../../../../package.json";

// Contrato de GET /api/v1/status (feature 002; RF-02, RF-03, RF-05;
// _reversa_forward/002-producao-pagina-e-api-status/interfaces/http-get-api-v1-status.md).
// Substitui o contrato histórico evolutivo (bundle e5e52a8): corpo fixo, cache proibido.
// Exige servidor de pé com build de produção (npm run build && npm start) ou o alvo
// apontado por API_BASE_URL (job de contrato do CI; verificação pós-deploy).

const BASE = process.env.API_BASE_URL ?? "http://localhost:3000";
const URL_STATUS = `${BASE}/api/v1/status`;

// Denylist do RN-02 (invariável): dado clínico/pessoal, segredo e variável de
// ambiente jamais aparecem na resposta serializada. Metadados públicos do produto
// (versão, commit) são permitidos.
const DENYLIST = [
  /senha/i,
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /authorization/i,
  /bearer/i,
  /private[_-]?key/i,
  /process\.env/i,
  /paciente/i,
  /prontu[aá]rio/i,
  /glicemia/i,
  /\bcpf\b/i,
  /\bcns\b/i,
  /nascimento/i,
];

describe("GET /api/v1/status", () => {
  test("200 com contrato fixo: atualizado_em ISO 8601, versao do manifesto, commit", async () => {
    const resposta = await fetch(URL_STATUS);

    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("content-type")).toContain("application/json");

    const corpo = await resposta.json();
    expect(Object.keys(corpo).sort()).toEqual(["atualizado_em", "commit", "versao"]);

    // Prova de frescor: carimbo ISO 8601 UTC válido, gerado na resposta.
    expect(new Date(corpo.atualizado_em).toISOString()).toBe(corpo.atualizado_em);

    expect(corpo.versao).toBe(manifesto.version);

    // SHA do commit publicado; "local" é o fallback correto fora do provedor.
    expect(typeof corpo.commit).toBe("string");
    expect(corpo.commit.length).toBeGreaterThan(0);
  });

  test("cache proibido (RN-05): Cache-Control no-store", async () => {
    const resposta = await fetch(URL_STATUS);
    expect(resposta.headers.get("cache-control")).toBe("no-store");
  });

  test("sem estado (RN-02): nenhum Set-Cookie", async () => {
    const resposta = await fetch(URL_STATUS);
    expect(resposta.headers.get("set-cookie")).toBeNull();
  });

  test("denylist de privacidade (RN-02): resposta sem segredo nem dado clínico/pessoal", async () => {
    const resposta = await fetch(URL_STATUS);
    const serializado = JSON.stringify(await resposta.json());
    for (const proibido of DENYLIST) {
      expect(serializado).not.toMatch(proibido);
    }
  });

  test.each(["POST", "PUT", "DELETE", "PATCH"])(
    "método %s (RN-04): 405 com Allow: GET, erro simples sem eco",
    async (metodo) => {
      const resposta = await fetch(URL_STATUS, {
        method: metodo,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eco: "jamais-refletido" }),
      });

      expect(resposta.status).toBe(405);
      expect(resposta.headers.get("allow")).toBe("GET");
      expect(resposta.headers.get("set-cookie")).toBeNull();

      const corpo = await resposta.json();
      expect(JSON.stringify(corpo)).not.toContain("jamais-refletido");
    },
  );
});
