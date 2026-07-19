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
