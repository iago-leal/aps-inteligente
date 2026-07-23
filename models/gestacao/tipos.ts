// Contrato do motor de datação gestacional (feature 007-idade-gestacional-e-home).
// Origem: RF-01..RF-04 e RF-09 do requirements; RN-01..RN-07 e RN-11 (entrada dupla);
// entidades conforme `data-delta.md#1`. Erros esperados são valores (ADR 0004);
// exceção só para bug interno (ErroDeInvariante).

/** Data civil no formato ISO `AAAA-MM-DD` (D-02: aritmética em dias epoch UTC). */
export type DataIso = string;

export interface ReferenciaClinica {
  readonly fonteId: string;
  readonly versaoEdicao: string;
  readonly localizacao: string;
}

/** Idade gestacional em semanas completas + dias restantes (RN-01). */
export interface IdadeGestacional {
  readonly semanas: number;
  readonly dias: number;
}

/** Cortes 13+6 / 27+6 são convenção obstétrica (RN-04, premissa 🟡 do roadmap §4). */
export type Trimestre = 1 | 2 | 3;

/** Datação do último ultrassom; campos opcionais porque parcial é ofensor (RN-05). */
export interface DatacaoUltrassom {
  readonly dataExame?: DataIso;
  readonly semanas?: number;
  readonly dias?: number;
}

export interface EntradaDatacao {
  /** Injetada pela UI com a data do dispositivo; o motor não lê o relógio (RN-07). */
  readonly dataReferencia: DataIso;
  readonly dum?: DataIso;
  readonly ultrassom?: DatacaoUltrassom;
}

export interface DatacaoCalculada {
  readonly ig: IdadeGestacional;
  /** RN-02: regra de Naegele calendárica (+7 dias, +9 meses — p. 32; D-03). */
  readonly dpp: DataIso;
  readonly trimestre: Trimestre;
  readonly referencia: ReferenciaClinica;
}

export interface DatacaoPorUltrassom extends DatacaoCalculada {
  /** RN-03: `dataExame − (semanas×7 + dias)`. */
  readonly dumEquivalente: DataIso;
}

/** RN-11 (D-04/D-05): o motor informa o veredito da fonte, não escolhe a datação. */
export type VereditoComparacao =
  | "dum-confirmada"
  | "dum-fora-da-margem"
  | "sem-parametro-na-fonte";

export interface ComparacaoDatacoes {
  readonly diferencaDias: number;
  /** Trimestre da gestação no dia do exame — define a margem da p. 32. */
  readonly trimestreDaUsg: Trimestre;
  /** 7 (1.º trimestre) ou 14 (2.º); ausente no 3.º, sem parâmetro na fonte (D-05). */
  readonly margemDias?: number;
  readonly veredito: VereditoComparacao;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export type TipoNota =
  | "CONFIABILIDADE_DUM"
  | "ESTIMATIVA_NA_DATA_DE_REFERENCIA";

/** Textos fixos ao prescritor (RF-07; p. 31): ressalvas, nunca conduta. */
export interface NotaAoPrescritor {
  readonly tipo: TipoNota;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export interface ResultadoDatacao {
  readonly tipo: "resultado";
  readonly dataReferencia: DataIso;
  readonly porDum?: DatacaoCalculada;
  readonly porUltrassom?: DatacaoPorUltrassom;
  /** Presente somente com as duas datações (RN-11). */
  readonly comparacao?: ComparacaoDatacoes;
  readonly notas: readonly NotaAoPrescritor[];
  /** Nunca vazia (RN-06; invariante verificado por property-based). */
  readonly referencias: readonly ReferenciaClinica[];
}

export type CodigoOfensor =
  | "DATA_INVALIDA"
  | "DUM_FUTURA"
  | "DUM_ALEM_DE_44_SEMANAS"
  | "DATA_EXAME_FUTURA"
  | "IG_LAUDO_FORA_DE_FAIXA"
  | "DATACAO_ULTRASSOM_INCOMPLETA"
  | "NENHUMA_DATACAO_INFORMADA";

export interface Ofensor {
  readonly campo: string;
  readonly codigo: CodigoOfensor;
  readonly mensagem: string;
}

/** Coleta total: todos os ofensores de uma vez, nunca só o primeiro (RF-03). */
export interface ErroValidacao {
  readonly tipo: "erro-validacao";
  readonly ofensores: readonly Ofensor[];
}

export type SaidaDatacao = ResultadoDatacao | ErroValidacao;

/** Violação de invariante de domínio: bug interno, nunca fluxo esperado (ADR 0004). */
export class ErroDeInvariante extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeInvariante";
  }
}
