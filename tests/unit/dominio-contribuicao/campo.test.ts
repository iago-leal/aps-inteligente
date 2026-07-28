// T005 (feature 019) — montagem TLV (RF-01; roadmap D-03). O comprimento é
// calculado, jamais escrito à mão: é o número que mais fácil se erra e o que o
// aplicativo do banco usa para fatiar a cadeia.
import { describe, expect, it } from "vitest";
import { campo, subtemplate } from "models/contribuicao/campo";

describe("campo(id, valor)", () => {
  it("prefixa o comprimento em dois dígitos decimais", () => {
    expect(campo("00", "01")).toBe("000201");
    expect(campo("53", "986")).toBe("5303986");
    expect(campo("58", "BR")).toBe("5802BR");
  });

  it("usa zero à esquerda quando o valor tem menos de dez caracteres", () => {
    expect(campo("60", "GOIANIA")).toBe("6007GOIANIA");
  });

  it("conta caracteres do valor, e não do campo montado", () => {
    const valor = "A".repeat(25);
    expect(campo("59", valor)).toBe(`5925${valor}`);
  });
});

describe("subtemplate(id, campos)", () => {
  it("compõe as triplas internas e declara o comprimento do conjunto", () => {
    const montado = subtemplate("26", [
      campo("00", "br.gov.bcb.pix"),
      campo("01", "chave"),
    ]);
    expect(montado).toBe("26270014br.gov.bcb.pix0105chave");
  });

  it("o comprimento declarado bate com o conteúdo interno", () => {
    const interno = campo("05", "***");
    const montado = subtemplate("62", [interno]);
    expect(montado.slice(0, 2)).toBe("62");
    expect(Number(montado.slice(2, 4))).toBe(interno.length);
    expect(montado.slice(4)).toBe(interno);
  });
});
