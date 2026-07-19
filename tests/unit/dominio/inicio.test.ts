// T007 — Validação do início de insulinização (RF-01 do motor; R-01..R-04 da spec §6.1).
// Fonte: Guia Rápido DM SMS-Rio 2023, p. 60 e Figura 4 p. 62; decisões AMB-01 e AMB-08.
import { describe, expect, it } from "vitest";
import { CalculadoraInsulinaDM2 } from "models/insulina/calculadora";
import {
  comoResultadoInicio,
  entradaInicio,
  jejum,
  tiposDeAlerta,
  tiposDeRecomendacao,
} from "../../apoio/construtores";

const calculadora = new CalculadoraInsulinaDM2();

describe("RegraInicio — dose inicial de NPH (R-01, R-02 / AMB-01)", () => {
  it("devolve a faixa absoluta 10–15 UI do texto do guia (p. 60)", () => {
    const r = comoResultadoInicio(calculadora.calcular(entradaInicio(80)));
    expect(r.faixaDoseUi).toEqual({ minUi: 10, maxUi: 15 });
  });

  it("devolve a faixa por peso 0,1–0,2 UI/kg/dia arredondada a UI inteiras (peso 80 → 8–16)", () => {
    const r = comoResultadoInicio(calculadora.calcular(entradaInicio(80)));
    expect(r.faixaPorPesoUi).toEqual({ minUi: 8, maxUi: 16 });
  });

  it("arredonda a faixa por peso a UI inteiras (peso 73 → 7–15)", () => {
    const r = comoResultadoInicio(calculadora.calcular(entradaInicio(73)));
    expect(r.faixaPorPesoUi).toEqual({ minUi: 7, maxUi: 15 });
  });

  it("sugere NPH antes de deitar sem fixar dose única — o médico fixa (AMB-01)", () => {
    const r = comoResultadoInicio(calculadora.calcular(entradaInicio(80)));
    expect(r.aplicacaoSugerida).toEqual({
      insulina: "NPH",
      momento: "ao_deitar",
    });
    expect("doseUi" in r.aplicacaoSugerida).toBe(false);
    expect("doseSugeridaUi" in r).toBe(false);
  });
});

describe("RegraInicio — recomendações ao prescritor (R-01, R-03)", () => {
  it("recomenda manter metformina e sulfonilureia no início (p. 60)", () => {
    const r = comoResultadoInicio(
      calculadora.calcular(entradaInicio(80, { usoSulfonilureia: true })),
    );
    const tipos = tiposDeRecomendacao(r);
    expect(tipos).toContain("MANTER_METFORMINA");
    expect(tipos).toContain("MANTER_SULFONILUREIA");
  });

  it("não recomenda manter sulfonilureia quando o paciente não a usa", () => {
    const r = comoResultadoInicio(
      calculadora.calcular(entradaInicio(80, { usoSulfonilureia: false })),
    );
    expect(tiposDeRecomendacao(r)).not.toContain("MANTER_SULFONILUREIA");
  });

  it("recomenda aferição de jejum 3×/semana por 15 dias (p. 60)", () => {
    const r = comoResultadoInicio(calculadora.calcular(entradaInicio(80)));
    expect(tiposDeRecomendacao(r)).toContain("AFERIR_JEJUM_3X_SEMANA_15_DIAS");
  });
});

describe("RegraInicio — alerta de indicação de insulina (R-04 / AMB-08)", () => {
  it("HbA1c exatamente 10% dispara o alerta (≥ 10%, leitura conservadora)", () => {
    const r = comoResultadoInicio(
      calculadora.calcular(entradaInicio(80, { hba1cPercent: 10 })),
    );
    expect(tiposDeAlerta(r)).toContain("INDICACAO_INSULINA");
  });

  it("HbA1c 9,9% sem jejum ≥ 300 não dispara o alerta", () => {
    const r = comoResultadoInicio(
      calculadora.calcular(entradaInicio(80, { hba1cPercent: 9.9 })),
    );
    expect(tiposDeAlerta(r)).not.toContain("INDICACAO_INSULINA");
  });

  it("glicemia de jejum ≥ 300 mg/dL dispara o alerta (p. 60)", () => {
    const r = comoResultadoInicio(
      calculadora.calcular(entradaInicio(80, { glicemias: jejum(300) })),
    );
    expect(tiposDeAlerta(r)).toContain("INDICACAO_INSULINA");
  });
});

describe("RegraInicio — rastreabilidade (RF-03)", () => {
  it("todo resultado de início carrega referência clínica do guia", () => {
    const r = comoResultadoInicio(calculadora.calcular(entradaInicio(80)));
    expect(r.referencias.length).toBeGreaterThanOrEqual(1);
    for (const ref of r.referencias) {
      expect(ref.fonteId).toBe("guia-rapido-dm-sms-rio");
      expect(ref.versaoEdicao).toBe("2.ª ed. atualizada, 2023");
      expect(ref.localizacao).not.toHaveLength(0);
    }
  });
});
