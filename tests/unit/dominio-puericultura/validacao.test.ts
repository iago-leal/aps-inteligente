// Teste da validação por coleta total (ação T014; RF-09, RN-11).
// Cobre o cenário negativo "entrada inválida em três pontos" do `requirements.md` §7.
//
// O que este arquivo vigia não é a existência de cada ofensor isolado, mas a
// SIMULTANEIDADE: o valor da coleta total está em devolver os três de uma vez. Um
// validador que para no primeiro erro passa em todos os testes de caso único e falha
// exatamente onde o médico sente — corrigindo um campo por tentativa.
import { describe, expect, it } from "vitest";
import { validarEntrada } from "models/puericultura/validacao";
import type { EntradaAvaliacao } from "models/puericultura/tipos";
import { entradaAvaliacao } from "../../apoio/puericultura";

function codigos(extras: Partial<EntradaAvaliacao>): string[] {
  return validarEntrada(entradaAvaliacao(extras)).map((o) => o.codigo);
}

describe("entrada válida não produz ofensor", () => {
  it("o primeiro cenário Gherkin passa limpo", () => {
    expect(validarEntrada(entradaAvaliacao())).toEqual([]);
  });

  it("idade gestacional ausente não é ofensor: é premissa declarada (RN-15)", () => {
    expect(codigos({ idadeGestacionalAoNascer: undefined })).toEqual([]);
  });

  it("uma medida só basta — as demais são opcionais (RF-06)", () => {
    expect(
      codigos({
        pesoKg: 8.2,
        comprimentoCm: undefined,
        posicaoDaMedicao: undefined,
        perimetroCefalicoCm: undefined,
      }),
    ).toEqual([]);
  });
});

describe("coleta total: três ofensores simultâneos (cenário negativo)", () => {
  it("sem sexo, com nascimento posterior à medição e peso negativo → três ofensores", () => {
    const ofensores = validarEntrada(
      entradaAvaliacao({
        sexo: undefined as unknown as EntradaAvaliacao["sexo"],
        dataDeNascimento: "2026-09-10",
        dataDaMedicao: "2026-08-10",
        pesoKg: -3,
      }),
    );

    expect(ofensores.map((o) => o.codigo)).toEqual([
      "SEXO_INVALIDO",
      "DATA_DE_NASCIMENTO_FUTURA",
      "PESO_INVALIDO",
    ]);
    expect(ofensores).toHaveLength(3);
  });

  it("cada ofensor nomeia o seu campo, para a tela ancorar a mensagem", () => {
    const ofensores = validarEntrada(
      entradaAvaliacao({
        sexo: "outro" as unknown as EntradaAvaliacao["sexo"],
        pesoKg: 0,
      }),
    );

    expect(ofensores.map((o) => o.campo)).toEqual(["sexo", "pesoKg"]);
    expect(ofensores.every((o) => o.mensagem.length > 0)).toBe(true);
  });
});

describe("datas (RN-10, RN-11)", () => {
  it("calendário impossível é ofensor, nunca normalização silenciosa", () => {
    expect(codigos({ dataDeNascimento: "2026-02-30" })).toEqual([
      "DATA_DE_NASCIMENTO_INVALIDA",
    ]);
    expect(codigos({ dataDaMedicao: "2026-13-01" })).toEqual([
      "DATA_DA_MEDICAO_INVALIDA",
    ]);
  });

  it("data vazia ou fora do formato ISO é ofensor", () => {
    expect(codigos({ dataDeNascimento: "" })).toEqual([
      "DATA_DE_NASCIMENTO_INVALIDA",
    ]);
    expect(codigos({ dataDaMedicao: "10/08/2026" })).toEqual([
      "DATA_DA_MEDICAO_INVALIDA",
    ]);
  });

  it("nascimento futuro trava; nascimento no mesmo dia da medição, não", () => {
    expect(
      codigos({ dataDeNascimento: "2026-08-11", dataDaMedicao: "2026-08-10" }),
    ).toEqual(["DATA_DE_NASCIMENTO_FUTURA"]);
    expect(
      codigos({ dataDeNascimento: "2026-08-10", dataDaMedicao: "2026-08-10" }),
    ).toEqual([]);
  });

  it("data inválida não gera também o ofensor de ordem: um erro, uma mensagem", () => {
    expect(
      codigos({ dataDeNascimento: "2026-02-30", dataDaMedicao: "2026-08-10" }),
    ).toEqual(["DATA_DE_NASCIMENTO_INVALIDA"]);
  });
});

describe("medidas e faixas de plausibilidade (RN-11 🟡)", () => {
  it("nenhuma medida informada é ofensor próprio", () => {
    expect(
      codigos({
        pesoKg: undefined,
        comprimentoCm: undefined,
        posicaoDaMedicao: undefined,
        perimetroCefalicoCm: undefined,
      }),
    ).toEqual(["NENHUMA_MEDIDA_INFORMADA"]);
  });

  it("peso: zero e negativo travam; 150 kg passa e 150,1 não", () => {
    expect(codigos({ pesoKg: 0 })).toEqual(["PESO_INVALIDO"]);
    expect(codigos({ pesoKg: -3 })).toEqual(["PESO_INVALIDO"]);
    expect(codigos({ pesoKg: 150 })).toEqual([]);
    expect(codigos({ pesoKg: 150.1 })).toEqual(["PESO_INVALIDO"]);
  });

  it("comprimento: fora de 20–200 cm trava nas duas pontas", () => {
    expect(codigos({ comprimentoCm: 19 })).toEqual(["COMPRIMENTO_INVALIDO"]);
    expect(codigos({ comprimentoCm: 201 })).toEqual(["COMPRIMENTO_INVALIDO"]);
    expect(codigos({ comprimentoCm: 200 })).toEqual([]);
  });

  it("perímetro cefálico: fora de 20–70 cm trava", () => {
    expect(codigos({ perimetroCefalicoCm: 19.9 })).toEqual([
      "PERIMETRO_CEFALICO_INVALIDO",
    ]);
    expect(codigos({ perimetroCefalicoCm: 70.5 })).toEqual([
      "PERIMETRO_CEFALICO_INVALIDO",
    ]);
  });

  it("valor não finito trava como qualquer outro implausível", () => {
    expect(codigos({ pesoKg: Number.NaN })).toEqual(["PESO_INVALIDO"]);
    expect(codigos({ pesoKg: Number.POSITIVE_INFINITY })).toEqual([
      "PESO_INVALIDO",
    ]);
  });

  it("comprimento sem posição declarada trava: não há default silencioso (RN-09)", () => {
    expect(
      codigos({ comprimentoCm: 68.5, posicaoDaMedicao: undefined }),
    ).toEqual(["POSICAO_DA_MEDICAO_AUSENTE"]);
  });

  it("sem comprimento, a posição não faz falta", () => {
    expect(
      codigos({ comprimentoCm: undefined, posicaoDaMedicao: undefined }),
    ).toEqual([]);
  });
});

describe("idade gestacional ao nascer, quando informada (RN-11)", () => {
  it("fora de 22–42 semanas trava nas duas pontas", () => {
    expect(
      codigos({ idadeGestacionalAoNascer: { semanas: 21, dias: 0 } }),
    ).toEqual(["IDADE_GESTACIONAL_INVALIDA"]);
    expect(
      codigos({ idadeGestacionalAoNascer: { semanas: 43, dias: 0 } }),
    ).toEqual(["IDADE_GESTACIONAL_INVALIDA"]);
    expect(
      codigos({ idadeGestacionalAoNascer: { semanas: 22, dias: 0 } }),
    ).toEqual([]);
    expect(
      codigos({ idadeGestacionalAoNascer: { semanas: 42, dias: 6 } }),
    ).toEqual([]);
  });

  it("dias fora de 0–6 travam: sete dias são uma semana, não um resto", () => {
    expect(
      codigos({ idadeGestacionalAoNascer: { semanas: 30, dias: 7 } }),
    ).toEqual(["IDADE_GESTACIONAL_INVALIDA"]);
    expect(
      codigos({ idadeGestacionalAoNascer: { semanas: 30, dias: -1 } }),
    ).toEqual(["IDADE_GESTACIONAL_INVALIDA"]);
  });

  it("semanas ou dias fracionários travam", () => {
    expect(
      codigos({ idadeGestacionalAoNascer: { semanas: 30.5, dias: 0 } }),
    ).toEqual(["IDADE_GESTACIONAL_INVALIDA"]);
    expect(
      codigos({ idadeGestacionalAoNascer: { semanas: 30, dias: 2.5 } }),
    ).toEqual(["IDADE_GESTACIONAL_INVALIDA"]);
  });

  it("um só ofensor para o par semanas/dias, ainda que os dois estejam errados", () => {
    expect(
      codigos({ idadeGestacionalAoNascer: { semanas: 50, dias: 9 } }),
    ).toEqual(["IDADE_GESTACIONAL_INVALIDA"]);
  });
});
