// Contrato do motor de cálculo de insulina DM2.
// Origem: RF-01..RF-09 e §9 da spec `_reversa_sdd/sdd/motor-calculo-insulina.md` (v2.0);
// RNF-06 (value objects imutáveis com invariantes no construtor).
// Feature 001-integrar-design-claude (RF-01/RF-02): campos opcionais de
// antidiabéticos orais em EntradaCalculo e tipos de saída novos (D-03/D-08).

export type MomentoAfericao =
  "jejum" | "antes_almoco" | "antes_jantar" | "ao_deitar";

export type MomentoAplicacao =
  "antes_cafe" | "antes_almoco" | "antes_jantar" | "ao_deitar";

export type NomeInsulina = "NPH" | "Regular";

export type TipoEsquema = "basal" | "basal-plus" | "basal-bolus";

export interface GlicemiaAferida {
  readonly valorMgDl: number;
  readonly momento: MomentoAfericao;
}

export interface AplicacaoInsulina {
  readonly insulina: NomeInsulina;
  readonly momento: MomentoAplicacao;
  readonly doseUi: number;
}

export interface EsquemaInsulina {
  readonly tipo: TipoEsquema;
  readonly aplicacoes: readonly AplicacaoInsulina[];
}

export interface EntradaCalculo {
  readonly modo: "inicio" | "titulacao";
  readonly pesoKg: number;
  readonly glicemias: readonly GlicemiaAferida[];
  readonly hba1cPercent?: number;
  readonly usoSulfonilureia?: boolean;
  readonly esquemaAtual?: EsquemaInsulina;
  /** Dose diária atual de metformina em mg/dia (RN-01); ausente = não informado. */
  readonly doseMetforminaMgDia?: number;
  /** Taxa de filtração glomerular em mL/min/1,73 m² (RN-02); ausente = não informado. */
  readonly tfg?: number;
}

export interface ReferenciaClinica {
  readonly fonteId: string;
  readonly versaoEdicao: string;
  readonly localizacao: string;
}

export type TipoAlerta =
  | "HIPOGLICEMIA"
  | "DOSE_ACIMA_FAIXA_PLENA"
  | "FRACIONAR_DOSE"
  | "TETO_POR_APLICACAO"
  | "INDICACAO_INSULINA"
  | "METFORMINA_NAO_OTIMIZADA";

export interface Alerta {
  readonly tipo: TipoAlerta;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export type TipoRecomendacao =
  | "MANTER_METFORMINA"
  | "MANTER_SULFONILUREIA"
  | "SUSPENDER_SULFONILUREIA"
  | "REDUZIR_METFORMINA_TFG"
  | "SUSPENDER_METFORMINA_TFG"
  | "AFERIR_JEJUM_3X_SEMANA_15_DIAS"
  | "REPETIR_HBA1C_3_MESES"
  | "REPETIR_HBA1C_6_MESES"
  | "DOSAR_HBA1C"
  | "AFERIR_PRE_PRANDIAIS"
  | "AFERIR_POS_PRANDIAL"
  | "AVALIAR_ENCAMINHAMENTO_ENDOCRINO"
  | "COMPARTILHAR_CUIDADO_ESPECIALISTA"
  | "REAVALIAR_EM_3_DIAS";

export interface Recomendacao {
  readonly tipo: TipoRecomendacao;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export interface CondutaAlternativa {
  readonly rotulo: string;
  readonly esquemaSugerido: readonly AplicacaoInsulina[];
  readonly referencia: ReferenciaClinica;
}

export interface FaixaUi {
  readonly minUi: number;
  readonly maxUi: number;
}

export interface ResultadoInicio {
  readonly tipo: "resultado";
  readonly modo: "inicio";
  readonly faixaDoseUi: FaixaUi;
  readonly faixaPorPesoUi: FaixaUi;
  readonly aplicacaoSugerida: {
    readonly insulina: "NPH";
    readonly momento: "ao_deitar";
  };
  readonly alertas: readonly Alerta[];
  readonly recomendacoesAoPrescritor: readonly Recomendacao[];
  readonly referencias: readonly ReferenciaClinica[];
}

export interface ResultadoTitulacao {
  readonly tipo: "resultado";
  readonly modo: "titulacao";
  readonly esquemaSugerido: readonly AplicacaoInsulina[];
  readonly doseTotalDiaUi: number;
  readonly deltaTotalUi: number;
  readonly naMeta: boolean;
  readonly condutasAlternativas?: readonly CondutaAlternativa[];
  readonly alertas: readonly Alerta[];
  readonly recomendacoesAoPrescritor: readonly Recomendacao[];
  readonly referencias: readonly ReferenciaClinica[];
}

export type ResultadoCalculo = ResultadoInicio | ResultadoTitulacao;

export type CodigoErro =
  | "PESO_FORA_DE_FAIXA"
  | "GLICEMIA_FORA_DE_FAIXA"
  | "HBA1C_FORA_DE_FAIXA"
  | "HBA1C_OBRIGATORIA"
  | "ESQUEMA_OBRIGATORIO"
  | "GLICEMIAS_AUSENTES"
  | "DOSE_FORA_DE_FAIXA"
  | "METFORMINA_FORA_DE_FAIXA"
  | "TFG_FORA_DE_FAIXA";

export interface Ofensor {
  readonly campo: string;
  readonly codigo: CodigoErro;
  readonly mensagem: string;
}

export interface ErroValidacao {
  readonly tipo: "erro-validacao";
  readonly ofensores: readonly Ofensor[];
}

export interface ForaDoEscopoDaFonte {
  readonly tipo: "fora-do-escopo";
  readonly motivo: string;
  readonly orientacao: string;
}

export type SaidaCalculo =
  ResultadoCalculo | ErroValidacao | ForaDoEscopoDaFonte;

/** Violação de invariante de domínio: bug interno, nunca fluxo esperado (RNF-05). */
export class ErroDeInvariante extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeInvariante";
  }
}

/** Peso corporal plausível (RF-05): > 0 e ≤ 350 kg. */
export class Peso {
  constructor(readonly kg: number) {
    if (!Number.isFinite(kg) || kg <= 0 || kg > 350) {
      throw new ErroDeInvariante(`Peso implausível: ${kg} kg`);
    }
    Object.freeze(this);
  }
}

/** Glicemia capilar plausível (RF-05): 10–1000 mg/dL. */
export class Glicemia {
  constructor(
    readonly valorMgDl: number,
    readonly momento: MomentoAfericao,
  ) {
    if (!Number.isFinite(valorMgDl) || valorMgDl < 10 || valorMgDl > 1000) {
      throw new ErroDeInvariante(`Glicemia implausível: ${valorMgDl} mg/dL`);
    }
    Object.freeze(this);
  }
}

/** Dose realizável nos dispositivos do SUS (R-20, D-08): inteira, 1–60 UI por aplicação. */
export class DoseUi {
  constructor(readonly ui: number) {
    if (!Number.isInteger(ui) || ui < 1 || ui > 60) {
      throw new ErroDeInvariante(`Dose irrealizável: ${ui} UI`);
    }
    Object.freeze(this);
  }
}
