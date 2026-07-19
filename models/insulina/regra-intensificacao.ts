// RegraIntensificacao — braços AA/AJ/AD da Figura 4 (p. 63) e titulação da Regular
// (RF-02 do motor; R-13..R-19 da spec §6.1; decisões AMB-03 e AMB-07).
import { CONSTANTES, REFERENCIAS } from "./fonte-clinica";
import {
  contemDoseLimitada,
  type AjusteEmCurso,
} from "./regra-titulacao-basal";
import type {
  AplicacaoInsulina,
  EntradaCalculo,
  MomentoAfericao,
  MomentoAplicacao,
  ReferenciaClinica,
} from "./tipos";

interface Braco {
  readonly sigla: "AA" | "AJ" | "AD";
  readonly momentoAferido: MomentoAfericao;
  readonly momentoDaRegular: MomentoAplicacao;
  readonly referenciaInicio: ReferenciaClinica;
  readonly rotuloRefeicao: string;
}

// Mapeamento aferição → aplicação (R-14..R-17): café ↔ AA, almoço ↔ AJ, jantar ↔ AD.
const BRACOS: readonly Braco[] = [
  {
    sigla: "AA",
    momentoAferido: "antes_almoco",
    momentoDaRegular: "antes_cafe",
    referenciaInicio: REFERENCIAS.bracoAA,
    rotuloRefeicao: "café da manhã",
  },
  {
    sigla: "AJ",
    momentoAferido: "antes_jantar",
    momentoDaRegular: "antes_almoco",
    referenciaInicio: REFERENCIAS.bracoAJ,
    rotuloRefeicao: "almoço",
  },
  {
    sigla: "AD",
    momentoAferido: "ao_deitar",
    momentoDaRegular: "antes_jantar",
    referenciaInicio: REFERENCIAS.bracoAD,
    rotuloRefeicao: "jantar",
  },
];

function indiceDe(
  aplicacoes: readonly AplicacaoInsulina[],
  insulina: AplicacaoInsulina["insulina"],
  momento: MomentoAplicacao,
): number {
  return aplicacoes.findIndex(
    (a) => a.insulina === insulina && a.momento === momento,
  );
}

export class RegraIntensificacao {
  aplicar(ajuste: AjusteEmCurso, entrada: EntradaCalculo): void {
    const prePrandiais = entrada.glicemias.filter((g) => g.momento !== "jejum");
    const temRegular = ajuste.aplicacoes.some((a) => a.insulina === "Regular");
    const hba1c = entrada.hba1cPercent;
    const meta = CONSTANTES.metaHba1cPercent;

    // Gate de HbA1c (R-13/R-18).
    let podeIniciarRegular = false;
    if (hba1c !== undefined && hba1c <= meta) {
      if (temRegular) {
        ajuste.recomendacoes.push({
          tipo: "AVALIAR_ENCAMINHAMENTO_ENDOCRINO",
          mensagem:
            "Meta de HbA1c atingida sob esquema intensificado: ajustar a Regular da refeição correspondente e avaliar encaminhamento ao endocrinologista.",
          referencia: REFERENCIAS.encaminhamentoEndocrino,
        });
      } else {
        if (!ajuste.houveAjuste) {
          ajuste.recomendacoes.push({
            tipo: "REPETIR_HBA1C_6_MESES",
            mensagem:
              "Meta de HbA1c atingida: manter a conduta e repetir HbA1c a cada 6 meses.",
            referencia: REFERENCIAS.manterConduta6Meses,
          });
        }
        return;
      }
    } else if (hba1c !== undefined && hba1c > meta) {
      podeIniciarRegular = true;
      if (prePrandiais.length === 0) {
        ajuste.recomendacoes.push({
          tipo: "AFERIR_PRE_PRANDIAIS",
          mensagem:
            "HbA1c acima da meta: aferir glicemia capilar antes do almoço (AA), antes do jantar (AJ) e antes de deitar (AD) para dirigir a intensificação.",
          referencia: REFERENCIAS.gateIntensificacao,
        });
        return;
      }
    } else if (hba1c === undefined) {
      // Ramos residuais sem HbA1c (adendo bug-20260719-RHZ5): a falta do exame
      // vira recomendação ao prescritor, nunca silêncio.
      if (!temRegular || prePrandiais.length === 0) {
        ajuste.recomendacoes.push({
          tipo: "DOSAR_HBA1C",
          mensagem:
            "HbA1c não informada: solicitar HbA1c para dirigir a intensificação do esquema (meta ≤ 7,0%).",
          referencia: REFERENCIAS.gateIntensificacao,
        });
        return;
      }
      ajuste.recomendacoes.push({
        tipo: "REPETIR_HBA1C_3_MESES",
        mensagem:
          "Repetir HbA1c em 3 meses para reavaliar o esquema intensificado.",
        referencia: REFERENCIAS.gateIntensificacao,
      });
    }

    const ajustesAntes = ajuste.houveAjuste;
    const condutasAntes = ajuste.condutasAlternativas.length;

    for (const braco of BRACOS) {
      this.aplicarBraco(ajuste, braco, prePrandiais, podeIniciarRegular);
    }

    // R-18/NG-07: intensificado, acima da meta e nada a ajustar nos pré-prandiais →
    // o próximo passo do guia é a aferição pós-prandial, sem parâmetro numérico.
    if (
      podeIniciarRegular &&
      temRegular &&
      ajuste.houveAjuste === ajustesAntes &&
      ajuste.condutasAlternativas.length === condutasAntes
    ) {
      ajuste.recomendacoes.push({
        tipo: "AFERIR_POS_PRANDIAL",
        mensagem:
          "HbA1c acima da meta com pré-prandiais na meta: aferir glicemias pós-prandiais para ajuste — o guia não parametriza esse ajuste; a conduta é do prescritor.",
        referencia: REFERENCIAS.posPrandial,
      });
    }
  }

  private aplicarBraco(
    ajuste: AjusteEmCurso,
    braco: Braco,
    prePrandiais: readonly EntradaCalculo["glicemias"][number][],
    podeIniciarRegular: boolean,
  ): void {
    const valores = prePrandiais
      .filter((g) => g.momento === braco.momentoAferido)
      .map((g) => g.valorMgDl);
    if (valores.length === 0) return;

    const media = valores.reduce((s, v) => s + v, 0) / valores.length;
    const hipoglicemia = valores.some(
      (v) => v <= CONSTANTES.limiarHipoglicemiaMgDl,
    );
    const indiceRegular = indiceDe(
      ajuste.aplicacoes,
      "Regular",
      braco.momentoDaRegular,
    );

    if (hipoglicemia) {
      ajuste.alertas.push({
        tipo: "HIPOGLICEMIA",
        mensagem: `Glicemia ${braco.sigla} em faixa de hipoglicemia (≤ 70 mg/dL): reduzir a insulina da refeição correspondente; jamais aumentar.`,
        referencia: REFERENCIAS.titulacaoRegular,
      });
      if (indiceRegular >= 0) {
        this.ajustarRegular(ajuste, indiceRegular, -CONSTANTES.ajusteRegularUi);
      }
      return;
    }

    if (media < CONSTANTES.limiarPrePrandialMgDl) return; // 71–129: manter (AMB-07).

    if (indiceRegular >= 0) {
      this.ajustarRegular(ajuste, indiceRegular, CONSTANTES.ajusteRegularUi);
      return;
    }

    if (!podeIniciarRegular) return;

    if (braco.sigla === "AJ") {
      // AMB-03: duas condutas equivalentes; o motor não escolhe quando ambas são possíveis.
      const indiceNphCafe = indiceDe(ajuste.aplicacoes, "NPH", "antes_cafe");
      if (indiceNphCafe >= 0) {
        const nphAumentada = ajuste.aplicacoes.map((a, i) =>
          i === indiceNphCafe
            ? {
                ...a,
                doseUi: Math.min(
                  CONSTANTES.dosePorAplicacaoUi.max,
                  a.doseUi + CONSTANTES.ajusteRegularUi,
                ),
              }
            : a,
        );
        ajuste.condutasAlternativas.push({
          rotulo: "Aumentar a NPH antes do café (ajustar 2 UI a cada 3 dias)",
          esquemaSugerido: nphAumentada,
          referencia: REFERENCIAS.bracoAJ,
        });
        ajuste.condutasAlternativas.push({
          rotulo:
            "Iniciar insulina Regular 4 UI antes do almoço (ajustar 2 UI a cada 3 dias)",
          esquemaSugerido: [
            ...ajuste.aplicacoes,
            {
              insulina: "Regular",
              momento: "antes_almoco",
              doseUi: CONSTANTES.doseInicialRegularUi,
            },
          ],
          referencia: REFERENCIAS.bracoAJ,
        });
        ajuste.referencias.push(REFERENCIAS.bracoAJ);
        return;
      }
    }

    ajuste.aplicacoes = [
      ...ajuste.aplicacoes,
      {
        insulina: "Regular",
        momento: braco.momentoDaRegular,
        doseUi: CONSTANTES.doseInicialRegularUi,
      },
    ];
    ajuste.referencias.push(braco.referenciaInicio);
    ajuste.houveAjuste = true;
  }

  private ajustarRegular(
    ajuste: AjusteEmCurso,
    indice: number,
    deltaUi: number,
  ): void {
    const doseAnterior = ajuste.aplicacoes[indice].doseUi;
    const doseFinal = contemDoseLimitada(
      ajuste,
      indice,
      doseAnterior + deltaUi,
    );
    if (doseFinal !== doseAnterior) {
      ajuste.houveAjuste = true;
      ajuste.referencias.push(REFERENCIAS.titulacaoRegular);
    }
  }
}
