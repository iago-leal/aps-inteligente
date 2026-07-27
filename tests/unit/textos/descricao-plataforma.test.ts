// A descrição da plataforma corresponde ao catálogo vigente (T021; RF-04; RN-06, D-17).
//
// DUAS FORMAS, UMA POR SUPERFÍCIE, e a assimetria é decisão e não descuido:
//
//   · POSITIVA na home — a `description` de `pages/index.tsx` NOMEIA todas as seções de
//     `CATALOGO`. É ali que o defeito vive: a descrição enumera, e enumera errado, deixando
//     de fora Cardiologia e Puericultura. Só a forma positiva o corrige e o impede de
//     voltar, porque uma quinta seção passa a quebrar a suíte até alguém revisitar o texto.
//
//   · NEGATIVA no manifesto — a `description` de `public/manifest.webmanifest` NÃO enumera
//     subconjunto próprio das seções. Ela não enumera nada hoje, tem teto prático de
//     comprimento e persiste no dispositivo de quem instalou até a reinstalação; exigir-lhe
//     as quatro seções custaria mais de sessenta caracteres antes de qualquer moldura e
//     produziria truncamento na tela de instalação. O que se proíbe ali é descrever a
//     plataforma pela metade: ou nomeia todas, ou não nomeia nenhuma.
//
// As duas asserções leem o MESMO oráculo, que é o catálogo — a fonte única de onde a home e
// as rotas nascem.

import { describe, expect, it } from "vitest";

import { CATALOGO } from "interface/inicio/catalogo";
import { descricaoDaRota, manifesto } from "../../apoio/superficie-textual";

const SECOES = CATALOGO.map((s) => s.titulo);

describe("descrição da plataforma × catálogo (RF-04)", () => {
  it("a descrição da home nomeia TODAS as seções do catálogo (forma positiva)", () => {
    const descricao = descricaoDaRota("pages/index.tsx");
    const ausentes = SECOES.filter((titulo) => !descricao.includes(titulo));

    expect(
      ausentes,
      `a descrição da raiz deixa de nomear ${ausentes.length} de ${SECOES.length} seções ` +
        `do catálogo: ${ausentes.join(", ")}.\n` +
        `É o texto que sai para o buscador e para o compartilhamento, e descrever uma ` +
        `plataforma que já não existe é defeito de exatidão, não questão de estilo.\n` +
        `Descrição atual: ${JSON.stringify(descricao)}`,
    ).toEqual([]);
  });

  it("a descrição do manifesto não enumera subconjunto próprio (forma negativa)", () => {
    const descricao = String(manifesto().description ?? "");
    const nomeadas = SECOES.filter((titulo) => descricao.includes(titulo));

    const enumeraParte = nomeadas.length > 0 && nomeadas.length < SECOES.length;

    expect(
      enumeraParte,
      `a descrição do manifesto nomeia ${nomeadas.length} de ${SECOES.length} seções ` +
        `(${nomeadas.join(", ")}), e descrever a plataforma pela metade é pior que não a ` +
        `descrever por seções.\n` +
        `Aqui o teste NÃO exige a enumeração completa: o campo tem teto prático de ` +
        `comprimento e é truncado na tela de instalação (D-17). Ou nomeia todas, ou ` +
        `nenhuma.\n` +
        `Descrição atual: ${JSON.stringify(descricao)}`,
    ).toBe(false);
  });

  it("o catálogo tem seções, e é ele o oráculo das duas formas", () => {
    // Sem esta guarda, um catálogo vazio faria as duas asserções passarem por vacuidade —
    // que é o modo de falha que esta feature inteira existe para não repetir.
    expect(SECOES.length).toBeGreaterThan(0);
    expect(new Set(SECOES).size).toBe(SECOES.length);
  });
});
