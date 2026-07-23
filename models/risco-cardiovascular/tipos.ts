// Contrato do motor de risco cardiovascular pelas Pooled Cohort Equations
// (feature 014-risco-cardiovascular-pce). Origem: RF-01..RF-10 e RN-01..RN-09 do
// requirements; entidades conforme `data-delta.md`. Fonte única: 2013 ACC/AHA
// Guideline on the Assessment of Cardiovascular Risk (Goff et al., Circulation
// 2014). O motor apenas INFORMA o risco de ASCVD em 10 anos e sua categoria, sem
// emitir conduta (ADR 0005). Erros esperados são valores (ADR 0004); exceção só
// para bug interno (ErroDeInvariante).

export interface ReferenciaClinica {
  readonly fonteId: string;
  readonly versaoEdicao: string;
  readonly localizacao: string;
}

export type Sexo = "masculino" | "feminino";

/** RN-05: "outra" adota os coeficientes de brancos, como o ASCVD Estimator oficial. */
export type Raca = "branco" | "afro-americano" | "outra";

/** Os quatro modelos de Cox sexo- e raça-específicos (Goff 2013, Tabela A). */
export type GrupoPce =
  | "homem-branco"
  | "homem-negro"
  | "mulher-branca"
  | "mulher-negra";

/** RF-07: cortes 5 / 7,5 / 20% (2019 ACC/AHA Primary Prevention). */
export type CategoriaRisco = "baixo" | "limitrofe" | "intermediario" | "alto";

export interface EntradaEstimativa {
  readonly sexo: Sexo;
  readonly raca: Raca;
  readonly idadeAnos: number;
  readonly colesterolTotalMgDl: number;
  readonly hdlMgDl: number;
  readonly pasMmHg: number;
  readonly emTratamentoAntiHipertensivo: boolean;
  readonly diabetes: boolean;
  readonly tabagismoAtual: boolean;
  /** true → prevenção secundária, fora do escopo das PCE (RF-05). */
  readonly dcvPrevia: boolean;
}

export type CodigoAviso =
  | "COLESTEROL_FORA_DA_FAIXA"
  | "HDL_FORA_DA_FAIXA"
  | "PAS_FORA_DA_FAIXA";

/** RN-07 (D-07): valor fora da faixa fisiológica é clampado ao limite e sinalizado. */
export interface Aviso {
  readonly campo: string;
  readonly codigo: CodigoAviso;
  readonly mensagem: string;
}

export interface ResultadoEstimativa {
  readonly tipo: "resultado";
  /** Risco de ASCVD "hard" em 10 anos, em pontos percentuais. */
  readonly riscoPct: number;
  readonly categoria: CategoriaRisco;
  /** Clamps aplicados a valores fora da faixa fisiológica (D-07); pode ser vazio. */
  readonly avisos: readonly Aviso[];
  readonly notaProveniencia: string;
  /** Nunca vazia (RF-08; invariante verificado por property-based). */
  readonly referencias: readonly ReferenciaClinica[];
}

export type MotivoForaDoEscopo = "IDADE_FORA_DA_FAIXA" | "DCV_PREVIA";

/** RF-05/RN-02 (D-06): fora da cobertura das PCE (40–79 anos, prevenção primária). */
export interface ForaDoEscopoDaFonte {
  readonly tipo: "fora-do-escopo";
  readonly motivo: MotivoForaDoEscopo;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export type CodigoOfensor =
  | "SEXO_INVALIDO"
  | "RACA_INVALIDA"
  | "IDADE_INVALIDA"
  | "COLESTEROL_INVALIDO"
  | "HDL_INVALIDO"
  | "PAS_INVALIDA";

export interface Ofensor {
  readonly campo: string;
  readonly codigo: CodigoOfensor;
  readonly mensagem: string;
}

/** Coleta total: todos os ofensores de uma vez, nunca só o primeiro (RN-08). */
export interface EntradaInvalida {
  readonly tipo: "erro-validacao";
  readonly ofensores: readonly Ofensor[];
}

export type SaidaEstimativa =
  | ResultadoEstimativa
  | ForaDoEscopoDaFonte
  | EntradaInvalida;

/** Violação de invariante de domínio: bug interno, nunca fluxo esperado (ADR 0004). */
export class ErroDeInvariante extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeInvariante";
  }
}
