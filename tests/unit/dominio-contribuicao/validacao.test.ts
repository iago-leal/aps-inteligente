// T006 (feature 019) — validação com COLETA TOTAL dos ofensores (RF-03; roadmap
// D-02; `interfaces/br-code.md` §4). A regra vale aqui mais do que nos domínios
// clínicos: quem configura errado é o mantenedor sozinho, meses depois, e quer
// ver os três problemas de uma vez.
import { describe, expect, it } from "vitest";
import { montarBrCode } from "models/contribuicao/br-code";
import { LIMITES } from "models/contribuicao/tipos";
import { codigos, comoOfensores, parametros } from "../../apoio/contribuicao";

describe("Campo obrigatório ausente", () => {
  it("chave vazia devolve erro como valor, e não exceção", () => {
    const saida = montarBrCode(parametros({ chave: "  " }));
    expect(saida.tipo).toBe("ParametroInvalido");
    expect(codigos(saida)).toContain("CHAVE_AUSENTE");
  });

  it("cidade ausente é nomeada, e nenhuma cadeia parcial é emitida", () => {
    const saida = montarBrCode(parametros({ cidade: "" }));
    expect(codigos(saida)).toContain("CIDADE_AUSENTE");
    expect(saida).not.toHaveProperty("payload");
  });

  it("nome que a normalização esvazia conta como ausente", () => {
    expect(
      codigos(montarBrCode(parametros({ nomeBeneficiario: "🙂🙂" }))),
    ).toContain("NOME_AUSENTE");
  });
});

describe("Limites do padrão (recusa, jamais truncamento)", () => {
  it("nome acima de 25 caracteres é recusado com limite e observado", () => {
    const nomeBeneficiario = "A".repeat(26);
    const ofensores = comoOfensores(
      montarBrCode(parametros({ nomeBeneficiario })),
    );
    const ofensor = ofensores.find((o) => o.campo === "nomeBeneficiario");
    expect(ofensor?.codigo).toBe("NOME_ACIMA_DO_LIMITE");
    expect(ofensor?.limite).toBe(LIMITES.nomeBeneficiario);
    expect(ofensor?.observado).toBe(26);
  });

  it("cidade acima de 15 caracteres é recusada", () => {
    const saida = montarBrCode(parametros({ cidade: "A".repeat(16) }));
    expect(codigos(saida)).toContain("CIDADE_ACIMA_DO_LIMITE");
  });

  it("identificação acima de 25 caracteres é recusada", () => {
    const saida = montarBrCode(parametros({ identificacao: "A".repeat(26) }));
    expect(codigos(saida)).toContain("IDENTIFICACAO_ACIMA_DO_LIMITE");
  });

  it("o limite é medido sobre o texto já normalizado, que é o que vai ao payload", () => {
    // 25 letras com acento: a normalização remove os diacríticos e o comprimento cabe.
    const nomeBeneficiario = "ÁÉÍÓÚ".repeat(5);
    expect(montarBrCode(parametros({ nomeBeneficiario })).tipo).toBe("ok");
  });
});

describe("Valor sugerido", () => {
  it("zero, negativo e não finito são recusados", () => {
    for (const valorSugerido of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(codigos(montarBrCode(parametros({ valorSugerido })))).toContain(
        "VALOR_INVALIDO",
      );
    }
  });
});

describe("Coleta total (regra 15 de domain.md)", () => {
  it("três problemas simultâneos voltam juntos, e não um de cada vez", () => {
    const saida = montarBrCode({
      chave: "",
      nomeBeneficiario: "A".repeat(30),
      cidade: "A".repeat(20),
      valorSugerido: -5,
    });
    expect(codigos(saida).sort()).toEqual(
      [
        "CHAVE_AUSENTE",
        "CIDADE_ACIMA_DO_LIMITE",
        "NOME_ACIMA_DO_LIMITE",
        "VALOR_INVALIDO",
      ].sort(),
    );
  });

  it("toda mensagem de ofensor é frase útil, e não código repetido", () => {
    const ofensores = comoOfensores(
      montarBrCode(parametros({ chave: "", cidade: "" })),
    );
    for (const ofensor of ofensores) {
      expect(ofensor.mensagem.length).toBeGreaterThan(20);
      expect(ofensor.mensagem).not.toBe(ofensor.codigo);
    }
  });
});
