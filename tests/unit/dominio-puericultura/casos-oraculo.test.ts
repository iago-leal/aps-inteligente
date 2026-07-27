// Teste dos casos-oráculo congelados, pela FACHADA (ação T019; RF-02, RF-03).
// Feature 017-puericultura-crescimento.
//
// A diferença deste arquivo para `lms.test.ts` (T010) é o alcance: lá o oráculo
// entra direto na função de cálculo, com o `L/M/S` da própria linha; aqui ele entra
// pela porta da frente, como o prescritor entraria — sexo, datas e uma medida —, e o
// motor tem de encontrar sozinho a tabela, a linha e a régua. É a cadeia inteira sob
// prova: datas → escopo → padrão → leitura → LMS → cauda → classificação.
//
// **A divergência de mês inteiro (D-06), explicitada.** De 5 a 10 anos a OMS publica
// por MÊS, e o motor lê o mês completo `⌊dias / 30,4375⌋` sem interpolar. O oráculo,
// portanto, só é exato em idades que caiam dentro do mês tabelado — e, dentro dele,
// em QUALQUER dia, porque todos leem a mesma linha. Os casos mensais abaixo usam o
// primeiro dia de cada mês, e um teste próprio prova que o último dia do mesmo mês
// devolve escore idêntico. É a consequência assumida de D-06, não um efeito colateral.
import { describe, expect, it } from "vitest";
import { CalculadoraCrescimentoInfantil } from "models/puericultura/calculadora";
import { DIAS_POR_MES } from "models/puericultura/oms/leitura";
import { posicaoEsperadaEm } from "models/puericultura/medidas";
import type { EntradaAvaliacao, Indice, Sexo } from "models/puericultura/tipos";
import { comoCalculado, dataApos } from "../../apoio/puericultura";
import oraculo from "../../apoio/casos-oraculo-puericultura.json";

const calculadora = new CalculadoraCrescimentoInfantil();
const { toleranciaEmZ, dados } = oraculo.oms;
const NASCIMENTO = "2016-01-10";

const INDICE_DO_INDICADOR: Readonly<Record<string, Indice>> = {
  peso: "peso-idade",
  "comprimento-estatura": "comprimento-estatura-idade",
  imc: "imc-idade",
  "perimetro-cefalico": "perimetro-cefalico-idade",
};

/**
 * A idade em dias que faz o motor ler exatamente aquela linha. Nas tabelas diárias a
 * chave É a idade; nas mensais, o primeiro dia do mês tabelado.
 */
function diasQueLeem(chave: number, unidade: string): number {
  return unidade === "dia" ? chave : Math.ceil(chave * DIAS_POR_MES);
}

/**
 * Entrada mínima que faz o índice consumir exatamente `medida`. O IMC é o único
 * indireto: com 100 cm de comprimento, o IMC é numericamente igual ao peso, porque
 * o denominador vale 1 m². A posição informada é sempre a esperada para a idade, de
 * modo que nenhuma conversão de 0,7 cm interfira no valor sob prova.
 */
function entradaPara(
  indice: Indice,
  medida: number,
  sexo: Sexo,
  dias: number,
): EntradaAvaliacao {
  const base = {
    sexo,
    dataDeNascimento: NASCIMENTO,
    dataDaMedicao: dataApos(NASCIMENTO, dias),
  };

  switch (indice) {
    case "peso-idade":
      return { ...base, pesoKg: medida };
    case "comprimento-estatura-idade":
      return {
        ...base,
        comprimentoCm: medida,
        posicaoDaMedicao: posicaoEsperadaEm(dias),
      };
    case "imc-idade":
      return {
        ...base,
        pesoKg: medida,
        comprimentoCm: 100,
        posicaoDaMedicao: posicaoEsperadaEm(dias),
      };
    case "perimetro-cefalico-idade":
      return { ...base, perimetroCefalicoCm: medida };
  }
}

function escoreDe(
  indice: Indice,
  medida: number,
  sexo: Sexo,
  dias: number,
): number {
  const saida = calculadora.avaliar(entradaPara(indice, medida, sexo, dias));
  if (saida.tipo !== "resultado") {
    throw new Error(
      `Esperava resultado para ${indice} em ${dias} dias, veio ${JSON.stringify(saida).slice(0, 200)}`,
    );
  }
  return comoCalculado(saida, indice).escoreZ;
}

describe("o motor reproduz os 356 casos congelados, pela fachada", () => {
  it("cada medida publicada em SDn devolve o escore n, nos nove desvios", () => {
    let avaliacoes = 0;
    let piorDesvio = 0;
    let piorCaso = "";

    for (const bloco of dados) {
      const indice = INDICE_DO_INDICADOR[bloco.indicador];
      const sexo = bloco.sexo as Sexo;

      for (const caso of bloco.casos) {
        const dias = diasQueLeem(caso.indice, bloco.unidadeDoIndice);

        for (const [chave, medida] of Object.entries(caso.sd)) {
          const n = Number(chave.slice(1));
          const desvio = Math.abs(escoreDe(indice, medida, sexo, dias) - n);

          if (desvio > piorDesvio) {
            piorDesvio = desvio;
            piorCaso = `${bloco.modulo} chave ${caso.indice} z=${n}`;
          }
          avaliacoes += 1;
        }
      }
    }

    expect(avaliacoes).toBe(3204);
    expect(piorDesvio, `pior caso: ${piorCaso}`).toBeLessThan(toleranciaEmZ);
  });

  it("os desvios de ±4 entram na conta, e é a cauda que os faz fechar no peso", () => {
    // A afirmação acima cobre −4 a +4. Este caso isola o que ela esconde: nos
    // indicadores de peso, o valor de ±4 publicado só devolve ±4 porque a correção
    // de cauda foi aplicada — e a fachada a aplica sem que o chamador peça.
    const aoNascer = dados.find((b) => b.modulo === "peso-idade-0-5-masculino")!
      .casos[0];

    expect(aoNascer.indice).toBe(0);
    expect(
      escoreDe("peso-idade", aoNascer.sd["z4"], "masculino", 0),
    ).toBeCloseTo(4, 2);
    expect(
      escoreDe("peso-idade", aoNascer.sd["z-4"], "masculino", 0),
    ).toBeCloseTo(-4, 2);
  });

  it("a mediana de cada linha devolve escore zero pela fachada", () => {
    for (const bloco of dados) {
      const indice = INDICE_DO_INDICADOR[bloco.indicador];
      const sexo = bloco.sexo as Sexo;

      for (const caso of bloco.casos) {
        const dias = diasQueLeem(caso.indice, bloco.unidadeDoIndice);
        expect(Math.abs(escoreDe(indice, caso.m, sexo, dias))).toBeLessThan(
          toleranciaEmZ,
        );
      }
    }
  });
});

describe("a divergência de mês inteiro, declarada (D-06)", () => {
  const primeiroCasoMensal = dados.find(
    (b) => b.modulo === "peso-idade-5-10-masculino",
  )!.casos[0];

  it("todo dia do mesmo mês tabelado devolve o MESMO escore, sem interpolar", () => {
    const mes = primeiroCasoMensal.indice;
    const primeiroDia = Math.ceil(mes * DIAS_POR_MES);
    const ultimoDia = Math.ceil((mes + 1) * DIAS_POR_MES) - 1;
    const medida = primeiroCasoMensal.m;

    expect(mes).toBe(61);
    expect(primeiroDia).toBe(1857);
    expect(ultimoDia).toBe(1887);

    const noPrimeiro = escoreDe("peso-idade", medida, "masculino", primeiroDia);
    const noUltimo = escoreDe("peso-idade", medida, "masculino", ultimoDia);

    expect(noUltimo).toBe(noPrimeiro);
  });

  it("o mês seguinte já devolve outro escore: a leitura muda de linha, e só", () => {
    const medida = primeiroCasoMensal.m;
    const noMes61 = escoreDe("peso-idade", medida, "masculino", 1857);
    const noMes62 = escoreDe("peso-idade", medida, "masculino", 1888);

    expect(noMes62).not.toBe(noMes61);
  });

  it("é isto que diverge do software oficial da OMS, que interpola entre meses", () => {
    // O `anthroplus` estimaria um valor intermediário para o dia 1872; aqui, o
    // escore é o da linha publicada do mês 61, e nenhum número é estimado.
    const medida = primeiroCasoMensal.m;

    expect(escoreDe("peso-idade", medida, "masculino", 1872)).toBe(
      escoreDe("peso-idade", medida, "masculino", 1857),
    );
  });

  it("abaixo dos 5 anos a divergência não existe: a OMS publica por dia", () => {
    const casoDiario = dados.find(
      (b) => b.modulo === "peso-idade-0-5-masculino",
    )!.casos[10];
    const dia = casoDiario.indice;

    expect(escoreDe("peso-idade", casoDiario.m, "masculino", dia)).not.toBe(
      escoreDe("peso-idade", casoDiario.m, "masculino", dia + 1),
    );
  });
});

describe("as fronteiras obrigatórias da amostra chegam íntegras à fachada", () => {
  it("cada caso com o campo `porque` nomeia a decisão do plano que ele prova", () => {
    const comPorque = dados.flatMap((bloco) =>
      bloco.casos
        .filter((caso) => "porque" in caso && caso.porque)
        .map((caso) => ({ modulo: bloco.modulo, ...caso })),
    );

    expect(comPorque.length).toBeGreaterThan(0);
    for (const caso of comPorque) {
      expect(typeof caso.porque).toBe("string");
      expect((caso.porque as string).length).toBeGreaterThan(0);
    }
  });

  it("a última linha da tabela diária (1856) e a primeira da mensal (mês 61) fecham", () => {
    const diaria = dados.find((b) => b.modulo === "peso-idade-0-5-masculino")!;
    const ultima = diaria.casos.find((c) => c.indice === 1856);
    const mensal = dados.find((b) => b.modulo === "peso-idade-5-10-masculino")!;
    const primeira = mensal.casos.find((c) => c.indice === 61);

    expect(ultima).toBeDefined();
    expect(primeira).toBeDefined();
    expect(ultima!.m).toBe(18.4968);
    expect(primeira!.m).toBe(18.5057);

    expect(escoreDe("peso-idade", ultima!.m, "masculino", 1856)).toBeCloseTo(
      0,
      5,
    );
    expect(escoreDe("peso-idade", primeira!.m, "masculino", 1857)).toBeCloseTo(
      0,
      5,
    );
  });
});
