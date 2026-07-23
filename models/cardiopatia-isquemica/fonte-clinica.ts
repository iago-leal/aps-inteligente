// Constantes e catálogo de referências da fonte clínica da avaliação de dor
// torácica. Fonte única desta unit (ADR 0001; uma fonte por unit, coerente com
// NG-04): TeleCondutas — Cardiopatia Isquêmica, TelessaúdeRS-UFRGS, 2017 (páginas
// impressas; PDF em `referencias/telecondutas-cardiopatia-isquemica-telessauders-2017.pdf`,
// fora do versionamento). Feature 010: RN-01..RN-08.
import type {
  ClassificacaoDor,
  FaixaEtaria,
  ReferenciaClinica,
  Sexo,
} from "./tipos";

export const FONTE_ID = "telecondutas-cardiopatia-isquemica";
export const VERSAO_EDICAO = "TelessaúdeRS-UFRGS, 2017";

export function referencia(localizacao: string): ReferenciaClinica {
  return Object.freeze({
    fonteId: FONTE_ID,
    versaoEdicao: VERSAO_EDICAO,
    localizacao,
  });
}

export const REFERENCIAS = Object.freeze({
  classificacaoDor: referencia(
    "Quadro 1, p. 4 (classificação clínica da dor torácica; CESAR et al., 2014)",
  ),
  probabilidadePreTeste: referencia(
    "Quadro 2, p. 5 (probabilidade pré-teste de DAC por idade e sexo; DUNCAN et al., 2013)",
  ),
  ajusteFatoresDeRisco: referencia(
    "Quadro 2, nota *, p. 5 (fatores de risco aumentam a estimativa em 2 a 3 vezes)",
  ),
  estratosEConduta: referencia(
    "p. 4-5 (estratos < 10% / 10–90% / > 90% e conduta de investigação; nota ** do Quadro 2)",
  ),
  exameFuncional: referencia(
    "p. 6 (ECG e teste ergométrico iniciais; método não invasivo quando o ECG basal impede a interpretação ou o paciente não pode exercitar)",
  ),
  anginaInstavel: referencia(
    "p. 6 (angina instável: alta probabilidade de evento agudo — encaminhamento emergencial)",
  ),
});

// RN-02 (Quadro 2, p. 5): probabilidade pré-teste-base (%) por classificação da
// dor × sexo × faixa etária. Fonte numérica única, congelada — transcrição fiel
// das 24 células (DUNCAN et al., 2013; dados de Diamond/Forrester e Registro CASS).
export const PROBABILIDADE_PRE_TESTE: Readonly<
  Record<ClassificacaoDor, Readonly<Record<Sexo, Readonly<Record<FaixaEtaria, number>>>>>
> = Object.freeze({
  "nao-anginosa": Object.freeze({
    masculino: Object.freeze({ "30-39": 4, "40-49": 13, "50-59": 20, "60-69": 27 }),
    feminino: Object.freeze({ "30-39": 2, "40-49": 3, "50-59": 7, "60-69": 14 }),
  }),
  atipica: Object.freeze({
    masculino: Object.freeze({ "30-39": 34, "40-49": 51, "50-59": 65, "60-69": 72 }),
    feminino: Object.freeze({ "30-39": 12, "40-49": 22, "50-59": 31, "60-69": 51 }),
  }),
  tipica: Object.freeze({
    masculino: Object.freeze({ "30-39": 76, "40-49": 87, "50-59": 93, "60-69": 94 }),
    feminino: Object.freeze({ "30-39": 26, "40-49": 55, "50-59": 73, "60-69": 86 }),
  }),
});

export const CONSTANTES = Object.freeze({
  // RN-06: faixas etárias do Quadro 2; fora de 30–69, fora do escopo da fonte.
  idadeCobertura: Object.freeze({ min: 30, max: 69 }),
  // Plausibilidade da idade (ofensor de validação distinto do fora-de-escopo).
  idadePlausivel: Object.freeze({ min: 0, max: 120 }),
  // RN-04 (p. 4-5, nota *** do Quadro 2): limiares dos estratos.
  estrato: Object.freeze({ baixaAbaixoDe: 10, altaAcimaDe: 90 }),
  // RN-03 (nota * do Quadro 2): multiplicador do ajuste por fatores de risco.
  fatorDeRisco: Object.freeze({ multiplicadorMin: 2, multiplicadorMax: 3 }),
});

// RN-04 (p. 4): causas não cardíacas a investigar quando a probabilidade é baixa.
export const CAUSAS_NAO_CARDIACAS: readonly string[] = Object.freeze([
  "dor musculoesquelética",
  "transtornos psiquiátricos (ansiedade, transtorno do pânico)",
  "distúrbios gastrointestinais (DRGE, cólica biliar, espasmo esofágico)",
  "doenças pulmonares (pneumonia, neoplasia torácica, pneumotórax)",
]);

// Textos fixos das condutas e advertências ao prescritor (fonte única anti-drift,
// molde do TEXTO_NOTAS da unit de gestação).
export const TEXTO_CONDUTA = Object.freeze({
  exameNaoIndicado:
    "Probabilidade pré-teste baixa (dor não anginosa e sem fatores de risco): exame funcional não indicado na avaliação inicial. Investigar causas não cardíacas.",
  exameNaoInvasivo:
    "Probabilidade pré-teste intermediária: indicar exame não invasivo para confirmar ou afastar a suspeita em quadro clínico duvidoso.",
  estratificacaoEEncaminhamento:
    "Probabilidade pré-teste alta: exame não invasivo para estratificação prognóstica e identificação de candidatos à revascularização; probabilidade > 90% requer estratificação por método invasivo — encaminhar ao cardiologista.",
  ergometria:
    "Exame inicial: ECG de repouso e teste ergométrico.",
  metodoNaoInvasivoAlternativo:
    "ECG basal impede a interpretação da ergometria ou o paciente não pode exercitar: preferir método não invasivo (ecocardiograma de estresse, cintilografia miocárdica ou ressonância magnética cardiovascular).",
});

export const TEXTO_ADVERTENCIA = Object.freeze({
  anginaInstavel:
    "Sinais de angina instável ou dor aguda: alta probabilidade de evento agudo em curto prazo. Encaminhar para atendimento emergencial — não seguir o fluxo eletivo de investigação.",
});
