// T008 (feature 019) — invariantes do payload por property-based (RF-02; RN-04).
// O que estas propriedades guardam não é um caso, é uma forma: qualquer
// configuração aceita produz cadeia cujo comprimento declarado bate com o
// conteúdo e cuja verificação confere. Erro de TLV não aparece na nossa suíte de
// exemplos, aparece na câmera de quem tenta contribuir.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { montarBrCode } from "models/contribuicao/br-code";
import { crc16 } from "models/contribuicao/crc16";
import { lerCampos } from "../../apoio/contribuicao";

/** Textos que a normalização preserva por inteiro, para o gerador não colidir com RF-03. */
const texto = (max: number) =>
  fc
    .stringMatching(/^[A-Z][A-Z ]*$/)
    .filter((valor) => valor.trim().length > 0 && valor.trim().length <= max);

const parametrosArbitrarios = fc.record(
  {
    chave: fc.uuid(),
    nomeBeneficiario: texto(25),
    cidade: texto(15),
    valorSugerido: fc.option(fc.double({ min: 0.01, max: 9999, noNaN: true }), {
      nil: undefined,
    }),
  },
  { requiredKeys: ["chave", "nomeBeneficiario", "cidade"] },
);

describe("Invariantes do payload emitido", () => {
  it("a verificação final sempre confere com o recálculo sobre a cadeia com 6304", () => {
    fc.assert(
      fc.property(parametrosArbitrarios, (parametros) => {
        const saida = montarBrCode(parametros);
        if (saida.tipo !== "ok") return true;
        const semVerificacao = saida.payload.slice(0, -4);
        return saida.payload.slice(-4) === crc16(semVerificacao);
      }),
    );
  });

  it("todo campo declara comprimento igual ao do próprio valor", () => {
    fc.assert(
      fc.property(parametrosArbitrarios, (parametros) => {
        const saida = montarBrCode(parametros);
        if (saida.tipo !== "ok") return true;
        // lerCampos relê a cadeia inteira pelos comprimentos declarados; se algum
        // estivesse errado, a leitura sairia dos limites ou deixaria resto.
        const campos = lerCampos(saida.payload);
        return campos.has("00") && campos.has("26") && campos.has("63");
      }),
    );
  });

  it("a montagem é idempotente: mesma entrada, mesma cadeia", () => {
    fc.assert(
      fc.property(parametrosArbitrarios, (parametros) => {
        const primeira = montarBrCode(parametros);
        const segunda = montarBrCode(parametros);
        return JSON.stringify(primeira) === JSON.stringify(segunda);
      }),
    );
  });

  it("nenhuma entrada faz a fachada lançar (ADR 0004)", () => {
    fc.assert(
      fc.property(
        fc.record({
          chave: fc.string(),
          nomeBeneficiario: fc.string(),
          cidade: fc.string(),
          valorSugerido: fc.option(fc.double(), { nil: undefined }),
          identificacao: fc.option(fc.string(), { nil: undefined }),
        }),
        (parametros) => {
          const saida = montarBrCode(parametros);
          return saida.tipo === "ok" || saida.tipo === "ParametroInvalido";
        },
      ),
    );
  });

  it("erro de validação nunca vem com lista de ofensores vazia", () => {
    fc.assert(
      fc.property(
        fc.record({
          chave: fc.string(),
          nomeBeneficiario: fc.string(),
          cidade: fc.string(),
        }),
        (parametros) => {
          const saida = montarBrCode(parametros);
          return saida.tipo === "ok" || saida.ofensores.length > 0;
        },
      ),
    );
  });
});

describe("Ausência de estado (RN-04)", () => {
  it("a ordem das chamadas não altera o resultado de nenhuma delas", () => {
    const a = montarBrCode({
      chave: "11111111-1111-1111-1111-111111111111",
      nomeBeneficiario: "A",
      cidade: "B",
    });
    const b = montarBrCode({
      chave: "22222222-2222-2222-2222-222222222222",
      nomeBeneficiario: "C",
      cidade: "D",
    });
    const aDeNovo = montarBrCode({
      chave: "11111111-1111-1111-1111-111111111111",
      nomeBeneficiario: "A",
      cidade: "B",
    });
    expect(aDeNovo).toEqual(a);
    expect(b).not.toEqual(a);
  });
});
