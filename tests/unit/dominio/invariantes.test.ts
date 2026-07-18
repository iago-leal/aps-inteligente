// T011 — Invariantes property-based (RF-06, RF-08 do motor; D-08; AMB-04).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CalculadoraInsulinaDM2 } from "@/dominio/insulina/calculadora";
import {
  comoResultadoTitulacao,
  entradaTitulacao,
  esquemaBasal,
  jejum,
  tiposDeAlerta,
} from "../../apoio/construtores";
import type { EntradaCalculo } from "@/dominio/insulina/tipos";

const calculadora = new CalculadoraInsulinaDM2();

// Entradas de titulação basal válidas, longe do gatilho de fracionamento
// (dose ≤ 25 → máx. 29 após +4, abaixo de 30 UI e de 0,4 × 100 kg = 40 UI).
const arbTitulacaoBasalSimples = fc
  .record({
    dose: fc.integer({ min: 5, max: 25 }),
    glicemias: fc.array(fc.integer({ min: 10, max: 1000 }), {
      minLength: 1,
      maxLength: 6,
    }),
  })
  .map(({ dose, glicemias }) =>
    entradaTitulacao(esquemaBasal(dose), jejum(...glicemias), { pesoKg: 100 }),
  );

// Entradas de titulação quaisquer (podem fracionar), ainda válidas.
const arbTitulacaoValida = fc
  .record({
    dose: fc.integer({ min: 1, max: 60 }),
    pesoKg: fc.integer({ min: 30, max: 200 }),
    glicemias: fc.array(fc.integer({ min: 10, max: 1000 }), {
      minLength: 1,
      maxLength: 6,
    }),
  })
  .map(({ dose, pesoKg, glicemias }) =>
    entradaTitulacao(esquemaBasal(dose), jejum(...glicemias), { pesoKg }),
  );

describe("Determinismo (RF-06, G-02)", () => {
  it("mesma entrada produz saída estruturalmente idêntica", () => {
    fc.assert(
      fc.property(arbTitulacaoValida, (entrada: EntradaCalculo) => {
        expect(calculadora.calcular(entrada)).toEqual(
          calculadora.calcular(entrada),
        );
      }),
    );
  });
});

describe("Doses realizáveis (RF-08, R-20, D-08)", () => {
  it("toda aplicação sugerida tem dose inteira entre 1 e 60 UI", () => {
    fc.assert(
      fc.property(arbTitulacaoValida, (entrada: EntradaCalculo) => {
        const saida = calculadora.calcular(entrada);
        if (saida.tipo !== "resultado" || saida.modo !== "titulacao") return;
        for (const aplicacao of saida.esquemaSugerido) {
          expect(Number.isInteger(aplicacao.doseUi)).toBe(true);
          expect(aplicacao.doseUi).toBeGreaterThanOrEqual(1);
          expect(aplicacao.doseUi).toBeLessThanOrEqual(60);
        }
      }),
    );
  });
});

describe("Incremento máximo por ajuste (RF-08)", () => {
  it("na titulação basal simples, |delta| ≤ 4 UI e delta ∈ {−4, 0, +2, +4}", () => {
    fc.assert(
      fc.property(arbTitulacaoBasalSimples, (entrada: EntradaCalculo) => {
        const saida = calculadora.calcular(entrada);
        if (saida.tipo !== "resultado" || saida.modo !== "titulacao") return;
        expect(Math.abs(saida.deltaTotalUi)).toBeLessThanOrEqual(4);
        expect([-4, 0, 2, 4]).toContain(saida.deltaTotalUi);
      }),
    );
  });

  it("o fracionamento preserva a dose total titulada", () => {
    fc.assert(
      fc.property(arbTitulacaoValida, (entrada: EntradaCalculo) => {
        const saida = calculadora.calcular(entrada);
        if (saida.tipo !== "resultado" || saida.modo !== "titulacao") return;
        const somaAplicacoes = saida.esquemaSugerido.reduce(
          (s, a) => s + a.doseUi,
          0,
        );
        expect(somaAplicacoes).toBe(saida.doseTotalDiaUi);
      }),
    );
  });
});

describe("Acima da faixa de insulinização plena (AMB-04 — alerta, não trava)", () => {
  it("dose total > 1,0 UI/kg/dia carrega o alerta DOSE_ACIMA_FAIXA_PLENA", () => {
    // Peso 40 kg, NPH 44 UI (1,1 UI/kg/dia): acima da faixa plena de 0,5–1,0 (p. 61).
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(44), jejum(150), { pesoKg: 40 }),
      ),
    );
    expect(tiposDeAlerta(r)).toContain("DOSE_ACIMA_FAIXA_PLENA");
    // Não trava: a dose sugerida segue a tabela (+2), sem clamp em 1,0 UI/kg.
    expect(r.deltaTotalUi).toBe(2);
  });

  it("a recomendação de compartilhamento de cuidados acompanha o alerta (AMB-04)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(44), jejum(150), { pesoKg: 40 }),
      ),
    );
    const tipos = r.recomendacoesAoPrescritor.map((rec) => rec.tipo);
    expect(tipos).toContain("COMPARTILHAR_CUIDADO_ESPECIALISTA");
  });
});

describe("Referência clínica obrigatória em todo resultado (RF-03, RN-01)", () => {
  it("qualquer resultado válido carrega ≥ 1 referência", () => {
    fc.assert(
      fc.property(arbTitulacaoValida, (entrada: EntradaCalculo) => {
        const saida = calculadora.calcular(entrada);
        if (saida.tipo !== "resultado") return;
        expect(saida.referencias.length).toBeGreaterThanOrEqual(1);
      }),
    );
  });
});
