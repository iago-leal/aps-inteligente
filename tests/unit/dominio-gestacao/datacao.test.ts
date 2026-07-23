// T003 — Datação gestacional pura (RN-01..RN-04; RF-01/RF-02; cenários do requirements §7).
// Fonte: Guia Rápido Pré-Natal — SMS-Rio, 4.ª ed., 2025, pp. 31–32.
import { describe, expect, it } from "vitest";
import {
  dppPorNaegele,
  dumEquivalente,
  igEntre,
  trimestreDaIg,
} from "models/gestacao/datacao";

describe("RN-01 — IG pela DUM: dias decorridos ÷ 7, em semanas e dias (p. 31)", () => {
  it("cenário 1 do requirements: DUM 2026-01-01 na referência 2026-07-23 → 29 semanas e 0 dias", () => {
    expect(igEntre("2026-01-01", "2026-07-23")).toEqual({
      semanas: 29,
      dias: 0,
    });
  });

  it("DUM no próprio dia de referência → 0 semanas e 0 dias", () => {
    expect(igEntre("2026-07-23", "2026-07-23")).toEqual({
      semanas: 0,
      dias: 0,
    });
  });

  it("resto em dias: DUM 10 dias antes da referência → 1 semana e 3 dias", () => {
    expect(igEntre("2026-07-13", "2026-07-23")).toEqual({
      semanas: 1,
      dias: 3,
    });
  });

  it("atravessa 29 de fevereiro de ano bissexto sem perder um dia", () => {
    // 2024 é bissexto: 2024-02-28 → 2024-03-07 são 8 dias corridos.
    expect(igEntre("2024-02-28", "2024-03-07")).toEqual({
      semanas: 1,
      dias: 1,
    });
  });

  it("DUM em 29 de fevereiro é data válida e conta normalmente", () => {
    expect(igEntre("2024-02-29", "2024-03-07")).toEqual({
      semanas: 1,
      dias: 0,
    });
  });
});

describe("RN-02 — DPP pela regra de Naegele: +7 dias, +9 meses (p. 32; D-03)", () => {
  it("reproduz o exemplo literal da fonte: DUM 03/02/2020 → DPP 10/11/2020", () => {
    expect(dppPorNaegele("2020-02-03")).toBe("2020-11-10");
  });

  it("cenário 1 do requirements: DUM 2026-01-01 → DPP 2026-10-08", () => {
    expect(dppPorNaegele("2026-01-01")).toBe("2026-10-08");
  });

  it("transbordo de dia no mês destino: DUM 24/05/2026 (+7d = 31/05; fev/2027 não tem dia 31) → 03/03/2027", () => {
    // Normalização por transbordo documentada em investigation.md §4.
    expect(dppPorNaegele("2026-05-24")).toBe("2027-03-03");
  });

  it("soma de meses com virada de ano: DUM 2025-10-15 → DPP 2026-07-22", () => {
    expect(dppPorNaegele("2025-10-15")).toBe("2026-07-22");
  });
});

describe("RN-03 — DUM equivalente do ultrassom: dataExame − (semanas×7 + dias)", () => {
  it("cenário 2 do requirements: exame 2026-06-10 com 12s3d → DUM equivalente 2026-03-15", () => {
    expect(dumEquivalente("2026-06-10", 12, 3)).toBe("2026-03-15");
  });

  it("exame com IG 0s0d → DUM equivalente no próprio dia do exame", () => {
    expect(dumEquivalente("2026-06-10", 0, 0)).toBe("2026-06-10");
  });

  it("cenário da entrada dupla: exame 2026-03-10 com 8s0d → DUM equivalente 2026-01-13", () => {
    expect(dumEquivalente("2026-03-10", 8, 0)).toBe("2026-01-13");
  });

  it("derivação encadeada (cenário 2): IG na referência 2026-07-23 a partir da DUM equivalente → 18s4d; DPP 2026-12-22", () => {
    const dum = dumEquivalente("2026-06-10", 12, 3);
    expect(igEntre(dum, "2026-07-23")).toEqual({ semanas: 18, dias: 4 });
    expect(dppPorNaegele(dum)).toBe("2026-12-22");
  });
});

describe("RN-04 — Trimestres: cortes convencionais 13+6 / 27+6 (premissa 🟡 do roadmap §4)", () => {
  it("0s0d é 1.º trimestre", () => {
    expect(trimestreDaIg({ semanas: 0, dias: 0 })).toBe(1);
  });

  it("13s6d ainda é 1.º trimestre; 14s0d já é 2.º", () => {
    expect(trimestreDaIg({ semanas: 13, dias: 6 })).toBe(1);
    expect(trimestreDaIg({ semanas: 14, dias: 0 })).toBe(2);
  });

  it("27s6d ainda é 2.º trimestre; 28s0d já é 3.º", () => {
    expect(trimestreDaIg({ semanas: 27, dias: 6 })).toBe(2);
    expect(trimestreDaIg({ semanas: 28, dias: 0 })).toBe(3);
  });

  it("cenário 1 do requirements: 29s0d é 3.º trimestre", () => {
    expect(trimestreDaIg({ semanas: 29, dias: 0 })).toBe(3);
  });
});
