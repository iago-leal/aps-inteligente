// Teste da classificação literal (ação T013; RF-04; RN-04 a RN-07).
// Cobre o cenário 2 do `requirements.md` §7 ("a nomenclatura do IMC muda aos 5 anos").
//
// Cada borda é exercitada NO VALOR e imediatamente ACIMA e ABAIXO dele, porque a
// diferença entre `> +2` e `≥ +2` é a diferença entre dois laudos, e é o tipo de
// engano que sobrevive a qualquer teste de valor médio. Os rótulos são conferidos
// como TEXTO EXATO da caderneta, inclusive onde a concordância do original destoa:
// se a transcrição for "corrigida", este arquivo falha — que é o objetivo.
import { describe, expect, it } from "vitest";
import { classificar, cortesDe } from "models/puericultura/classificacao";
import { ErroDeInvariante } from "models/puericultura/tipos";

const AOS_SEIS_MESES = 180;
const AOS_TRES_ANOS = 1095;
const CINCO_ANOS = 1826;

describe("peso para idade (RN-04, pp. 89, 92, 95)", () => {
  const rotulo = (z: number) => classificar("peso-idade", z, AOS_SEIS_MESES);

  it("as quatro faixas, nos seus rótulos literais", () => {
    expect(rotulo(3)).toBe("Peso elevado para idade");
    expect(rotulo(0)).toBe("Peso adequado para idade");
    expect(rotulo(-2.5)).toBe("Baixo peso para idade");
    expect(rotulo(-4)).toBe("Muito baixo peso para idade");
  });

  it("borda +2: o valor exato ainda é adequado; acima dele, elevado", () => {
    expect(rotulo(2)).toBe("Peso adequado para idade");
    expect(rotulo(2.0001)).toBe("Peso elevado para idade");
  });

  it("borda −2: o valor exato ainda é adequado; abaixo, baixo peso", () => {
    expect(rotulo(-2)).toBe("Peso adequado para idade");
    expect(rotulo(-2.0001)).toBe("Baixo peso para idade");
  });

  it("borda −3: o valor exato ainda é baixo peso; abaixo, muito baixo", () => {
    expect(rotulo(-3)).toBe("Baixo peso para idade");
    expect(rotulo(-3.0001)).toBe("Muito baixo peso para idade");
  });

  it("o conjunto do peso não muda com a idade", () => {
    expect(cortesDe("peso-idade", 0)).toBe(cortesDe("peso-idade", 3682));
  });
});

describe("comprimento e estatura: sem categoria superior (RN-05)", () => {
  it("escore alto NÃO recebe rótulo de desvio — a fonte não o classifica", () => {
    expect(classificar("comprimento-estatura-idade", 5, AOS_SEIS_MESES)).toBe(
      "Comprimento adequada para idade",
    );
    expect(classificar("comprimento-estatura-idade", 5, AOS_TRES_ANOS)).toBe(
      "Estatura adequada para idade",
    );
  });

  it("nenhum conjunto de C-E/I tem faixa acima de zero", () => {
    for (const dias of [0, 730, 731, 3682]) {
      const cortes = cortesDe("comprimento-estatura-idade", dias);
      expect(cortes).toHaveLength(3);
      expect(cortes.some((c) => c.tipo === "acimaDe")).toBe(false);
    }
  });

  it("as bordas −2 e −3, nos dois substantivos", () => {
    expect(classificar("comprimento-estatura-idade", -2, AOS_SEIS_MESES)).toBe(
      "Comprimento adequada para idade",
    );
    expect(
      classificar("comprimento-estatura-idade", -2.0001, AOS_SEIS_MESES),
    ).toBe("Baixa comprimento para idade");
    expect(classificar("comprimento-estatura-idade", -3, AOS_SEIS_MESES)).toBe(
      "Baixa comprimento para idade",
    );
    expect(
      classificar("comprimento-estatura-idade", -3.0001, AOS_SEIS_MESES),
    ).toBe("Muito baixo comprimento para idade");

    expect(classificar("comprimento-estatura-idade", -2, AOS_TRES_ANOS)).toBe(
      "Estatura adequada para idade",
    );
    expect(
      classificar("comprimento-estatura-idade", -3.0001, AOS_TRES_ANOS),
    ).toBe("Muito baixa estatura para idade");
  });
});

describe("o substantivo do comprimento troca aos 2 anos (achado de T023, D-16)", () => {
  it("aos 730 dias ainda é comprimento; aos 731, estatura", () => {
    expect(classificar("comprimento-estatura-idade", -2.5, 730)).toBe(
      "Baixa comprimento para idade",
    );
    expect(classificar("comprimento-estatura-idade", -2.5, 731)).toBe(
      "Baixa estatura para idade",
    );
  });

  it("é a mesma fronteira da posição de medida, e não a dos cinco anos", () => {
    expect(cortesDe("comprimento-estatura-idade", 730)).not.toBe(
      cortesDe("comprimento-estatura-idade", 731),
    );
    expect(cortesDe("comprimento-estatura-idade", 731)).toBe(
      cortesDe("comprimento-estatura-idade", CINCO_ANOS),
    );
  });

  it("a transcrição preserva a concordância da fonte, destoante e tudo", () => {
    // "Comprimento adequada", "Baixa comprimento", "Muito baixo comprimento" estão
    // assim nos DOIS materiais, menino e menina (conferido em T023).
    const rotulos = cortesDe("comprimento-estatura-idade", 0).map(
      (c) => c.rotulo,
    );

    expect(rotulos).toEqual([
      "Comprimento adequada para idade",
      "Baixa comprimento para idade",
      "Muito baixo comprimento para idade",
    ]);
  });
});

describe("IMC: a troca de nomenclatura aos 5 anos (RN-06, cenário 2)", () => {
  const ateCinco = (z: number) => classificar("imc-idade", z, CINCO_ANOS - 1);
  const dosCinco = (z: number) => classificar("imc-idade", z, CINCO_ANOS);

  it("o cenário 2 em números: z = +2,5 aos 4a11m é Sobrepeso; aos 5a0m, Obesidade", () => {
    expect(ateCinco(2.5)).toBe("Sobrepeso");
    expect(dosCinco(2.5)).toBe("Obesidade");
  });

  it("os três rótulos superiores deslizam um degrau inteiro", () => {
    expect(ateCinco(3.5)).toBe("Obesidade");
    expect(dosCinco(3.5)).toBe("Obesidade grave");

    expect(ateCinco(1.5)).toBe("Risco de sobrepeso");
    expect(dosCinco(1.5)).toBe("Sobrepeso");
  });

  it("os três rótulos inferiores NÃO mudam: eutrofia, magreza e magreza acentuada", () => {
    for (const z of [0, -2.5, -4]) {
      expect(ateCinco(z)).toBe(dosCinco(z));
    }
    expect(ateCinco(0)).toBe("Eutrofia");
    expect(ateCinco(-2.5)).toBe("Magreza");
    expect(ateCinco(-4)).toBe("Magreza acentuada");
  });

  it("a troca é no dia 1826, não no 1825 nem no 1856 (fronteira DE RÓTULO, D-05)", () => {
    expect(classificar("imc-idade", 2.5, 1825)).toBe("Sobrepeso");
    expect(classificar("imc-idade", 2.5, 1826)).toBe("Obesidade");
    // Entre 1826 e 1856 já valem os rótulos de cima, embora a TABELA ainda seja a de baixo.
    expect(classificar("imc-idade", 2.5, 1856)).toBe("Obesidade");
  });

  it("as bordas +1, +2 e +3 são estritas, e −2 e −3 são inclusivas", () => {
    expect(ateCinco(1)).toBe("Eutrofia");
    expect(ateCinco(1.0001)).toBe("Risco de sobrepeso");
    expect(ateCinco(2)).toBe("Risco de sobrepeso");
    expect(ateCinco(2.0001)).toBe("Sobrepeso");
    expect(ateCinco(3)).toBe("Sobrepeso");
    expect(ateCinco(3.0001)).toBe("Obesidade");
    expect(ateCinco(-2)).toBe("Eutrofia");
    expect(ateCinco(-2.0001)).toBe("Magreza");
    expect(ateCinco(-3)).toBe("Magreza");
    expect(ateCinco(-3.0001)).toBe("Magreza acentuada");
  });
});

describe("perímetro cefálico: três faixas, sem corte em ±3 (RN-07, p. 88)", () => {
  const rotulo = (z: number) => classificar("perimetro-cefalico-idade", z, 180);

  it("os três rótulos literais, com a sigla que a fonte usa", () => {
    expect(rotulo(3)).toBe("PC acima do esperado para a idade");
    expect(rotulo(0)).toBe("PC adequado para idade");
    expect(rotulo(-3)).toBe("PC abaixo do esperado para idade");
  });

  it("não há faixa em ±3: −4 e −2,5 recebem o mesmo rótulo", () => {
    expect(rotulo(-4)).toBe(rotulo(-2.5));
    expect(cortesDe("perimetro-cefalico-idade", 180)).toHaveLength(3);
  });

  it("as bordas ±2, nos dois sentidos", () => {
    expect(rotulo(2)).toBe("PC adequado para idade");
    expect(rotulo(2.0001)).toBe("PC acima do esperado para a idade");
    expect(rotulo(-2)).toBe("PC adequado para idade");
    expect(rotulo(-2.0001)).toBe("PC abaixo do esperado para idade");
  });
});

describe("guardas do módulo", () => {
  it("escore não finito é bug interno, não rótulo", () => {
    expect(() => classificar("peso-idade", Number.NaN, 180)).toThrow(
      ErroDeInvariante,
    );
    expect(() =>
      classificar("peso-idade", Number.POSITIVE_INFINITY, 180),
    ).toThrow(ErroDeInvariante);
  });

  it("todo conjunto termina numa faixa que recolhe o resto", () => {
    const indices = [
      "peso-idade",
      "comprimento-estatura-idade",
      "imc-idade",
      "perimetro-cefalico-idade",
    ] as const;

    for (const indice of indices) {
      for (const dias of [0, 730, 731, 1825, 1826, 3682]) {
        const cortes = cortesDe(indice, dias);
        expect(cortes.at(-1)?.tipo).toBe("abaixoDeTudo");
        expect(classificar(indice, -99, dias)).toBe(cortes.at(-1)?.rotulo);
      }
    }
  });
});
