// T010 — Validação de entrada e erros nomeados (RF-05, RF-07; RN-03, RN-04; EC-01..08/10).
import { describe, expect, it } from "vitest";
import { CalculadoraInsulinaDM2 } from "models/insulina/calculadora";
import type { EntradaCalculo } from "models/insulina/tipos";
import {
  codigosDe,
  comoErroValidacao,
  comoForaDoEscopo,
  entradaInicio,
  entradaTitulacao,
  esquemaBasal,
  jejum,
} from "../../apoio/construtores";

const calculadora = new CalculadoraInsulinaDM2();

describe("EC-01 — peso implausível", () => {
  it.each([0, -5, 351, Number.NaN, Number.POSITIVE_INFINITY])(
    "peso %s retorna PESO_FORA_DE_FAIXA sem dose",
    (pesoKg) => {
      const erro = comoErroValidacao(
        calculadora.calcular(entradaInicio(pesoKg)),
      );
      expect(codigosDe(erro)).toContain("PESO_FORA_DE_FAIXA");
    },
  );
});

describe("EC-02 — glicemia implausível", () => {
  it.each([9, 1001, Number.NaN])(
    "glicemia %s retorna GLICEMIA_FORA_DE_FAIXA",
    (valor) => {
      const erro = comoErroValidacao(
        calculadora.calcular(entradaTitulacao(esquemaBasal(20), jejum(valor))),
      );
      expect(codigosDe(erro)).toContain("GLICEMIA_FORA_DE_FAIXA");
    },
  );

  it("o campo ofensor aponta o índice do valor inválido", () => {
    const erro = comoErroValidacao(
      calculadora.calcular(entradaTitulacao(esquemaBasal(20), jejum(120, 5))),
    );
    const ofensor = erro.ofensores.find(
      (o) => o.codigo === "GLICEMIA_FORA_DE_FAIXA",
    );
    expect(ofensor?.campo).toContain("1");
  });
});

describe("EC-04/EC-07 — esquema e glicemias obrigatórios na titulação", () => {
  it("titulação sem esquema atual retorna ESQUEMA_OBRIGATORIO", () => {
    const entrada: EntradaCalculo = {
      modo: "titulacao",
      pesoKg: 80,
      glicemias: jejum(150),
    };
    const erro = comoErroValidacao(calculadora.calcular(entrada));
    expect(codigosDe(erro)).toContain("ESQUEMA_OBRIGATORIO");
  });

  it("esquema sem aplicações retorna ESQUEMA_OBRIGATORIO", () => {
    const erro = comoErroValidacao(
      calculadora.calcular(
        entradaTitulacao({ tipo: "basal", aplicacoes: [] }, jejum(150)),
      ),
    );
    expect(codigosDe(erro)).toContain("ESQUEMA_OBRIGATORIO");
  });

  it("titulação sem nenhuma glicemia retorna GLICEMIAS_AUSENTES", () => {
    const erro = comoErroValidacao(
      calculadora.calcular(entradaTitulacao(esquemaBasal(20), [])),
    );
    expect(codigosDe(erro)).toContain("GLICEMIAS_AUSENTES");
  });
});

describe("HbA1c fora da faixa de plausibilidade (RF-05)", () => {
  it.each([2, 25, Number.NaN])(
    "HbA1c %s retorna HBA1C_FORA_DE_FAIXA",
    (hba1cPercent) => {
      const erro = comoErroValidacao(
        calculadora.calcular(entradaInicio(80, { hba1cPercent })),
      );
      expect(codigosDe(erro)).toContain("HBA1C_FORA_DE_FAIXA");
    },
  );
});

describe("RN-03 — todos os ofensores reportados de uma vez", () => {
  it("peso 400 + glicemia 5 reportam dois ofensores", () => {
    const erro = comoErroValidacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(20), jejum(5), { pesoKg: 400 }),
      ),
    );
    const codigos = codigosDe(erro);
    expect(codigos).toContain("PESO_FORA_DE_FAIXA");
    expect(codigos).toContain("GLICEMIA_FORA_DE_FAIXA");
    expect(erro.ofensores.length).toBeGreaterThanOrEqual(2);
  });

  it("cada ofensor tem campo, código estável e mensagem em português", () => {
    const erro = comoErroValidacao(calculadora.calcular(entradaInicio(0)));
    for (const ofensor of erro.ofensores) {
      expect(ofensor.campo).not.toHaveLength(0);
      expect(ofensor.codigo).toMatch(/^[A-Z0-9_]+$/);
      expect(ofensor.mensagem).not.toHaveLength(0);
    }
  });
});

describe("EC-08 — defesa em profundidade contra entrada corrompida", () => {
  it("glicemia com valor não numérico vindo da UI é rejeitada", () => {
    const entrada = entradaTitulacao(esquemaBasal(20), [
      { valorMgDl: "90" as unknown as number, momento: "jejum" },
    ]);
    const erro = comoErroValidacao(calculadora.calcular(entrada));
    expect(codigosDe(erro)).toContain("GLICEMIA_FORA_DE_FAIXA");
  });
});

describe("RN-04 — ForaDoEscopoDaFonte sem dose aproximada (RF-07)", () => {
  it("insulina fora do catálogo NPH/Regular é recusada com orientação, sem número", () => {
    const entrada = entradaTitulacao(
      {
        tipo: "basal",
        aplicacoes: [
          {
            insulina: "Glargina" as unknown as "NPH",
            momento: "ao_deitar",
            doseUi: 20,
          },
        ],
      },
      jejum(150),
    );
    const recusa = comoForaDoEscopo(calculadora.calcular(entrada));
    expect(recusa.motivo).not.toHaveLength(0);
    expect(recusa.orientacao).toMatch(/avalia|julgamento|individual/i);
    expect("doseSugeridaUi" in recusa).toBe(false);
    expect("esquemaSugerido" in recusa).toBe(false);
  });
});
