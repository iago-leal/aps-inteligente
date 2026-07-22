// T002 (feature 006-checkbox-revisao-redundante) — formatador do plano copiável
// (RF-02; RN-03; decisões D-01/D-04/D-05 do roadmap). O texto é a projeção em
// prosa do que a tela exibe: quatro partes na ordem fixa, sem cabeçalho "Plano:",
// sem alertas e sem condutas alternativas (a escolha entre equivalentes é do
// prescritor — ADR 0005).
import { describe, expect, it } from "vitest";
import { formatarPlano } from "interface/calculadora/formatar-plano";
import type {
  ResultadoInicio,
  ResultadoTitulacao,
} from "models/insulina/tipos";

const referenciaInicio = {
  fonteId: "guia-rapido-dm-sms-rio",
  versaoEdicao: "2.ª ed. atualizada, 2023",
  localizacao: "p. 60; Figura 4, p. 62",
} as const;

const referenciaTfg = {
  fonteId: "guia-rapido-dm-sms-rio",
  versaoEdicao: "2.ª ed. atualizada, 2023",
  localizacao: "p. 58",
} as const;

const manterMetformina = {
  tipo: "MANTER_METFORMINA",
  mensagem: "Manter a metformina ao iniciar a insulina NPH.",
  referencia: referenciaInicio,
} as const;

const reduzirPorTfg = {
  tipo: "REDUZIR_METFORMINA_TFG",
  mensagem:
    "TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%.",
  referencia: referenciaTfg,
} as const;

const aferirJejum = {
  tipo: "AFERIR_JEJUM_3X_SEMANA_15_DIAS",
  mensagem:
    "Orientar aferição de glicemia capilar em jejum três vezes por semana, com registro, durante 15 dias.",
  referencia: referenciaInicio,
} as const;

const resultadoInicio: ResultadoInicio = {
  tipo: "resultado",
  modo: "inicio",
  faixaDoseUi: { minUi: 10, maxUi: 15 },
  faixaPorPesoUi: { minUi: 8, maxUi: 16 },
  aplicacaoSugerida: { insulina: "NPH", momento: "ao_deitar" },
  alertas: [],
  recomendacoesAoPrescritor: [manterMetformina, aferirJejum],
  referencias: [referenciaInicio],
};

const resultadoTitulacao: ResultadoTitulacao = {
  tipo: "resultado",
  modo: "titulacao",
  esquemaSugerido: [
    { insulina: "NPH", momento: "antes_cafe", doseUi: 10 },
    { insulina: "NPH", momento: "ao_deitar", doseUi: 16 },
  ],
  doseTotalDiaUi: 26,
  deltaTotalUi: -4,
  naMeta: false,
  condutasAlternativas: [
    {
      rotulo: "Alternativa B",
      esquemaSugerido: [{ insulina: "NPH", momento: "ao_deitar", doseUi: 20 }],
      referencia: referenciaInicio,
    },
  ],
  alertas: [
    {
      tipo: "HIPOGLICEMIA",
      mensagem: "Hipoglicemia detectada no período",
      referencia: referenciaInicio,
    },
  ],
  recomendacoesAoPrescritor: [manterMetformina],
  referencias: [referenciaInicio],
};

describe("Quatro partes na ordem do RF-02, sem cabeçalho", () => {
  it("início: esquema/dose → recomendações → fonte → linha de contexto", () => {
    const texto = formatarPlano(resultadoInicio);

    const posEsquema = texto.indexOf("Insulina NPH ao deitar");
    const posRecomendacoes = texto.indexOf("Recomendações ao prescritor:");
    const posFonte = texto.indexOf("Fonte clínica:");
    const posContexto = texto.indexOf(
      "Plano elaborado com apoio de ferramenta de decisão clínica; a prescrição é responsabilidade do médico.",
    );

    expect(posEsquema).toBeGreaterThanOrEqual(0);
    expect(posRecomendacoes).toBeGreaterThan(posEsquema);
    expect(posFonte).toBeGreaterThan(posRecomendacoes);
    expect(posContexto).toBeGreaterThan(posFonte);
    expect(texto.startsWith("Plano:")).toBe(false);
  });

  it("início: faixa da fonte, equivalente por peso e ressalva da dose exata", () => {
    const texto = formatarPlano(resultadoInicio);
    expect(texto).toContain(
      "Insulina NPH ao deitar — dose inicial pela fonte: 10 a 15 UI/dia.",
    );
    expect(texto).toContain(
      "Equivalente por peso (0,1 a 0,2 UI/kg/dia): 8 a 16 UI/dia.",
    );
    expect(texto).toContain("A dose exata é fixada pelo prescritor.");
  });

  it("fonte clínica espelha a referência da tela", () => {
    const texto = formatarPlano(resultadoInicio);
    expect(texto).toContain(
      "- Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023: p. 60; Figura 4, p. 62",
    );
  });
});

describe("Titulação: conduta, dose total e esquema por aplicação (D-04)", () => {
  it("traz conduta, dose total e as linhas do esquema", () => {
    const texto = formatarPlano(resultadoTitulacao);
    expect(texto).toContain("Conduta: Reduzir 4 UI. Dose total: 26 UI/dia.");
    expect(texto).toContain("- NPH 10 UI antes do café");
    expect(texto).toContain("- NPH 16 UI ao deitar");
  });

  it("exclui alertas e condutas alternativas do texto copiado", () => {
    const texto = formatarPlano(resultadoTitulacao);
    expect(texto).not.toContain("Hipoglicemia detectada");
    expect(texto).not.toContain("Alternativa B");
  });
});

describe("Hierarquia das recomendações (feature 005 preservada em texto)", () => {
  it("subitem por TFG sai recuado imediatamente sob a manutenção", () => {
    const texto = formatarPlano({
      ...resultadoInicio,
      recomendacoesAoPrescritor: [manterMetformina, aferirJejum, reduzirPorTfg],
      referencias: [referenciaInicio, referenciaTfg],
    });
    expect(texto).toContain(
      "- Manter a metformina ao iniciar a insulina NPH.\n" +
        "  - TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%.\n" +
        "- Orientar aferição",
    );
  });

  it("sem par de subordinação a lista permanece plana", () => {
    const texto = formatarPlano(resultadoInicio);
    expect(texto).toContain("- Manter a metformina ao iniciar a insulina NPH.");
    expect(texto).not.toContain("  - ");
  });

  it("sem recomendações a seção é omitida", () => {
    const texto = formatarPlano({
      ...resultadoInicio,
      recomendacoesAoPrescritor: [],
    });
    expect(texto).not.toContain("Recomendações ao prescritor:");
  });
});
