// RegraInicio — início de insulinização no DM2 (RF-01 do motor; R-01..R-04 da spec §6.1).
// Decisão AMB-01: o motor devolve a FAIXA do guia (10–15 UI ou 0,1–0,2 UI/kg/dia);
// quem fixa a dose é o médico.
import { CONSTANTES, REFERENCIAS } from "./fonte-clinica";
import type {
  Alerta,
  EntradaCalculo,
  Peso,
  Recomendacao,
  ResultadoInicio,
} from "./tipos";

export class RegraInicio {
  calcular(entrada: EntradaCalculo, peso: Peso): ResultadoInicio {
    const alertas: Alerta[] = [];
    const recomendacoes: Recomendacao[] = [];

    const indicacaoPorHba1c =
      entrada.hba1cPercent !== undefined &&
      entrada.hba1cPercent >= CONSTANTES.limiarIndicacaoHba1cPercent;
    const indicacaoPorJejum = entrada.glicemias.some(
      (g) =>
        g.momento === "jejum" &&
        g.valorMgDl >= CONSTANTES.limiarIndicacaoJejumMgDl,
    );
    if (indicacaoPorHba1c || indicacaoPorJejum) {
      alertas.push({
        tipo: "INDICACAO_INSULINA",
        mensagem:
          "Indicação de insulina presente (HbA1c ≥ 10% ou glicemia de jejum ≥ 300 mg/dL, inclusive ao diagnóstico).",
        referencia: REFERENCIAS.indicacaoInsulina,
      });
    }

    recomendacoes.push({
      tipo: "MANTER_METFORMINA",
      mensagem: "Manter a metformina ao iniciar a insulina NPH.",
      referencia: REFERENCIAS.inicio,
    });
    if (entrada.usoSulfonilureia !== false) {
      recomendacoes.push({
        tipo: "MANTER_SULFONILUREIA",
        mensagem: "Manter a sulfonilureia ao iniciar a insulina NPH.",
        referencia: REFERENCIAS.inicio,
      });
    }
    recomendacoes.push({
      tipo: "AFERIR_JEJUM_3X_SEMANA_15_DIAS",
      mensagem:
        "Orientar aferição de glicemia capilar em jejum três vezes por semana, com registro, durante 15 dias.",
      referencia: REFERENCIAS.monitorizacaoInicial,
    });

    const porPeso = CONSTANTES.inicioPorPesoUiPorKg;
    return {
      tipo: "resultado",
      modo: "inicio",
      faixaDoseUi: CONSTANTES.inicioFaixaAbsolutaUi,
      faixaPorPesoUi: {
        minUi: Math.round(porPeso.min * peso.kg),
        maxUi: Math.round(porPeso.max * peso.kg),
      },
      aplicacaoSugerida: { insulina: "NPH", momento: "ao_deitar" },
      alertas,
      recomendacoesAoPrescritor: recomendacoes,
      referencias: [REFERENCIAS.inicio],
    };
  }
}
