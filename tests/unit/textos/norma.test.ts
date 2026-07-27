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
  semNomesDeFonte,
  type EntradaAutoral,
} from "./apoio";

const AUTORAIS = autoraisDoInventario();

/** Reúne as violações numa mensagem só: corrigir uma de cada vez seria trabalho de tolo. */
function violacoes(
  regra: string,
  ofende: (texto: string, entrada: EntradaAutoral) => boolean,
): string[] {
  return AUTORAIS.filter((e: EntradaAutoral) => ofende(paraNorma(e), e)).map(
    (e) =>
      `  ${e.arquivo}:${e.linha}\n    ${JSON.stringify(paraNorma(e))}\n    ↳ ${regra}`,
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

  it("o travessão não comparece na prosa autoral, salvo no nome publicado da fonte (§3.2)", () => {
    // MD-0020 zerou o teto que a 018 fixara em um par por bloco. A razão é de eixo, não de
    // dose: num texto que informa não há subjetividade a marcar, e o travessão que sobrava
    // estava sempre fazendo trabalho de dois-pontos, de vírgula ou de ponto. A exceção
    // única é o nome pelo qual a fonte se publica, onde o literal transcreve em vez de
    // redigir, e ela se confere contra `NOME_PUBLICADO` no domínio.
    relatar(
      "travessão em prosa autoral",
      violacoes(
        "o eixo expressivo fica fora do texto do produto: onde o travessão separa ou " +
          "introduz, use o sinal sintático que faz esse trabalho (dois-pontos, vírgula, " +
          "ponto). Exceção única: o nome publicado da fonte. Ver docs/redacao.md §3.2 e MD-0020",
        (t) => semNomesDeFonte(t).includes("—"),
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
          if (!ehFragmento(entrada) && (t.startsWith("·") || t.endsWith("·")))
            return true;
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
    expect(textos).not.toContain(
      "p. 4-5 (estratos < 10% / 10–90% / > 90% e conduta de investigação; nota ** do Quadro 2)",
    );
    expect(textos).not.toContain("PC acima do esperado para a idade");
  });
});
