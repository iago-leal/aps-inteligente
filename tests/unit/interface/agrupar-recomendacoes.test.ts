// T001 (feature 005-redacao-metformina-tfg) — agrupador de recomendações para
// renderização (RF-01/RF-03; decisões D-01/D-02 do roadmap). O motor não muda:
// este módulo apenas subordina, na apresentação, a redução por TFG à manutenção
// da metformina quando as duas coexistem na mesma saída.
import { describe, expect, it } from "vitest";
import { agruparRecomendacoes } from "interface/calculadora/agrupar-recomendacoes";
import type { Recomendacao } from "models/insulina/tipos";

const referencia = {
  fonteId: "guia-rapido-dm-sms-rio",
  versaoEdicao: "2.ª ed. atualizada, 2023",
  localizacao: "p. 60; Figura 4, p. 62",
} as const;

const referenciaTfg = {
  fonteId: "guia-rapido-dm-sms-rio",
  versaoEdicao: "2.ª ed. atualizada, 2023",
  localizacao: "p. 58",
} as const;

const manterMetformina: Recomendacao = {
  tipo: "MANTER_METFORMINA",
  mensagem: "Manter a metformina ao iniciar a insulina NPH.",
  referencia,
};

const manterSulfonilureia: Recomendacao = {
  tipo: "MANTER_SULFONILUREIA",
  mensagem: "Manter a sulfonilureia ao iniciar a insulina NPH.",
  referencia,
};

const aferirJejum: Recomendacao = {
  tipo: "AFERIR_JEJUM_3X_SEMANA_15_DIAS",
  mensagem:
    "Orientar aferição de glicemia capilar em jejum três vezes por semana, com registro, durante 15 dias.",
  referencia,
};

const reduzirPorTfg: Recomendacao = {
  tipo: "REDUZIR_METFORMINA_TFG",
  mensagem:
    "TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%.",
  referencia: referenciaTfg,
};

describe("agruparRecomendacoes — par metformina × TFG (RF-01)", () => {
  it("subordina a redução por TFG à manutenção quando as duas coexistem", () => {
    const grupos = agruparRecomendacoes([
      manterMetformina,
      manterSulfonilureia,
      aferirJejum,
      reduzirPorTfg,
    ]);

    expect(grupos.map((g) => g.principal.tipo)).toEqual([
      "MANTER_METFORMINA",
      "MANTER_SULFONILUREIA",
      "AFERIR_JEJUM_3X_SEMANA_15_DIAS",
    ]);
    expect(grupos[0].subitens.map((s) => s.tipo)).toEqual([
      "REDUZIR_METFORMINA_TFG",
    ]);
    expect(grupos[1].subitens).toEqual([]);
    expect(grupos[2].subitens).toEqual([]);
  });

  it("mantém a redução por TFG no topo quando a manutenção está ausente (fallback D-02)", () => {
    const grupos = agruparRecomendacoes([manterSulfonilureia, reduzirPorTfg]);

    expect(grupos.map((g) => g.principal.tipo)).toEqual([
      "MANTER_SULFONILUREIA",
      "REDUZIR_METFORMINA_TFG",
    ]);
    expect(grupos.every((g) => g.subitens.length === 0)).toBe(true);
  });
});

describe("agruparRecomendacoes — invariância fora do par (RF-03)", () => {
  it("sem coexistência, devolve a lista idêntica e na mesma ordem", () => {
    const entrada = [manterMetformina, manterSulfonilureia, aferirJejum];
    const grupos = agruparRecomendacoes(entrada);

    expect(grupos.map((g) => g.principal)).toEqual(entrada);
    expect(grupos.every((g) => g.subitens.length === 0)).toBe(true);
  });

  it("preserva os objetos por referência, sem clonar nem mutar", () => {
    const entrada = [manterMetformina, reduzirPorTfg];
    const copia = [...entrada];
    const grupos = agruparRecomendacoes(entrada);

    expect(grupos[0].principal).toBe(manterMetformina);
    expect(grupos[0].subitens[0]).toBe(reduzirPorTfg);
    expect(entrada).toEqual(copia);
  });

  it("lista vazia devolve lista vazia", () => {
    expect(agruparRecomendacoes([])).toEqual([]);
  });
});
