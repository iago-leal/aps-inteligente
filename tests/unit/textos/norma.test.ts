// Verificador das regras MECÂNICAS da norma de redação (T018; RF-05; RN-03, RN-10).
//
// Ele lê o inventário e alcança **só a classe autoral**. A citação fica explicitamente
// isenta, e a isenção é o ponto: a fonte impressa escreve como escreve, e submetê-la a uma
// norma que ela nunca conheceu produziria falha em texto que não se pode alterar. O
// identificador também fica fora, por não ser prosa.
//
// O que este arquivo prova é o que `docs/redacao.md` §7 lista como verificável, e nada
// além. Coesão, progressão e ausência de ornamento não estão aqui, e é bom que não estejam:
// a suíte verde não significa que o texto está bom, significa que ele não viola as regras
// duras. O guia diz qual é qual justamente para que ninguém confunda as duas coisas.
//
// Cada falha nomeia arquivo, linha, o trecho e a regra do guia violada (D-07).

import { describe, expect, it } from "vitest";

import {
  autoraisDoInventario,
  ehFragmento,
  paraNorma,
  type EntradaAutoral,
} from "./apoio";

const AUTORAIS = autoraisDoInventario();

/** Reúne as violações numa mensagem só: corrigir uma de cada vez seria trabalho de tolo. */
function violacoes(
  regra: string,
  ofende: (texto: string, entrada: EntradaAutoral) => boolean,
): string[] {
  return AUTORAIS.filter((e: EntradaAutoral) => ofende(paraNorma(e), e)).map(
    (e) => `  ${e.arquivo}:${e.linha}\n    ${JSON.stringify(paraNorma(e))}\n    ↳ ${regra}`,
  );
}

function relatar(titulo: string, achados: string[]): void {
  expect(
    achados,
    `${achados.length} literal(is) autoral(is) violam a norma — ${titulo}\n` +
      `Regra em docs/redacao.md.\n\n${achados.join("\n\n")}\n`,
  ).toEqual([]);
}

describe("norma de redação, regras mecânicas (docs/redacao.md §3)", () => {
  it("o travessão é `—`, e o hífen não faz o seu ofício (§3.2)", () => {
    // Hífen ladeado por espaços é hífen fazendo trabalho de travessão; `--` é o mesmo
    // erro em outra grafia. Hífen dentro de palavra composta — `pré-teste`,
    // `afro-americano` — é ortografia, e esta regra não o alcança.
    relatar(
      "hífen no lugar do travessão",
      violacoes(
        "use `—` (travessão), não `-` nem `--` — docs/redacao.md §3.2",
        (t) => / - /.test(t) || t.includes("--"),
      ),
    );
  });

  it("no máximo um par de travessões por bloco (§3.2)", () => {
    relatar(
      "mais de um par de travessões no mesmo bloco",
      violacoes(
        "teto de um par (dois `—`) por bloco — docs/redacao.md §3.2",
        (t) => (t.match(/—/g) ?? []).length > 2,
      ),
    );
  });

  it("sem reticências e sem exclamação em prosa de produto (§3.3)", () => {
    relatar(
      "sinal expressivo vedado",
      violacoes(
        "reticências e exclamação ficam fora — docs/redacao.md §3.3",
        (t) => t.includes("…") || t.includes("...") || t.includes("!"),
      ),
    );
  });

  it("o ponto médio vem ladeado por espaço simples (§3.4)", () => {
    relatar(
      "forma do ponto médio",
      violacoes(
        "`·` sempre entre espaços simples, nunca acumulado com vírgula ou travessão, " +
          "nunca em início ou fim de linha — docs/redacao.md §3.4",
        (t, entrada) => {
          if (!t.includes("·")) return false;
          // Num fragmento de JSX, o começo e o fim não são começo e fim de linha: o que
          // vem antes e depois é o valor interpolado que a montagem insere.
          if (!ehFragmento(entrada) && (t.startsWith("·") || t.endsWith("·"))) return true;
          if (/[,—]\s*·|·\s*[,—]/.test(t)) return true;
          return /\S·|·\S|\s{2,}·|·\s{2,}/.test(t);
        },
      ),
    );
  });

  it("a classe citação fica isenta destas regras, e a isenção é declarada", () => {
    // A prova de que a isenção existe: o rótulo `PC acima do esperado para a idade` e a
    // localização `p. 4-5 (estratos ...)` trazem formas que a norma reprovaria em prosa
    // autoral, e passam por serem citação. Se algum dia a classe deixasse de isentar, este
    // teste falharia antes dos outros e diria por quê.
    const textos = AUTORAIS.map((e) => e.texto);
    expect(textos).not.toContain("p. 4-5 (estratos < 10% / 10–90% / > 90% e conduta de investigação; nota ** do Quadro 2)");
    expect(textos).not.toContain("PC acima do esperado para a idade");
  });
});
