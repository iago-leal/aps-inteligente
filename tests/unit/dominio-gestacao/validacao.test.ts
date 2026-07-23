// T004 — Validação com coleta total de ofensores (RN-05; RF-03; padrão da regra 15
// do domain.md: nunca parar no primeiro ofensor).
import { describe, expect, it } from "vitest";
import { validarEntrada } from "models/gestacao/validacao";
import type { EntradaDatacao } from "models/gestacao/tipos";

const REF = "2026-07-23";

function codigos(entrada: EntradaDatacao): string[] {
  return validarEntrada(entrada).map((o) => o.codigo);
}

describe("Coleta total: todos os ofensores de uma vez (RF-03)", () => {
  it("DUM futura + exame futuro + IG do laudo fora de faixa → três ofensores juntos", () => {
    const ofensores = validarEntrada({
      dataReferencia: REF,
      dum: "2026-08-01",
      ultrassom: { dataExame: "2026-09-01", semanas: 45, dias: 0 },
    });
    const cods = ofensores.map((o) => o.codigo);
    expect(cods).toContain("DUM_FUTURA");
    expect(cods).toContain("DATA_EXAME_FUTURA");
    expect(cods).toContain("IG_LAUDO_FORA_DE_FAIXA");
    expect(ofensores.length).toBeGreaterThanOrEqual(3);
  });

  it("cada ofensor aponta o campo de origem", () => {
    const ofensores = validarEntrada({
      dataReferencia: REF,
      dum: "2026-08-01",
    });
    expect(ofensores[0]?.campo).toBe("dum");
    expect(ofensores[0]?.mensagem).toBeTruthy();
  });
});

describe("Datações ausentes ou incompletas (RN-05)", () => {
  it("nenhuma datação informada → NENHUMA_DATACAO_INFORMADA", () => {
    expect(codigos({ dataReferencia: REF })).toEqual([
      "NENHUMA_DATACAO_INFORMADA",
    ]);
  });

  it("ultrassom só com a data do exame → DATACAO_ULTRASSOM_INCOMPLETA", () => {
    expect(
      codigos({ dataReferencia: REF, ultrassom: { dataExame: "2026-06-10" } }),
    ).toContain("DATACAO_ULTRASSOM_INCOMPLETA");
  });

  it("ultrassom só com a IG do laudo (sem data do exame) → DATACAO_ULTRASSOM_INCOMPLETA", () => {
    expect(
      codigos({ dataReferencia: REF, ultrassom: { semanas: 12, dias: 3 } }),
    ).toContain("DATACAO_ULTRASSOM_INCOMPLETA");
  });

  it("DUM presente e ultrassom incompleto → só o ofensor do ultrassom (a DUM basta como datação)", () => {
    const cods = codigos({
      dataReferencia: REF,
      dum: "2026-01-01",
      ultrassom: { dataExame: "2026-06-10" },
    });
    expect(cods).toEqual(["DATACAO_ULTRASSOM_INCOMPLETA"]);
  });
});

describe("Limites de plausibilidade (RN-05, premissa 🟡)", () => {
  it("DUM no futuro → DUM_FUTURA", () => {
    expect(codigos({ dataReferencia: REF, dum: "2026-07-24" })).toEqual([
      "DUM_FUTURA",
    ]);
  });

  it("DUM exatamente 44 semanas (308 dias) antes da referência é aceita", () => {
    expect(codigos({ dataReferencia: REF, dum: "2025-09-18" })).toEqual([]);
  });

  it("DUM além de 44 semanas → DUM_ALEM_DE_44_SEMANAS", () => {
    expect(codigos({ dataReferencia: REF, dum: "2025-09-17" })).toEqual([
      "DUM_ALEM_DE_44_SEMANAS",
    ]);
  });

  it("IG do laudo nos limites: 42s0d e 0s6d aceitas; 43 semanas ou 7 dias recusadas", () => {
    const base = { dataReferencia: REF } as const;
    expect(
      codigos({
        ...base,
        ultrassom: { dataExame: "2026-06-10", semanas: 42, dias: 0 },
      }),
    ).toEqual([]);
    expect(
      codigos({
        ...base,
        ultrassom: { dataExame: "2026-06-10", semanas: 0, dias: 6 },
      }),
    ).toEqual([]);
    expect(
      codigos({
        ...base,
        ultrassom: { dataExame: "2026-06-10", semanas: 43, dias: 0 },
      }),
    ).toContain("IG_LAUDO_FORA_DE_FAIXA");
    expect(
      codigos({
        ...base,
        ultrassom: { dataExame: "2026-06-10", semanas: 12, dias: 7 },
      }),
    ).toContain("IG_LAUDO_FORA_DE_FAIXA");
  });

  it("IG do laudo não inteira ou negativa → IG_LAUDO_FORA_DE_FAIXA", () => {
    expect(
      codigos({
        dataReferencia: REF,
        ultrassom: { dataExame: "2026-06-10", semanas: 12.5, dias: -1 },
      }),
    ).toContain("IG_LAUDO_FORA_DE_FAIXA");
  });
});

describe("Datas inválidas como valor, nunca exceção (ADR 0004)", () => {
  it("DUM em calendário impossível (30 de fevereiro) → DATA_INVALIDA", () => {
    expect(codigos({ dataReferencia: REF, dum: "2026-02-30" })).toEqual([
      "DATA_INVALIDA",
    ]);
  });

  it("formato fora do ISO (31/01/2026) → DATA_INVALIDA", () => {
    expect(codigos({ dataReferencia: REF, dum: "31/01/2026" })).toEqual([
      "DATA_INVALIDA",
    ]);
  });

  it("data de referência inválida → DATA_INVALIDA no campo dataReferencia", () => {
    const ofensores = validarEntrada({
      dataReferencia: "2026-13-01",
      dum: "2026-01-01",
    });
    expect(
      ofensores.some(
        (o) => o.codigo === "DATA_INVALIDA" && o.campo === "dataReferencia",
      ),
    ).toBe(true);
  });

  it("entrada íntegra (DUM e ultrassom válidos) → nenhum ofensor", () => {
    expect(
      codigos({
        dataReferencia: REF,
        dum: "2026-01-01",
        ultrassom: { dataExame: "2026-06-10", semanas: 12, dias: 3 },
      }),
    ).toEqual([]);
  });
});
