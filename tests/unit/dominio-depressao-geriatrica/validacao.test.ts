// T007 (feature 023-saude-do-idoso-gds) — coleta total de ofensores (RF-05; RN-06).
//
// A REGRA QUE ESTE ARQUIVO FAZ VALER. Item sem resposta é ofensor, e a validação devolve
// TODOS os faltantes de uma vez, nomeando cada um. Não existe escore parcial: instrumento
// somado pela metade produz número que parece resultado e não é, e é o pior desfecho
// possível porque não deixa rastro na tela.
//
// Devolver um ofensor por vez seria pior do que parece: o prescritor descobriria o segundo
// item em branco só depois de corrigir o primeiro, e a escala tem quinze.
import { describe, expect, it } from "vitest";
import { EscalaDepressaoGeriatrica } from "models/depressao-geriatrica/calculadora";
import { ITENS } from "models/depressao-geriatrica/itens";
import type {
  EntradaInvalida,
  RespostaDoItem,
  RespostasDaEscala,
} from "models/depressao-geriatrica/tipos";

const motor = new EscalaDepressaoGeriatrica();

function completas(): Record<string, RespostaDoItem> {
  const respostas: Record<string, RespostaDoItem> = {};
  for (const item of ITENS) respostas[item.id] = "nao";
  return respostas;
}

function semOsItens(numeros: readonly number[]): RespostasDaEscala {
  const respostas = completas();
  for (const numero of numeros) {
    const item = ITENS.find((i) => i.numero === numero)!;
    delete respostas[item.id];
  }
  return respostas;
}

function erro(respostas: RespostasDaEscala): EntradaInvalida {
  const saida = motor.avaliar(respostas);
  if (saida.tipo !== "erro-validacao") {
    throw new Error(`Esperava erro-validacao, veio ${saida.tipo}`);
  }
  return saida;
}

describe("RN-06: item sem resposta vira ofensor nomeado", () => {
  it("um item em branco produz um ofensor, com o código e o campo do item", () => {
    const saida = erro(semOsItens([7]));
    expect(saida.ofensores).toHaveLength(1);
    expect(saida.ofensores[0].codigo).toBe("ITEM_NAO_RESPONDIDO");
    expect(saida.ofensores[0].campo).toBe(ITENS[6].id);
  });

  it("a mensagem nomeia o item, e não apenas o campo interno", () => {
    const saida = erro(semOsItens([7]));
    expect(saida.ofensores[0].mensagem).toContain("7");
    expect(saida.ofensores[0].mensagem).toContain(ITENS[6].texto);
  });

  it("três itens em branco produzem os três ofensores de uma vez", () => {
    const saida = erro(semOsItens([2, 9, 14]));
    expect(saida.ofensores.map((o) => o.campo)).toEqual([
      ITENS[1].id,
      ITENS[8].id,
      ITENS[13].id,
    ]);
  });

  it("entrada sem resposta alguma produz quinze ofensores, na ordem impressa", () => {
    const saida = erro({});
    expect(saida.ofensores).toHaveLength(ITENS.length);
    expect(saida.ofensores.map((o) => o.campo)).toEqual(ITENS.map((i) => i.id));
  });
});

describe("RF-05: nenhum caminho de erro devolve escore parcial", () => {
  it("a saída de erro não carrega escore, faixa nem providência", () => {
    const saida = erro(semOsItens([1, 2, 3]));
    expect(saida).toEqual({
      tipo: "erro-validacao",
      ofensores: saida.ofensores,
    });
  });

  it("respostas completas não produzem ofensor nenhum", () => {
    expect(motor.avaliar(completas()).tipo).toBe("resultado");
  });

  it("chave desconhecida no mapa não é resposta, e não completa a escala", () => {
    const respostas = semOsItens([15]);
    const comIntrusa = { ...respostas, "item-99": "sim" as RespostaDoItem };
    expect(erro(comIntrusa).ofensores.map((o) => o.campo)).toEqual([
      ITENS[14].id,
    ]);
  });
});

describe("RN-08: erro esperado é valor, e a validação nunca lança", () => {
  it("mapa vazio devolve erro em vez de exceção", () => {
    expect(() => motor.avaliar({})).not.toThrow();
  });
});
