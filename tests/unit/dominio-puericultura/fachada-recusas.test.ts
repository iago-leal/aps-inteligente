// Teste das RECUSAS da fachada (ação T018; RF-07, RF-09; RN-08, RN-11, RN-18).
// Cobre os quatro cenários negativos do `requirements.md` §7 que a fachada responde
// sem produzir número algum — os de números 10 a 13. Separado de `fachada.test.ts`
// por coesão e pelo teto de 400 linhas do mantenedor: um arquivo responde pelo que a
// calculadora CALCULA, este pelo que ela se RECUSA a calcular.
//
// A recusa honesta é o invariante que MD-0009 fixou (`domain.md` §8): cenário
// plausível fora da cobertura da fonte não recebe estimativa, aproximação nem
// extrapolação. Os dois pares de limite (3682/3683 e 730/731) estão aqui porque
// errar por um dia, em qualquer direção, é consequente — e porque a recusa PARCIAL
// do perímetro cefálico não pode derrubar os índices que a fonte ainda responde.
import { describe, expect, it } from "vitest";
import { CalculadoraCrescimentoInfantil } from "models/puericultura/calculadora";
import type { EntradaAvaliacao } from "models/puericultura/tipos";
import {
  codigosDe,
  comoCalculado,
  comoErroValidacao,
  comoForaDoEscopo,
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

describe("cenário 10 (negativo): idade fora da cobertura da fonte", () => {
  it("criança de 12 anos: nenhum escore, motivo IDADE_FORA_DA_COBERTURA", () => {
    const saida = avaliarApos(4383);
    const fora = comoForaDoEscopo(saida);

    expect(fora.motivo).toBe("IDADE_FORA_DA_COBERTURA");
    expect(fora.mensagem).toContain("0 a 10 anos");
    expect(saida).not.toHaveProperty("indices");
  });

  it("no par de limite: 3682 dias calcula e 3683 recusa", () => {
    expect(avaliarApos(3682, { perimetroCefalicoCm: undefined }).tipo).toBe(
      "resultado",
    );
    expect(avaliarApos(3683, { perimetroCefalicoCm: undefined }).tipo).toBe(
      "fora-do-escopo",
    );
  });
});

describe("cenário 11 (negativo): abaixo da curva de pré-termo", () => {
  it("recém-nascido de 26 semanas pós-menstruais: nenhum escore", () => {
    const saida = avaliarApos(0, {
      idadeGestacionalAoNascer: { semanas: 26, dias: 0 },
      pesoKg: 0.9,
      comprimentoCm: 34,
      posicaoDaMedicao: "deitado",
      perimetroCefalicoCm: 24,
    });
    const fora = comoForaDoEscopo(saida);

    expect(fora.motivo).toBe("ABAIXO_DA_CURVA_DE_PRETERMO");
    expect(fora.mensagem).toContain("27 semanas");
  });
});

describe("cenário 12 (negativo): perímetro cefálico acima dos 2 anos", () => {
  it("criança de 3 anos: PC fora do escopo, demais índices calculados", () => {
    const saida = avaliarApos(1095, {
      pesoKg: 14.3,
      comprimentoCm: 96.1,
      posicaoDaMedicao: "em-pe",
      perimetroCefalicoCm: 49.5,
    });
    const resultado = comoResultado(saida);
    const pc = indiceDe(resultado, "perimetro-cefalico-idade");

    expect(pc.estado).toBe("fora-do-escopo");
    expect(pc).toMatchObject({ motivo: "PC_ACIMA_DE_2_ANOS" });
    expect(comoCalculado(resultado, "peso-idade").estado).toBe("calculado");
    expect(comoCalculado(resultado, "imc-idade").estado).toBe("calculado");
  });

  it("no par de limite: 730 dias calcula o PC e 731 o põe fora de escopo", () => {
    const aos730 = avaliarApos(730, { perimetroCefalicoCm: 48 });
    const aos731 = avaliarApos(731, { perimetroCefalicoCm: 48 });

    expect(
      indiceDe(comoResultado(aos730), "perimetro-cefalico-idade").estado,
    ).toBe("calculado");
    expect(
      indiceDe(comoResultado(aos731), "perimetro-cefalico-idade").estado,
    ).toBe("fora-do-escopo");
  });
});

describe("cenário 13 (negativo): entrada inválida em três pontos", () => {
  it("os três ofensores saem juntos e nenhum escore é calculado", () => {
    const saida = calculadora.avaliar(
      entradaAvaliacao({
        sexo: undefined as unknown as EntradaAvaliacao["sexo"],
        dataDeNascimento: "2026-09-10",
        dataDaMedicao: "2026-08-10",
        pesoKg: -3,
      }),
    );
    const erro = comoErroValidacao(saida);

    expect(codigosDe(erro)).toEqual([
      "SEXO_INVALIDO",
      "DATA_DE_NASCIMENTO_FUTURA",
      "PESO_INVALIDO",
    ]);
    expect(saida).not.toHaveProperty("indices");
  });
});
