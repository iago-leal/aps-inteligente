// Teste da leitura das tabelas da OMS (ação T011; RF-02, RF-07, RN-02, RN-08).
// Vigia as três fronteiras que o roadmap §9 classifica como modo de falha alto ou
// médio: as DUAS dos cinco anos (D-05/D-06), a superior dos dez (D-15) e a dos dois
// anos do perímetro cefálico (D-16). Cada uma é exercitada no PAR de dias que a
// define — o último que entra e o primeiro que sai —, porque errar por um dia é
// justamente o que um teste de valor médio não pega.
//
// Os valores conferidos contra o acervo real são os do contrato de aquisição
// (`interfaces/tabelas-de-referencia.md` §5, verificação V7) e o do spike de D-14.
import { describe, expect, it } from "vitest";
import {
  DIAS_POR_MES,
  PRIMEIRO_MES_DA_TABELA_POR_MES,
  REPOSITORIO_OMS,
  ULTIMO_DIA_COBERTO,
  ULTIMO_DIA_DA_TABELA_POR_DIA,
  ULTIMO_DIA_DO_PERIMETRO_CEFALICO,
  ULTIMO_MES_DA_TABELA_POR_MES,
  conferirTabela,
  lerLms,
  mesCompletoDe,
} from "models/puericultura/oms/leitura";
import { ErroDeInvariante } from "models/puericultura/tipos";
import {
  repositorioSintetico,
  tabelaSintetica,
} from "../../apoio/puericultura";

function lida(...args: Parameters<typeof lerLms>) {
  const leitura = lerLms(...args);
  if (leitura.tipo !== "lida") {
    throw new Error(`Esperava leitura, veio ${JSON.stringify(leitura)}`);
  }
  return leitura;
}

describe("leitura por dia inteiro até os cinco anos (D-06)", () => {
  it("lê a linha do dia, sem interpolar nem arredondar", () => {
    // Âncora do spike de D-14: peso masculino em Day = 1856.
    const leitura = lida("peso-idade", "masculino", 1856);

    expect(leitura.unidade).toBe("dia");
    expect(leitura.chave).toBe(1856);
    expect(leitura.parametros).toEqual({ l: -0.1534, m: 18.4968, s: 0.1358 });
  });

  it("dias vizinhos devolvem linhas distintas — a busca é aritmética, não por faixa", () => {
    const m = (dias: number) =>
      lida("peso-idade", "masculino", dias).parametros.m;

    expect(m(1825)).toBe(18.3298);
    expect(m(1826)).toBe(18.3352);
    expect(m(1855)).toBe(18.4914);
  });
});

describe("a fronteira DE TABELA dos cinco anos (D-05)", () => {
  it("o dia 1856 ainda é a tabela de 2006, por dia", () => {
    const leitura = lida(
      "peso-idade",
      "masculino",
      ULTIMO_DIA_DA_TABELA_POR_DIA,
    );

    expect(leitura.unidade).toBe("dia");
    expect(leitura.chave).toBe(1856);
    expect(leitura.parametros.m).toBe(18.4968);
  });

  it("o dia 1857 já é a referência de 2007, no mês 61 (V7 do contrato)", () => {
    const menino = lida("peso-idade", "masculino", 1857);
    const menina = lida("peso-idade", "feminino", 1857);

    expect(menino.unidade).toBe("mes");
    expect(menino.chave).toBe(PRIMEIRO_MES_DA_TABELA_POR_MES);
    expect(menino.parametros.m).toBe(18.5057);
    expect(menina.parametros.m).toBe(18.2579);
  });

  it("as duas tabelas se encaixam sem buraco nem sobreposição", () => {
    // O último dia de 2006 é 1856; o mês 61 de 2007 começa exatamente em 1857.
    expect(mesCompletoDe(ULTIMO_DIA_DA_TABELA_POR_DIA)).toBe(
      PRIMEIRO_MES_DA_TABELA_POR_MES - 1,
    );
    expect(mesCompletoDe(ULTIMO_DIA_DA_TABELA_POR_DIA + 1)).toBe(
      PRIMEIRO_MES_DA_TABELA_POR_MES,
    );
  });

  it("a fronteira DE RÓTULO, aos 1826 dias, não move a tabela", () => {
    // D-05: as duas fronteiras dos cinco anos são distintas de propósito. Aos 1826
    // dias a nomenclatura do IMC muda (RN-06, trabalho da classificação), mas a
    // régua continua sendo a de 0 a 5 anos, lida por dia.
    const vespera = lida("imc-idade", "masculino", 1825);
    const aniversario = lida("imc-idade", "masculino", 1826);

    expect(vespera.unidade).toBe("dia");
    expect(aniversario.unidade).toBe("dia");
    expect(aniversario.chave).toBe(1826);
  });
});

describe("leitura por mês completo dos cinco aos dez anos (D-06)", () => {
  it("todos os dias do mesmo mês leem a mesma linha — sem interpolação", () => {
    const primeiro = lida("peso-idade", "masculino", 1857);
    const ultimo = lida("peso-idade", "masculino", 1887);
    const seguinte = lida("peso-idade", "masculino", 1888);

    expect(ultimo.chave).toBe(61);
    expect(ultimo.parametros).toEqual(primeiro.parametros);

    expect(seguinte.chave).toBe(62);
    expect(seguinte.parametros.m).toBe(18.6802);
  });

  it("o mês é o completo, `⌊dias / 30,4375⌋`", () => {
    expect(DIAS_POR_MES).toBe(365.25 / 12);
    expect(mesCompletoDe(1856)).toBe(60);
    expect(mesCompletoDe(1857)).toBe(61);
    expect(mesCompletoDe(3682)).toBe(120);
    expect(mesCompletoDe(3683)).toBe(121);
  });
});

describe("a fronteira superior da cobertura (D-15)", () => {
  it("3682 dias ainda lê o mês 120, a última linha publicada", () => {
    const leitura = lida("peso-idade", "masculino", ULTIMO_DIA_COBERTO);

    expect(leitura.unidade).toBe("mes");
    expect(leitura.chave).toBe(ULTIMO_MES_DA_TABELA_POR_MES);
    expect(leitura.parametros.m).toBe(31.1586);
  });

  it("3683 dias sai da cobertura, sem número algum", () => {
    const leitura = lerLms("peso-idade", "masculino", ULTIMO_DIA_COBERTO + 1);

    expect(leitura).toEqual({
      tipo: "sem-tabela",
      motivo: "IDADE_ACIMA_DA_COBERTURA",
    });
  });

  it("a recusa vale para os três índices que chegam aos dez anos", () => {
    for (const indice of [
      "peso-idade",
      "comprimento-estatura-idade",
      "imc-idade",
    ] as const) {
      expect(lerLms(indice, "feminino", 3683).tipo).toBe("sem-tabela");
      expect(lerLms(indice, "feminino", 3682).tipo).toBe("lida");
    }
  });
});

describe("a fronteira dos dois anos do perímetro cefálico (D-16)", () => {
  it("730 dias lê; 731 sai do escopo da fonte", () => {
    const dentro = lida("perimetro-cefalico-idade", "masculino", 730);
    expect(dentro.parametros.m).toBe(48.2494);

    expect(
      lerLms(
        "perimetro-cefalico-idade",
        "masculino",
        ULTIMO_DIA_DO_PERIMETRO_CEFALICO + 1,
      ),
    ).toEqual({
      tipo: "sem-tabela",
      motivo: "PERIMETRO_CEFALICO_ACIMA_DE_2_ANOS",
    });
  });

  it("a recusa é só do perímetro cefálico: os demais índices seguem lendo (RF-06)", () => {
    expect(lerLms("peso-idade", "masculino", 731).tipo).toBe("lida");
    expect(lerLms("comprimento-estatura-idade", "masculino", 731).tipo).toBe(
      "lida",
    );
    expect(lerLms("imc-idade", "masculino", 731).tipo).toBe("lida");
  });

  it("o perímetro cefálico ao nascer confere com a âncora V7 do contrato", () => {
    expect(lida("perimetro-cefalico-idade", "masculino", 0).parametros.m).toBe(
      34.4618,
    );
  });
});

describe("o acervo real (D-03, D-08)", () => {
  it("tem as quatorze combinações que a OMS publica dentro da cobertura", () => {
    const porDia = (
      [
        "peso-idade",
        "comprimento-estatura-idade",
        "imc-idade",
        "perimetro-cefalico-idade",
      ] as const
    ).flatMap((indice) =>
      (["masculino", "feminino"] as const).map((sexo) =>
        REPOSITORIO_OMS.obter(indice, "dia", sexo),
      ),
    );
    const porMes = (
      ["peso-idade", "comprimento-estatura-idade", "imc-idade"] as const
    ).flatMap((indice) =>
      (["masculino", "feminino"] as const).map((sexo) =>
        REPOSITORIO_OMS.obter(indice, "mes", sexo),
      ),
    );

    expect(porDia.filter((t) => t !== null)).toHaveLength(8);
    expect(porMes.filter((t) => t !== null)).toHaveLength(6);
  });

  it("não tem perímetro cefálico por mês — a tabela da OMS termina aos 730 dias", () => {
    expect(
      REPOSITORIO_OMS.obter("perimetro-cefalico-idade", "mes", "masculino"),
    ).toBeNull();
  });
});

describe("índice de linha aritmético sobre acervo injetado (D-08)", () => {
  const sintetico = repositorioSintetico([
    {
      indice: "peso-idade",
      unidade: "dia",
      sexo: "masculino",
      tabela: tabelaSintetica({ unidade: "dia", inicio: 0, fim: 10 }),
    },
    {
      indice: "peso-idade",
      unidade: "mes",
      sexo: "masculino",
      tabela: tabelaSintetica({ unidade: "mes", inicio: 61, fim: 120 }),
    },
  ]);

  it("a posição é `chave − inicio`, e não a chave", () => {
    // Na tabela por mês o `inicio` é 61: ler o mês 61 tem de cair na posição 0.
    // Como o `m` sintético devolve a própria chave, um desvio apareceria como número.
    expect(lida("peso-idade", "masculino", 3, sintetico).parametros.m).toBe(3);
    expect(lida("peso-idade", "masculino", 1857, sintetico).parametros.m).toBe(
      61,
    );
    expect(lida("peso-idade", "masculino", 3682, sintetico).parametros.m).toBe(
      120,
    );
  });
});

describe("guardas de invariante — bug interno, nunca fluxo esperado (ADR 0004)", () => {
  it("idade não inteira ou negativa não é recusa clínica, é bug", () => {
    expect(() => lerLms("peso-idade", "masculino", -1)).toThrow(
      ErroDeInvariante,
    );
    expect(() => lerLms("peso-idade", "masculino", 30.5)).toThrow(
      ErroDeInvariante,
    );
  });

  it("acervo sem a combinação pedida falha ruidosamente", () => {
    const vazio = repositorioSintetico([]);

    expect(() => lerLms("peso-idade", "masculino", 100, vazio)).toThrow(
      /Acervo sem tabela/,
    );
  });

  it("tabela que cobre menos do que a fronteira permite falha ao ser lida", () => {
    const curto = repositorioSintetico([
      {
        indice: "peso-idade",
        unidade: "dia",
        sexo: "masculino",
        tabela: tabelaSintetica({ unidade: "dia", inicio: 0, fim: 10 }),
      },
    ]);

    expect(() => lerLms("peso-idade", "masculino", 11, curto)).toThrow(
      /fora da tabela/,
    );
  });

  it("`conferirTabela` recusa unidade trocada", () => {
    const porMes = tabelaSintetica({ unidade: "mes", inicio: 61, fim: 120 });

    expect(() => conferirTabela(porMes, "dia", "peso/dia/masculino")).toThrow(
      /unidade "mes", esperada "dia"/,
    );
    expect(conferirTabela(porMes, "mes", "peso/mes/masculino")).toBe(porMes);
  });

  it("`conferirTabela` recusa array mais curto do que a faixa declarada", () => {
    const mutilada = {
      ...tabelaSintetica({ unidade: "dia", inicio: 0, fim: 10 }),
    };
    const comFaixaMaior = { ...mutilada, fim: 20 };

    expect(() => conferirTabela(comFaixaMaior, "dia", "sintética")).toThrow(
      /pede 21 linhas/,
    );
  });
});
