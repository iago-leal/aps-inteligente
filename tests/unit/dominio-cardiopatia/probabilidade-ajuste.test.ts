// T006 — Ajuste por fatores de risco e estrato (RF-03/RF-04/RN-03/RN-04; D-03,
// decisão de 2026-07-23): sem fator, estrato pelo valor-base; com ≥ 1 fator, faixa
// base×2–base×3 capada e estrato nunca "baixa". Feature 010.
import { describe, expect, it } from "vitest";
import {
  ajustarPorFatoresDeRisco,
  estratoDe,
} from "models/cardiopatia-isquemica/probabilidade";

describe("Ajuste por fatores de risco (RN-03)", () => {
  it("sem fatores não produz ajuste (undefined)", () => {
    expect(ajustarPorFatoresDeRisco(20, 0)).toBeUndefined();
  });

  it("com fatores, faixa é base×2 a base×3", () => {
    expect(ajustarPorFatoresDeRisco(20, 1)).toEqual({
      minPct: 40,
      maxPct: 60,
      excedeAlta: false,
    });
  });

  it("faixa é capada em 99% para não exibir > 100%, sinalizando excedeAlta", () => {
    expect(ajustarPorFatoresDeRisco(50, 2)).toEqual({
      minPct: 99, // 100 capado
      maxPct: 99, // 150 capado
      excedeAlta: true,
    });
  });

  it("excedeAlta liga quando o teto ultrapassa 90 mesmo com piso baixo", () => {
    // base 34 (atípica, homem 30-39): ×2=68, ×3=102 → excede.
    expect(ajustarPorFatoresDeRisco(34, 1)).toEqual({
      minPct: 68,
      maxPct: 99,
      excedeAlta: true,
    });
  });
});

describe("Estrato sem fatores de risco (RN-04; nota ** do Quadro 2)", () => {
  it("dor não anginosa e sem fatores → baixa, qualquer que seja o valor tabelado", () => {
    // Não anginosa vai de 2% (M 30-39) a 27% (H 60-69): a conduta 'baixa' segue a
    // descrição clínica do guia, não o corte numérico.
    expect(estratoDe("nao-anginosa", 4, undefined)).toBe("baixa");
    expect(estratoDe("nao-anginosa", 27, undefined)).toBe("baixa");
  });

  it("angina atípica sem fatores → intermediária (não é 'baixa')", () => {
    expect(estratoDe("atipica", 12, undefined)).toBe("intermediaria");
    expect(estratoDe("atipica", 72, undefined)).toBe("intermediaria");
  });

  it("probabilidade-base acima de 90 → alta", () => {
    expect(estratoDe("tipica", 93, undefined)).toBe("alta");
    expect(estratoDe("tipica", 94, undefined)).toBe("alta");
  });

  it("probabilidade-base exatamente 90 permanece intermediária", () => {
    expect(estratoDe("tipica", 90, undefined)).toBe("intermediaria");
  });
});

describe("Estrato com fatores de risco: nunca baixa (RN-03/decisão §9)", () => {
  it("dor não anginosa com fator sobe para intermediária, não baixa", () => {
    const ajustada = ajustarPorFatoresDeRisco(4, 1);
    expect(estratoDe("nao-anginosa", 4, ajustada)).toBe("intermediaria");
  });

  it("piso da faixa acima de 90 → alta", () => {
    const ajustada = ajustarPorFatoresDeRisco(46, 1); // ×2 = 92 > 90
    expect(estratoDe("atipica", 46, ajustada)).toBe("alta");
  });

  it("piso da faixa exatamente 90 permanece intermediária", () => {
    const ajustada = ajustarPorFatoresDeRisco(45, 1); // ×2 = 90, não > 90
    expect(estratoDe("atipica", 45, ajustada)).toBe("intermediaria");
  });
});
