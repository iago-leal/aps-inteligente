// T006 (feature 023-saude-do-idoso-gds) — o escore e as três faixas (RF-04; RN-03/RN-04).
//
// POR QUE VARREDURA EXAUSTIVA, E NÃO AMOSTRA (D-04). O espaço do escore tem dezesseis
// valores, e enumerá-los inteiramente custa dezesseis asserções. Amostrar as fronteiras
// provaria os pontos que o autor lembrou; a varredura prova também o intervalo que ele não
// olhou, e é a única forma de afirmar, como fato e não como intenção, que as faixas cobrem
// 0 a 15 sem buraco nem sobreposição.
//
// OS DOIS EXTREMOS POR RESPOSTAS COMPLETAS. Responder aos quinze itens na direção que pontua
// tem de dar 15, e na direção oposta tem de dar 0. Só fecham os dois se a direção de TODOS os
// itens estiver certa: é o teste que uma chave de pontuação invertida não sobrevive.
import { describe, expect, it } from "vitest";
import { EscalaDepressaoGeriatrica } from "models/depressao-geriatrica/calculadora";
import { faixaDoEscore } from "models/depressao-geriatrica/classificacao";
import { ITENS } from "models/depressao-geriatrica/itens";
import { ErroDeInvariante } from "models/depressao-geriatrica/tipos";
import type {
  FaixaDeResultado,
  RespostaDoItem,
  RespostasDaEscala,
  ResultadoDaEscala,
} from "models/depressao-geriatrica/tipos";

const motor = new EscalaDepressaoGeriatrica();

const ESCORE_MINIMO = 0;
const ESCORE_MAXIMO = 15;

/** O rótulo que a fonte dá a cada escore possível. Oráculo escrito à mão, item da §7. */
const ROTULO_ESPERADO: readonly string[] = [
  ...Array<string>(6).fill("se considera normal"),
  ...Array<string>(5).fill("indica depressão leve"),
  ...Array<string>(5).fill("depressão severa"),
];

function oposta(resposta: RespostaDoItem): RespostaDoItem {
  return resposta === "sim" ? "nao" : "sim";
}

/** Respostas completas em que os `quantos` primeiros itens pontuam e os demais não. */
function respostasComEscore(quantos: number): RespostasDaEscala {
  const respostas: Record<string, RespostaDoItem> = {};
  ITENS.forEach((item, indice) => {
    respostas[item.id] =
      indice < quantos
        ? item.respostaQuePontua
        : oposta(item.respostaQuePontua);
  });
  return respostas;
}

function resultado(respostas: RespostasDaEscala): ResultadoDaEscala {
  const saida = motor.avaliar(respostas);
  if (saida.tipo !== "resultado") {
    throw new Error(`Esperava resultado, veio ${saida.tipo}`);
  }
  return saida;
}

describe("RN-03: o escore é a soma dos itens pontuados, de 0 a 15", () => {
  for (let escore = ESCORE_MINIMO; escore <= ESCORE_MAXIMO; escore += 1) {
    it(`escore ${escore}: soma e rótulo da faixa`, () => {
      const saida = resultado(respostasComEscore(escore));
      expect(saida.escore).toBe(escore);
      expect(saida.faixa.rotulo).toBe(ROTULO_ESPERADO[escore]);
      expect(saida.faixa.de).toBeLessThanOrEqual(escore);
      expect(saida.faixa.ate).toBeGreaterThanOrEqual(escore);
    });
  }
});

describe("RF-04: os dois extremos por respostas completas", () => {
  it("todas as respostas na direção que pontua dão 15 e a faixa severa", () => {
    const respostas: Record<string, RespostaDoItem> = {};
    for (const item of ITENS) respostas[item.id] = item.respostaQuePontua;
    const saida = resultado(respostas);
    expect(saida.escore).toBe(ESCORE_MAXIMO);
    expect(saida.faixa.rotulo).toBe("depressão severa");
  });

  it("todas na direção oposta dão 0 e a faixa que a fonte considera normal", () => {
    const respostas: Record<string, RespostaDoItem> = {};
    for (const item of ITENS)
      respostas[item.id] = oposta(item.respostaQuePontua);
    const saida = resultado(respostas);
    expect(saida.escore).toBe(ESCORE_MINIMO);
    expect(saida.faixa.rotulo).toBe("se considera normal");
  });

  it("responder tudo com Sim não é o mesmo que responder tudo na direção que pontua", () => {
    // A escala não é homogênea: dez itens pontuam com "Sim" e cinco com "Não". Se este teste
    // falhar, alguém uniformizou a chave e o instrumento deixou de ser o da fonte.
    const todosSim: Record<string, RespostaDoItem> = {};
    for (const item of ITENS) todosSim[item.id] = "sim";
    expect(resultado(todosSim).escore).toBe(10);
  });
});

describe("RN-04: as faixas cobrem o escore sem buraco nem sobreposição", () => {
  it("todo escore de 0 a 15 cai em exatamente uma faixa", () => {
    for (let escore = ESCORE_MINIMO; escore <= ESCORE_MAXIMO; escore += 1) {
      const faixa = resultado(respostasComEscore(escore)).faixa;
      expect(faixa.de).toBeLessThanOrEqual(escore);
      expect(faixa.ate).toBeGreaterThanOrEqual(escore);
    }
  });

  it("as faixas se encadeiam: cada uma começa onde a anterior terminou", () => {
    const faixas: FaixaDeResultado[] = [];
    for (let escore = ESCORE_MINIMO; escore <= ESCORE_MAXIMO; escore += 1) {
      faixas.push(resultado(respostasComEscore(escore)).faixa);
    }
    const distintas = faixas.filter(
      (faixa, indice) =>
        indice === 0 || faixa.rotulo !== faixas[indice - 1].rotulo,
    );
    expect(distintas).toHaveLength(3);
    expect(distintas[0].de).toBe(ESCORE_MINIMO);
    expect(distintas.at(-1)!.ate).toBe(ESCORE_MAXIMO);
    for (let i = 1; i < distintas.length; i += 1) {
      expect(distintas[i].de).toBe(distintas[i - 1].ate + 1);
    }
  });
});

describe("RN-08: escore fora da escala é bug, e bug se anuncia", () => {
  // Pela fachada este caminho é inalcançável, e é essa a razão de exercitá-lo aqui, na
  // função: a guarda existe para o dia em que alguém alterar `escore.ts` ou `FAIXAS` e
  // abrir um buraco. Guarda que nunca foi vista disparar não se sabe se dispara.
  it("um escore acima do máximo lança ErroDeInvariante, e não devolve faixa alguma", () => {
    expect(() => faixaDoEscore(ESCORE_MAXIMO + 1)).toThrow(ErroDeInvariante);
  });

  it("um escore negativo também lança, em vez de cair na primeira faixa", () => {
    expect(() => faixaDoEscore(-1)).toThrow(ErroDeInvariante);
  });
});
