// T012 — Rastreabilidade clínica (RF-03 do motor; RN-01): dose → fonte, sempre.
import { describe, expect, it } from "vitest";
import { CalculadoraInsulinaDM2 } from "models/insulina/calculadora";
import type { ReferenciaClinica, SaidaCalculo } from "models/insulina/tipos";
import {
  afericao,
  comoResultadoTitulacao,
  entradaInicio,
  entradaTitulacao,
  esquema,
  esquemaBasal,
  jejum,
  nph,
  regular,
} from "../../apoio/construtores";

const calculadora = new CalculadoraInsulinaDM2();

function esperaReferenciaCompleta(ref: ReferenciaClinica) {
  expect(ref.fonteId).toBe("guia-rapido-dm-sms-rio");
  expect(ref.versaoEdicao).toBe("2.ª ed. atualizada, 2023");
  expect(ref.localizacao.trim()).not.toHaveLength(0);
}

const cenarios: Array<{ nome: string; saida: () => SaidaCalculo }> = [
  {
    nome: "início de insulinização",
    saida: () => calculadora.calcular(entradaInicio(80)),
  },
  {
    nome: "titulação basal com aumento",
    saida: () =>
      calculadora.calcular(entradaTitulacao(esquemaBasal(20), jejum(200))),
  },
  {
    nome: "hipoglicemia",
    saida: () =>
      calculadora.calcular(entradaTitulacao(esquemaBasal(20), jejum(65))),
  },
  {
    nome: "fracionamento",
    saida: () =>
      calculadora.calcular(entradaTitulacao(esquemaBasal(30), jejum(200))),
  },
  {
    nome: "intensificação (braço AA)",
    saida: () =>
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(20), afericao("antes_almoco", 150), {
          hba1cPercent: 8,
        }),
      ),
  },
  // Feature 001 (T008): saídas novas de antidiabéticos orais.
  {
    nome: "metformina não otimizada",
    saida: () =>
      calculadora.calcular(entradaInicio(80, { doseMetforminaMgDia: 1500 })),
  },
  {
    nome: "contraindicação de metformina por TFG",
    saida: () =>
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(20), jejum(150), { tfg: 25 }),
      ),
  },
];

describe("Todo ResultadoCalculo carrega ≥ 1 ReferenciaClinica completa (RF-03)", () => {
  it.each(cenarios)("$nome", ({ saida }) => {
    const resultado = saida();
    expect(resultado.tipo).toBe("resultado");
    if (resultado.tipo !== "resultado") return;
    expect(resultado.referencias.length).toBeGreaterThanOrEqual(1);
    resultado.referencias.forEach(esperaReferenciaCompleta);
  });
});

describe("Alertas e recomendações carregam referência própria (RN-01)", () => {
  it.each(cenarios)("$nome", ({ saida }) => {
    const resultado = saida();
    if (resultado.tipo !== "resultado") throw new Error("esperava resultado");
    for (const alerta of resultado.alertas)
      esperaReferenciaCompleta(alerta.referencia);
    for (const rec of resultado.recomendacoesAoPrescritor) {
      esperaReferenciaCompleta(rec.referencia);
    }
  });
});

describe("Inferências decididas citam a decisão além da página (spec §6.1)", () => {
  it("a titulação da Regular (AMB-07) cita a inferência na localização", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(
          esquema("basal-plus", nph(20), regular(6, "antes_cafe")),
          afericao("antes_almoco", 150),
          { hba1cPercent: 8 },
        ),
      ),
    );
    const todas = [
      ...r.referencias,
      ...r.alertas.map((a) => a.referencia),
      ...r.recomendacoesAoPrescritor.map((rec) => rec.referencia),
    ];
    expect(todas.some((ref) => ref.localizacao.includes("AMB-07"))).toBe(true);
  });

  it("o alerta de hipoglicemia cita a Figura 4 (p. 62)", () => {
    const saida = calculadora.calcular(
      entradaTitulacao(esquemaBasal(20), jejum(65)),
    );
    if (saida.tipo !== "resultado" || saida.modo !== "titulacao") {
      throw new Error("esperava resultado de titulação");
    }
    const alerta = saida.alertas.find((a) => a.tipo === "HIPOGLICEMIA");
    expect(alerta?.referencia.localizacao).toMatch(/62/);
  });
});

// Feature 001 (T008) — entradas novas do catálogo: p. 28, 58 e 59 (data-delta §4).
describe("Feature 001 — páginas novas do guia citadas nas saídas", () => {
  it("o alerta de metformina não otimizada cita a p. 28", () => {
    const saida = calculadora.calcular(
      entradaInicio(80, { doseMetforminaMgDia: 1500 }),
    );
    if (saida.tipo !== "resultado") throw new Error("esperava resultado");
    const alerta = saida.alertas.find(
      (a) => a.tipo === "METFORMINA_NAO_OTIMIZADA",
    );
    expect(alerta?.referencia.localizacao).toMatch(/28/);
  });

  it("a suspensão da metformina por TFG cita a p. 58", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(20), jejum(150), { tfg: 25 }),
      ),
    );
    const rec = r.recomendacoesAoPrescritor.find(
      (x) => x.tipo === "SUSPENDER_METFORMINA_TFG",
    );
    expect(rec?.referencia.localizacao).toMatch(/58/);
  });

  it("a redação condicional da sulfonilureia agrega a p. 59 às referências do resultado", () => {
    // Fracionamento com uso de sulfonilureia não informado → redação condicional.
    const r = comoResultadoTitulacao(
      calculadora.calcular(entradaTitulacao(esquemaBasal(30), jejum(200))),
    );
    expect(r.referencias.some((ref) => ref.localizacao.includes("59"))).toBe(
      true,
    );
  });
});
