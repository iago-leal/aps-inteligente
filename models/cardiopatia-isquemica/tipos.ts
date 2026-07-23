// Contrato do motor de dor torácica e probabilidade pré-teste de cardiopatia
// isquêmica (feature 010-dor-toracica-pre-teste). Origem: RF-01..RF-10 e
// RN-01..RN-09 do requirements; entidades conforme `data-delta.md`. Fonte única:
// TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017). Erros esperados
// são valores (ADR 0004); exceção só para bug interno (ErroDeInvariante).

export interface ReferenciaClinica {
  readonly fonteId: string;
  readonly versaoEdicao: string;
  readonly localizacao: string;
}

export type Sexo = "masculino" | "feminino";

/** Faixas etárias do Quadro 2 (p. 5); fora delas → ForaDoEscopoDaFonte (RN-06). */
export type FaixaEtaria = "30-39" | "40-49" | "50-59" | "60-69";

/** RN-01 (Quadro 1, p. 4): 3 características → típica; 2 → atípica; ≤ 1 → não anginosa. */
export type ClassificacaoDor = "tipica" | "atipica" | "nao-anginosa";

/** RN-04 (p. 4-5): estratos < 10% / 10–90% / > 90%. */
export type Estrato = "baixa" | "intermediaria" | "alta";

/** RN-03 (nota * do Quadro 2): fatores que aumentam a estimativa em 2–3×. */
export type FatorDeRisco = "diabetes" | "tabagismo" | "hipertensao" | "dislipidemia";

/** As três características do Quadro 1 (RN-01). */
export interface CaracteristicasDor {
  readonly retroesternal: boolean;
  readonly provocadaPorEsforcoOuEstresse: boolean;
  readonly aliviaComRepousoOuNitrato: boolean;
}

export interface EntradaAvaliacao {
  readonly idadeAnos: number;
  readonly sexo: Sexo;
  readonly caracteristicas: CaracteristicasDor;
  readonly fatoresDeRisco: readonly FatorDeRisco[];
  /** ECG basal altera a interpretação ou o paciente não pode exercitar (RN-05). */
  readonly impedimentoErgometria?: boolean;
  /** Padrão de angina instável / dor aguda (RN-07): desvia do fluxo eletivo. */
  readonly sinaisInstabilidade?: boolean;
}

/** RN-03 (D-03): faixa base×2–base×3, capada quando extrapola a faixa "alta". */
export interface FaixaProbabilidade {
  readonly minPct: number;
  readonly maxPct: number;
  /** true quando algum extremo ultrapassa 90% — redação ">90%" / alta possível. */
  readonly excedeAlta: boolean;
}

export type TipoConduta =
  | "encaminhamento-emergencial"
  | "exame-nao-indicado"
  | "exame-nao-invasivo"
  | "estratificacao-e-encaminhamento";

export type ExameRecomendado =
  | "nenhum"
  | "ergometria"
  | "metodo-nao-invasivo-alternativo";

export interface Conduta {
  readonly tipo: TipoConduta;
  readonly texto: string;
  readonly exame: ExameRecomendado;
  /** Só na conduta de probabilidade baixa: causas não cardíacas (RN-04). */
  readonly causasNaoCardiacas?: readonly string[];
  readonly referencia: ReferenciaClinica;
}

export type TipoAdvertencia = "ANGINA_INSTAVEL";

/** RN-07: advertência de desvio do fluxo eletivo (encaminhamento emergencial). */
export interface Advertencia {
  readonly tipo: TipoAdvertencia;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export interface ResultadoAvaliacao {
  readonly tipo: "resultado";
  readonly classificacaoDor: ClassificacaoDor;
  readonly faixaEtaria: FaixaEtaria;
  readonly probabilidadeBasePct: number;
  /** Presente somente com ≥ 1 fator de risco (RN-03). */
  readonly probabilidadeAjustada?: FaixaProbabilidade;
  readonly estrato: Estrato;
  readonly conduta: Conduta;
  readonly advertencias: readonly Advertencia[];
  /** Nunca vazia (RN-09; invariante verificado por property-based). */
  readonly referencias: readonly ReferenciaClinica[];
}

export type MotivoForaDoEscopo = "IDADE_FORA_DA_TABELA";

/** RN-06: idade plausível mas fora de 30–69; sem número estimado. */
export interface ForaDoEscopoDaFonte {
  readonly tipo: "fora-do-escopo";
  readonly motivo: MotivoForaDoEscopo;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export type CodigoOfensor =
  | "IDADE_INVALIDA"
  | "SEXO_INVALIDO"
  | "FATOR_DE_RISCO_INVALIDO";

export interface Ofensor {
  readonly campo: string;
  readonly codigo: CodigoOfensor;
  readonly mensagem: string;
}

/** Coleta total: todos os ofensores de uma vez, nunca só o primeiro (RN-09). */
export interface EntradaInvalida {
  readonly tipo: "erro-validacao";
  readonly ofensores: readonly Ofensor[];
}

export type SaidaAvaliacao =
  | ResultadoAvaliacao
  | ForaDoEscopoDaFonte
  | EntradaInvalida;

/** Violação de invariante de domínio: bug interno, nunca fluxo esperado (ADR 0004). */
export class ErroDeInvariante extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeInvariante";
  }
}
