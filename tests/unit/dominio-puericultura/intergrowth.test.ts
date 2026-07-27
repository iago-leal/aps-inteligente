// Teste das curvas de pré-termo (ação T012; RF-18, RN-17; D-02).
// Cobre a metade de cálculo do cenário 5 do `requirements.md` §7.
//
// O oráculo é EXTERNO e independente da implementação: as seis tabelas oficiais de
// z-score do INTERGROWTH-21st (`PPFS_zscores_*`, assinadas Villar et al. 2015),
// extraídas dos PDFs e congeladas em T008 — 1596 células, sete desvios por semana,
// de 27 a 64 semanas, nos dois sexos. As equações fechadas têm de reproduzir cada
// uma delas. A tolerância é 0,005, meia unidade da última casa publicada.
//
// É esta conferência que encerra a ressalva de procedência de `MD-0002`: os
// coeficientes vieram de implementação de referência, e não do artigo original, mas
// reproduzem célula a célula o que o próprio projeto publica.
import { describe, expect, it } from "vitest";
import {
  escalaDe,
  medianaDe,
  medidaNoDesvio,
  mu,
  sigma,
  type MedidaPreTermo,
} from "models/puericultura/intergrowth/equacoes";
import {
  escoreZPreTermo,
  medidaDoIndiceNoPreTermo,
} from "models/puericultura/intergrowth/escore";
import { ErroDeInvariante, type Sexo } from "models/puericultura/tipos";
import oraculo from "../../apoio/casos-oraculo-puericultura.json";

const { toleranciaSugerida, janela, dados } = oraculo.intergrowth;

const MEDIDA_DO_ORACULO: Readonly<Record<string, MedidaPreTermo>> = {
  peso: "peso",
  comprimento: "comprimento",
  "perimetro-cefalico": "perimetro-cefalico",
};

/**
 * A ÚNICA célula das 1596 que não fecha ao arredondar para as duas casas publicadas.
 * Não é folga genérica: é empate de arredondamento na terceira casa, nomeado para
 * que fique conhecido em vez de escondido numa tolerância maior. A tabela publica
 * 4,40 kg e a equação devolve 4,40503 — o valor verdadeiro está em cima do 4,405, e
 * a publicação arredondou para baixo enquanto o cálculo cai para cima. A distinção
 * importa: uma tolerância afrouxada acomodaria também um coeficiente errado.
 */
const EMPATE_DE_ARREDONDAMENTO = {
  origem: "peso-masculino",
  semana: 55,
  z: -3,
  publicado: 4.4,
  calculado: 4.40503,
};

describe("as equações reproduzem as tabelas publicadas (D-02, MD-0002)", () => {
  it("as 1596 células, dentro de meia casa da precisão publicada", () => {
    let celulas = 0;
    let piorDesvio = 0;
    let piorCelula = "";
    const foraDaTolerancia: string[] = [];

    for (const bloco of dados) {
      const medida = MEDIDA_DO_ORACULO[bloco.medida];
      const sexo = bloco.sexo as Sexo;

      for (const linha of bloco.semanas) {
        for (const [chave, publicado] of Object.entries(linha.z)) {
          const z = Number(chave.slice(1));
          const calculado = medidaNoDesvio(medida, sexo, linha.semana, z);
          const desvio = Math.abs(calculado - publicado);

          if (desvio > piorDesvio) {
            piorDesvio = desvio;
            piorCelula = `${bloco.origem} semana ${linha.semana} z=${z}`;
          }
          if (desvio > toleranciaSugerida) {
            foraDaTolerancia.push(`${bloco.origem}/${linha.semana}/${z}`);
          }
          celulas += 1;
        }
      }
    }

    expect(celulas).toBe(1596);
    // Uma só célula acima da tolerância, e é a nomeada acima.
    expect(foraDaTolerancia).toEqual([
      `${EMPATE_DE_ARREDONDAMENTO.origem}/${EMPATE_DE_ARREDONDAMENTO.semana}/${EMPATE_DE_ARREDONDAMENTO.z}`,
    ]);
    expect(piorCelula).toBe(
      `${EMPATE_DE_ARREDONDAMENTO.origem} semana ${EMPATE_DE_ARREDONDAMENTO.semana} z=${EMPATE_DE_ARREDONDAMENTO.z}`,
    );
    expect(piorDesvio).toBeLessThan(0.0051);
  });

  it("o empate nomeado é de arredondamento, não de coeficiente", () => {
    const { semana, z, publicado, calculado } = EMPATE_DE_ARREDONDAMENTO;
    const obtido = medidaNoDesvio("peso", "masculino", semana, z);

    expect(obtido).toBeCloseTo(calculado, 5);
    // O valor verdadeiro cai sobre o 4,405: a publicação desceu, o cálculo sobe.
    expect(obtido - publicado).toBeGreaterThan(0.005);
    expect(obtido - publicado).toBeLessThan(0.0051);
  });

  it("o caminho inverso também fecha: a medida publicada devolve o desvio dela", () => {
    // Em `z` o arredondamento da medida se amplifica por 1/σ, e o pior caso está na
    // semana 27 da menina, onde o peso mediano é de 0,6 kg: 0,005 kg de
    // arredondamento valem 0,057 de escore. A tolerância vai MEDIDA, como a da OMS.
    let piorDesvioEmZ = 0;

    for (const bloco of dados) {
      const medida = MEDIDA_DO_ORACULO[bloco.medida];
      const sexo = bloco.sexo as Sexo;

      for (const linha of bloco.semanas) {
        for (const [chave, publicado] of Object.entries(linha.z)) {
          const z = Number(chave.slice(1));
          const obtido = escoreZPreTermo(medida, publicado, sexo, linha.semana);
          piorDesvioEmZ = Math.max(piorDesvioEmZ, Math.abs(obtido - z));
        }
      }
    }

    expect(piorDesvioEmZ).toBeLessThan(0.06);
  });

  it("as seis tabelas cobrem a janela inteira, de 27 a 64 semanas", () => {
    expect(dados).toHaveLength(6);
    expect(janela).toEqual({ de: 27, ate: 64, unidade: "semana" });

    for (const bloco of dados) {
      expect(bloco.semanas[0].semana).toBe(27);
      expect(bloco.semanas.at(-1)?.semana).toBe(64);
      expect(bloco.semanas).toHaveLength(38);
    }
  });
});

describe("μ e σ nos extremos e no meio da janela (investigation §3)", () => {
  const medianas: ReadonlyArray<[number, MedidaPreTermo, Sexo, number]> = [
    [27, "peso", "masculino", 0.672],
    [27, "peso", "feminino", 0.613],
    [40, "peso", "masculino", 3.433],
    [40, "peso", "feminino", 3.134],
    [64, "peso", "masculino", 7.787],
    [27, "comprimento", "masculino", 32.7],
    [40, "comprimento", "masculino", 50.9],
    [64, "comprimento", "feminino", 64.7],
    [27, "perimetro-cefalico", "masculino", 24.8],
    [40, "perimetro-cefalico", "masculino", 35.0],
    [64, "perimetro-cefalico", "feminino", 42.2],
  ];

  it.each(medianas)(
    "semana %i, %s, %s: mediana ≈ %f",
    (semana, medida, sexo, esperada) => {
      expect(medianaDe(medida, sexo, semana)).toBeCloseTo(esperada, 1);
    },
  );

  it("a mediana cresce monotonicamente ao longo da janela inteira", () => {
    for (const medida of [
      "peso",
      "comprimento",
      "perimetro-cefalico",
    ] as const) {
      for (const sexo of ["masculino", "feminino"] as const) {
        let anterior = -Infinity;
        for (let semana = 27; semana <= 64; semana += 1) {
          const atual = medianaDe(medida, sexo, semana);
          expect(atual).toBeGreaterThan(anterior);
          anterior = atual;
        }
      }
    }
  });

  it("o menino é mediano maior que a menina em toda a janela", () => {
    for (const medida of [
      "peso",
      "comprimento",
      "perimetro-cefalico",
    ] as const) {
      for (let semana = 27; semana <= 64; semana += 1) {
        expect(medianaDe(medida, "masculino", semana)).toBeGreaterThan(
          medianaDe(medida, "feminino", semana),
        );
      }
    }
  });

  it("σ é positivo em toda a janela e não depende do sexo", () => {
    for (const medida of [
      "peso",
      "comprimento",
      "perimetro-cefalico",
    ] as const) {
      for (let semana = 27; semana <= 64; semana += 1) {
        expect(sigma(medida, semana)).toBeGreaterThan(0);
      }
    }
  });

  it("o menino de 40 semanas: de −2 a +2 DP vai de 2,593 a 4,545 kg", () => {
    expect(medidaNoDesvio("peso", "masculino", 40, -2)).toBeCloseTo(2.593, 2);
    expect(medidaNoDesvio("peso", "masculino", 40, 2)).toBeCloseTo(4.545, 2);
  });
});

describe("escala de cada curva: log no crescimento, natural no perímetro (D-02)", () => {
  it("peso e comprimento vivem em escala logarítmica; o PC, na natural", () => {
    expect(escalaDe("peso")).toBe("logaritmica");
    expect(escalaDe("comprimento")).toBe("logaritmica");
    expect(escalaDe("perimetro-cefalico")).toBe("natural");
  });

  it("no PC, μ É a mediana; no peso, a mediana é exp(μ)", () => {
    expect(medianaDe("perimetro-cefalico", "masculino", 40)).toBeCloseTo(
      mu("perimetro-cefalico", "masculino", 40),
      10,
    );
    expect(medianaDe("peso", "masculino", 40)).toBeCloseTo(
      Math.exp(mu("peso", "masculino", 40)),
      10,
    );
  });

  it("a curva é contínua: semana fracionária não interpola, avalia", () => {
    const em36 = medianaDe("peso", "masculino", 36);
    const em37 = medianaDe("peso", "masculino", 37);
    const emMeio = medianaDe("peso", "masculino", 36.5);

    expect(emMeio).toBeGreaterThan(em36);
    expect(emMeio).toBeLessThan(em37);
    // E não é a média aritmética dos vizinhos, que é o que a interpolação daria.
    expect(emMeio).not.toBeCloseTo((em36 + em37) / 2, 5);
  });

  it("medida não positiva é bug interno, não escore", () => {
    expect(() => escoreZPreTermo("peso", 0, "masculino", 36)).toThrow(
      ErroDeInvariante,
    );
    expect(() => escoreZPreTermo("peso", -1, "masculino", 36)).toThrow(
      ErroDeInvariante,
    );
    expect(() => mu("peso", "masculino", 0)).toThrow(ErroDeInvariante);
  });
});

describe("o IMC não existe nas curvas de pré-termo (RN-17)", () => {
  it("os três índices publicados mapeiam para as três medidas da fonte", () => {
    expect(medidaDoIndiceNoPreTermo("peso-idade")).toEqual({
      tipo: "medida",
      medida: "peso",
    });
    expect(medidaDoIndiceNoPreTermo("comprimento-estatura-idade")).toEqual({
      tipo: "medida",
      medida: "comprimento",
    });
    expect(medidaDoIndiceNoPreTermo("perimetro-cefalico-idade")).toEqual({
      tipo: "medida",
      medida: "perimetro-cefalico",
    });
  });

  it("o IMC devolve ausência com motivo próprio, jamais erro", () => {
    const imc = medidaDoIndiceNoPreTermo("imc-idade");

    expect(imc.tipo).toBe("inexistente");
    expect(imc).toEqual({
      tipo: "inexistente",
      motivo: "IMC_INEXISTENTE_NO_PRETERMO",
    });
  });

  it("o motivo distingue 'a fonte não publica' de 'faltou a medida'", () => {
    const imc = medidaDoIndiceNoPreTermo("imc-idade");

    expect(imc.tipo === "inexistente" && imc.motivo).not.toBe(
      "MEDIDA_NAO_INFORMADA",
    );
  });
});
