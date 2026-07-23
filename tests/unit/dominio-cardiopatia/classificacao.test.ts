// T005 — Classificação clínica da dor torácica (RF-01/RN-01; Quadro 1, p. 4):
// 3 características → típica; 2 → atípica; 0–1 → não anginosa. Feature 010.
import { describe, expect, it } from "vitest";
import { classificarDor } from "models/cardiopatia-isquemica/classificacao";
import type { CaracteristicasDor } from "models/cardiopatia-isquemica/tipos";

function c(
  retroesternal: boolean,
  provocadaPorEsforcoOuEstresse: boolean,
  aliviaComRepousoOuNitrato: boolean,
): CaracteristicasDor {
  return { retroesternal, provocadaPorEsforcoOuEstresse, aliviaComRepousoOuNitrato };
}

describe("Classificação da dor (RN-01)", () => {
  it("as três características presentes → angina típica", () => {
    expect(classificarDor(c(true, true, true))).toBe("tipica");
  });

  it("exatamente duas características → angina atípica (qualquer par)", () => {
    expect(classificarDor(c(true, true, false))).toBe("atipica");
    expect(classificarDor(c(true, false, true))).toBe("atipica");
    expect(classificarDor(c(false, true, true))).toBe("atipica");
  });

  it("uma característica → dor não anginosa", () => {
    expect(classificarDor(c(true, false, false))).toBe("nao-anginosa");
    expect(classificarDor(c(false, true, false))).toBe("nao-anginosa");
    expect(classificarDor(c(false, false, true))).toBe("nao-anginosa");
  });

  it("nenhuma característica → dor não anginosa", () => {
    expect(classificarDor(c(false, false, false))).toBe("nao-anginosa");
  });
});
