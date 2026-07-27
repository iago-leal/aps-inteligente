// Teste das idades derivadas (ação T009; RF-05, RF-16, RF-17; RN-10, RN-15 a RN-17).
// Cobre o cenário 7 do `requirements.md` §7 ("até quando a idade é corrigida") e a
// metade temporal do cenário 6 (o par 64/65 semanas pós-menstruais, cuja outra
// metade — qual padrão passa a valer — é de `padrao.ts`).
//
// Toda fronteira é exercitada no PAR de dias que a define: o último que entra e o
// primeiro que sai. Errar por um dia é justamente o que um teste de valor médio
// deixa passar, e aqui um dia a mais de correção desloca a curva inteira.
import { describe, expect, it } from "vitest";
import { diferencaEmDias, paraDiasEpoch } from "models/puericultura/datas";
import {
  derivarIdades,
  ehPreTermo,
  idadeGestacionalEmDias,
} from "models/puericultura/idades";
import { ErroDeInvariante } from "models/puericultura/tipos";
import { dataApos, entradaAvaliacao } from "../../apoio/puericultura";

const NASCIMENTO = "2026-01-10";

/** Idades de uma criança medida `dias` depois de nascer, com a IG informada ou não. */
function idadesApos(dias: number, ig?: { semanas: number; dias: number }) {
  return derivarIdades(
    entradaAvaliacao({
      dataDeNascimento: NASCIMENTO,
      dataDaMedicao: dataApos(NASCIMENTO, dias),
      idadeGestacionalAoNascer: ig,
    }),
  );
}

describe("idade cronológica em dias epoch UTC (RN-10)", () => {
  it("conta os dias corridos entre nascimento e medição", () => {
    // 2026-01-10 → 2026-08-10: 31−10 + 28 + 31 + 30 + 31 + 30 + 31 + 10 = 212 dias.
    expect(idadesApos(212).diasDeVida).toBe(212);
    expect(diferencaEmDias("2026-01-10", "2026-08-10")).toBe(212);
  });

  it("atravessa 29 de fevereiro sem perder o dia extra", () => {
    // 2024 é bissexto: de 2024-02-28 a 2024-03-01 vão 2 dias, não 1.
    expect(diferencaEmDias("2024-02-28", "2024-03-01")).toBe(2);
    expect(diferencaEmDias("2023-02-28", "2023-03-01")).toBe(1);
  });

  it("independe do fuso do ambiente: a conta é sobre Date.UTC, não sobre o relógio local", () => {
    // Se a aritmética caísse no fuso local, uma data de verão e outra de inverno
    // dariam 364 ou 366 aqui, conforme o horário de verão do ambiente de teste.
    expect(diferencaEmDias("2026-06-15", "2027-06-15")).toBe(365);
    expect(paraDiasEpoch("1970-01-01")).toBe(0);
    expect(paraDiasEpoch("2026-01-10")).toBe(20463);
  });

  it("calendário impossível é valor nulo, e chegar aqui com ele é bug interno", () => {
    expect(paraDiasEpoch("2026-02-30")).toBeNull();
    expect(diferencaEmDias("2026-02-30", "2026-03-10")).toBeNull();
    expect(() =>
      derivarIdades(
        entradaAvaliacao({
          dataDeNascimento: "2026-02-30",
          dataDaMedicao: "2026-03-10",
        }),
      ),
    ).toThrow(ErroDeInvariante);
  });

  it("medição anterior ao nascimento não produz idade negativa em silêncio", () => {
    expect(() =>
      derivarIdades(
        entradaAvaliacao({
          dataDeNascimento: "2026-08-10",
          dataDaMedicao: "2026-01-10",
        }),
      ),
    ).toThrow(ErroDeInvariante);
  });
});

describe("desconto de prematuridade: 40 semanas menos a IG ao nascer (RN-16, p. 86)", () => {
  it("o exemplo da própria caderneta: IG de 28 semanas desconta 12", () => {
    expect(idadesApos(180, { semanas: 28, dias: 0 }).descontoDeSemanas).toBe(
      12,
    );
  });

  it("IG de 30 semanas desconta 10, como o cenário 7 do requirements", () => {
    const idades = idadesApos(180, { semanas: 30, dias: 0 });

    expect(idades.descontoDeSemanas).toBe(10);
    expect(idades.diasCorrigidos).toBe(180 - 70);
  });

  it("os dias soltos da IG entram no desconto, não são truncados", () => {
    // IG 32s3d = 227 dias; 280 − 227 = 53 dias = 7,571… semanas.
    const idades = idadesApos(100, { semanas: 32, dias: 3 });

    expect(idadeGestacionalEmDias({ semanas: 32, dias: 3 })).toBe(227);
    expect(idades.descontoDeSemanas).toBeCloseTo(53 / 7, 10);
    expect(idades.diasCorrigidos).toBe(100 - 53);
  });
});

describe("quem é pré-termo, e quem só é tratado como termo (RN-15)", () => {
  it("IG ausente não é pré-termo: nenhuma correção, nenhuma idade pós-menstrual", () => {
    const idades = idadesApos(180);

    expect(ehPreTermo(undefined)).toBe(false);
    expect(idades.descontoDeSemanas).toBe(0);
    expect(idades.correcaoAtiva).toBe(false);
    expect(idades.diasCorrigidos).toBe(idades.diasDeVida);
    expect(idades.semanasPosMenstruais).toBeNull();
  });

  it("IG de 37 semanas já é termo — a regra da caderneta é para o RNPT", () => {
    const idades = idadesApos(180, { semanas: 37, dias: 0 });

    expect(ehPreTermo({ semanas: 37, dias: 0 })).toBe(false);
    expect(idades.descontoDeSemanas).toBe(0);
    expect(idades.semanasPosMenstruais).toBeNull();
  });

  it("36 semanas e 6 dias ainda é pré-termo: a fronteira é 37 exatas", () => {
    expect(ehPreTermo({ semanas: 36, dias: 6 })).toBe(true);
    expect(
      idadesApos(100, { semanas: 36, dias: 6 }).descontoDeSemanas,
    ).toBeCloseTo((280 - 258) / 7, 10);
  });
});

describe("até quando a idade é corrigida (RN-16, cenário 7)", () => {
  const IG_30 = { semanas: 30, dias: 0 };
  const IG_27 = { semanas: 27, dias: 0 };

  it("aos 1 ano e 6 meses a correção está ativa e o desconto aparece", () => {
    const idades = idadesApos(547, IG_30);

    expect(idades.correcaoAtiva).toBe(true);
    expect(idades.descontoDeSemanas).toBe(10);
    expect(idades.diasCorrigidos).toBe(547 - 70);
  });

  it("par de limite dos dois anos: 730 dias ainda corrige, 731 já não", () => {
    const dentro = idadesApos(730, IG_30);
    const fora = idadesApos(731, IG_30);

    expect(dentro.correcaoAtiva).toBe(true);
    expect(dentro.diasCorrigidos).toBe(660);
    expect(fora.correcaoAtiva).toBe(false);
    expect(fora.diasCorrigidos).toBe(731);
  });

  it("aos 2 anos e 1 mês a idade volta a ser a cronológica, sem correção", () => {
    const idades = idadesApos(761, IG_30);

    expect(idades.correcaoAtiva).toBe(false);
    expect(idades.diasCorrigidos).toBe(idades.diasDeVida);
    // O desconto continua sendo declarado: ele existe, apenas já não se aplica.
    expect(idades.descontoDeSemanas).toBe(10);
  });

  it("IG abaixo de 28 semanas estende a correção ao terceiro ano", () => {
    const aosDoisAnosEMeio = idadesApos(913, IG_27);

    expect(aosDoisAnosEMeio.correcaoAtiva).toBe(true);
    expect(aosDoisAnosEMeio.diasCorrigidos).toBe(913 - 91);
  });

  it("par de limite dos três anos: 1095 dias ainda corrige, 1096 já não", () => {
    expect(idadesApos(1095, IG_27).correcaoAtiva).toBe(true);
    expect(idadesApos(1096, IG_27).correcaoAtiva).toBe(false);
  });

  it("a extensão é da IG < 28, não de toda prematuridade: com 28 semanas para em 730", () => {
    const ig28 = { semanas: 28, dias: 0 };

    expect(idadesApos(730, ig28).correcaoAtiva).toBe(true);
    expect(idadesApos(731, ig28).correcaoAtiva).toBe(false);
    // 27s6d ainda está abaixo de 28 semanas e alcança o terceiro ano.
    expect(idadesApos(1000, { semanas: 27, dias: 6 }).correcaoAtiva).toBe(true);
  });
});

describe("idade pós-menstrual e o par 64/65 semanas (RN-17, cenário 6)", () => {
  const IG_32 = { semanas: 32, dias: 0 };

  it("é a IG ao nascer somada ao tempo de vida", () => {
    // 32 semanas ao nascer + 4 semanas de vida = 36 pós-menstruais (cenário 5).
    expect(idadesApos(28, IG_32).semanasPosMenstruais).toBe(36);
  });

  it("o par que define a transferência: 64 semanas exatas e 65", () => {
    // 32 semanas ao nascer + 224 dias (32 semanas) = 64 pós-menstruais.
    expect(idadesApos(224, IG_32).semanasPosMenstruais).toBe(64);
    expect(idadesApos(231, IG_32).semanasPosMenstruais).toBe(65);
  });

  it("é fracionária entre semanas, porque a curva de pré-termo é contínua", () => {
    expect(idadesApos(227, IG_32).semanasPosMenstruais).toBeCloseTo(
      (224 + 227) / 7,
      10,
    );
  });

  it("a fronteira inferior de 27 semanas cai neste campo, não na idade cronológica", () => {
    // Recém-nascido de 26 semanas medido no dia do nascimento (RN-18).
    expect(idadesApos(0, { semanas: 26, dias: 0 }).semanasPosMenstruais).toBe(
      26,
    );
    expect(idadesApos(7, { semanas: 26, dias: 0 }).semanasPosMenstruais).toBe(
      27,
    );
  });
});
