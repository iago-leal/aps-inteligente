// T004 (feature 019) — CRC16-CCITT/FALSE (RF-02; `interfaces/br-code.md` §3).
// O vetor conhecido é o que distingue esta variante de meia dúzia de outras com o
// mesmo polinômio: parâmetro trocado ainda produz quatro dígitos, e o erro só
// apareceria na câmera de quem tenta contribuir.
import { describe, expect, it } from "vitest";
import { crc16 } from "models/contribuicao/crc16";

describe("Vetor de teste do padrão (RF-02)", () => {
  it('a entrada "123456789" produz 29B1', () => {
    expect(crc16("123456789")).toBe("29B1");
  });

  it("a cadeia vazia produz FFFF, que é o valor inicial sem xor final", () => {
    expect(crc16("")).toBe("FFFF");
  });
});

describe("Forma da saída", () => {
  it("são sempre quatro dígitos hexadecimais maiúsculos, com zero à esquerda", () => {
    for (const entrada of ["A", "PIX", "000201", "63040000"]) {
      expect(crc16(entrada)).toMatch(/^[0-9A-F]{4}$/);
    }
  });

  it("cadeias distintas em um caractere produzem verificações distintas", () => {
    expect(crc16("5802BR5913FULANO DE TAL")).not.toBe(
      crc16("5802BR5913FULANA DE TAL"),
    );
  });
});

describe("A entrada inclui o próprio 6304 (armadilha do padrão)", () => {
  it("calcular com e sem o sufixo 6304 dá resultados diferentes", () => {
    const semSufixo = "00020126000052040000";
    expect(crc16(semSufixo)).not.toBe(crc16(`${semSufixo}6304`));
  });
});
