// Contrato do módulo que monta o BR Code do PIX estático (feature
// 019-contribuicao-voluntaria-pix). Origem: RF-01..RF-04 e RN-04..RN-06 do
// requirements; entidades conforme `data-delta.md` §2.
//
// ISENÇÃO DECLARADA (MD-0022; RN-06): este é o primeiro unit de domínio NÃO
// CLÍNICO do projeto. A tabela de invariantes da família `models/*` em
// `architecture.md#1` não o alcança — a íntegra da isenção e a razão dela estão
// no cabeçalho de `br-code.ts`, que é a fachada.
//
// Erros esperados são valores (ADR 0004): a fachada nunca lança.

/** Entrada do módulo. `readonly` em todos os campos, como nos domínios clínicos. */
export interface ParametrosPix {
  readonly chave: string;
  readonly nomeBeneficiario: string;
  readonly cidade: string;
  /** Ausente por padrão: o valor fica à escolha de quem contribui (RF-04). */
  readonly valorSugerido?: number;
  /** Ausente vira `***` no campo 62/05, como o padrão prevê. */
  readonly identificacao?: string;
}

/**
 * Limites do padrão do Banco Central para os campos de texto
 * (`interfaces/br-code.md` §2.1). Medidos sobre o texto JÁ NORMALIZADO, que é o
 * que chega ao payload.
 */
export const LIMITES = Object.freeze({
  nomeBeneficiario: 25,
  cidade: 15,
  identificacao: 25,
});

export type CodigoOfensorPix =
  | "CHAVE_AUSENTE"
  | "NOME_AUSENTE"
  | "NOME_ACIMA_DO_LIMITE"
  | "CIDADE_AUSENTE"
  | "CIDADE_ACIMA_DO_LIMITE"
  | "IDENTIFICACAO_ACIMA_DO_LIMITE"
  | "VALOR_INVALIDO";

/**
 * Ofensor de configuração. `limite` e `observado` só existem quando o motivo é
 * comprimento: a mensagem precisa dizer o que fazer, e não apenas que algo está
 * errado. Quem lê é o mantenedor sozinho, meses depois.
 */
export interface OfensorPix {
  readonly campo: string;
  readonly codigo: CodigoOfensorPix;
  readonly mensagem: string;
  readonly limite?: number;
  readonly observado?: number;
}

/**
 * União discriminada por `tipo` (`data-delta.md` §2.2). O ramo de erro carrega
 * TODOS os ofensores, jamais o primeiro apenas: é a regra 15 de `domain.md`,
 * reaproveitada sem alteração.
 */
export type SaidaBrCode =
  | { readonly tipo: "ok"; readonly payload: string }
  | {
      readonly tipo: "ParametroInvalido";
      readonly ofensores: readonly OfensorPix[];
    };
