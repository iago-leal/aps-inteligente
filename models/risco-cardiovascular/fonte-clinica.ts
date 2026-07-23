// Constantes e catálogo de referências da fonte clínica do risco cardiovascular.
// Fonte única desta unit (ADR 0001/0011; uma fonte por unit): 2013 ACC/AHA
// Guideline on the Assessment of Cardiovascular Risk — Pooled Cohort Equations
// (Goff DC et al., Circulation 2014;129(25 Suppl 2):S49–S73), com os cortes de
// categoria do 2019 ACC/AHA Primary Prevention Guideline. O guideline é dependência
// EDITORIAL fora do git (MD-0008). Coeficientes em precisão estendida (validados
// contra os pacotes R `CVrisk` e `PooledCohort`, que reproduzem a Tabela A e
// concordam entre si) para reproduzir o ASCVD Risk Estimator Plus. Feature 014:
// RN-01..RN-09; detalhamento em `investigation.md` §4.
import type { GrupoPce, ReferenciaClinica } from "./tipos";

export const FONTE_ID = "pce-acc-aha-2013";
export const VERSAO_EDICAO = "ACC/AHA 2013 (Goff et al., Circulation 2014)";

export function referencia(localizacao: string): ReferenciaClinica {
  return Object.freeze({
    fonteId: FONTE_ID,
    versaoEdicao: VERSAO_EDICAO,
    localizacao,
  });
}

/**
 * Coeficientes β dos quatro modelos de Cox (Tabela A de Goff 2013). Estrutura
 * uniforme: um termo ausente no modelo tem coeficiente 0 (investigation §3). As
 * variáveis contínuas entram como logaritmo natural; a PAS entra por UM dos dois
 * coeficientes mutuamente exclusivos (tratada × não-tratada). Mulheres negras em
 * precisão estendida do `PooledCohort` (investigation §4.1).
 */
export interface RegistroCoeficientes {
  readonly lnIdade: number;
  readonly lnIdade2: number;
  readonly lnColesterolTotal: number;
  readonly lnIdadeXlnColesterol: number;
  readonly lnHdl: number;
  readonly lnIdadeXlnHdl: number;
  readonly lnPasTratada: number;
  readonly lnIdadeXlnPasTratada: number;
  readonly lnPasNaoTratada: number;
  readonly lnIdadeXlnPasNaoTratada: number;
  readonly tabagismo: number;
  readonly lnIdadeXtabagismo: number;
  readonly diabetes: number;
}

export const COEFICIENTES: Readonly<Record<GrupoPce, RegistroCoeficientes>> =
  Object.freeze({
    // Homens brancos/outros (Goff 2013, Tabela A).
    "homem-branco": Object.freeze({
      lnIdade: 12.344,
      lnIdade2: 0,
      lnColesterolTotal: 11.853,
      lnIdadeXlnColesterol: -2.664,
      lnHdl: -7.99,
      lnIdadeXlnHdl: 1.769,
      lnPasTratada: 1.797,
      lnIdadeXlnPasTratada: 0,
      lnPasNaoTratada: 1.764,
      lnIdadeXlnPasNaoTratada: 0,
      tabagismo: 7.837,
      lnIdadeXtabagismo: -1.795,
      diabetes: 0.658,
    }),
    // Homens negros — modelo enxuto, sem interações com idade (investigation §3).
    "homem-negro": Object.freeze({
      lnIdade: 2.469,
      lnIdade2: 0,
      lnColesterolTotal: 0.302,
      lnIdadeXlnColesterol: 0,
      lnHdl: -0.307,
      lnIdadeXlnHdl: 0,
      lnPasTratada: 1.916,
      lnIdadeXlnPasTratada: 0,
      lnPasNaoTratada: 1.809,
      lnIdadeXlnPasNaoTratada: 0,
      tabagismo: 0.549,
      lnIdadeXtabagismo: 0,
      diabetes: 0.645,
    }),
    // Mulheres brancas/outras — como os homens brancos + Ln idade² (investigation §3).
    "mulher-branca": Object.freeze({
      lnIdade: -29.799,
      lnIdade2: 4.884,
      lnColesterolTotal: 13.54,
      lnIdadeXlnColesterol: -3.114,
      lnHdl: -13.578,
      lnIdadeXlnHdl: 3.149,
      lnPasTratada: 2.019,
      lnIdadeXlnPasTratada: 0,
      lnPasNaoTratada: 1.957,
      lnIdadeXlnPasNaoTratada: 0,
      tabagismo: 7.574,
      lnIdadeXtabagismo: -1.665,
      diabetes: 0.661,
    }),
    // Mulheres negras — interações Ln idade×Ln HDL e Ln idade×Ln PAS; precisão
    // estendida do `PooledCohort` (investigation §4.1).
    "mulher-negra": Object.freeze({
      lnIdade: 17.114,
      lnIdade2: 0,
      lnColesterolTotal: 0.9396,
      lnIdadeXlnColesterol: 0,
      lnHdl: -18.9196,
      lnIdadeXlnHdl: 4.4748,
      lnPasTratada: 29.2907,
      lnIdadeXlnPasTratada: -6.4321,
      lnPasNaoTratada: 27.8197,
      lnIdadeXlnPasNaoTratada: -6.0873,
      tabagismo: 0.6908,
      lnIdadeXtabagismo: 0,
      diabetes: 0.8738,
    }),
  });

/** "Baseline survival" S₀ em 10 anos por grupo (precisão estendida, investigation §4.1). */
export const BASELINE_SURVIVAL: Readonly<Record<GrupoPce, number>> =
  Object.freeze({
    "homem-branco": 0.91436,
    "homem-negro": 0.89536,
    "mulher-branca": 0.96652,
    "mulher-negra": 0.95334,
  });

/**
 * "Mean (Coefficient × Value)" da coorte de derivação, subtraído por grupo
 * (precisão estendida, investigation §4.1). Nota: o mean dos homens negros é
 * 19.5425 — o requirements citou de memória um valor trocado, corrigido aqui (D-04).
 */
export const MEANS: Readonly<Record<GrupoPce, number>> = Object.freeze({
  "homem-branco": 61.1816,
  "homem-negro": 19.5425,
  "mulher-branca": -29.1817,
  "mulher-negra": 86.6081,
});

export const FAIXAS = Object.freeze({
  // RF-03/RN-02 (D-06): cobertura etária de validação das PCE; fora → fora-do-escopo.
  idadeCobertura: Object.freeze({ min: 40, max: 79 }),
  // Plausibilidade da idade (ofensor de validação distinto do fora-de-escopo).
  idadePlausivel: Object.freeze({ min: 0, max: 120 }),
  // RN-03/RN-07 (D-07): faixas fisiológicas do ASCVD Estimator; fora → clamp + aviso.
  colesterolTotal: Object.freeze({ min: 130, max: 320 }),
  hdl: Object.freeze({ min: 20, max: 100 }),
  pas: Object.freeze({ min: 90, max: 200 }),
});

// RF-07 (investigation §7): cortes das categorias de risco em pontos percentuais.
export const CATEGORIAS = Object.freeze({
  limitrofe: 5,
  intermediario: 7.5,
  alto: 20,
});

export const REFERENCIAS = Object.freeze({
  equacoes: referencia(
    "Pooled Cohort Equations, Tabela A (Goff et al., 2013): risco de ASCVD em 10 anos, adultos de 40 a 79 anos sem DCV prévia",
  ),
  categorias: referencia(
    "2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease: cortes de risco 5% / 7,5% / 20%",
  ),
  cobertura: referencia(
    "ASCVD Risk Estimator Plus (ACC): faixa de validação 40–79 anos, prevenção primária (sem DCV prévia)",
  ),
});

// RN-09/RF-10 (D-09): fonte textual única da limitação de proveniência.
export const NOTA_PROVENIENCIA =
  "As Pooled Cohort Equations foram derivadas de coortes dos Estados Unidos (ARIC, CHS, CARDIA, Framingham) e são específicas para as categorias raciais branco e afro-americano do contexto norte-americano. Não há calibração validada para a população brasileira; a categoria “outra” adota os coeficientes de brancos, como o ASCVD Risk Estimator Plus oficial. Use a estimativa como apoio à decisão, ponderando essa limitação de transportabilidade.";
