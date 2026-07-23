// T007 — Conduta por estrato, exame e advertência (RF-04/RF-05/RF-07;
// RN-04/RN-05/RN-07). Feature 010.
import { describe, expect, it } from "vitest";
import {
  advertenciasPara,
  condutaPara,
  exameRecomendado,
} from "models/cardiopatia-isquemica/conduta";

describe("Conduta de probabilidade baixa (RN-04)", () => {
  it("exame não indicado, sem exame, com causas não cardíacas listadas", () => {
    const conduta = condutaPara("baixa", false);
    expect(conduta.tipo).toBe("exame-nao-indicado");
    expect(conduta.exame).toBe("nenhum");
    expect(conduta.causasNaoCardiacas).toEqual(
      expect.arrayContaining([
        "dor musculoesquelética",
        expect.stringMatching(/gastrointestinais/i),
      ]),
    );
    expect(conduta.causasNaoCardiacas).toHaveLength(4);
  });
});

describe("Conduta de probabilidade intermediária (RN-04/RN-05)", () => {
  it("sem impedimento: exame não invasivo via ergometria", () => {
    const conduta = condutaPara("intermediaria", false);
    expect(conduta.tipo).toBe("exame-nao-invasivo");
    expect(conduta.exame).toBe("ergometria");
    expect(conduta.texto).toMatch(/ergométrico/i);
  });

  it("com impedimento da ergometria: método não invasivo alternativo", () => {
    const conduta = condutaPara("intermediaria", true);
    expect(conduta.exame).toBe("metodo-nao-invasivo-alternativo");
    expect(conduta.texto).toMatch(/cintilografia|ressonância|ecocardiograma/i);
  });
});

describe("Conduta de probabilidade alta (RN-04)", () => {
  it("estratificação e encaminhamento ao cardiologista", () => {
    const conduta = condutaPara("alta", false);
    expect(conduta.tipo).toBe("estratificacao-e-encaminhamento");
    expect(conduta.texto).toMatch(/cardiologista/i);
    expect(conduta.exame).toBe("ergometria");
  });

  it("alta com impedimento também troca para método alternativo", () => {
    expect(condutaPara("alta", true).exame).toBe(
      "metodo-nao-invasivo-alternativo",
    );
  });
});

describe("exameRecomendado (RN-05)", () => {
  it.each([
    ["baixa", false, "nenhum"],
    ["intermediaria", false, "ergometria"],
    ["intermediaria", true, "metodo-nao-invasivo-alternativo"],
    ["alta", false, "ergometria"],
    ["alta", true, "metodo-nao-invasivo-alternativo"],
  ] as const)("estrato %s, impedimento %s → %s", (estrato, imped, esperado) => {
    expect(exameRecomendado(estrato, imped)).toBe(esperado);
  });
});

describe("Advertência de angina instável (RN-07)", () => {
  it("sem sinais: nenhuma advertência", () => {
    expect(advertenciasPara(false)).toEqual([]);
  });

  it("com sinais: advertência de encaminhamento emergencial referenciada", () => {
    const advertencias = advertenciasPara(true);
    expect(advertencias).toHaveLength(1);
    expect(advertencias[0].tipo).toBe("ANGINA_INSTAVEL");
    expect(advertencias[0].mensagem).toMatch(/emergencial/i);
    expect(advertencias[0].referencia.localizacao).toMatch(/p\. 6/);
  });
});
