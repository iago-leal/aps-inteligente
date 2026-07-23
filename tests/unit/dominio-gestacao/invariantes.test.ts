// T005 — Invariantes property-based e cenários da fachada (RN-06/RN-07/RN-11;
// RF-01/RF-02/RF-09; D-04/D-05; cenários do requirements §7).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CalculadoraIdadeGestacional } from "models/gestacao/calculadora";
import { deDiasEpoch, paraDiasEpoch, somarDias } from "models/gestacao/datas";
import type { EntradaDatacao, SaidaDatacao } from "models/gestacao/tipos";

const calculadora = new CalculadoraIdadeGestacional();
const REF = "2026-07-23";
const REF_DIAS = paraDiasEpoch(REF)!;

function resultado(entrada: EntradaDatacao) {
  const saida: SaidaDatacao = calculadora.calcular(entrada);
  if (saida.tipo !== "resultado") {
    throw new Error(`Esperava resultado, veio ${saida.tipo}`);
  }
  return saida;
}

// DUM válida: até 308 dias (44 semanas) antes da referência.
const arbDum = fc
  .integer({ min: 0, max: 308 })
  .map((atras) => deDiasEpoch(REF_DIAS - atras));

describe("Aritmética de datas: ida e volta sem perdas (D-02)", () => {
  it("paraDiasEpoch e deDiasEpoch são inversas em todo o intervalo útil", () => {
    fc.assert(
      fc.property(
        // ~1970..2170, folga ampla sobre o uso clínico.
        fc.integer({ min: 0, max: 73000 }),
        (dias) => {
          expect(paraDiasEpoch(deDiasEpoch(dias))).toBe(dias);
        },
      ),
    );
  });

  it("somarDias desloca exatamente o intervalo somado", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 73000 }),
        fc.integer({ min: -500, max: 500 }),
        (dias, delta) => {
          const data = deDiasEpoch(dias);
          expect(paraDiasEpoch(somarDias(data, delta))).toBe(dias + delta);
        },
      ),
    );
  });
});

describe("Invariantes da datação por DUM (RN-01; RN-06)", () => {
  it("para qualquer DUM válida: IG ≥ 0, dias 0–6, total de dias exato e referências não vazias", () => {
    fc.assert(
      fc.property(arbDum, (dum) => {
        const saida = resultado({ dataReferencia: REF, dum });
        const ig = saida.porDum!.ig;
        expect(ig.semanas).toBeGreaterThanOrEqual(0);
        expect(ig.dias).toBeGreaterThanOrEqual(0);
        expect(ig.dias).toBeLessThanOrEqual(6);
        expect(ig.semanas * 7 + ig.dias).toBe(REF_DIAS - paraDiasEpoch(dum)!);
        expect(saida.referencias.length).toBeGreaterThan(0);
      }),
    );
  });

  it("determinismo: mesma entrada produz saída estruturalmente idêntica (RN-07)", () => {
    fc.assert(
      fc.property(arbDum, (dum) => {
        const entrada: EntradaDatacao = { dataReferencia: REF, dum };
        expect(calculadora.calcular(entrada)).toEqual(
          calculadora.calcular(entrada),
        );
      }),
    );
  });
});

describe("Cenários fixos da fachada (requirements §7)", () => {
  it("cenário 1 — só DUM 2026-01-01: IG 29s0d, DPP 2026-10-08, 3.º trimestre, notas presentes", () => {
    const saida = resultado({ dataReferencia: REF, dum: "2026-01-01" });
    expect(saida.porDum).toMatchObject({
      ig: { semanas: 29, dias: 0 },
      dpp: "2026-10-08",
      trimestre: 3,
    });
    expect(saida.porUltrassom).toBeUndefined();
    expect(saida.comparacao).toBeUndefined();
    const tiposDeNota = saida.notas.map((n) => n.tipo);
    expect(tiposDeNota).toContain("CONFIABILIDADE_DUM");
    expect(tiposDeNota).toContain("ESTIMATIVA_NA_DATA_DE_REFERENCIA");
  });

  it("cenário 2 — só ultrassom 2026-06-10 com 12s3d: IG 18s4d, DPP 2026-12-22, DUM equivalente 2026-03-15, 2.º trimestre", () => {
    const saida = resultado({
      dataReferencia: REF,
      ultrassom: { dataExame: "2026-06-10", semanas: 12, dias: 3 },
    });
    expect(saida.porUltrassom).toMatchObject({
      ig: { semanas: 18, dias: 4 },
      dpp: "2026-12-22",
      dumEquivalente: "2026-03-15",
      trimestre: 2,
    });
    expect(saida.porDum).toBeUndefined();
    expect(saida.comparacao).toBeUndefined();
  });

  it("entrada dupla divergente — DUM 2026-01-01 + USG 2026-03-10 (8s0d): diferença 12 dias > margem 7 → dum-fora-da-margem", () => {
    const saida = resultado({
      dataReferencia: REF,
      dum: "2026-01-01",
      ultrassom: { dataExame: "2026-03-10", semanas: 8, dias: 0 },
    });
    expect(saida.comparacao).toMatchObject({
      diferencaDias: 12,
      trimestreDaUsg: 1,
      margemDias: 7,
      veredito: "dum-fora-da-margem",
    });
    expect(saida.porDum).toBeDefined();
    expect(saida.porUltrassom).toBeDefined();
  });

  it("entrada dupla convergente — diferença igual à margem (7 dias, 1.º trimestre) confirma a DUM (p. 32: 'fora' é além da margem)", () => {
    const saida = resultado({
      dataReferencia: REF,
      dum: "2026-01-06",
      ultrassom: { dataExame: "2026-03-10", semanas: 8, dias: 0 },
    });
    expect(saida.comparacao).toMatchObject({
      diferencaDias: 7,
      margemDias: 7,
      veredito: "dum-confirmada",
    });
  });

  it("USG de 3.º trimestre + DUM → sem parâmetro na fonte, sem margem (D-05)", () => {
    const saida = resultado({
      dataReferencia: REF,
      dum: "2026-01-01",
      ultrassom: { dataExame: "2026-07-01", semanas: 28, dias: 0 },
    });
    expect(saida.comparacao?.veredito).toBe("sem-parametro-na-fonte");
    expect(saida.comparacao?.margemDias).toBeUndefined();
  });
});

describe("Propriedade da comparação: veredito segue a margem do trimestre da USG (RN-11)", () => {
  // Exame fixo; IG do laudo sorteada no 1.º/2.º trimestre; DUM deslocada da
  // equivalente por um desvio conhecido.
  const arbCaso = fc.record({
    semanasLaudo: fc.integer({ min: 0, max: 27 }),
    diasLaudo: fc.integer({ min: 0, max: 6 }),
    desvio: fc.integer({ min: -30, max: 30 }),
  });

  it("dum-fora-da-margem sse |desvio| > margem (7 no 1.º trimestre, 14 no 2.º)", () => {
    fc.assert(
      fc.property(arbCaso, ({ semanasLaudo, diasLaudo, desvio }) => {
        const dataExame = "2026-07-01";
        const igLaudoDias = semanasLaudo * 7 + diasLaudo;
        const dumEquivalenteDias = paraDiasEpoch(dataExame)! - igLaudoDias;
        const dum = deDiasEpoch(dumEquivalenteDias + desvio);
        // DUM precisa continuar válida (não futura, dentro das 44 semanas).
        fc.pre(paraDiasEpoch(dum)! <= REF_DIAS);
        fc.pre(REF_DIAS - paraDiasEpoch(dum)! <= 308);
        const saida = resultado({
          dataReferencia: REF,
          dum,
          ultrassom: { dataExame, semanas: semanasLaudo, dias: diasLaudo },
        });
        const margem = igLaudoDias < 14 * 7 ? 7 : 14;
        const esperado =
          Math.abs(desvio) > margem ? "dum-fora-da-margem" : "dum-confirmada";
        expect(saida.comparacao?.veredito).toBe(esperado);
        expect(saida.comparacao?.diferencaDias).toBe(Math.abs(desvio));
        expect(saida.comparacao?.margemDias).toBe(margem);
      }),
    );
  });
});
