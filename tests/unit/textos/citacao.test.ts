// Preservação verificada da classe citação (T020; RF-07; RN-09).
//
// É o verificador que autoriza a exceção de `MD-0015` a existir. A arbitragem de 27/07
// permitiu corrigir a concordância de DOIS rótulos transcritos da Caderneta da Criança, sob
// a condição de o afastamento ser declarado ao leitor; sem uma comparação que reprove
// qualquer TERCEIRO afastamento, aquela permissão viraria licença geral de reescrita da
// citação — e a citação é o que casa a tela com a página impressa que o prescritor tem na
// mão.
//
// CONTRA O QUE ELE COMPARA, E POR QUE NÃO CONTRA O INVENTÁRIO. Contra
// `tests/apoio/citacao-linha-de-base.json`, emitido uma vez do estado ANTERIOR às
// reescritas e jamais regerado (D-14, `MD-0018`). O inventário se regera ao fim da revisão;
// comparar contra ele seria comparar o estado corrente consigo mesmo — verde por
// construção, incapaz de reprovar, e sem produzir sinal nenhum de que deixou de servir.

import { describe, expect, it } from "vitest";

import { citacoesDoInventario, linhaDeBaseDaCitacao } from "./apoio";

/**
 * A lista fechada de §2.4: os dois únicos afastamentos autorizados, e a forma exata de
 * cada um. Escrita aqui à mão, e não derivada, porque uma lista fechada que se derivasse do
 * estado corrente deixaria de ser fechada.
 */
const AFASTAMENTOS_AUTORIZADOS: ReadonlyArray<{
  readonly impresso: string;
  readonly corrigido: string;
  readonly ficha: string;
}> = [
  {
    impresso: "Comprimento adequada para idade",
    corrigido: "Comprimento adequado para idade",
    ficha: "MD-0015",
  },
  {
    impresso: "Baixa comprimento para idade",
    corrigido: "Baixo comprimento para idade",
    ficha: "MD-0015",
  },
];

/** Normaliza para comparar concordância: só as diferenças de desinência devem restar. */
function esqueleto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[oa]\b/g, "•"); // desinência de gênero, o alvo da exceção
}

describe("preservação da classe citação (RF-07, contra a linha de base)", () => {
  const base = linhaDeBaseDaCitacao();
  const corrente = citacoesDoInventario();

  const porArquivo = (arquivo: string, textos: readonly string[]) =>
    new Set(textos.map((t) => `${arquivo}\n${t}`));

  const conjuntoBase = new Set(base.map((e) => `${e.arquivo}\n${e.texto}`));
  const conjuntoCorrente = new Set(
    corrente.map((e) => `${e.arquivo}\n${e.texto}`),
  );

  const sumidos = [...conjuntoBase].filter((k) => !conjuntoCorrente.has(k));
  const surgidos = [...conjuntoCorrente].filter((k) => !conjuntoBase.has(k));

  it("a linha de base existe e não está vazia", () => {
    expect(
      base.length,
      "sem linha de base não há o que comparar, e RF-07 perde a capacidade de reprovar. " +
        "Emita-a com `node scripts/inventariar-textos.mts --linha-de-base` — e só é " +
        "legítimo emiti-la do estado ANTERIOR às reescritas.",
    ).toBeGreaterThan(0);
  });

  it("os deltas da classe citação são exatamente os dois de §2.4", () => {
    const esperadosSumidos = AFASTAMENTOS_AUTORIZADOS.map((a) => a.impresso);
    const esperadosSurgidos = AFASTAMENTOS_AUTORIZADOS.map((a) => a.corrigido);

    const inesperadosSumidos = sumidos.filter(
      (k) => !esperadosSumidos.some((t) => k.endsWith(`\n${t}`)),
    );
    const inesperadosSurgidos = surgidos.filter(
      (k) => !esperadosSurgidos.some((t) => k.endsWith(`\n${t}`)),
    );

    expect(
      [...inesperadosSumidos, ...inesperadosSurgidos].map((k) =>
        k.replace("\n", " → "),
      ),
      "há afastamento NÃO autorizado na classe citação. A exceção de RN-09 alcança " +
        "apenas os dois rótulos de §2.4, apenas na concordância, e apenas com a " +
        "declaração ao leitor. Qualquer outro delta reprova a entrega: a citação é o que " +
        "casa a tela com a página impressa.",
    ).toEqual([]);
  });

  it("cada afastamento autorizado difere da fonte SÓ na concordância", () => {
    for (const a of AFASTAMENTOS_AUTORIZADOS) {
      const jaCorrigido = [...conjuntoCorrente].some((k) =>
        k.endsWith(`\n${a.corrigido}`),
      );
      if (!jaCorrigido) continue; // ainda na forma impressa: nada a conferir

      expect(
        esqueleto(a.corrigido),
        `a correção de "${a.impresso}" para "${a.corrigido}" foi além da concordância. ` +
          `${a.ficha} autoriza desinência de gênero e nada mais: nem léxico, nem ordem, ` +
          `nem terminologia, nem elipse de artigo.`,
      ).toBe(esqueleto(a.impresso));
    }
  });

  it("o afastamento autorizado vem declarado com a ficha que o sustenta", () => {
    for (const a of AFASTAMENTOS_AUTORIZADOS) {
      const entrada = corrente.find((e) => e.texto === a.corrigido);
      if (entrada === undefined) continue; // ainda na forma impressa

      expect(
        entrada.excecao,
        `"${a.corrigido}" foi corrigido mas a entrada do inventário não declara a ficha ` +
          `que o autoriza. Correção sem declaração é violação de RN-09, não cumprimento ` +
          `parcial dela.`,
      ).toContain(a.ficha);
    }
  });

  it("os vizinhos de §2.4 que NÃO são concordância permanecem intocados", () => {
    // `Muito baixo comprimento para idade` já concorda; `Peso adequado para idade` tem
    // elipse de artigo, que não é concordância. Os dois ficam como a fonte imprime.
    const intocaveis = porArquivo("models/puericultura/fonte-clinica.ts", [
      "Muito baixo comprimento para idade",
      "Peso adequado para idade",
      "PC acima do esperado para a idade",
    ]);
    for (const k of intocaveis) {
      expect(
        conjuntoCorrente.has(k),
        `${k.split("\n")[1]} saiu da classe citação ou foi alterado. Ele está FORA da ` +
          `exceção de §2.4, e a razão está escrita lá: não é desvio de concordância.`,
      ).toBe(true);
    }
  });
});
