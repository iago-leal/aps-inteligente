// T008 (feature 023-saude-do-idoso-gds) — invariantes da fachada, por propriedade
// (RF-01/RF-02/RF-04b/RF-07; RN-05/RN-08).
//
// POR QUE PROPRIEDADE, E NÃO MAIS EXEMPLOS. O escore tem dezesseis valores, mas o espaço de
// ENTRADA tem 2^15 combinações de resposta, e nenhuma lista de exemplos o cobre. O que se
// afirma aqui não é o valor de saída — disso cuida `escore.test.ts` —, e sim o que tem de
// valer para toda entrada completa: que a saída é resultado, que o escore cabe na escala, que
// nenhuma saída sai sem referência, que a providência acompanha TODA faixa e que duas
// chamadas iguais devolvem valores iguais.
//
// A PROVIDÊNCIA EM TODA FAIXA É INVARIANTE, E NÃO DETALHE (D-06). A fonte diz "escores
// elevados" e não quantifica; um limiar do produto aqui seria regra nossa com aparência de
// citação. Como propriedade, a ausência de limiar deixa de ser promessa de prosa e passa a
// ser fato verificado em toda combinação sorteada.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { EscalaDepressaoGeriatrica } from "models/depressao-geriatrica/calculadora";
import { ITENS } from "models/depressao-geriatrica/itens";
import type {
  RespostaDoItem,
  RespostasDaEscala,
} from "models/depressao-geriatrica/tipos";

const motor = new EscalaDepressaoGeriatrica();

const ESCORE_MINIMO = 0;
const ESCORE_MAXIMO = 15;

/** Toda a superfície de entrada válida: uma resposta para cada um dos quinze itens. */
const arbRespostas: fc.Arbitrary<RespostasDaEscala> = fc
  .array(fc.constantFrom<RespostaDoItem>("sim", "nao"), {
    minLength: ITENS.length,
    maxLength: ITENS.length,
  })
  .map((valores) => {
    const respostas: Record<string, RespostaDoItem> = {};
    ITENS.forEach((item, indice) => {
      respostas[item.id] = valores[indice];
    });
    return respostas;
  });

describe("RF-01: entrada completa produz sempre resultado", () => {
  it("nenhuma combinação de respostas completas cai em erro", () => {
    fc.assert(
      fc.property(arbRespostas, (respostas) => {
        expect(motor.avaliar(respostas).tipo).toBe("resultado");
      }),
      { numRuns: 300 },
    );
  });

  it("o escore fica sempre entre 0 e 15", () => {
    fc.assert(
      fc.property(arbRespostas, (respostas) => {
        const saida = motor.avaliar(respostas);
        if (saida.tipo !== "resultado") return;
        expect(Number.isInteger(saida.escore)).toBe(true);
        expect(saida.escore).toBeGreaterThanOrEqual(ESCORE_MINIMO);
        expect(saida.escore).toBeLessThanOrEqual(ESCORE_MAXIMO);
      }),
      { numRuns: 300 },
    );
  });
});

describe("RF-02: nenhuma saída existe sem referência clínica", () => {
  it("`referencias` nunca é vazia, e cada entrada tem localização preenchida", () => {
    fc.assert(
      fc.property(arbRespostas, (respostas) => {
        const saida = motor.avaliar(respostas);
        if (saida.tipo !== "resultado") return;
        expect(saida.referencias.length).toBeGreaterThan(0);
        for (const referencia of saida.referencias) {
          expect(referencia.fonteId.length).toBeGreaterThan(0);
          expect(referencia.versaoEdicao.length).toBeGreaterThan(0);
          expect(referencia.localizacao.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 300 },
    );
  });
});

describe("RF-04b e RF-07: providência e advertência acompanham toda faixa", () => {
  it("a providência da fonte está presente em qualquer escore", () => {
    fc.assert(
      fc.property(arbRespostas, (respostas) => {
        const saida = motor.avaliar(respostas);
        if (saida.tipo !== "resultado") return;
        expect(saida.providencia.texto.length).toBeGreaterThan(0);
        expect(saida.providencia.referencia.localizacao.length).toBeGreaterThan(
          0,
        );
      }),
      { numRuns: 300 },
    );
  });

  it("a advertência de que o instrumento rastreia e não diagnostica sempre acompanha", () => {
    fc.assert(
      fc.property(arbRespostas, (respostas) => {
        const saida = motor.avaliar(respostas);
        if (saida.tipo !== "resultado") return;
        expect(saida.advertencias.map((a) => a.tipo)).toContain(
          "RASTREAMENTO_NAO_DIAGNOSTICO",
        );
      }),
      { numRuns: 300 },
    );
  });
});

describe("RN-08: o motor é puro e determinístico", () => {
  it("duas chamadas com a mesma entrada devolvem valores iguais", () => {
    fc.assert(
      fc.property(arbRespostas, (respostas) => {
        expect(motor.avaliar(respostas)).toEqual(motor.avaliar(respostas));
      }),
      { numRuns: 200 },
    );
  });

  it("o motor não altera o mapa de respostas que recebe", () => {
    fc.assert(
      fc.property(arbRespostas, (respostas) => {
        const copia = { ...respostas };
        motor.avaliar(respostas);
        expect(respostas).toEqual(copia);
      }),
      { numRuns: 100 },
    );
  });
});
