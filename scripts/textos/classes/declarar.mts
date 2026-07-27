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
 * `NOME_PUBLICADO`: o nome pelo qual a fonte clínica se publica, guardado no domínio como
 * oráculo da exceção do travessão (MD-0020).
 *
 * Por que `identificador` e não `citacao`, que a origem do texto sugeriria. A classe citação
 * carrega uma consequência operacional precisa: entrar na comparação contra
 * `citacao-linha-de-base.json`, que se emitiu uma vez e jamais se regera. Aquela linha de
 * base é oráculo dos RÓTULOS EXIBIDOS, que o prescritor confere contra a página impressa, e
 * o verificador reprova toda citação nova que não seja um dos dois afastamentos de
 * `MD-0015`. Declarar estas constantes como citação obrigaria a afrouxar esse guarda para
 * acomodá-las, que é desfazer o gate em vez de passar por ele. Elas não são rótulo
 * conferível: são chave de comparação, e é isso que `identificador` nomeia.
 *
 * A classe muda no dia em que as telas passarem a consumir a constante em vez de reescrever
 * o nome à mão. Aí o literal chega à tela, e o que chega à tela não é chave.
 */
export function nomesDeFonte(textos: readonly string[]): readonly Declaracao[] {
  return textos.map((texto) => ({
    texto,
    classe: "identificador" as const,
    nota: "nome publicado da fonte: chave de comparação do verificador de norma (MD-0020), não texto exibido",
  }));
}

/**
 * Glifo tipográfico que ocupa o lugar de um valor ausente, como o travessão sozinho de uma
 * célula sem dado. Não é prosa: não se lê, se vê. Fica fora da norma por natureza, e não
 * por exceção, e a distinção importa desde MD-0020, que zerou o travessão na prosa autoral.
 * Declarado como `identificador`, a única das três classes de RN-01 que significa "fora do
 * alcance da revisão"; a nota existe porque a razão não se lê no literal.
 */
export function glifos(textos: readonly string[]): readonly Declaracao[] {
  return textos.map((texto) => ({
    texto,
    classe: "identificador" as const,
    nota: "glifo de valor ausente: ocupa na tela o lugar do dado que não existe, e não se lê como prosa",
  }));
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
