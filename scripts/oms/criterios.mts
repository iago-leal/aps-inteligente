// Critérios que as tabelas da OMS têm de cumprir para virar código — a parte declarativa
// das verificações do contrato de aquisição
// `_reversa_forward/017-puericultura-crescimento/interfaces/tabelas-de-referencia.md` §5.
//
// Este módulo guarda O QUE se exige do dado, com a proveniência de cada exigência;
// `verificacoes.mts` guarda COMO se exige. A separação existe porque as duas coisas mudam
// por motivos diferentes: os critérios mudam quando a fonte muda, a mecânica quando o
// gerador muda. Quem for auditar de onde veio um número lê só este arquivo.
//
// Módulo DEV-TIME: nunca importado por código de aplicação (fronteira do roadmap §5).
// RF-02, D-03, D-04, D-16 do roadmap da feature 017-puericultura-crescimento.
import type { Indicador } from "./origens.mts";

/** Desvios reconstruídos em V6. Fora de ±3 a OMS aplica correção de cauda (D-10). */
export const DESVIOS_CONFERIDOS = Object.freeze({
  SD3neg: -3,
  SD2neg: -2,
  SD1neg: -1,
  SD0: 0,
  SD1: 1,
  SD2: 2,
  SD3: 3,
});

/** Colunas exigidas em todo arquivo, além da coluna de índice (contrato §3). */
export const COLUNAS_OBRIGATORIAS: readonly string[] = Object.freeze([
  "L",
  "M",
  "S",
  ...Object.keys(DESVIOS_CONFERIDOS),
]);

// O contrato §3 diz "exatamente as 13 colunas". Os dois arquivos de estatura da referência
// 2007 trazem 15: `StDev` e `SD5neg` a mais. A divergência é da OMS e não afeta o dado que
// interessa, então V2 exige as obrigatórias e tolera apenas estas — coluna desconhecida
// continua sendo falha, que é a intenção da verificação ("o formato mudou").
export const COLUNAS_TOLERADAS: readonly string[] = Object.freeze([
  "StDev",
  "SD5neg",
  "SD4neg",
  "SD4",
]);

/** Casas decimais publicadas pela fonte, por coluna (contrato §4.2). */
export const PRECISAO = Object.freeze({ l: 4, m: 4, s: 5 });

/**
 * Ordem de grandeza de `M` por indicador (V4) — a barreira contra o arquivo mal nomeado do
 * contrato §2.2. Vale sobre o recorte, não sobre a planilha inteira: a estatura da referência
 * 2007 chega a 176 cm no mês 228, fora desta faixa, e essas linhas não são embarcadas.
 */
export const GRANDEZA: Readonly<
  Record<Indicador, { readonly de: number; readonly ate: number }>
> = Object.freeze({
  peso: { de: 0.5, ate: 60 },
  "comprimento-estatura": { de: 40, ate: 160 },
  imc: { de: 10, ate: 25 },
  "perimetro-cefalico": { de: 30, ate: 55 },
});

/** `M` cresce com a idade nestes três; no IMC, não (cai e volta a subir). */
export const MONOTONICOS: readonly Indicador[] = Object.freeze([
  "peso",
  "comprimento-estatura",
  "perimetro-cefalico",
]);

export interface Degrau {
  /** Índice em que a queda é esperada, na unidade da tabela. */
  readonly indice: number;
  /** Queda máxima tolerada, em fração de `M`. */
  readonly maximoRelativo: number;
  readonly porque: string;
}

// O contrato §5 enuncia V5 como monotonia simples, e o dado desmentiu isso em dois pontos —
// ambos por fisiologia ou por método da própria fonte, não por corrupção. Declarar cada
// descontinuidade com o seu limite torna V5 MAIS forte que a redação original: ela deixa de
// exigir o que a fonte não cumpre e passa a vigiar a magnitude do que a fonte faz.
export const DEGRAUS: Readonly<Record<string, readonly Degrau[]>> =
  Object.freeze({
    // Perda ponderal fisiológica do recém-nascido, visível na tabela: o peso mediano cai no
    // primeiro dia e só recupera o valor de nascimento no terceiro (menino) ou no quarto
    // (menina). Medido em 27/07: −0,87% e −1,13%.
    "peso-2006": [
      {
        indice: 1,
        maximoRelativo: 0.02,
        porque: "perda ponderal fisiológica do recém-nascido",
      },
    ],
    // Troca da régua aos dois anos: a tabela `lhfa` mede comprimento deitado até 730 dias e
    // estatura em pé de 731 em diante, e a estatura em pé é menor. O degrau medido em 27/07
    // é de −0,6715 cm (menino) e −0,6709 cm (menina) — a própria constante de 0,7 cm que a
    // caderneta manda aplicar na conversão de posição (RF-08, D-11), e no exato dia que
    // D-16 fixou como fronteira. O dado confirma as duas decisões por conta própria.
    "comprimento-estatura-2006": [
      {
        indice: 731,
        maximoRelativo: 0.015,
        porque: "troca da régua deitado → em pé aos dois anos (D-16)",
      },
    ],
  });

/**
 * Valores-âncora do contrato §5, V7. São o alarme contra revisão silenciosa da tabela na
 * origem: se a OMS republicar a curva, o número muda aqui antes de mudar num escore. V7 pega
 * o que V6 não pega — uma revisão coerente, com os desvios recalculados junto do `M`, passa
 * incólume pela reconstrução da LMS e para só na âncora.
 */
export const ANCORAS: Readonly<
  Record<string, { readonly indice: number; readonly m: number }>
> = Object.freeze({
  "perimetro-cefalico-masculino-2006": { indice: 0, m: 34.4618 },
  "peso-masculino-2007": { indice: 61, m: 18.5057 },
  "peso-feminino-2007": { indice: 61, m: 18.2579 },
});

// Pior desvio de V6 medido nas 14 tabelas: exatamente 5e-4, sempre em `SD0` — o empate de
// arredondamento da terceira casa, que é a precisão com que a fonte publica as colunas de
// desvio. A folga de 1e-9 existe só para que o empate não caia fora por erro de ponto
// flutuante; ela não abre espaço para divergência real, que seria de ordem 1e-3.
export const TOLERANCIA_V6 = 5e-4 + 1e-9;
