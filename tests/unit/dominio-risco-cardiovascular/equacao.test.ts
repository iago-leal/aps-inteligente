// T003 — Golden cases das Pooled Cohort Equations (RF-06/RN-03/RN-05): validação
// numérica do núcleo contra a suíte oficial do pacote R `PooledCohort` (equação
// Goff 2013), tolerância ±0,1 pp (os valores da suíte são arredondados a 1 casa).
// Cobre os três eixos — sexo, raça e as três faixas de categoria (investigation §6).
// Feature 014-risco-cardiovascular-pce.
import { describe, expect, it } from "vitest";
import { grupoDe, riscoAscvdPct, type VariaveisEquacao } from "models/risco-cardiovascular/equacao";
import type { GrupoPce } from "models/risco-cardiovascular/tipos";

const TOLERANCIA_PP = 0.1;

// Base comum (investigation §6): idade 55, colesterol total 213, HDL 50, PAS 120.
const BASE: Omit<VariaveisEquacao, "emTratamentoAntiHipertensivo" | "diabetes" | "tabagismoAtual"> = {
  idadeAnos: 55,
  colesterolTotalMgDl: 213,
  hdlMgDl: 50,
  pasMmHg: 120,
};

function variaveis(sobre: Partial<VariaveisEquacao> = {}): VariaveisEquacao {
  return {
    ...BASE,
    emTratamentoAntiHipertensivo: false,
    diabetes: false,
    tabagismoAtual: false,
    ...sobre,
  };
}

const GRUPOS: readonly GrupoPce[] = [
  "homem-branco",
  "homem-negro",
  "mulher-branca",
  "mulher-negra",
];

/** ±0,1 pp: a suíte de referência arredonda a 1 casa (investigation §6). */
function perto(obtido: number, esperado: number): void {
  expect(Math.abs(obtido - esperado)).toBeLessThanOrEqual(TOLERANCIA_PP);
}

describe("Mapeamento sexo×raça → grupo PCE (RN-05, data-delta §4)", () => {
  it("distribui os quatro grupos e trata 'outra' como branco", () => {
    expect(grupoDe("masculino", "branco")).toBe("homem-branco");
    expect(grupoDe("masculino", "outra")).toBe("homem-branco");
    expect(grupoDe("masculino", "afro-americano")).toBe("homem-negro");
    expect(grupoDe("feminino", "branco")).toBe("mulher-branca");
    expect(grupoDe("feminino", "outra")).toBe("mulher-branca");
    expect(grupoDe("feminino", "afro-americano")).toBe("mulher-negra");
  });
});

describe("Golden cases das PCE (investigation §6): ±0,1 pp", () => {
  // Cada linha: grupo → risco esperado (%), para a variação de entrada indicada.
  const BASELINE: Record<GrupoPce, number> = {
    "homem-branco": 5.4,
    "homem-negro": 6.1,
    "mulher-branca": 2.1,
    "mulher-negra": 3.0,
  };
  const TRATADA: Record<GrupoPce, number> = {
    "homem-branco": 6.3,
    "homem-negro": 9.9,
    "mulher-branca": 2.8,
    "mulher-negra": 4.6,
  };
  const FUMANTE: Record<GrupoPce, number> = {
    "homem-branco": 10.0,
    "homem-negro": 10.3,
    "mulher-branca": 5.0,
    "mulher-negra": 5.9,
  };
  const DIABETICO: Record<GrupoPce, number> = {
    "homem-branco": 10.1,
    "homem-negro": 11.2,
    "mulher-branca": 3.9,
    "mulher-negra": 7.0,
  };

  for (const grupo of GRUPOS) {
    it(`${grupo} · baseline = ${BASELINE[grupo]}%`, () => {
      perto(riscoAscvdPct(grupo, variaveis()), BASELINE[grupo]);
    });
    it(`${grupo} · PAS tratada = ${TRATADA[grupo]}%`, () => {
      perto(
        riscoAscvdPct(grupo, variaveis({ emTratamentoAntiHipertensivo: true })),
        TRATADA[grupo],
      );
    });
    it(`${grupo} · fumante = ${FUMANTE[grupo]}%`, () => {
      perto(riscoAscvdPct(grupo, variaveis({ tabagismoAtual: true })), FUMANTE[grupo]);
    });
    it(`${grupo} · diabético = ${DIABETICO[grupo]}%`, () => {
      perto(riscoAscvdPct(grupo, variaveis({ diabetes: true })), DIABETICO[grupo]);
    });
  }

  it("caso de alto risco: homem branco 54a, TC 170, HDL 50, PAS 157, fumante, diabético → 20.8%", () => {
    const risco = riscoAscvdPct("homem-branco", {
      idadeAnos: 54,
      colesterolTotalMgDl: 170,
      hdlMgDl: 50,
      pasMmHg: 157,
      emTratamentoAntiHipertensivo: false,
      diabetes: true,
      tabagismoAtual: true,
    });
    perto(risco, 20.8);
  });
});
