// T004 (001-integrar-design-claude) — Regra de antidiabéticos orais (RN-01/RN-02; RF-01/RF-02).
// Fonte: Guia Rápido DM p. 28 e p. 58 (extração citada em investigation.md §1.1–1.2).
import { describe, expect, it } from "vitest";
import { CalculadoraInsulinaDM2 } from "models/insulina/calculadora";
import type { EntradaCalculo } from "models/insulina/tipos";
import {
  comoResultadoInicio,
  comoResultadoTitulacao,
  entradaInicio,
  entradaTitulacao,
  esquemaBasal,
  jejum,
  tiposDeAlerta,
  tiposDeRecomendacao,
} from "../../apoio/construtores";

const calculadora = new CalculadoraInsulinaDM2();

const inicioCom = (extras: Partial<EntradaCalculo>) =>
  comoResultadoInicio(calculadora.calcular(entradaInicio(80, extras)));

const titulacaoCom = (extras: Partial<EntradaCalculo>) =>
  comoResultadoTitulacao(
    calculadora.calcular(
      entradaTitulacao(esquemaBasal(20), jejum(150), extras),
    ),
  );

describe("RN-01 — alerta de metformina não otimizada (RF-01)", () => {
  it("dose abaixo da faixa otimizada (1500 mg/dia) alerta no modo início, com referência à p. 28", () => {
    const r = inicioCom({ doseMetforminaMgDia: 1500 });
    expect(tiposDeAlerta(r)).toContain("METFORMINA_NAO_OTIMIZADA");
    const alerta = r.alertas.find((a) => a.tipo === "METFORMINA_NAO_OTIMIZADA");
    expect(alerta?.referencia.localizacao).toMatch(/28/);
  });

  it("o mesmo alerta vale no modo titulação (regra transversal, D-01)", () => {
    const r = titulacaoCom({ doseMetforminaMgDia: 1500 });
    expect(tiposDeAlerta(r)).toContain("METFORMINA_NAO_OTIMIZADA");
  });

  it("dose no limiar da faixa otimizada (2000 mg/dia) não alerta", () => {
    const r = titulacaoCom({ doseMetforminaMgDia: 2000 });
    expect(tiposDeAlerta(r)).not.toContain("METFORMINA_NAO_OTIMIZADA");
  });

  it("dose 1999 mg/dia (imediatamente abaixo do piso otimizado) alerta", () => {
    const r = titulacaoCom({ doseMetforminaMgDia: 1999 });
    expect(tiposDeAlerta(r)).toContain("METFORMINA_NAO_OTIMIZADA");
  });

  it("dose ausente não produz o alerta (critério de aceite do RF-01)", () => {
    const r = titulacaoCom({});
    expect(tiposDeAlerta(r)).not.toContain("METFORMINA_NAO_OTIMIZADA");
  });

  it("o alerta ordena abaixo de INDICACAO_INSULINA (D-08)", () => {
    const r = inicioCom({ doseMetforminaMgDia: 1500, hba1cPercent: 11 });
    const tipos = tiposDeAlerta(r);
    expect(tipos.indexOf("INDICACAO_INSULINA")).toBeGreaterThanOrEqual(0);
    expect(tipos.indexOf("METFORMINA_NAO_OTIMIZADA")).toBeGreaterThan(
      tipos.indexOf("INDICACAO_INSULINA"),
    );
  });
});

describe("RN-02 — ajuste e contraindicação da metformina pela TFG (RF-02)", () => {
  it("TFG 45 (teto da faixa de redução) recomenda reduzir a dose em 50%, com referência à p. 58", () => {
    const r = titulacaoCom({ tfg: 45 });
    expect(tiposDeRecomendacao(r)).toContain("REDUZIR_METFORMINA_TFG");
    const rec = r.recomendacoesAoPrescritor.find(
      (x) => x.tipo === "REDUZIR_METFORMINA_TFG",
    );
    expect(rec?.referencia.localizacao).toMatch(/58/);
  });

  it("TFG 30 (piso da faixa de redução) ainda recomenda reduzir, não suspender", () => {
    const r = titulacaoCom({ tfg: 30 });
    expect(tiposDeRecomendacao(r)).toContain("REDUZIR_METFORMINA_TFG");
    expect(tiposDeRecomendacao(r)).not.toContain("SUSPENDER_METFORMINA_TFG");
  });

  it("TFG < 30 recomenda suspender a metformina (risco de acidose lática)", () => {
    const r = titulacaoCom({ tfg: 29 });
    expect(tiposDeRecomendacao(r)).toContain("SUSPENDER_METFORMINA_TFG");
    expect(tiposDeRecomendacao(r)).not.toContain("REDUZIR_METFORMINA_TFG");
    const rec = r.recomendacoesAoPrescritor.find(
      (x) => x.tipo === "SUSPENDER_METFORMINA_TFG",
    );
    expect(rec?.mensagem).toMatch(/acidose/i);
  });

  it("TFG 46 (acima da faixa de ajuste) não produz recomendação nova", () => {
    const r = titulacaoCom({ tfg: 46 });
    expect(tiposDeRecomendacao(r)).not.toContain("REDUZIR_METFORMINA_TFG");
    expect(tiposDeRecomendacao(r)).not.toContain("SUSPENDER_METFORMINA_TFG");
  });

  it("TFG ausente não produz recomendação nova (critério de aceite do RF-02)", () => {
    const r = titulacaoCom({});
    expect(tiposDeRecomendacao(r)).not.toContain("REDUZIR_METFORMINA_TFG");
    expect(tiposDeRecomendacao(r)).not.toContain("SUSPENDER_METFORMINA_TFG");
  });

  it("a contraindicação também vale no modo início (regra transversal, D-01)", () => {
    const r = inicioCom({ tfg: 25 });
    expect(tiposDeRecomendacao(r)).toContain("SUSPENDER_METFORMINA_TFG");
  });
});

describe("Precedência clínica — TFG em faixa de ajuste suprime o alerta de otimização", () => {
  // Decisão de execução registrada no coding (Notas de execução do actions.md):
  // "otimizar (aumentar) a dose" contradiria "reduzir 50%" ou "suspender" (p. 28/58).
  it("dose 1500 + TFG 40: recomenda reduzir, sem alerta de otimização", () => {
    const r = titulacaoCom({ doseMetforminaMgDia: 1500, tfg: 40 });
    expect(tiposDeRecomendacao(r)).toContain("REDUZIR_METFORMINA_TFG");
    expect(tiposDeAlerta(r)).not.toContain("METFORMINA_NAO_OTIMIZADA");
  });

  it("dose 1500 + TFG 25: recomenda suspender, sem alerta de otimização", () => {
    const r = titulacaoCom({ doseMetforminaMgDia: 1500, tfg: 25 });
    expect(tiposDeRecomendacao(r)).toContain("SUSPENDER_METFORMINA_TFG");
    expect(tiposDeAlerta(r)).not.toContain("METFORMINA_NAO_OTIMIZADA");
  });

  it("dose 1500 + TFG 60 (função renal preservada): o alerta de otimização permanece", () => {
    const r = titulacaoCom({ doseMetforminaMgDia: 1500, tfg: 60 });
    expect(tiposDeAlerta(r)).toContain("METFORMINA_NAO_OTIMIZADA");
  });

  it("TFG < 30 também suprime MANTER_METFORMINA na mesma saída (início)", () => {
    const r = inicioCom({ tfg: 25 });
    expect(tiposDeRecomendacao(r)).toContain("SUSPENDER_METFORMINA_TFG");
    expect(tiposDeRecomendacao(r)).not.toContain("MANTER_METFORMINA");
  });

  it("TFG 30–45 não suprime MANTER_METFORMINA (reduzir e manter coexistem)", () => {
    const r = inicioCom({ tfg: 40 });
    expect(tiposDeRecomendacao(r)).toContain("REDUZIR_METFORMINA_TFG");
    expect(tiposDeRecomendacao(r)).toContain("MANTER_METFORMINA");
  });
});
