// Integridade do manifesto do aplicativo instalável (T022; D-15).
//
// A marca é o que a revisão de linguagem não pode alcançar por descuido. `name` e
// `short_name` foram fixados pela feature 009 e vivem no dispositivo de quem instalou até a
// reinstalação: alterá-los não é revisar texto, é renomear o produto na tela inicial de
// alguém.
//
// POR QUE ELE MORA AQUI, E NÃO EM `tests/contract/` (D-15). A pasta `tests/contract/` está
// fora do `include` de `vitest.config.ts` e roda só por `npm run test:api`, sob
// configuração que exige o build de produção e um servidor de pé, porque seus testes fazem
// `fetch`. Um teste que lê arquivo estático não precisa disso, e herdaria a dependência sem
// contrapartida — pior, ficaria fora dos gates de entrega e pareceria escrito e verde sem
// nunca ter rodado. A decisão vale para todos os verificadores desta feature, e para os que
// vierem depois.

import { describe, expect, it } from "vitest";

import { CAMINHO_DO_MANIFESTO, ler } from "../../apoio/superficie-textual";

/**
 * Comprimento da `description` ANTES da revisão, medido em 27/07/2026 e não citado.
 *
 * O contrato `interfaces/manifesto-pwa.md` dizia 78, e dizia errado: era número escrito em
 * prosa, do tipo que L-13 tirou de circulação neste projeto. A régua aqui não é um teto
 * absoluto do formato — não existe teto absoluto, o corte varia por plataforma —, e sim a
 * regra que o contrato de fato enuncia: **não aproveitar a revisão para alongar**. Encurtar
 * é livre, e se a reescrita encurtar, esta constante desce junto na próxima medição.
 */
const COMPRIMENTO_ANTES = 81;

const CAMPOS_OBRIGATORIOS = [
  "name",
  "short_name",
  "description",
  "start_url",
  "scope",
  "display",
  "icons",
] as const;

describe("integridade do manifesto (public/manifest.webmanifest)", () => {
  const bruto = ler(CAMINHO_DO_MANIFESTO);

  it("é JSON válido", () => {
    expect(
      () => JSON.parse(bruto),
      "o manifesto deixou de ser JSON válido: o navegador o descarta em silêncio e a " +
        "instalação do aplicativo para de funcionar sem erro visível",
    ).not.toThrow();
  });

  const manifesto = JSON.parse(bruto) as Record<string, unknown>;

  it("traz os campos obrigatórios", () => {
    const ausentes = CAMPOS_OBRIGATORIOS.filter(
      (campo) => manifesto[campo] === undefined,
    );
    expect(ausentes, `campos ausentes: ${ausentes.join(", ")}`).toEqual([]);
  });

  it("a marca permanece: `name` e `short_name` são os da feature 009", () => {
    expect(
      manifesto.name,
      "`name` é a marca sob o ícone de quem instalou o aplicativo. Ele não é prosa " +
        "revisável: alterá-lo renomeia o produto na tela inicial de alguém.",
    ).toBe("APS Inteligente");

    expect(
      manifesto.short_name,
      "`short_name` é o rótulo curto do ícone, e vale a mesma razão de `name`.",
    ).toBe("APSi");
  });

  it("a descrição existe e a revisão não a alongou", () => {
    const descricao = String(manifesto.description ?? "");
    expect(descricao.length).toBeGreaterThan(0);
    expect(
      descricao.length,
      `a descrição tem ${descricao.length} caracteres, contra os ${COMPRIMENTO_ANTES} ` +
        `de antes da revisão. O campo é truncado na tela de instalação, com corte ` +
        `variável por plataforma, e a regra do contrato é não aproveitar a revisão para ` +
        `alongar. Encurtar é livre.`,
    ).toBeLessThanOrEqual(COMPRIMENTO_ANTES);
  });
});
