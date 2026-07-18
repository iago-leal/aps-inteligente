// T008 — Validação da titulação basal (RF-02 do motor; R-05..R-07 da spec §6.1).
// Fonte: Figura 4 p. 62; decisões AMB-02, AMB-05, AMB-06 e AMB-09.
import { describe, expect, it } from "vitest";
import { CalculadoraInsulinaDM2 } from "@/dominio/insulina/calculadora";
import {
  comoResultadoTitulacao,
  doseDe,
  entradaTitulacao,
  esquemaBasal,
  jejum,
  tiposDeAlerta,
  tiposDeRecomendacao,
} from "../../apoio/construtores";

const calculadora = new CalculadoraInsulinaDM2();

// Esquema-base longe dos gatilhos de fracionamento (20 UI; peso 80 → 0,4 UI/kg = 32 UI).
const titulacao = (glicemias: ReturnType<typeof jejum>) =>
  comoResultadoTitulacao(
    calculadora.calcular(entradaTitulacao(esquemaBasal(20), glicemias)),
  );

describe("RegraTitulacaoBasal — tabela de ajuste por jejum (R-06)", () => {
  it("jejum ≥ 180 aumenta 4 UI (200 → 24 UI)", () => {
    const r = titulacao(jejum(200));
    expect(doseDe(r, "NPH", "ao_deitar")).toBe(24);
    expect(r.deltaTotalUi).toBe(4);
  });

  it("jejum exatamente 180 aumenta 4 UI — prioridade ao braço ≥ 180 (AMB-09)", () => {
    const r = titulacao(jejum(180));
    expect(r.deltaTotalUi).toBe(4);
  });

  it("jejum 179 aumenta 2 UI (braço ≥ 130 e < 180)", () => {
    const r = titulacao(jejum(179));
    expect(r.deltaTotalUi).toBe(2);
  });

  it("jejum exatamente 130 aumenta 2 UI", () => {
    const r = titulacao(jejum(130));
    expect(r.deltaTotalUi).toBe(2);
  });

  it("jejum 129 mantém a dose e informa 'na meta' (AMB-02, AMB-05)", () => {
    const r = titulacao(jejum(129));
    expect(r.deltaTotalUi).toBe(0);
    expect(doseDe(r, "NPH", "ao_deitar")).toBe(20);
    expect(r.naMeta).toBe(true);
  });

  it("jejum 71 mantém a dose e informa 'na meta' (piso da faixa-alvo)", () => {
    const r = titulacao(jejum(71));
    expect(r.deltaTotalUi).toBe(0);
    expect(r.naMeta).toBe(true);
  });

  it("jejum ≤ 70 reduz 4 UI com alerta de hipoglicemia (RN-05)", () => {
    const r = titulacao(jejum(70));
    expect(r.deltaTotalUi).toBe(-4);
    expect(doseDe(r, "NPH", "ao_deitar")).toBe(16);
    expect(r.alertas[0]?.tipo).toBe("HIPOGLICEMIA");
    expect(r.naMeta).toBe(false);
  });
});

describe("RegraTitulacaoBasal — agregação de múltiplas glicemias (R-05 / AMB-06)", () => {
  it("usa a média das glicemias de jejum (180 e 120 → média 150 → +2 UI)", () => {
    const r = titulacao(jejum(180, 120));
    expect(r.deltaTotalUi).toBe(2);
  });

  it("qualquer valor ≤ 70 prevalece sobre a média (200 e 65 → −4 UI + alerta)", () => {
    const r = titulacao(jejum(200, 65));
    expect(r.deltaTotalUi).toBe(-4);
    expect(tiposDeAlerta(r)).toContain("HIPOGLICEMIA");
  });

  it("com hipoglicemia presente a recomendação nunca é aumento (RN-05)", () => {
    const r = titulacao(jejum(300, 70, 250));
    expect(r.deltaTotalUi).toBeLessThanOrEqual(0);
  });
});

describe("RegraTitulacaoBasal — cadência de 3 dias (Figura 4, p. 62)", () => {
  it("todo ajuste vem com a recomendação de reavaliar em 3 dias", () => {
    const r = titulacao(jejum(200));
    expect(tiposDeRecomendacao(r)).toContain("REAVALIAR_EM_3_DIAS");
  });

  it("resultado 'na meta' não pede reavaliação em 3 dias", () => {
    const r = titulacao(jejum(100));
    expect(tiposDeRecomendacao(r)).not.toContain("REAVALIAR_EM_3_DIAS");
  });
});
