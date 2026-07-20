// RegraMetformina — antidiabéticos orais antes de iniciar ou titular insulina
// (feature 001-integrar-design-claude: RN-01/RN-02; RF-01/RF-02; decisões D-01/D-08).
// Fonte: Guia Rápido DM p. 28 e p. 58 (extração citada em investigation.md §1.1–1.2).
import { CONSTANTES, REFERENCIAS } from "./fonte-clinica";
import type { Alerta, EntradaCalculo, Recomendacao } from "./tipos";

export interface SaidaAntidiabeticosOrais {
  readonly alertas: readonly Alerta[];
  readonly recomendacoes: readonly Recomendacao[];
}

export class RegraMetformina {
  /** Avalia dose de metformina e TFG; campos ausentes não produzem saída (RF-01/RF-02). */
  avaliar(entrada: EntradaCalculo): SaidaAntidiabeticosOrais {
    const alertas: Alerta[] = [];
    const recomendacoes: Recomendacao[] = [];
    const { metformina, tfg: limiares } = CONSTANTES;

    const tfgEmFaixaDeAjuste =
      entrada.tfg !== undefined && entrada.tfg <= limiares.limiarReducao50;

    if (entrada.tfg !== undefined) {
      if (entrada.tfg < limiares.limiarSuspensao) {
        recomendacoes.push({
          tipo: "SUSPENDER_METFORMINA_TFG",
          mensagem: `TFG abaixo de ${limiares.limiarSuspensao} mL/min/1,73 m²: suspender a metformina, pelo risco de acidose lática.`,
          referencia: REFERENCIAS.tfgSuspensaoMetformina,
        });
      } else if (entrada.tfg <= limiares.limiarReducao50) {
        recomendacoes.push({
          tipo: "REDUZIR_METFORMINA_TFG",
          mensagem: `TFG entre ${limiares.limiarSuspensao} e ${limiares.limiarReducao50} mL/min/1,73 m²: reduzir a dose de metformina em 50%.`,
          referencia: REFERENCIAS.tfgReducaoMetformina,
        });
      }
    }

    // Precedência clínica (decisão de execução do coding, Notas de execução do
    // actions.md): com TFG em faixa de redução/suspensão, "otimizar (aumentar) a
    // dose" contradiria a conduta renal do próprio guia (p. 28/58) — suprime-se.
    if (
      entrada.doseMetforminaMgDia !== undefined &&
      entrada.doseMetforminaMgDia < metformina.doseOtimizadaMinMgDia &&
      !tfgEmFaixaDeAjuste
    ) {
      alertas.push({
        tipo: "METFORMINA_NAO_OTIMIZADA",
        mensagem: `Dose de metformina abaixo da faixa otimizada (${metformina.doseOtimizadaMinMgDia}–${metformina.doseMaxMgDia} mg/dia): otimizar a dose antes de intensificar a insulina.`,
        referencia: REFERENCIAS.metforminaOtimizada,
      });
    }

    return { alertas, recomendacoes };
  }
}
