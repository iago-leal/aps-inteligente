// T004 — Oráculo do Quadro 2 (RF-02/RN-02): cada célula da probabilidade
// pré-teste-base bate com o valor tabelado; faixa etária e fora-de-escopo (RN-06).
// A tabela esperada é transcrita aqui de forma independente da fonte-clinica, para
// que uma revisão visual deste arquivo confirme os 24 números (feature 010).
import { describe, expect, it } from "vitest";
import {
  faixaEtariaDe,
  probabilidadeBasePct,
} from "models/cardiopatia-isquemica/probabilidade";
import type {
  ClassificacaoDor,
  FaixaEtaria,
  Sexo,
} from "models/cardiopatia-isquemica/tipos";

// Quadro 2, p. 5 (DUNCAN et al., 2013). [classe][sexo] → por faixa 30-39/40-49/50-59/60-69.
const ESPERADO: Record<
  ClassificacaoDor,
  Record<Sexo, Record<FaixaEtaria, number>>
> = {
  "nao-anginosa": {
    masculino: { "30-39": 4, "40-49": 13, "50-59": 20, "60-69": 27 },
    feminino: { "30-39": 2, "40-49": 3, "50-59": 7, "60-69": 14 },
  },
  atipica: {
    masculino: { "30-39": 34, "40-49": 51, "50-59": 65, "60-69": 72 },
    feminino: { "30-39": 12, "40-49": 22, "50-59": 31, "60-69": 51 },
  },
  tipica: {
    masculino: { "30-39": 76, "40-49": 87, "50-59": 93, "60-69": 94 },
    feminino: { "30-39": 26, "40-49": 55, "50-59": 73, "60-69": 86 },
  },
};

const CLASSES: ClassificacaoDor[] = ["nao-anginosa", "atipica", "tipica"];
const SEXOS: Sexo[] = ["masculino", "feminino"];
const FAIXAS: FaixaEtaria[] = ["30-39", "40-49", "50-59", "60-69"];

describe("Quadro 2 — probabilidade pré-teste-base (RN-02): oráculo por célula", () => {
  for (const classe of CLASSES) {
    for (const sexo of SEXOS) {
      for (const faixa of FAIXAS) {
        it(`${classe} · ${sexo} · ${faixa} = ${ESPERADO[classe][sexo][faixa]}%`, () => {
          expect(probabilidadeBasePct(classe, sexo, faixa)).toBe(
            ESPERADO[classe][sexo][faixa],
          );
        });
      }
    }
  }
});

describe("Faixa etária do Quadro 2 (RN-06)", () => {
  it.each([
    [30, "30-39"],
    [39, "30-39"],
    [40, "40-49"],
    [49, "40-49"],
    [50, "50-59"],
    [59, "50-59"],
    [60, "60-69"],
    [69, "60-69"],
  ])("idade %i → faixa %s", (idade, faixa) => {
    expect(faixaEtariaDe(idade)).toBe(faixa);
  });

  it.each([29, 25, 70, 74, 90])("idade %i está fora da tabela → null", (idade) => {
    expect(faixaEtariaDe(idade)).toBeNull();
  });
});
