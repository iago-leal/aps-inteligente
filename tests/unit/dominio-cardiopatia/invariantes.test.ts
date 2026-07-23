// T009 — Invariantes property-based e cenários fixos da fachada (RF-01..RF-07;
// RN-01..RN-09; requirements §7). Invariante-mãe: toda saída de resultado carrega
// ≥ 1 referência clínica (RN-09). Feature 010-dor-toracica-pre-teste.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CalculadoraCardiopatiaIsquemica } from "models/cardiopatia-isquemica/calculadora";
import type {
  EntradaAvaliacao,
  FatorDeRisco,
  ResultadoAvaliacao,
} from "models/cardiopatia-isquemica/tipos";

const motor = new CalculadoraCardiopatiaIsquemica();
const FATORES: FatorDeRisco[] = [
  "diabetes",
  "tabagismo",
  "hipertensao",
  "dislipidemia",
];

const arbEntrada = fc.record({
  idadeAnos: fc.integer({ min: 30, max: 69 }),
  sexo: fc.constantFrom("masculino", "feminino") as fc.Arbitrary<
    EntradaAvaliacao["sexo"]
  >,
  caracteristicas: fc.record({
    retroesternal: fc.boolean(),
    provocadaPorEsforcoOuEstresse: fc.boolean(),
    aliviaComRepousoOuNitrato: fc.boolean(),
  }),
  fatoresDeRisco: fc.subarray(FATORES),
  impedimentoErgometria: fc.boolean(),
  sinaisInstabilidade: fc.boolean(),
});

function resultado(entrada: EntradaAvaliacao): ResultadoAvaliacao {
  const saida = motor.avaliar(entrada);
  if (saida.tipo !== "resultado") {
    throw new Error(`Esperava resultado, veio ${saida.tipo}`);
  }
  return saida;
}

describe("Invariante-mãe: toda saída de resultado é referenciada (RN-09)", () => {
  it("para qualquer entrada válida (idade 30–69), referencias não é vazia", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        expect(resultado(entrada).referencias.length).toBeGreaterThan(0);
      }),
    );
  });

  it("determinismo: mesma entrada produz saída estruturalmente idêntica", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        expect(motor.avaliar(entrada)).toEqual(motor.avaliar(entrada));
      }),
    );
  });
});

describe("Coerência de ajuste e estrato (RN-03/RN-04)", () => {
  it("ajuste existe se e somente se há fator de risco", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        const r = resultado(entrada);
        expect(r.probabilidadeAjustada !== undefined).toBe(
          entrada.fatoresDeRisco.length > 0,
        );
      }),
    );
  });

  it("qualquer fator de risco impede o estrato 'baixa'", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        if (entrada.fatoresDeRisco.length > 0) {
          expect(resultado(entrada).estrato).not.toBe("baixa");
        }
      }),
    );
  });

  it("estrato 'baixa' ⟺ dor não anginosa e sem fatores de risco", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        const r = resultado(entrada);
        const eBaixa = r.estrato === "baixa";
        const naoAnginosaSemFatores =
          r.classificacaoDor === "nao-anginosa" &&
          entrada.fatoresDeRisco.length === 0;
        expect(eBaixa).toBe(naoAnginosaSemFatores);
      }),
    );
  });
});

describe("Cenários fixos da fachada (requirements §7)", () => {
  const base = {
    caracteristicas: {
      retroesternal: true,
      provocadaPorEsforcoOuEstresse: true,
      aliviaComRepousoOuNitrato: true,
    },
    fatoresDeRisco: [] as FatorDeRisco[],
  };

  it("cenário 1 — homem 55, angina típica, com HAS e diabetes → alta, encaminhamento", () => {
    const r = resultado({
      ...base,
      idadeAnos: 55,
      sexo: "masculino",
      fatoresDeRisco: ["hipertensao", "diabetes"],
    });
    expect(r.classificacaoDor).toBe("tipica");
    expect(r.faixaEtaria).toBe("50-59");
    expect(r.probabilidadeBasePct).toBe(93);
    expect(r.probabilidadeAjustada).toBeDefined();
    expect(r.estrato).toBe("alta");
    expect(r.conduta.tipo).toBe("estratificacao-e-encaminhamento");
  });

  it("cenário 2 — dor não anginosa sem fatores → baixa, exame não indicado, causas não cardíacas", () => {
    const r = resultado({
      idadeAnos: 55,
      sexo: "masculino",
      caracteristicas: {
        retroesternal: true,
        provocadaPorEsforcoOuEstresse: false,
        aliviaComRepousoOuNitrato: false,
      },
      fatoresDeRisco: [],
    });
    expect(r.classificacaoDor).toBe("nao-anginosa");
    expect(r.estrato).toBe("baixa");
    expect(r.conduta.tipo).toBe("exame-nao-indicado");
    expect(r.conduta.causasNaoCardiacas?.length).toBeGreaterThan(0);
  });

  it("cenário 3 — ECG basal impede ergometria em probabilidade intermediária → método alternativo", () => {
    const r = resultado({
      ...base,
      idadeAnos: 55,
      sexo: "masculino",
      caracteristicas: {
        retroesternal: true,
        provocadaPorEsforcoOuEstresse: true,
        aliviaComRepousoOuNitrato: false,
      },
      impedimentoErgometria: true,
    });
    expect(r.classificacaoDor).toBe("atipica");
    expect(r.estrato).toBe("intermediaria");
    expect(r.conduta.exame).toBe("metodo-nao-invasivo-alternativo");
  });

  it("cenário 7 — sinais de instabilidade geram advertência de emergência", () => {
    const r = resultado({
      ...base,
      idadeAnos: 55,
      sexo: "masculino",
      sinaisInstabilidade: true,
    });
    expect(r.advertencias.map((a) => a.tipo)).toContain("ANGINA_INSTAVEL");
  });
});
