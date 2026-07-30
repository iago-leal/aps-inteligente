// Contrato do motor da Escala de Depressão Geriátrica em quinze itens (feature
// 023-saude-do-idoso-gds). Origem: RF-01..RF-07 e RN-01..RN-08 do requirements; entidades
// conforme `data-delta.md`. Fonte única: Escala de Depressão Geriátrica (GDS), Linhas de
// Cuidado, Ministério da Saúde. Erros esperados são valores (ADR 0004); exceção só para bug
// interno (ErroDeInvariante).
//
// O QUE ESTE DOMÍNIO NÃO TEM, E É DELIBERADO (D-07, RN-07). Não existe variante
// `ForaDoEscopoDaFonte`. A página não publica faixa etária nem população de aplicação, de
// modo que não há recusa a modelar: inventar um piso etário seria inventar fonte, e nomear
// como recusa da fonte o que seria regra do produto é o desvio de transparência que a
// plataforma evita desde `MD-0015`. É o primeiro unit clínico sem essa variante, e quem
// reler daqui a seis meses há de estranhar a ausência — daí esta nota. O público a que o
// instrumento se dirige é dito em prosa, em `fonte-clinica.ts`.

export interface ReferenciaClinica {
  readonly fonteId: string;
  readonly versaoEdicao: string;
  readonly localizacao: string;
}

/** As duas respostas possíveis de cada item. A escala não admite terceira. */
export type RespostaDoItem = "sim" | "nao";

/**
 * RN-02/RN-03: cada item declara qual resposta pontua, porque a escala mistura dez itens em
 * que pontua o "Sim" com cinco em que pontua o "Não". A direção é DADO, e não condicional.
 */
export interface ItemDaEscala {
  /** Identificador estável do produto; nunca exibido (classe identificador). */
  readonly id: string;
  /** Número impresso, de 1 a 15, na ordem da fonte. */
  readonly numero: number;
  /** Enunciado transcrito byte a byte (classe citação). */
  readonly texto: string;
  readonly respostaQuePontua: RespostaDoItem;
}

/**
 * RN-06 (D-03): entrada do motor. A AUSÊNCIA DE CHAVE É A AUSÊNCIA DE RESPOSTA, e é o que a
 * validação coleta. Um array de quinze booleanos tornaria "não respondido" inexprimível e
 * empurraria a regra para a tela; um array de `boolean | null` a exprimiria ao custo de
 * amarrar o domínio à ordem em que a tela renderiza.
 */
export type RespostasDaEscala = Readonly<
  Record<string, RespostaDoItem | undefined>
>;

/** RN-04: faixa de resultado, com limites inclusivos nas duas pontas e rótulo da fonte. */
export interface FaixaDeResultado {
  readonly de: number;
  readonly ate: number;
  /** Rótulo literal da fonte (classe citação). */
  readonly rotulo: string;
}

/** RN-04b: a recomendação da fonte, exibida em toda faixa e sem limiar do produto. */
export interface Providencia {
  readonly texto: string;
  readonly referencia: ReferenciaClinica;
}

export type TipoAdvertencia = "RASTREAMENTO_NAO_DIAGNOSTICO";

/** RN-05: o instrumento rastreia e não diagnostica. O motor informa e não escolhe. */
export interface Advertencia {
  readonly tipo: TipoAdvertencia;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export interface ResultadoDaEscala {
  readonly tipo: "resultado";
  /** Inteiro de 0 a 15. */
  readonly escore: number;
  readonly faixa: FaixaDeResultado;
  /** Presente em toda faixa (RN-04b): a fonte não quantifica "escores elevados". */
  readonly providencia: Providencia;
  readonly advertencias: readonly Advertencia[];
  /** Nunca vazia (RN-01; invariante verificado por propriedade). */
  readonly referencias: readonly ReferenciaClinica[];
}

export type CodigoOfensor = "ITEM_NAO_RESPONDIDO";

export interface Ofensor {
  readonly campo: string;
  readonly codigo: CodigoOfensor;
  readonly mensagem: string;
}

/** Coleta total: todos os itens faltantes de uma vez, nunca só o primeiro (RN-06). */
export interface EntradaInvalida {
  readonly tipo: "erro-validacao";
  readonly ofensores: readonly Ofensor[];
}

export type SaidaAvaliacao = ResultadoDaEscala | EntradaInvalida;

/** Violação de invariante de domínio: bug interno, nunca fluxo esperado (ADR 0004). */
export class ErroDeInvariante extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeInvariante";
  }
}
