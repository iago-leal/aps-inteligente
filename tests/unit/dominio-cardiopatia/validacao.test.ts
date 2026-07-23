// T008 — Validação com coleta total (RF-09/RN-09) e fora-de-escopo por idade
// (RF-06/RN-06). Idade plausível fora de 30–69 é fora-do-escopo, não ofensor.
// Feature 010.
import { describe, expect, it } from "vitest";
import { CalculadoraCardiopatiaIsquemica } from "models/cardiopatia-isquemica/calculadora";
import { validarEntrada } from "models/cardiopatia-isquemica/validacao";
import type {
  EntradaAvaliacao,
  FatorDeRisco,
  Sexo,
} from "models/cardiopatia-isquemica/tipos";

function entrada(over: Partial<EntradaAvaliacao> = {}): EntradaAvaliacao {
  return {
    idadeAnos: 55,
    sexo: "masculino",
    caracteristicas: {
      retroesternal: true,
      provocadaPorEsforcoOuEstresse: true,
      aliviaComRepousoOuNitrato: true,
    },
    fatoresDeRisco: [],
    ...over,
  };
}

const motor = new CalculadoraCardiopatiaIsquemica();

describe("Validação de entrada (RN-09)", () => {
  it("entrada válida não tem ofensores", () => {
    expect(validarEntrada(entrada())).toEqual([]);
  });

  it("idade não inteira é ofensor IDADE_INVALIDA", () => {
    const ofensores = validarEntrada(entrada({ idadeAnos: 55.5 }));
    expect(ofensores.map((o) => o.codigo)).toContain("IDADE_INVALIDA");
  });

  it("coleta TODOS os ofensores de uma vez, nunca só o primeiro", () => {
    const ofensores = validarEntrada(
      entrada({
        idadeAnos: -3,
        sexo: "indefinido" as unknown as Sexo,
        fatoresDeRisco: ["colesterol" as unknown as FatorDeRisco],
      }),
    );
    expect(ofensores.map((o) => o.codigo).sort()).toEqual([
      "FATOR_DE_RISCO_INVALIDO",
      "IDADE_INVALIDA",
      "SEXO_INVALIDO",
    ]);
  });
});

describe("Fachada: entrada inválida vira valor, não exceção (ADR 0004)", () => {
  it("idade implausível → SaidaAvaliacao erro-validacao", () => {
    const saida = motor.avaliar(entrada({ idadeAnos: 400 }));
    expect(saida.tipo).toBe("erro-validacao");
  });
});

describe("Fachada: idade plausível fora de 30–69 → fora-do-escopo (RN-06)", () => {
  it.each([25, 29, 70, 74])("idade %i → fora-do-escopo, sem número", (idade) => {
    const saida = motor.avaliar(entrada({ idadeAnos: idade }));
    expect(saida.tipo).toBe("fora-do-escopo");
    if (saida.tipo === "fora-do-escopo") {
      expect(saida.motivo).toBe("IDADE_FORA_DA_TABELA");
      expect(saida.mensagem).toMatch(/30 a 69/);
      expect(saida.referencia.localizacao).toMatch(/Quadro 2/);
    }
  });
});
