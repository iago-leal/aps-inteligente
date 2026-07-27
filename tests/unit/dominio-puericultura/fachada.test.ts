// Teste da fachada (ação T018; RF-01, RF-06, RF-07, RF-16 a RF-20).
// Um caso nomeado por cenário Gherkin de `requirements.md` §7 — o mapa completo dos
// dezoito cenários está na seção "Cobertura dos cenários" do `actions.md`. Aqui
// correm os que atravessam a cadeia inteira: validar → datar → escopo → medidas →
// escolher o padrão → ler a régua → classificar.
//
// O que só a fachada prova, e nenhum módulo isolado provaria: que as decisões
// tomadas em arquivos diferentes chegam COERENTES ao mesmo resultado — a régua
// escolhida, a idade que a indexa, o rótulo da faixa e a página da referência.
import { describe, expect, it } from "vitest";
import { CalculadoraCrescimentoInfantil } from "models/puericultura/calculadora";
import type { EntradaAvaliacao } from "models/puericultura/tipos";
import {
  comoCalculado,
  comoResultado,
  dataApos,
  entradaAvaliacao,
  indiceDe,
} from "../../apoio/puericultura";

const calculadora = new CalculadoraCrescimentoInfantil();

const NASCIMENTO = "2024-01-10";

function avaliarApos(dias: number, extras: Partial<EntradaAvaliacao> = {}) {
  return calculadora.avaliar(
    entradaAvaliacao({
      dataDeNascimento: NASCIMENTO,
      dataDaMedicao: dataApos(NASCIMENTO, dias),
      ...extras,
    }),
  );
}

describe("cenário 1: lactente a termo com medidas completas", () => {
  const resultado = comoResultado(calculadora.avaliar(entradaAvaliacao()));

  it("devolve os quatro índices, cada um com escore z", () => {
    expect(resultado.indices).toHaveLength(4);
    expect(resultado.indices.map((i) => i.indice)).toEqual([
      "peso-idade",
      "comprimento-estatura-idade",
      "imc-idade",
      "perimetro-cefalico-idade",
    ]);

    for (const indice of resultado.indices) {
      expect(indice.estado).toBe("calculado");
    }
  });

  it("cada índice traz a classificação literal da caderneta", () => {
    // Menino de 212 dias, 8,2 kg, 68,5 cm e 44,0 cm de perímetro cefálico.
    expect(comoCalculado(resultado, "peso-idade").classificacao).toBe(
      "Peso adequado para idade",
    );
    expect(
      comoCalculado(resultado, "comprimento-estatura-idade").classificacao,
    ).toBe("Comprimento adequado para idade");
    expect(comoCalculado(resultado, "imc-idade").classificacao).toBe(
      "Eutrofia",
    );
    expect(
      comoCalculado(resultado, "perimetro-cefalico-idade").classificacao,
    ).toBe("PC adequado para idade");
  });

  it("cada índice declara o padrão usado, a idade usada e a página (RF-20)", () => {
    for (const indice of resultado.indices) {
      if (indice.estado !== "calculado") throw new Error("esperava calculado");

      expect(indice.padrao).toBe("OMS");
      expect(indice.idadeUsada).toEqual({
        especie: "cronologica",
        valor: 212,
        unidade: "dia",
      });
      expect(indice.referencia.localizacao).toMatch(/^p\. \d{2},/);
      expect(indice.referencia.versaoEdicao).toContain("2.ª ed.");
    }
  });

  it("as páginas são as do gráfico de cada índice na faixa de 0 a 2 anos", () => {
    expect(
      comoCalculado(resultado, "peso-idade").referencia.localizacao,
    ).toContain("p. 89");
    expect(
      comoCalculado(resultado, "comprimento-estatura-idade").referencia
        .localizacao,
    ).toContain("p. 90");
    expect(
      comoCalculado(resultado, "imc-idade").referencia.localizacao,
    ).toContain("p. 91");
    expect(
      comoCalculado(resultado, "perimetro-cefalico-idade").referencia
        .localizacao,
    ).toContain("p. 88");
  });

  it("o resultado carrega a nota de proveniência e ao menos uma referência", () => {
    expect(resultado.notaProveniencia).toContain("medição isolada");
    expect(resultado.notaProveniencia).toContain("tendência");
    expect(resultado.referencias.length).toBeGreaterThan(0);
  });
});

describe("cenário 5: prematuro dentro da janela das curvas de pré-termo", () => {
  // Menino nascido com 32 semanas, medido 4 semanas depois: 36 pós-menstruais.
  const saida = avaliarApos(28, {
    idadeGestacionalAoNascer: { semanas: 32, dias: 0 },
    pesoKg: 2.5,
    comprimentoCm: 46.5,
    posicaoDaMedicao: "deitado",
    perimetroCefalicoCm: 32.7,
  });

  it("peso, comprimento e PC são lidos nas curvas INTERGROWTH-21st", () => {
    const resultado = comoResultado(saida);

    for (const indice of [
      "peso-idade",
      "comprimento-estatura-idade",
      "perimetro-cefalico-idade",
    ] as const) {
      const calculado = comoCalculado(resultado, indice);
      expect(calculado.padrao).toBe("INTERGROWTH-21st");
      expect(calculado.idadeUsada).toEqual({
        especie: "pos-menstrual",
        valor: 36,
        unidade: "semana",
      });
      expect(calculado.referencia.localizacao).toContain("p. 87");
    }
  });

  it("os escores são próximos de zero: as medidas são as medianas de 36 semanas", () => {
    const resultado = comoResultado(saida);

    for (const indice of [
      "peso-idade",
      "comprimento-estatura-idade",
      "perimetro-cefalico-idade",
    ] as const) {
      expect(Math.abs(comoCalculado(resultado, indice).escoreZ)).toBeLessThan(
        0.1,
      );
    }
  });

  it("o IMC não é exibido, por não existir nessas curvas — e não é erro", () => {
    const resultado = comoResultado(saida);
    const imc = indiceDe(resultado, "imc-idade");

    expect(imc.estado).toBe("ausente");
    expect(imc).toEqual({
      estado: "ausente",
      indice: "imc-idade",
      motivo: "IMC_INEXISTENTE_NO_PRETERMO",
    });
  });
});

describe("cenário 6: transferência do pré-termo para as curvas da OMS", () => {
  const ig32 = { semanas: 32, dias: 0 };
  const medidas = {
    pesoKg: 7.8,
    comprimentoCm: 66.8,
    posicaoDaMedicao: "deitado" as const,
    perimetroCefalicoCm: 43.0,
  };

  it("com 64 semanas pós-menstruais, os índices declaram INTERGROWTH-21st", () => {
    const saida = avaliarApos(224, {
      idadeGestacionalAoNascer: ig32,
      ...medidas,
    });
    const resultado = comoResultado(saida);

    expect(comoCalculado(resultado, "peso-idade").padrao).toBe(
      "INTERGROWTH-21st",
    );
    expect(comoCalculado(resultado, "peso-idade").idadeUsada.valor).toBe(64);
  });

  it("com 65 semanas, passam a declarar a OMS e a idade corrigida com o desconto", () => {
    const saida = avaliarApos(231, {
      idadeGestacionalAoNascer: ig32,
      ...medidas,
    });
    const resultado = comoResultado(saida);
    const peso = comoCalculado(resultado, "peso-idade");

    expect(peso.padrao).toBe("OMS");
    expect(peso.idadeUsada).toEqual({
      especie: "corrigida",
      valor: 231 - 56,
      unidade: "dia",
      descontoDeSemanas: 8,
    });
  });

  it("o IMC, ausente na véspera, passa a ser calculado do outro lado da fronteira", () => {
    const antes = avaliarApos(224, {
      idadeGestacionalAoNascer: ig32,
      ...medidas,
    });
    const depois = avaliarApos(231, {
      idadeGestacionalAoNascer: ig32,
      ...medidas,
    });

    expect(indiceDe(comoResultado(antes), "imc-idade").estado).toBe("ausente");
    expect(indiceDe(comoResultado(depois), "imc-idade").estado).toBe(
      "calculado",
    );
  });
});

describe("cenário 8: idade gestacional não informada", () => {
  it("o resultado declara que a criança foi tratada como nascida a termo", () => {
    const saida = avaliarApos(212, { idadeGestacionalAoNascer: undefined });
    const resultado = comoResultado(saida);

    expect(resultado.notas).toHaveLength(1);
    expect(resultado.notas[0].tipo).toBe("PREMISSA_DE_TERMO");
    expect(resultado.notas[0].mensagem).toContain(
      "tratada como nascida a termo",
    );
    expect(resultado.notas[0].referencia.localizacao).toContain("p. 86");
  });

  it("nenhuma correção é aplicada, e a idade usada é a cronológica", () => {
    const saida = avaliarApos(212, { idadeGestacionalAoNascer: undefined });
    const resultado = comoResultado(saida);

    expect(resultado.idades.correcaoAtiva).toBe(false);
    expect(resultado.idades.descontoDeSemanas).toBe(0);
    expect(comoCalculado(resultado, "peso-idade").idadeUsada.especie).toBe(
      "cronologica",
    );
  });

  it("com IG de 39 semanas, a nota muda de tipo mas a ausência de correção permanece", () => {
    const saida = avaliarApos(212, {
      idadeGestacionalAoNascer: { semanas: 39, dias: 0 },
    });
    const resultado = comoResultado(saida);

    expect(resultado.notas[0].tipo).toBe("NASCIDO_A_TERMO_SEM_CORRECAO");
    expect(resultado.idades.correcaoAtiva).toBe(false);
  });
});

describe("cenário 9: medida ausente não invalida as demais (RF-06)", () => {
  it("criança de 3 anos com peso e estatura, sem perímetro cefálico", () => {
    const saida = avaliarApos(1095, {
      pesoKg: 14.3,
      comprimentoCm: 96.1,
      posicaoDaMedicao: "em-pe",
      perimetroCefalicoCm: undefined,
    });
    const resultado = comoResultado(saida);

    expect(comoCalculado(resultado, "peso-idade").estado).toBe("calculado");
    expect(comoCalculado(resultado, "comprimento-estatura-idade").estado).toBe(
      "calculado",
    );
    expect(comoCalculado(resultado, "imc-idade").estado).toBe("calculado");
  });

  it("só com peso, os outros três saem ausentes e nenhum erro é devolvido", () => {
    const saida = avaliarApos(212, {
      pesoKg: 8.2,
      comprimentoCm: undefined,
      posicaoDaMedicao: undefined,
      perimetroCefalicoCm: undefined,
    });
    const resultado = comoResultado(saida);

    expect(comoCalculado(resultado, "peso-idade").estado).toBe("calculado");
    for (const indice of [
      "comprimento-estatura-idade",
      "imc-idade",
      "perimetro-cefalico-idade",
    ] as const) {
      expect(indiceDe(resultado, indice)).toEqual({
        estado: "ausente",
        indice,
        motivo: "MEDIDA_NAO_INFORMADA",
      });
    }
  });

  it("o IMC cai sozinho quando falta o peso, sem derrubar a estatura", () => {
    const saida = avaliarApos(1095, {
      pesoKg: undefined,
      comprimentoCm: 96.1,
      posicaoDaMedicao: "em-pe",
    });
    const resultado = comoResultado(saida);

    expect(comoCalculado(resultado, "comprimento-estatura-idade").estado).toBe(
      "calculado",
    );
    expect(indiceDe(resultado, "imc-idade").estado).toBe("ausente");
  });
});

describe("cenário 4 na fachada: a conversão de posição chega aos dois índices", () => {
  it("medida deitada aos 2a3m converte, e o aviso acompanha estatura e IMC", () => {
    const saida = avaliarApos(821, {
      pesoKg: 12.5,
      comprimentoCm: 90.0,
      posicaoDaMedicao: "deitado",
      perimetroCefalicoCm: undefined,
    });
    const resultado = comoResultado(saida);

    const estatura = comoCalculado(resultado, "comprimento-estatura-idade");
    const imc = comoCalculado(resultado, "imc-idade");

    expect(estatura.avisos).toHaveLength(1);
    expect(estatura.avisos[0].codigo).toBe("CONVERSAO_DE_POSICAO_APLICADA");
    expect(imc.avisos).toHaveLength(1);
    // O peso não depende da medida convertida e não carrega o aviso.
    expect(comoCalculado(resultado, "peso-idade").avisos).toEqual([]);
  });

  it("a referência da regra dos 0,7 cm entra na lista do resultado", () => {
    const saida = avaliarApos(821, {
      pesoKg: 12.5,
      comprimentoCm: 90.0,
      posicaoDaMedicao: "deitado",
      perimetroCefalicoCm: undefined,
    });
    const resultado = comoResultado(saida);

    expect(
      resultado.referencias.some((r) => r.localizacao.includes("0,7 cm")),
    ).toBe(true);
  });
});

describe("injeção do acervo (D-08)", () => {
  it("a fachada sem argumento usa o acervo real embarcado", () => {
    const semArgumento = new CalculadoraCrescimentoInfantil();
    const saida = semArgumento.avaliar(entradaAvaliacao());

    expect(saida.tipo).toBe("resultado");
  });
});
