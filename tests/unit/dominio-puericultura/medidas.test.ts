// Teste da conversão de posição e do IMC (ação T016; RF-08, RN-09; D-11, D-16).
// Cobre o cenário 4 do `requirements.md` §7 ("medição em pé antes dos 2 anos").
//
// A fronteira dos dois anos é exercitada no par 730/731 dias, que é onde a caderneta
// troca a posição esperada. Aplicar a conversão a um dos lados e não ao outro produz
// erro de 0,7 cm sob rótulo certo — o modo de falha que o roadmap §9 vigia.
import { describe, expect, it } from "vitest";
import {
  converterPosicao,
  derivarMedidas,
  imcDe,
  posicaoEsperadaEm,
} from "models/puericultura/medidas";
import { dataApos, entradaAvaliacao } from "../../apoio/puericultura";

const NASCIMENTO = "2024-01-10";

function medidasApos(
  dias: number,
  extras: Parameters<typeof entradaAvaliacao>[0],
) {
  return derivarMedidas(
    entradaAvaliacao({
      dataDeNascimento: NASCIMENTO,
      dataDaMedicao: dataApos(NASCIMENTO, dias),
      ...extras,
    }),
    dias,
  );
}

describe("a posição que a curva espera em cada idade (D-16, p. 85)", () => {
  it("deitado até 730 dias, em pé de 731 em diante", () => {
    expect(posicaoEsperadaEm(0)).toBe("deitado");
    expect(posicaoEsperadaEm(730)).toBe("deitado");
    expect(posicaoEsperadaEm(731)).toBe("em-pe");
    expect(posicaoEsperadaEm(3682)).toBe("em-pe");
  });
});

describe("conversão de +0,7 cm: medida em pé antes dos 2 anos (cenário 4)", () => {
  it("criança de 1 ano e 8 meses medida em pé, 82,0 cm → o índice usa 82,7 cm", () => {
    const convertido = converterPosicao(82.0, "em-pe", 608);

    expect(convertido.valorCm).toBeCloseTo(82.7, 10);
    expect(convertido.aviso).not.toBeNull();
    expect(convertido.aviso?.codigo).toBe("CONVERSAO_DE_POSICAO_APLICADA");
    expect(convertido.aviso?.campo).toBe("comprimentoCm");
    expect(convertido.aviso?.mensagem).toContain("somados 0,7 cm");
    expect(convertido.aviso?.mensagem).toContain("82,0 cm → 82,7 cm");
    expect(convertido.aviso?.mensagem).toContain("p. 85");
  });

  it("medida deitada antes dos 2 anos é a esperada: nada a converter, nenhum aviso", () => {
    const convertido = converterPosicao(82.0, "deitado", 608);

    expect(convertido.valorCm).toBe(82.0);
    expect(convertido.aviso).toBeNull();
  });
});

describe("conversão de −0,7 cm: medida deitada com 2 anos ou mais (RF-08)", () => {
  it("criança de 2a3m medida deitada, 90,0 cm → o índice usa 89,3 cm", () => {
    const convertido = converterPosicao(90.0, "deitado", 821);

    expect(convertido.valorCm).toBeCloseTo(89.3, 10);
    expect(convertido.aviso?.mensagem).toContain("subtraídos 0,7 cm");
    expect(convertido.aviso?.mensagem).toContain("90,0 cm → 89,3 cm");
  });

  it("medida em pé com 2 anos ou mais é a esperada: nada a converter", () => {
    const convertido = converterPosicao(90.0, "em-pe", 821);

    expect(convertido.valorCm).toBe(90.0);
    expect(convertido.aviso).toBeNull();
  });
});

describe("o par de limite 730/731 dias, nas duas direções (D-16)", () => {
  it("aos 730 dias, deitado ainda é o esperado e em pé é que converte", () => {
    expect(converterPosicao(87.0, "deitado", 730).aviso).toBeNull();
    expect(converterPosicao(87.0, "em-pe", 730).valorCm).toBeCloseTo(87.7, 10);
  });

  it("aos 731 dias a expectativa se inverte, e com ela o sinal da conversão", () => {
    expect(converterPosicao(87.0, "em-pe", 731).aviso).toBeNull();
    expect(converterPosicao(87.0, "deitado", 731).valorCm).toBeCloseTo(
      86.3,
      10,
    );
  });

  it("um único dia inverte o sinal: 1,4 cm separam as duas leituras da mesma medida", () => {
    const antes = converterPosicao(87.0, "deitado", 730).valorCm;
    const depois = converterPosicao(87.0, "deitado", 731).valorCm;

    expect(antes - depois).toBeCloseTo(0.7, 10);
  });
});

describe("IMC sobre a medida já convertida (D-11)", () => {
  it("é peso dividido pelo quadrado da estatura em metros", () => {
    expect(imcDe(12.5, 90)).toBeCloseTo(12.5 / 0.81, 10);
    expect(imcDe(8.2, 68.5)).toBeCloseTo(8.2 / 0.685 ** 2, 10);
  });

  it("usa a medida convertida, não a bruta: os dois índices leem a mesma altura", () => {
    const medidas = medidasApos(821, {
      pesoKg: 12.5,
      comprimentoCm: 90.0,
      posicaoDaMedicao: "deitado",
    });

    expect(medidas.comprimentoCm).toBeCloseTo(89.3, 10);
    expect(medidas.imc).toBeCloseTo(imcDe(12.5, 89.3), 10);
    // A diferença contra o IMC da medida bruta é real, não arredondamento.
    expect(Math.abs(medidas.imc! - imcDe(12.5, 90.0))).toBeGreaterThan(0.02);
  });

  it("o aviso da conversão acompanha as medidas derivadas", () => {
    const medidas = medidasApos(821, {
      pesoKg: 12.5,
      comprimentoCm: 90.0,
      posicaoDaMedicao: "deitado",
    });

    expect(medidas.avisos).toHaveLength(1);
    expect(medidas.avisos[0].codigo).toBe("CONVERSAO_DE_POSICAO_APLICADA");
  });
});

describe("medida ausente suprime só o que dela depende (RF-06)", () => {
  it("sem comprimento não há comprimento nem IMC, e isso não é erro", () => {
    const medidas = medidasApos(300, {
      pesoKg: 8.2,
      comprimentoCm: undefined,
      posicaoDaMedicao: undefined,
    });

    expect(medidas.comprimentoCm).toBeUndefined();
    expect(medidas.imc).toBeUndefined();
    expect(medidas.avisos).toEqual([]);
  });

  it("sem peso há comprimento convertido, mas não há IMC", () => {
    const medidas = medidasApos(821, {
      pesoKg: undefined,
      comprimentoCm: 90.0,
      posicaoDaMedicao: "deitado",
    });

    expect(medidas.comprimentoCm).toBeCloseTo(89.3, 10);
    expect(medidas.imc).toBeUndefined();
    // A conversão ocorreu e continua declarada, ainda que o IMC não exista.
    expect(medidas.avisos).toHaveLength(1);
  });
});
