// Guarda negativa (feature 016-estrutura-cabecalho-home; RF-01) — a altura do
// cabeçalho deve emergir do conteúdo, jamais ser chumbada. Este teste lê as duas
// folhas do cabeçalho e falha se o seletor do CONTAINER `.cabecalho` (base ou
// variante destaque) declarar `height` ou `min-height`. Regras de descendentes
// com altura própria legítima (`.cabecalho-marca`, a logo de 34px) ficam de fora:
// o alvo é só o container, cuja altura tem de ser função do conteúdo.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FOLHAS = ["cabecalho.css", "inicio.css"] as const;

interface Bloco {
  readonly seletor: string;
  readonly corpo: string;
}

// Extrai os blocos cujo seletor alveja o container do cabeçalho: ".cabecalho"
// isolado (inclusive ".pagina[...] .cabecalho"), nunca descendentes como
// ".cabecalho-marca" — o lookahead nega o hífen e o resto do identificador.
function blocosDoContainer(css: string): Bloco[] {
  const blocos: Bloco[] = [];
  const regra = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = regra.exec(css)) !== null) {
    const seletor = m[1].trim();
    if (/\.cabecalho(?![\w-])/.test(seletor)) {
      blocos.push({ seletor, corpo: m[2] });
    }
  }
  return blocos;
}

function propriedades(corpo: string): string[] {
  return corpo
    .split(";")
    .map((decl) => decl.split(":")[0]?.trim().toLowerCase())
    .filter((p): p is string => Boolean(p));
}

describe("O container .cabecalho não fixa altura (RF-01)", () => {
  for (const folha of FOLHAS) {
    it(`${folha}: nenhum bloco de .cabecalho declara height/min-height`, () => {
      const css = readFileSync(
        path.resolve(import.meta.dirname, "../../../interface/estilos", folha),
        "utf8",
      );
      const blocos = blocosDoContainer(css);
      // Sanidade: se o seletor sumir, o teste deixaria de guardar coisa alguma.
      expect(blocos.length).toBeGreaterThan(0);
      for (const { seletor, corpo } of blocos) {
        const props = propriedades(corpo);
        expect(
          props,
          `Bloco "${seletor}" em ${folha} não pode fixar altura do cabeçalho`,
        ).not.toContain("height");
        expect(props).not.toContain("min-height");
      }
    });
  }
});
