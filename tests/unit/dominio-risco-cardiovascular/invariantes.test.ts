// T004 — Invariantes property-based e cenários fixos da fachada (RF-01..RF-10;
// RN-01..RN-09; requirements §7). Invariante-mãe: toda saída de resultado carrega
// ≥ 1 referência clínica (RF-08). Cobre também elegibilidade (fora-do-escopo),
// validação (coleta total) e clamp (avisos). Feature 014-risco-cardiovascular-pce.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CalculadoraRiscoCardiovascular } from "models/risco-cardiovascular/calculadora";
import type {
  EntradaEstimativa,
  ResultadoEstimativa,
} from "models/risco-cardiovascular/tipos";

const motor = new CalculadoraRiscoCardiovascular();

const arbEntradaValida = fc.record({
  sexo: fc.constantFrom("masculino", "feminino") as fc.Arbitrary<
    EntradaEstimativa["sexo"]
  >,
  raca: fc.constantFrom("branco", "afro-americano", "outra") as fc.Arbitrary<
    EntradaEstimativa["raca"]
  >,
  idadeAnos: fc.integer({ min: 40, max: 79 }),
  colesterolTotalMgDl: fc.integer({ min: 130, max: 320 }),
  hdlMgDl: fc.integer({ min: 20, max: 100 }),
  pasMmHg: fc.integer({ min: 90, max: 200 }),
  emTratamentoAntiHipertensivo: fc.boolean(),
  diabetes: fc.boolean(),
  tabagismoAtual: fc.boolean(),
  dcvPrevia: fc.constant(false),
});

function resultado(entrada: EntradaEstimativa): ResultadoEstimativa {
  const saida = motor.estimar(entrada);
  if (saida.tipo !== "resultado") {
    throw new Error(`Esperava resultado, veio ${saida.tipo}`);
  }
  return saida;
}

const BASE: EntradaEstimativa = {
  sexo: "masculino",
  raca: "branco",
  idadeAnos: 55,
  colesterolTotalMgDl: 213,
  hdlMgDl: 50,
  pasMmHg: 120,
  emTratamentoAntiHipertensivo: false,
  diabetes: false,
  tabagismoAtual: false,
  dcvPrevia: false,
};

describe("Invariante-mãe: toda saída de resultado é referenciada (RF-08)", () => {
  it("para qualquer entrada elegível, referencias não é vazia", () => {
    fc.assert(
      fc.property(arbEntradaValida, (entrada) => {
        expect(resultado(entrada).referencias.length).toBeGreaterThan(0);
      }),
    );
  });

  it("determinismo: mesma entrada produz saída idêntica", () => {
    fc.assert(
      fc.property(arbEntradaValida, (entrada) => {
        expect(motor.estimar(entrada)).toEqual(motor.estimar(entrada));
      }),
    );
  });

  it("risco sempre em 0–100 e categoria coerente com os cortes", () => {
    fc.assert(
      fc.property(arbEntradaValida, (entrada) => {
        const r = resultado(entrada);
        expect(r.riscoPct).toBeGreaterThanOrEqual(0);
        expect(r.riscoPct).toBeLessThanOrEqual(100);
        const esperada =
          r.riscoPct < 5
            ? "baixo"
            : r.riscoPct < 7.5
              ? "limitrofe"
              : r.riscoPct < 20
                ? "intermediario"
                : "alto";
        expect(r.categoria).toBe(esperada);
      }),
    );
  });
});

describe("Elegibilidade: fora do escopo das PCE (RF-05/RN-02; D-06)", () => {
  it("idade fora de 40–79 (mas plausível) → fora-do-escopo IDADE_FORA_DA_FAIXA", () => {
    for (const idade of [39, 80, 90]) {
      const saida = motor.estimar({ ...BASE, idadeAnos: idade });
      expect(saida.tipo).toBe("fora-do-escopo");
      if (saida.tipo === "fora-do-escopo") {
        expect(saida.motivo).toBe("IDADE_FORA_DA_FAIXA");
      }
    }
  });

  it("DCV prévia → fora-do-escopo DCV_PREVIA, mesmo com idade elegível", () => {
    const saida = motor.estimar({ ...BASE, dcvPrevia: true });
    expect(saida.tipo).toBe("fora-do-escopo");
    if (saida.tipo === "fora-do-escopo") {
      expect(saida.motivo).toBe("DCV_PREVIA");
    }
  });

  it("DCV prévia tem precedência sobre idade fora da faixa", () => {
    const saida = motor.estimar({ ...BASE, idadeAnos: 90, dcvPrevia: true });
    expect(saida.tipo).toBe("fora-do-escopo");
    if (saida.tipo === "fora-do-escopo") {
      expect(saida.motivo).toBe("DCV_PREVIA");
    }
  });
});

describe("Validação com coleta total (RN-08)", () => {
  it("sexo, raça, idade e valores inválidos → todos os ofensores de uma vez", () => {
    const saida = motor.estimar({
      ...BASE,
      sexo: "outro" as EntradaEstimativa["sexo"],
      raca: "x" as EntradaEstimativa["raca"],
      idadeAnos: Number.NaN,
      colesterolTotalMgDl: -1,
      hdlMgDl: 0,
      pasMmHg: Number.NaN,
    });
    expect(saida.tipo).toBe("erro-validacao");
    if (saida.tipo === "erro-validacao") {
      const codigos = saida.ofensores.map((o) => o.codigo);
      expect(codigos).toEqual(
        expect.arrayContaining([
          "SEXO_INVALIDO",
          "RACA_INVALIDA",
          "IDADE_INVALIDA",
          "COLESTEROL_INVALIDO",
          "HDL_INVALIDO",
          "PAS_INVALIDA",
        ]),
      );
    }
  });

  it("idade não inteira é ofensor, nunca fora-do-escopo", () => {
    const saida = motor.estimar({ ...BASE, idadeAnos: 55.5 });
    expect(saida.tipo).toBe("erro-validacao");
  });
});

describe("Clamp fisiológico como aviso, não trava (RN-07; D-07)", () => {
  it("colesterol, HDL e PAS fora da faixa → resultado com avisos", () => {
    const r = resultado({
      ...BASE,
      colesterolTotalMgDl: 400,
      hdlMgDl: 10,
      pasMmHg: 250,
    });
    const campos = r.avisos.map((a) => a.campo);
    expect(campos).toEqual(
      expect.arrayContaining(["colesterolTotalMgDl", "hdlMgDl", "pasMmHg"]),
    );
  });

  it("valor no limite da faixa não gera aviso", () => {
    const r = resultado({ ...BASE, colesterolTotalMgDl: 320, pasMmHg: 90 });
    expect(r.avisos).toHaveLength(0);
  });

  it("clampar ao mesmo limite é idempotente (valor já no limite = valor extrapolado)", () => {
    const dentro = resultado({ ...BASE, colesterolTotalMgDl: 320 }).riscoPct;
    const fora = resultado({ ...BASE, colesterolTotalMgDl: 500 }).riscoPct;
    expect(fora).toBeCloseTo(dentro, 10);
  });
});

describe("Cenários fixos da fachada (requirements §7)", () => {
  it("homem branco baseline → ~5,4% e categoria limítrofe", () => {
    const r = resultado(BASE);
    expect(Math.abs(r.riscoPct - 5.4)).toBeLessThanOrEqual(0.1);
    expect(r.categoria).toBe("limitrofe");
  });

  it("o resultado não carrega nenhum campo de conduta (ADR 0005)", () => {
    const r = resultado(BASE);
    expect(r).not.toHaveProperty("conduta");
    expect(r.notaProveniencia.length).toBeGreaterThan(0);
  });
});
