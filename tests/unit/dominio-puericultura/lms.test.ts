// Teste do LMS e da correção de cauda (ação T010; RF-02, RF-03; RN-02, RN-03; D-10).
// Cobre o cenário 3 do `requirements.md` §7 ("correção de cauda só onde a OMS a prevê").
//
// O oráculo vem dos casos CONGELADOS em T008, nunca de `referencias/`, que o git
// ignora: é o que permite este arquivo rodar em clone limpo. A promessa que ele
// exercita é exata — a medida publicada em `SDn` tem de devolver `z = n` pela LMS da
// mesma linha —, e as colunas de ±4 provam a cauda contra a FONTE PRIMÁRIA, porque
// nos indicadores de peso a OMS já as publica com a correção aplicada.
//
// Três notas de T008 governam a escrita deste arquivo:
//
//  1. A tolerância é `oms.toleranciaEmZ` (3e-3), do próprio arquivo de casos, e não a
//     da escala da medida (5e-4): o arredondamento da terceira casa publicada se
//     amplifica por 1/(M·S) ao virar escore, mais de duas vezes no peso ao nascer.
//  2. O ramo `L = 0` NÃO existe no dado real — nenhuma das 14 tabelas o tem —, então
//     ele se cobre com o acervo sintético.
//  3. A metade negativa de RN-03 (a cauda não se aplica a C-E/I e PC/I) também pede
//     sintético, com `L ≠ 1`: no dado real esses dois têm `L = 1`, e ali as duas
//     regras coincidem por construção. Provar pelo dado seria passar com a
//     implementação certa e com a errada.
import { describe, expect, it } from "vitest";
import {
  FRONTEIRA_DA_CAUDA,
  aplicaCorrecaoDeCauda,
  escoreLms,
  escoreZ,
  medidaEmZ,
} from "models/puericultura/oms/lms";
import { ErroDeInvariante, type Indice } from "models/puericultura/tipos";
import type { ParametrosLms } from "models/puericultura/oms/leitura";
import oraculo from "../../apoio/casos-oraculo-puericultura.json";

const { toleranciaEmZ, dados } = oraculo.oms;

const INDICE_DO_INDICADOR: Readonly<Record<string, Indice>> = {
  peso: "peso-idade",
  "comprimento-estatura": "comprimento-estatura-idade",
  imc: "imc-idade",
  "perimetro-cefalico": "perimetro-cefalico-idade",
};

/** As chaves são `z-4`…`z4` para o JSON não reordenar as colunas (nota de T008). */
function desvioDaChave(chave: string): number {
  return Number(chave.slice(1));
}

describe("LMS de Cole contra a fonte primária (RN-02)", () => {
  it("as 14 tabelas: a medida publicada em SDn devolve z = n, de −3 a +3", () => {
    let pares = 0;
    let piorDesvio = 0;

    for (const bloco of dados) {
      for (const caso of bloco.casos) {
        const parametros: ParametrosLms = {
          l: caso.l,
          m: caso.m,
          s: caso.s,
        };
        for (const [chave, medida] of Object.entries(caso.sd)) {
          const n = desvioDaChave(chave);
          if (Math.abs(n) > FRONTEIRA_DA_CAUDA) continue; // ±4 tem seção própria
          const desvio = Math.abs(escoreLms(medida, parametros) - n);
          piorDesvio = Math.max(piorDesvio, desvio);
          pares += 1;
        }
      }
    }

    expect(pares).toBe(356 * 7);
    expect(piorDesvio).toBeLessThan(toleranciaEmZ);
  });

  it("a mediana é o escore zero, em toda linha congelada", () => {
    for (const bloco of dados) {
      for (const caso of bloco.casos) {
        expect(
          escoreLms(caso.m, { l: caso.l, m: caso.m, s: caso.s }),
        ).toBeCloseTo(0, 10);
      }
    }
  });

  it("a inversa fecha o círculo: medidaEmZ e escoreLms se desfazem", () => {
    const parametros: ParametrosLms = { l: 0.3487, m: 3.3464, s: 0.14602 };

    for (const z of [-3, -1.5, 0, 0.7, 2, 3]) {
      expect(escoreLms(medidaEmZ(z, parametros), parametros)).toBeCloseTo(
        z,
        10,
      );
    }
  });

  it("medida não positiva é bug interno, não escore", () => {
    const parametros: ParametrosLms = { l: 1, m: 10, s: 0.1 };

    expect(() => escoreLms(0, parametros)).toThrow(ErroDeInvariante);
    expect(() => escoreLms(-2, parametros)).toThrow(ErroDeInvariante);
    expect(() => escoreLms(Number.NaN, parametros)).toThrow(ErroDeInvariante);
  });
});

describe("o ramo L = 0, que o dado real da OMS não exercita (nota 2 de T008)", () => {
  const logaritmico: ParametrosLms = { l: 0, m: 10, s: 0.1 };

  it("com L = 0 o escore é ln(X/M)/S", () => {
    expect(escoreLms(10, logaritmico)).toBe(0);
    expect(escoreLms(10 * Math.exp(0.1), logaritmico)).toBeCloseTo(1, 10);
    expect(escoreLms(10 * Math.exp(-0.2), logaritmico)).toBeCloseTo(-2, 10);
  });

  it("a inversa também troca de ramo, e as duas continuam se desfazendo", () => {
    expect(medidaEmZ(0, logaritmico)).toBe(10);
    for (const z of [-3, -1, 0, 2.5]) {
      expect(escoreLms(medidaEmZ(z, logaritmico), logaritmico)).toBeCloseTo(
        z,
        10,
      );
    }
  });

  it("nenhuma das 14 tabelas tem L = 0 — o motivo de este bloco ser sintético", () => {
    const comLZero = dados.flatMap((b) => b.casos.filter((c) => c.l === 0));

    expect(comLZero).toEqual([]);
  });
});

describe("correção de cauda onde a OMS a prevê: P/I e IMC/I (RN-03, D-10)", () => {
  const comCauda = dados.filter(
    (b) => b.indicador === "peso" || b.indicador === "imc",
  );

  it("o índice certo é que aplica: peso e IMC sim, estatura e PC não", () => {
    expect(aplicaCorrecaoDeCauda("peso-idade")).toBe(true);
    expect(aplicaCorrecaoDeCauda("imc-idade")).toBe(true);
    expect(aplicaCorrecaoDeCauda("comprimento-estatura-idade")).toBe(false);
    expect(aplicaCorrecaoDeCauda("perimetro-cefalico-idade")).toBe(false);
  });

  it("a coluna SD4 publicada devolve exatamente z = 4 quando a cauda é aplicada", () => {
    let casos = 0;

    for (const bloco of comCauda) {
      const indice = INDICE_DO_INDICADOR[bloco.indicador];
      for (const caso of bloco.casos) {
        const parametros: ParametrosLms = { l: caso.l, m: caso.m, s: caso.s };
        const medida = caso.sd["z4"];
        expect(
          Math.abs(
            escoreZ(medida, parametros, aplicaCorrecaoDeCauda(indice)) - 4,
          ),
        ).toBeLessThan(toleranciaEmZ);
        casos += 1;
      }
    }

    expect(casos).toBe(212);
  });

  it("e a de −4 devolve −4: o sinal da distância se preserva nos dois lados", () => {
    for (const bloco of comCauda) {
      for (const caso of bloco.casos) {
        const parametros: ParametrosLms = { l: caso.l, m: caso.m, s: caso.s };
        expect(
          Math.abs(escoreZ(caso.sd["z-4"], parametros, true) + 4),
        ).toBeLessThan(toleranciaEmZ);
      }
    }
  });

  it("sem a cauda, a mesma medida devolveria outro número — a fonte publica corrigido", () => {
    // Peso masculino ao nascer, o caso em que T008 flagrou a diferença: a LMS prevê
    // 5,6945 kg em z = 4, e a OMS publica 5,642. As duas leituras do mesmo dado:
    const aoNascer = dados.find((b) => b.modulo === "peso-idade-0-5-masculino")!
      .casos[0];
    const parametros: ParametrosLms = {
      l: aoNascer.l,
      m: aoNascer.m,
      s: aoNascer.s,
    };
    const publicado = aoNascer.sd["z4"];

    expect(publicado).toBe(5.642);
    expect(medidaEmZ(4, parametros)).toBeCloseTo(5.6945, 3);
    expect(escoreZ(publicado, parametros, true)).toBeCloseTo(4, 2);

    // Um motor sem a cauda leria o peso que a OMS chama de +4 DP como +3,92 —
    // subestimando o desvio de quem já está no extremo. E, do outro lado da mesma
    // moeda, a criança que pesasse o SD4 da LMS receberia +4,09, e não +4.
    expect(escoreLms(publicado, parametros)).toBeCloseTo(3.92, 2);
    expect(escoreLms(publicado, parametros)).toBeLessThan(4);
    expect(escoreZ(medidaEmZ(4, parametros), parametros, true)).toBeCloseTo(
      4.086,
      3,
    );
  });

  it("dentro de ±3 a cauda não muda nada: ela só existe além da fronteira", () => {
    const parametros: ParametrosLms = { l: 0.3487, m: 3.3464, s: 0.14602 };

    for (const z of [-3, -1, 0, 2.9, 3]) {
      const medida = medidaEmZ(z, parametros);
      expect(escoreZ(medida, parametros, true)).toBe(
        escoreZ(medida, parametros, false),
      );
    }
  });
});

describe("a cauda NÃO se aplica a C-E/I e PC/I, e isso exige sintético (D-10.1)", () => {
  // `L ≠ 1` é o que torna a diferença visível: com L = 1 a LMS já é linear em z, de
  // passo SD3 − SD2, e as duas regras devolvem o mesmo número.
  const assimetrico: ParametrosLms = { l: 0.4, m: 10, s: 0.12 };

  it("no acervo sintético, corrigir e não corrigir dão números distintos", () => {
    const medida = medidaEmZ(4, assimetrico);

    expect(escoreZ(medida, assimetrico, false)).toBeCloseTo(4, 10);
    expect(escoreZ(medida, assimetrico, true)).toBeCloseTo(4.065, 3);
    // A diferença já é visível na casa decimal que a tela exibe (D-13), e cresce
    // com o afastamento: 0,02 em z=3,5; 0,07 em z=4; 0,20 em z=5.
    expect(
      Math.abs(
        escoreZ(medida, assimetrico, true) -
          escoreZ(medida, assimetrico, false),
      ),
    ).toBeGreaterThan(0.05);
    expect(escoreZ(medidaEmZ(5, assimetrico), assimetrico, true)).toBeCloseTo(
      5.196,
      3,
    );
  });

  it("o lado negativo desloca na mesma ordem, e é onde o erro de sinal se esconderia", () => {
    // O risco que o roadmap §9 nomeia: os denominadores da cauda são positivos nos
    // DOIS lados, e trocá-los devolveria um escore de sinal invertido — número
    // plausível, laudo oposto. Aqui a cauda encolhe o desvio simetricamente ao lado
    // positivo (−3,92 contra −4, como +4,07 contra +4), e jamais muda de sinal.
    const medida = medidaEmZ(-4, assimetrico);

    expect(escoreZ(medida, assimetrico, false)).toBeCloseTo(-4, 10);
    expect(escoreZ(medida, assimetrico, true)).toBeCloseTo(-3.919, 3);
    expect(escoreZ(medida, assimetrico, true)).toBeLessThan(0);

    const deslocamentoNegativo = Math.abs(
      escoreZ(medida, assimetrico, true) - escoreZ(medida, assimetrico, false),
    );
    const deslocamentoPositivo = Math.abs(
      escoreZ(medidaEmZ(4, assimetrico), assimetrico, true) -
        escoreZ(medidaEmZ(4, assimetrico), assimetrico, false),
    );

    expect(deslocamentoNegativo).toBeCloseTo(deslocamentoPositivo, 1);
  });

  it("estatura e perímetro cefálico recebem o escore LMS puro", () => {
    const medida = medidaEmZ(4, assimetrico);

    for (const indice of [
      "comprimento-estatura-idade",
      "perimetro-cefalico-idade",
    ] as const) {
      expect(
        escoreZ(medida, assimetrico, aplicaCorrecaoDeCauda(indice)),
      ).toBeCloseTo(escoreLms(medida, assimetrico), 10);
    }
  });

  it("o dado real é silencioso: com L = 1 as duas regras coincidem (achado de T008)", () => {
    const comLUm = dados.filter(
      (b) =>
        b.indicador === "comprimento-estatura" ||
        b.indicador === "perimetro-cefalico",
    );

    expect(comLUm.every((b) => b.casos.every((c) => c.l === 1))).toBe(true);

    for (const bloco of comLUm) {
      for (const caso of bloco.casos) {
        const parametros: ParametrosLms = { l: caso.l, m: caso.m, s: caso.s };
        const medida = caso.sd["z4"];
        expect(
          Math.abs(
            escoreZ(medida, parametros, true) -
              escoreZ(medida, parametros, false),
          ),
        ).toBeLessThan(1e-10);
      }
    }
  });
});
