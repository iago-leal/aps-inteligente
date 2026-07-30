// T005 (feature 023-saude-do-idoso-gds) — o oráculo de transcrição da escala (D-09, `MD-0010`).
//
// O QUE ESTE TESTE PROVA, E CONTRA O QUÊ. Que os quinze enunciados, a resposta que pontua de
// cada item, os três rótulos de faixa com os seus cortes, a providência e a referência
// bibliográfica que o domínio declara são os que a fonte publica. A comparação é contra
// `tests/apoio/gds-fonte-congelada.json`, extraído da cópia datada da página por
// `scripts/congelar-fonte-gds.mts`: não veio de quem transcreveu, e é isso que faz dele
// oráculo em vez de segunda leitura nossa.
//
// POR QUE ELE É O TESTE MAIS IMPORTANTE DESTE DOMÍNIO. A chave de pontuação mistura dez itens
// em que pontua o "Sim" com cinco em que pontua o "Não", e ela NÃO ESTÁ NO TEXTO: a fonte a
// publica pela cor da célula (`MD-0038`). Uma inversão em um único item produz escore
// plausível, na faixa vizinha da correta, e nenhuma inspeção de tela a pega. É o defeito
// silencioso que esta feature tinha para produzir, e é este arquivo que o impede.
//
// A COMPARAÇÃO É BYTE A BYTE, e é de propósito que não haja normalização: rótulo transcrito
// é o que casa a tela com a página que o prescritor tem à mão, e "quase igual" não casa.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FAIXAS } from "models/depressao-geriatrica/classificacao";
import {
  REFERENCIA_BIBLIOGRAFICA_DA_FONTE,
  TEXTO_PROVIDENCIA,
} from "models/depressao-geriatrica/fonte-clinica";
import { ITENS } from "models/depressao-geriatrica/itens";

const CONGELADO = "tests/apoio/gds-fonte-congelada.json";

type Congelado = {
  readonly dados: {
    readonly itens: ReadonlyArray<{
      readonly numero: number;
      readonly texto: string;
      readonly respostaQuePontua: "sim" | "nao";
    }>;
    readonly avaliacoes: ReadonlyArray<{
      readonly de: number;
      readonly ate: number;
      readonly rotulo: string;
    }>;
    readonly providencia: {
      readonly paragrafo: string;
      readonly recomendacao: string;
    };
    readonly referenciaBibliografica: string;
  };
};

const { dados } = JSON.parse(readFileSync(CONGELADO, "utf8")) as Congelado;

describe("RF-03: os quinze itens são a transcrição da fonte", () => {
  it("o domínio traz exatamente os itens que a fonte publica, na ordem impressa", () => {
    expect(ITENS.map((item) => item.numero)).toEqual(
      dados.itens.map((item) => item.numero),
    );
  });

  for (const daFonte of dados.itens) {
    it(`item ${daFonte.numero}: enunciado byte a byte`, () => {
      const doDominio = ITENS.find((item) => item.numero === daFonte.numero);
      expect(
        doDominio,
        `o item ${daFonte.numero} não existe no domínio, e a fonte o publica`,
      ).toBeDefined();
      expect(
        doDominio!.texto,
        `o enunciado do item ${daFonte.numero} diverge da fonte. A citação permanece byte a ` +
          `byte: se a página mudou, reabra a transcrição e regere o congelado, lendo o diff.`,
      ).toBe(daFonte.texto);
    });

    it(`item ${daFonte.numero}: a resposta que pontua é a da marcação de célula`, () => {
      const doDominio = ITENS.find((item) => item.numero === daFonte.numero)!;
      expect(
        doDominio.respostaQuePontua,
        `a chave de pontuação do item ${daFonte.numero} está invertida. É o defeito mais ` +
          `grave possível aqui: o escore sai plausível, na faixa vizinha da correta, e ` +
          `nenhuma leitura de tela o denuncia.`,
      ).toBe(daFonte.respostaQuePontua);
    });
  }

  it("dez itens pontuam com Sim e cinco com Não, como a fonte marca", () => {
    const comSim = ITENS.filter((item) => item.respostaQuePontua === "sim");
    const comNao = ITENS.filter((item) => item.respostaQuePontua === "nao");
    expect(comSim).toHaveLength(10);
    expect(comNao.map((item) => item.numero)).toEqual([1, 5, 7, 11, 13]);
  });

  it("cada item tem identificador próprio, e nenhum se repete", () => {
    const ids = new Set(ITENS.map((item) => item.id));
    expect(ids.size).toBe(ITENS.length);
  });
});

describe("RF-04: as três faixas são as da fonte, com os cortes transcritos", () => {
  it("os limites e os rótulos batem com as avaliações publicadas", () => {
    expect(
      FAIXAS.map((faixa) => ({
        de: faixa.de,
        ate: faixa.ate,
        rotulo: faixa.rotulo,
      })),
    ).toEqual(
      dados.avaliacoes.map((avaliacao) => ({
        de: avaliacao.de,
        ate: avaliacao.ate,
        rotulo: avaliacao.rotulo,
      })),
    );
  });
});

describe("RF-04b: a providência é citação, e a fonte não a quantifica", () => {
  it("o texto do domínio ocorre no parágrafo que a fonte imprime", () => {
    expect(dados.providencia.paragrafo).toContain(TEXTO_PROVIDENCIA);
  });

  it("é a recomendação da fonte, e não uma paráfrase dela", () => {
    expect(TEXTO_PROVIDENCIA).toBe(dados.providencia.recomendacao);
  });

  it("nenhum número do produto acompanha a providência", () => {
    // A fonte diz "escores elevados" e não quantifica. Um corte no texto seria o produto
    // emitindo regra própria com aparência de citação (D-06).
    expect(TEXTO_PROVIDENCIA).not.toMatch(/\d/);
  });
});

describe("RF-02: a referência bibliográfica é a que a própria fonte cita", () => {
  it("bate byte a byte com a legenda sob a tabela", () => {
    expect(REFERENCIA_BIBLIOGRAFICA_DA_FONTE).toBe(
      dados.referenciaBibliografica,
    );
  });
});
