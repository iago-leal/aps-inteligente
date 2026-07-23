// Elegibilidade às Pooled Cohort Equations (RF-05/RN-02; D-06): as PCE só foram
// validadas para prevenção primária em 40–79 anos (ADR 0009). Idade fora da faixa
// e DCV prévia produzem `ForaDoEscopoDaFonte` com motivo distinto — recusa honesta,
// sem extrapolar (molde do `ForaDoEscopoDaFonte` da unit de cardiopatia). A idade já
// chega validada como inteiro plausível (a validação roda antes, na fachada).
// Feature 014-risco-cardiovascular-pce.
import { FAIXAS, REFERENCIAS } from "./fonte-clinica";
import type { EntradaEstimativa, ForaDoEscopoDaFonte } from "./tipos";

const { idadeCobertura } = FAIXAS;

/** null quando elegível; `ForaDoEscopoDaFonte` quando fora da cobertura das PCE. */
export function foraDoEscopo(
  entrada: EntradaEstimativa,
): ForaDoEscopoDaFonte | null {
  if (entrada.dcvPrevia) {
    return {
      tipo: "fora-do-escopo",
      motivo: "DCV_PREVIA",
      mensagem:
        "Doença cardiovascular prévia (prevenção secundária): as Pooled Cohort Equations estimam risco apenas em prevenção primária. A conduta segue a estratificação de risco secundário, fora do escopo desta ferramenta.",
      referencia: REFERENCIAS.cobertura,
    };
  }

  if (
    entrada.idadeAnos < idadeCobertura.min ||
    entrada.idadeAnos > idadeCobertura.max
  ) {
    return {
      tipo: "fora-do-escopo",
      motivo: "IDADE_FORA_DA_FAIXA",
      mensagem: `Idade de ${entrada.idadeAnos} anos fora da faixa de validação das Pooled Cohort Equations, que cobrem de ${idadeCobertura.min} a ${idadeCobertura.max} anos: a fonte não estima o risco para esta idade.`,
      referencia: REFERENCIAS.cobertura,
    };
  }

  return null;
}
