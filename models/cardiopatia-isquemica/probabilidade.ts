// Probabilidade pré-teste de DAC (RN-02/RN-03/RN-06). Lookup na matriz congelada
// do Quadro 2 por classificação × sexo × faixa etária; ajuste por fatores de risco
// como faixa base×2–base×3 capada (D-03, decisão de 2026-07-23); estrato com a
// regra de que qualquer fator de risco impede o estrato "baixa". Funções puras.
// Feature 010-dor-toracica-pre-teste.
import { CONSTANTES, PROBABILIDADE_PRE_TESTE } from "./fonte-clinica";
import type {
  ClassificacaoDor,
  Estrato,
  FaixaEtaria,
  FaixaProbabilidade,
  Sexo,
} from "./tipos";

const { idadeCobertura, estrato, fatorDeRisco } = CONSTANTES;
const PCT_MAX_EXIBIVEL = 99;

/** RN-06: faixa etária do Quadro 2; null quando a idade está fora de 30–69. */
export function faixaEtariaDe(idadeAnos: number): FaixaEtaria | null {
  if (idadeAnos < idadeCobertura.min || idadeAnos > idadeCobertura.max) {
    return null;
  }
  if (idadeAnos <= 39) return "30-39";
  if (idadeAnos <= 49) return "40-49";
  if (idadeAnos <= 59) return "50-59";
  return "60-69";
}

/** RN-02: valor-base (%) tabelado no Quadro 2. */
export function probabilidadeBasePct(
  classificacao: ClassificacaoDor,
  sexo: Sexo,
  faixa: FaixaEtaria,
): number {
  return PROBABILIDADE_PRE_TESTE[classificacao][sexo][faixa];
}

/**
 * RN-03 (D-03): sem fator, sem ajuste (undefined). Com ≥ 1 fator, faixa
 * base×2–base×3, capada em 99% para não exibir > 100%; `excedeAlta` sinaliza
 * que algum extremo ultrapassa o limiar de 90% (redação ">90%").
 */
export function ajustarPorFatoresDeRisco(
  basePct: number,
  quantidadeFatores: number,
): FaixaProbabilidade | undefined {
  if (quantidadeFatores <= 0) return undefined;
  const bruto = {
    min: basePct * fatorDeRisco.multiplicadorMin,
    max: basePct * fatorDeRisco.multiplicadorMax,
  };
  return {
    minPct: Math.min(bruto.min, PCT_MAX_EXIBIVEL),
    maxPct: Math.min(bruto.max, PCT_MAX_EXIBIVEL),
    excedeAlta: bruto.max > estrato.altaAcimaDe,
  };
}

/**
 * Estrato de conduta (RN-04; nota ** do Quadro 2; decisão §9). O guia define a
 * conduta "baixa" (não investigar) pela descrição clínica — dor não anginosa E
 * sem fatores de risco —, não pelo corte numérico isolado (uma dor não anginosa
 * pode tabelar até 27%). Logo: "baixa" ⟺ não anginosa e sem fatores; "alta" ⟺ a
 * probabilidade efetiva ultrapassa 90% (base sem fatores, ou piso da faixa com
 * fatores); o restante é "intermediária". Qualquer fator de risco impede "baixa".
 */
export function estratoDe(
  classificacao: ClassificacaoDor,
  basePct: number,
  ajustada: FaixaProbabilidade | undefined,
): Estrato {
  if (classificacao === "nao-anginosa" && ajustada === undefined) {
    return "baixa";
  }
  const passaDe90 =
    ajustada === undefined
      ? basePct > estrato.altaAcimaDe
      : ajustada.minPct > estrato.altaAcimaDe;
  return passaDe90 ? "alta" : "intermediaria";
}
