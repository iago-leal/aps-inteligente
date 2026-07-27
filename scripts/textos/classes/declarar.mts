// Auxiliares de declaração de classe. Vive fora de `classificacao.mts` para que os módulos
// de `classes/` não dependam do agregador que os importa — ciclo que o Node resolveria, mas
// que tornaria a leitura circular.
//
// O QUE ESTES AUXILIARES FAZEM, E O QUE ELES NÃO FAZEM. Eles agrupam literais que JÁ FORAM
// classificados à mão, para que a classe seja escrita uma vez por grupo em vez de uma vez
// por linha. Eles NÃO inferem classe nenhuma: quem põe um literal na lista de `autorais` é
// quem decidiu que ele é autoral, e a decisão continua sendo humana, literal a literal
// (D-04, `MD-0016`). O que se economiza é repetição, não julgamento.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.

import type { Declaracao } from "../classificacao.mts";

/** Texto escrito pelo produto. A norma de `docs/redacao.md` o alcança por inteiro. */
export function autorais(textos: readonly string[]): readonly Declaracao[] {
  return textos.map((texto) => ({ texto, classe: "autoral" as const }));
}

/**
 * Texto transcrito de fonte clínica, com a localização impressa. Permanece byte a byte,
 * salvo a exceção estrita de RN-09, que se declara com `excecao` na entrada afetada.
 */
export function citacoes(
  origem: string,
  textos: readonly string[],
): readonly Declaracao[] {
  return textos.map((texto) => ({ texto, classe: "citacao" as const, origem }));
}

/**
 * Citação AFASTADA da fonte pela exceção estrita de RN-09, que corrige concordância e só
 * concordância. Exige três coisas ao mesmo tempo, e é de propósito que não se possa
 * declarar uma sem as outras: o texto corrigido, a **forma impressa** que ele substitui, e
 * a **ficha** que autorizou o afastamento. Declaração sem ficha é o desvio de transparência
 * que `MD-0015` existe para impedir.
 */
export function citacaoCorrigida(
  origem: string,
  impresso: string,
  corrigido: string,
  ficha: string,
): Declaracao {
  return {
    texto: corrigido,
    classe: "citacao",
    origem: `${origem}; impresso "${impresso}"`,
    excecao: ficha,
  };
}

/** Chave, código, discriminante de tipo, atributo de HTML. Fora do alcance da revisão. */
export function identificadores(
  textos: readonly string[],
): readonly Declaracao[] {
  return textos.map((texto) => ({ texto, classe: "identificador" as const }));
}

/**
 * Mensagem de invariante interno: existe para o desenvolvedor, jamais chega à tela, e por
 * isso fica fora da revisão de linguagem (T059, D-16). Carrega a classe `identificador`
 * porque é a única das três de RN-01 que significa "fora do alcance", e carrega a nota
 * porque a razão não é evidente pela leitura do literal.
 */
export function internas(textos: readonly string[]): readonly Declaracao[] {
  return textos.map((texto) => ({
    texto,
    classe: "identificador" as const,
    nota: "mensagem de invariante interno: nunca é exibida, e por isso a revisão não a alcança",
  }));
}
