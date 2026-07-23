// Núcleo de cálculo das Pooled Cohort Equations (RF-06/RN-03/RN-05). Modelo de Cox
// sexo- e raça-específico: Risco_10 = 1 − S0^exp(Σ(β·X) − mean_grupo), com as
// variáveis contínuas em logaritmo natural e a PAS entrando por UM coeficiente
// (tratada × não-tratada). "Outra raça" usa os coeficientes de brancos (RN-05, D-05).
// Função pura, sem efeitos; os valores numéricos chegam já validados e clampados à
// faixa fisiológica (validacao.ts). Feature 014-risco-cardiovascular-pce.
import { BASELINE_SURVIVAL, COEFICIENTES, MEANS } from "./fonte-clinica";
import type { GrupoPce, Raca, Sexo } from "./tipos";

/** Mapeia sexo×raça ao grupo PCE; "outra" → coeficientes de branco (RN-05, data-delta §4). */
export function grupoDe(sexo: Sexo, raca: Raca): GrupoPce {
  const negro = raca === "afro-americano";
  if (sexo === "masculino") return negro ? "homem-negro" : "homem-branco";
  return negro ? "mulher-negra" : "mulher-branca";
}

export interface VariaveisEquacao {
  readonly idadeAnos: number;
  readonly colesterolTotalMgDl: number;
  readonly hdlMgDl: number;
  readonly pasMmHg: number;
  readonly emTratamentoAntiHipertensivo: boolean;
  readonly diabetes: boolean;
  readonly tabagismoAtual: boolean;
}

/** Risco de ASCVD "hard" em 10 anos, em pontos percentuais (0–100). */
export function riscoAscvdPct(grupo: GrupoPce, v: VariaveisEquacao): number {
  const c = COEFICIENTES[grupo];
  const lnIdade = Math.log(v.idadeAnos);
  const lnColesterol = Math.log(v.colesterolTotalMgDl);
  const lnHdl = Math.log(v.hdlMgDl);
  const lnPas = Math.log(v.pasMmHg);
  const fuma = v.tabagismoAtual ? 1 : 0;
  const temDiabetes = v.diabetes ? 1 : 0;

  const termoPas = v.emTratamentoAntiHipertensivo
    ? c.lnPasTratada * lnPas + c.lnIdadeXlnPasTratada * lnIdade * lnPas
    : c.lnPasNaoTratada * lnPas + c.lnIdadeXlnPasNaoTratada * lnIdade * lnPas;

  const somaIndividual =
    c.lnIdade * lnIdade +
    c.lnIdade2 * lnIdade * lnIdade +
    c.lnColesterolTotal * lnColesterol +
    c.lnIdadeXlnColesterol * lnIdade * lnColesterol +
    c.lnHdl * lnHdl +
    c.lnIdadeXlnHdl * lnIdade * lnHdl +
    termoPas +
    c.tabagismo * fuma +
    c.lnIdadeXtabagismo * lnIdade * fuma +
    c.diabetes * temDiabetes;

  const risco =
    1 - Math.pow(BASELINE_SURVIVAL[grupo], Math.exp(somaIndividual - MEANS[grupo]));
  return risco * 100;
}
