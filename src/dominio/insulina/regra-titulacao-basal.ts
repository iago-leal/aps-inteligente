// RegraTitulacaoBasal — titulação da NPH pela glicemia de jejum e fracionamento
// (RF-02 do motor; R-05..R-12 da spec §6.1; decisões AMB-02/05/06/09/10).
import { CONSTANTES, REFERENCIAS } from "./fonte-clinica";
import type {
  Alerta,
  AplicacaoInsulina,
  CondutaAlternativa,
  EntradaCalculo,
  Peso,
  Recomendacao,
  ReferenciaClinica,
} from "./tipos";

/** Estado de trabalho compartilhado entre as estratégias durante um cálculo de titulação. */
export interface AjusteEmCurso {
  aplicacoes: AplicacaoInsulina[];
  alertas: Alerta[];
  recomendacoes: Recomendacao[];
  referencias: ReferenciaClinica[];
  condutasAlternativas: CondutaAlternativa[];
  houveAjuste: boolean;
  naMeta: boolean;
}

const ORDEM_NOTURNA: readonly AplicacaoInsulina["momento"][] = [
  "ao_deitar",
  "antes_jantar",
  "antes_almoco",
  "antes_cafe",
];

function indiceDaNphNoturna(aplicacoes: readonly AplicacaoInsulina[]): number {
  for (const momento of ORDEM_NOTURNA) {
    const indice = aplicacoes.findIndex(
      (a) => a.insulina === "NPH" && a.momento === momento,
    );
    if (indice >= 0) return indice;
  }
  return -1;
}

export function contemDoseLimitada(
  ajuste: AjusteEmCurso,
  indice: number,
  novaDoseUi: number,
): number {
  const { min, max } = CONSTANTES.dosePorAplicacaoUi;
  const contida = Math.min(max, Math.max(min, novaDoseUi));
  if (contida !== novaDoseUi) {
    ajuste.alertas.push({
      tipo: "TETO_POR_APLICACAO",
      mensagem: `A dose por aplicação foi contida no limite físico da caneta (${min}–${max} UI).`,
      referencia: REFERENCIAS.limitePorAplicacao,
    });
  }
  ajuste.aplicacoes[indice] = { ...ajuste.aplicacoes[indice], doseUi: contida };
  return contida;
}

export class RegraTitulacaoBasal {
  /** Ajusta a NPH noturna pela glicemia de jejum agregada (média; hipo prevalece — AMB-06). */
  aplicar(ajuste: AjusteEmCurso, entrada: EntradaCalculo): void {
    const jejum = entrada.glicemias.filter((g) => g.momento === "jejum");
    if (jejum.length === 0) return;

    const valores = jejum.map((g) => g.valorMgDl);
    const media = valores.reduce((s, v) => s + v, 0) / valores.length;
    const hipoglicemia = valores.some(
      (v) => v <= CONSTANTES.limiarHipoglicemiaMgDl,
    );

    ajuste.referencias.push(REFERENCIAS.tabelaTitulacao);
    if (valores.length > 1)
      ajuste.referencias.push(REFERENCIAS.agregacaoGlicemias);

    const { ajusteBasalUi } = CONSTANTES;
    let deltaUi: number;
    if (hipoglicemia || media <= CONSTANTES.limiarHipoglicemiaMgDl) {
      deltaUi = -ajusteBasalUi.reducao;
      ajuste.alertas.push({
        tipo: "HIPOGLICEMIA",
        mensagem:
          "Glicemia em faixa de hipoglicemia (≤ 70 mg/dL) no período: reduzir a insulina basal; jamais aumentar.",
        referencia: REFERENCIAS.hipoglicemia,
      });
    } else if (media >= CONSTANTES.limiarAumentoMaiorMgDl) {
      deltaUi = ajusteBasalUi.aumentoMaior;
    } else if (media >= CONSTANTES.limiarAumentoMenorMgDl) {
      deltaUi = ajusteBasalUi.aumentoMenor;
    } else {
      deltaUi = 0;
      ajuste.naMeta = true;
      ajuste.referencias.push(REFERENCIAS.metaJejum);
    }

    if (deltaUi === 0) return;

    const indice = indiceDaNphNoturna(ajuste.aplicacoes);
    if (indice < 0) return; // Esquema sem NPH: nada a titular pelo jejum.

    const doseAnterior = ajuste.aplicacoes[indice].doseUi;
    const doseFinal = contemDoseLimitada(
      ajuste,
      indice,
      doseAnterior + deltaUi,
    );
    if (doseFinal !== doseAnterior) ajuste.houveAjuste = true;
  }

  /**
   * Fracionamento da NPH única quando o gatilho dispara (R-08..R-10):
   * ½ café + ½ noite como conduta principal; ⅔ + ⅓ como alternativa rotulada (AMB-10).
   */
  fracionarSeIndicado(
    ajuste: AjusteEmCurso,
    entrada: EntradaCalculo,
    peso: Peso,
  ): void {
    const indicesNph = ajuste.aplicacoes
      .map((a, i) => (a.insulina === "NPH" ? i : -1))
      .filter((i) => i >= 0);
    if (indicesNph.length !== 1) return; // Já fracionada (ou sem NPH): gatilho não se aplica.

    const indice = indicesNph[0];
    const aplicacao = ajuste.aplicacoes[indice];
    const gatilhoAbsoluto =
      aplicacao.doseUi > CONSTANTES.gatilhoFracionamentoUi;
    const gatilhoPorPeso =
      aplicacao.doseUi > CONSTANTES.gatilhoFracionamentoUiPorKgDia * peso.kg;
    if (!gatilhoAbsoluto && !gatilhoPorPeso) return;

    const total = aplicacao.doseUi;
    const meioCafe = Math.ceil(total / 2);
    const principal: AplicacaoInsulina[] = [
      { insulina: "NPH", momento: "antes_cafe", doseUi: meioCafe },
      { insulina: "NPH", momento: "ao_deitar", doseUi: total - meioCafe },
    ];
    const doisTercosCafe = Math.round((total * 2) / 3);
    const alternativa: AplicacaoInsulina[] = [
      { insulina: "NPH", momento: "antes_cafe", doseUi: doisTercosCafe },
      { insulina: "NPH", momento: "ao_deitar", doseUi: total - doisTercosCafe },
    ];

    const demais = ajuste.aplicacoes.filter((_, i) => i !== indice);
    ajuste.aplicacoes = [...principal, ...demais];
    ajuste.condutasAlternativas.push({
      rotulo: "Alternativa do guia: ⅔ da dose antes do café e ⅓ antes da ceia",
      esquemaSugerido: [...alternativa, ...demais],
      referencia: REFERENCIAS.fracionamento,
    });

    ajuste.alertas.push({
      tipo: "FRACIONAR_DOSE",
      mensagem: `Dose de NPH acima do gatilho (${CONSTANTES.gatilhoFracionamentoUi} UI ou ${CONSTANTES.gatilhoFracionamentoUiPorKgDia} UI/kg/dia): fracionar — metade antes do café e metade antes da ceia/ao deitar (preferencial).`,
      referencia: REFERENCIAS.fracionamento,
    });
    ajuste.referencias.push(REFERENCIAS.fracionamento);
    ajuste.houveAjuste = true;

    if (entrada.usoSulfonilureia === true) {
      ajuste.recomendacoes.push({
        tipo: "SUSPENDER_SULFONILUREIA",
        mensagem: "Ao fracionar a NPH, suspender a sulfonilureia.",
        referencia: REFERENCIAS.suspenderSulfonilureia,
      });
    }
    ajuste.recomendacoes.push({
      tipo: "MANTER_METFORMINA",
      mensagem: "Manter a metformina ao fracionar a NPH.",
      referencia: REFERENCIAS.suspenderSulfonilureia,
    });
  }
}
