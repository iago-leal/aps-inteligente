// T015 — Value objects com invariantes no construtor (RNF-06 do motor):
// estado inválido é irrepresentável; violação interna é ErroDeInvariante (bug), não fluxo.
import { describe, expect, it } from "vitest";
import {
  DoseUi,
  ErroDeInvariante,
  Glicemia,
  Peso,
} from "@/dominio/insulina/tipos";

describe("Peso — > 0 e ≤ 350 kg (RF-05)", () => {
  it.each([80, 0.5, 350])("aceita %s kg e é imutável", (kg) => {
    const peso = new Peso(kg);
    expect(peso.kg).toBe(kg);
    expect(Object.isFrozen(peso)).toBe(true);
  });

  it.each([0, -1, 351, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejeita %s kg",
    (kg) => {
      expect(() => new Peso(kg)).toThrow(ErroDeInvariante);
    },
  );
});

describe("Glicemia — 10–1000 mg/dL com momento (RF-05)", () => {
  it("aceita valor plausível com momento de aferição", () => {
    const glicemia = new Glicemia(120, "jejum");
    expect(glicemia.valorMgDl).toBe(120);
    expect(glicemia.momento).toBe("jejum");
    expect(Object.isFrozen(glicemia)).toBe(true);
  });

  it.each([9, 1001, Number.NaN])("rejeita %s mg/dL", (valor) => {
    expect(() => new Glicemia(valor, "jejum")).toThrow(ErroDeInvariante);
  });
});

describe("DoseUi — inteira, 1–60 UI por aplicação (R-20, D-08)", () => {
  it.each([1, 30, 60])("aceita %s UI", (ui) => {
    const dose = new DoseUi(ui);
    expect(dose.ui).toBe(ui);
    expect(Object.isFrozen(dose)).toBe(true);
  });

  it.each([0, 61, 2.5, -4, Number.NaN])("rejeita %s UI", (ui) => {
    expect(() => new DoseUi(ui)).toThrow(ErroDeInvariante);
  });
});
