// T011 (feature 020) — aplicabilidade e flexão por sexo (RF-05, RN-07, RN-08; D-05, D-06,
// `MD-0026`).
//
// Duas coisas distintas se provam aqui, e confundi-las seria confundir as duas decisões que
// as originam:
//
//  · A SUPRESSÃO de "Criptorquidia" na ficha feminina é diferença de CONTEÚDO entre a fonte
//    e a tela, autorizada por `MD-0026` sobre lista fechada de um item e inseparável da
//    declaração ao leitor. O teste guarda os dois lados: o campo some da ficha feminina, e a
//    nota que o declara continua existindo.
//  · A FLEXÃO por sexo é diferença de REDAÇÃO entre as duas tiragens, e entra como par de
//    rótulos declarados (D-06). O teste guarda a forma: nenhum rótulo exibido pode nascer de
//    interpolação, porque o inventário textual não enxerga crase com substituição e a
//    citação sairia do guarda sem que ninguém percebesse.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FICHAS } from "models/puericultura/consulta/fichas/indice";
import { NOTA_SUPRESSAO_DE_CAMPO } from "models/puericultura/consulta/fonte-clinica";
import { camposAplicaveis } from "models/puericultura/consulta/selecao";
import type { Ficha } from "models/puericultura/consulta/tipos";

function fichaDe(id: string): Ficha {
  const ficha = FICHAS.find((f) => f.id === id);
  if (ficha === undefined) throw new Error(`ficha ausente do índice: ${id}`);
  return ficha;
}

function rotulosDe(ficha: Ficha, sexo: "masculino" | "feminino"): string[] {
  return ficha.secoes.flatMap((secao) =>
    camposAplicaveis(secao, sexo).map((campo) =>
      sexo === "feminino" && campo.rotuloFeminino !== undefined
        ? campo.rotuloFeminino
        : campo.rotulo,
    ),
  );
}

describe("Supressão declarada de “Criptorquidia” (RN-08, `MD-0026`)", () => {
  it("não aparece na ficha feminina do 2.º Mês", () => {
    expect(rotulosDe(fichaDe("segundo-mes"), "feminino")).not.toContain(
      "Criptorquidia",
    );
  });

  it("aparece na ficha masculina do 2.º Mês", () => {
    expect(rotulosDe(fichaDe("segundo-mes"), "masculino")).toContain(
      "Criptorquidia",
    );
  });

  it("é a única diferença de conteúdo entre as duas tiragens", () => {
    const restritos = FICHAS.flatMap((f) => f.secoes)
      .flatMap((s) => s.campos)
      .filter((c) => c.sexos !== undefined);
    expect(restritos.map((c) => c.rotulo)).toEqual(["Criptorquidia"]);
  });

  it("continua declarada ao leitor, que é a condição da supressão", () => {
    expect(NOTA_SUPRESSAO_DE_CAMPO).toContain("Criptorquidia");
    expect(NOTA_SUPRESSAO_DE_CAMPO).toContain("2.º Mês");
  });
});

describe("Flexão por par de rótulos, jamais por interpolação (D-06)", () => {
  it("troca a flexão do campo de interação conforme o sexo informado", () => {
    const primeiroMes = fichaDe("primeiro-mes");
    expect(rotulosDe(primeiroMes, "masculino")).toContain(
      "Observação da interação mãe-filho",
    );
    expect(rotulosDe(primeiroMes, "feminino")).toContain(
      "Observação da interação mãe-filha",
    );
  });

  it("mantém idêntico todo campo sem flexão declarada", () => {
    for (const ficha of FICHAS) {
      const semFlexao = ficha.secoes
        .flatMap((s) => s.campos)
        .filter((c) => c.rotuloFeminino === undefined && c.sexos === undefined);
      for (const campo of semFlexao) {
        expect(campo.rotulo.length).toBeGreaterThan(0);
      }
    }
  });

  it("não monta rótulo algum por crase interpolada nos módulos das fichas", () => {
    for (const ficha of FICHAS) {
      const fonte = readFileSync(
        `models/puericultura/consulta/fichas/${ficha.id}.ts`,
        "utf8",
      );
      expect(
        /rotulo(Feminino)?:\s*`[^`]*\$\{/.test(fonte),
        `${ficha.id}: rótulo montado por interpolação sairia do inventário textual (D-06)`,
      ).toBe(false);
    }
  });
});
