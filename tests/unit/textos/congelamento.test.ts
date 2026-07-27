// Congelamento dos textos autorais (T019; RF-06; RN-08).
//
// A PROPRIEDADE QUE ELE INSTALA: alterar qualquer literal autoral do código quebra a suíte.
// Não para impedir a alteração — ela é legítima e frequente —, mas para que seja
// DELIBERADA. Texto de produto que muda como efeito colateral de refatoração é a forma mais
// silenciosa de dívida que existe numa ferramenta clínica, porque ninguém relê a tela
// inteira depois de mexer num componente.
//
// COMO ELE CONGELA, E POR QUE NÃO POR ASSERÇÃO. Congelar literal a literal em arquivo de
// teste multiplicaria por centenas o acoplamento que a feature já mede (D-08). Aqui a
// comparação é de conjunto: o extrator relê o código, e o resultado tem de bater com o
// inventário versionado. Alterar um literal produz então DUAS falhas úteis — esta, que
// aponta a linha, e o `git diff` do inventário regerado, que põe o antes e o depois lado a
// lado sob leitura humana.
//
// O `README.md` fica FORA (D-10). São quase duzentas linhas que mudam a cada feature;
// congelá-las transformaria toda atualização de documentação em atualização de oráculo. Ele
// continua no inventário e continua sob as regras mecânicas de RF-05 — o que não pesa sobre
// ele é o congelamento.

import { describe, expect, it } from "vitest";

import {
  coletarTudo,
  ehCandidato,
} from "../../../scripts/inventariar-textos.mts";
import { inventario } from "./apoio";

const FORA_DO_CONGELAMENTO = new Set(["README.md"]);

function chave(arquivo: string, texto: string): string {
  return `${arquivo}\n${texto}`;
}

/** O que o código diz HOJE. */
function superficieCorrente(): ReadonlySet<string> {
  const vistos = new Set<string>();
  for (const c of coletarTudo().filter(ehCandidato)) {
    if (FORA_DO_CONGELAMENTO.has(c.arquivo)) continue;
    vistos.add(chave(c.arquivo, c.texto));
  }
  return vistos;
}

/** O que o inventário versionado registra. */
function superficieCongelada(): ReadonlySet<string> {
  return new Set(
    inventario()
      .filter((e) => !FORA_DO_CONGELAMENTO.has(e.arquivo))
      .map((e) => chave(e.arquivo, e.texto)),
  );
}

const COMO_RECONCILIAR =
  "\n\nSe a alteração for deliberada, releia docs/redacao.md, atualize a classe em " +
  "scripts/textos/classes/ se o literal for novo, e regere o inventário com " +
  "`node scripts/inventariar-textos.mts --gerar`. O `git diff` do inventário é o registro " +
  "da mudança, e é ele que põe o antes e o depois sob leitura humana.";

describe("congelamento da superfície textual (RF-06)", () => {
  const corrente = superficieCorrente();
  const congelada = superficieCongelada();

  it("nenhum literal do código mudou sem o inventário mudar junto", () => {
    const alterados = [...corrente]
      .filter((k) => !congelada.has(k))
      .map((k) => `  ${k.replace("\n", " → ")}`);

    expect(
      alterados,
      `${alterados.length} literal(is) existem no código e NÃO no inventário — ` +
        `foram acrescentados ou reescritos:\n\n${alterados.join("\n")}${COMO_RECONCILIAR}`,
    ).toEqual([]);
  });

  it("nenhum literal do inventário desapareceu do código sem registro", () => {
    const sumidos = [...congelada]
      .filter((k) => !corrente.has(k))
      .map((k) => `  ${k.replace("\n", " → ")}`);

    expect(
      sumidos,
      `${sumidos.length} literal(is) existem no inventário e NÃO no código — ` +
        `foram removidos ou reescritos:\n\n${sumidos.join("\n")}${COMO_RECONCILIAR}`,
    ).toEqual([]);
  });

  it("o README continua no inventário, e continua fora do congelamento (D-10)", () => {
    const doReadme = inventario().filter((e) => e.arquivo === "README.md");
    expect(
      doReadme.length,
      "o README saiu do inventário: RF-02 exige que ele esteja lá, ainda que D-10 o " +
        "dispense do congelamento",
    ).toBeGreaterThan(0);
    expect(doReadme.every((e) => e.classe === "autoral")).toBe(true);
  });
});
