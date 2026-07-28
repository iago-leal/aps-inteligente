// T007 (feature 019) — a fachada contra oráculo congelado (RF-01/RF-04; Gherkin
// 1 a 3 do requirements). O payload é lido de volta por um decodificador TLV que
// não sabe como ele foi montado (`tests/apoio/contribuicao.ts`), para o teste não
// se limitar a provar que o código concorda consigo mesmo.
import { describe, expect, it } from "vitest";
import { montarBrCode } from "models/contribuicao/br-code";
import { crc16 } from "models/contribuicao/crc16";
import { comoOk, lerCampos, parametros } from "../../apoio/contribuicao";

const PAYLOAD_SEM_VALOR =
  "00020126580014br.gov.bcb.pix013600000000-0000-0000-0000-0000000000005204000053039865802BR5913FULANO DE TAL6007GOIANIA62070503***6304";

describe("Payload estático sem valor definido", () => {
  it("bate com o oráculo congelado, verificação incluída", () => {
    const payload = comoOk(montarBrCode(parametros()));
    expect(payload).toBe(`${PAYLOAD_SEM_VALOR}${crc16(PAYLOAD_SEM_VALOR)}`);
  });

  it("começa por 000201 e traz os campos fixos do arranjo", () => {
    const payload = comoOk(montarBrCode(parametros()));
    expect(payload.startsWith("000201")).toBe(true);
    expect(payload).toContain("br.gov.bcb.pix");
    expect(payload).toContain("5303986");
    expect(payload).toContain("5802BR");
  });

  it("não traz o campo de valor", () => {
    const campos = lerCampos(comoOk(montarBrCode(parametros())));
    expect(campos.has("54")).toBe(false);
  });

  it("termina por 6304 seguido de quatro dígitos que conferem com o recálculo", () => {
    const payload = comoOk(montarBrCode(parametros()));
    const semVerificacao = payload.slice(0, -4);
    expect(semVerificacao.endsWith("6304")).toBe(true);
    expect(payload.slice(-4)).toBe(crc16(semVerificacao));
  });

  it("os campos lidos de volta são os configurados", () => {
    const campos = lerCampos(comoOk(montarBrCode(parametros())));
    expect(campos.get("59")).toBe("FULANO DE TAL");
    expect(campos.get("60")).toBe("GOIANIA");
    expect(campos.get("52")).toBe("0000");
    expect(campos.get("62")).toBe("0503***");
    expect(campos.get("26")).toBe(
      "0014br.gov.bcb.pix013600000000-0000-0000-0000-000000000000",
    );
  });
});

describe("Payload com valor sugerido", () => {
  it("traz o campo 54 com duas casas decimais", () => {
    const campos = lerCampos(
      comoOk(montarBrCode(parametros({ valorSugerido: 25 }))),
    );
    expect(campos.get("54")).toBe("25.00");
  });

  it("a verificação final difere da do payload sem valor", () => {
    const semValor = comoOk(montarBrCode(parametros()));
    const comValor = comoOk(montarBrCode(parametros({ valorSugerido: 25 })));
    expect(comValor.slice(-4)).not.toBe(semValor.slice(-4));
  });
});

describe("Identificação (campo 62/05)", () => {
  it("ausente vira ***", () => {
    expect(lerCampos(comoOk(montarBrCode(parametros()))).get("62")).toBe(
      "0503***",
    );
  });

  it("presente entra normalizada, com o comprimento declarado", () => {
    const campos = lerCampos(
      comoOk(montarBrCode(parametros({ identificacao: "APOIO2026" }))),
    );
    expect(campos.get("62")).toBe("0509APOIO2026");
  });
});

describe("Determinismo (RN-04)", () => {
  it("duas montagens com os mesmos parâmetros são idênticas byte a byte", () => {
    expect(comoOk(montarBrCode(parametros()))).toBe(
      comoOk(montarBrCode(parametros())),
    );
  });
});

describe("Normalização (RF-03)", () => {
  it("remove diacríticos do nome e da cidade, preservando as letras", () => {
    const campos = lerCampos(
      comoOk(
        montarBrCode(
          parametros({ nomeBeneficiario: "JOÃO ÁVILA", cidade: "GOIÂNIA" }),
        ),
      ),
    );
    expect(campos.get("59")).toBe("JOAO AVILA");
    expect(campos.get("60")).toBe("GOIANIA");
  });

  it("o payload emitido é inteiramente ASCII, que é o que o padrão admite", () => {
    const payload = comoOk(
      montarBrCode(parametros({ nomeBeneficiario: "MARIA DA CONCEIÇÃO" })),
    );
    expect(payload).toMatch(/^[\x20-\x7E]+$/);
  });
});
