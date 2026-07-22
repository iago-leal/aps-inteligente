// @vitest-environment jsdom
// T014 — Painel de resultado (RF-03/RF-04/RF-08/RF-09 do requirements; RF-04..RF-08/EC-07 da UI).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PainelResultado,
  type EstadoResultado,
} from "interface/calculadora/resultado";
import type {
  ErroValidacao,
  ForaDoEscopoDaFonte,
  ResultadoInicio,
  ResultadoTitulacao,
} from "models/insulina/tipos";

afterEach(cleanup);

const referencia = {
  fonteId: "guia-rapido-dm-sms-rio",
  versaoEdicao: "2.ª ed. atualizada, 2023",
  localizacao: "Figura 4, p. 62",
} as const;

const resultadoComHipoglicemia: ResultadoTitulacao = {
  tipo: "resultado",
  modo: "titulacao",
  esquemaSugerido: [{ insulina: "NPH", momento: "ao_deitar", doseUi: 16 }],
  doseTotalDiaUi: 16,
  deltaTotalUi: -4,
  naMeta: false,
  alertas: [
    {
      tipo: "HIPOGLICEMIA",
      mensagem: "Hipoglicemia detectada no período",
      referencia,
    },
  ],
  recomendacoesAoPrescritor: [],
  referencias: [referencia],
};

function renderizaSucesso(
  sobrescreve: Partial<Parameters<typeof PainelResultado>[0]> = {},
) {
  const onConfirmarRevisao = vi.fn();
  const onNovoCalculo = vi.fn();
  render(
    <PainelResultado
      estado={{ estado: "sucesso", saida: resultadoComHipoglicemia }}
      desatualizado={false}
      revisaoConfirmada={false}
      onConfirmarRevisao={onConfirmarRevisao}
      onNovoCalculo={onNovoCalculo}
      {...sobrescreve}
    />,
  );
  return { onConfirmarRevisao, onNovoCalculo };
}

function posicaoNoDocumento(a: Element, b: Element): "antes" | "depois" {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
    ? "antes"
    : "depois";
}

describe("Ordem visual: alertas → dose/delta → fonte (RF-03/RF-04 do requirements)", () => {
  it("o alerta de hipoglicemia precede a dose, e a dose precede a referência", () => {
    renderizaSucesso();
    const alerta = screen.getByText(/hipoglicemia detectada/i);
    const dose = screen.getAllByText(/16 UI/)[0];
    const fonte = screen.getByText(/figura 4, p\. 62/i);
    expect(posicaoNoDocumento(alerta, dose)).toBe("antes");
    expect(posicaoNoDocumento(dose, fonte)).toBe("antes");
  });

  it("o delta é exibido junto da dose (RF-02 do requirements)", () => {
    renderizaSucesso();
    expect(screen.getByText(/reduzir 4 UI|−4 UI|-4 UI/i)).toBeTruthy();
  });
});

describe("Revisão explícita habilita o bloco final (RF-08 do requirements; RN-06)", () => {
  it("o bloco 'pronto para prescrever' nasce desabilitado", () => {
    renderizaSucesso();
    const bloco = screen.getByTestId("bloco-pronto-para-prescrever");
    expect(bloco.getAttribute("aria-disabled")).toBe("true");
  });

  it("marcar 'Revisei a dose e a fonte' notifica o contêiner", () => {
    const { onConfirmarRevisao } = renderizaSucesso();
    fireEvent.click(
      screen.getByRole("checkbox", { name: /revisei a dose e a fonte/i }),
    );
    expect(onConfirmarRevisao).toHaveBeenCalledWith(true);
  });

  it("com a revisão confirmada, o bloco final habilita", () => {
    renderizaSucesso({ revisaoConfirmada: true });
    const bloco = screen.getByTestId("bloco-pronto-para-prescrever");
    expect(bloco.getAttribute("aria-disabled")).toBe("false");
  });
});

describe("Invalidação por edição (RF-08 do requirements; EC-03 da UI)", () => {
  it("desatualizado mostra o aviso de recalcular", () => {
    renderizaSucesso({ desatualizado: true });
    expect(screen.getByText(/os dados mudaram/i)).toBeTruthy();
  });

  it("desatualizado desabilita o bloco final mesmo com revisão anterior", () => {
    renderizaSucesso({ desatualizado: true, revisaoConfirmada: true });
    const bloco = screen.getByTestId("bloco-pronto-para-prescrever");
    expect(bloco.getAttribute("aria-disabled")).toBe("true");
  });

  it("desatualizado desmarca a confirmação de revisão", () => {
    renderizaSucesso({ desatualizado: true, revisaoConfirmada: false });
    const caixa = screen.getByRole("checkbox", {
      name: /revisei a dose e a fonte/i,
    });
    expect((caixa as HTMLInputElement).checked).toBe(false);
  });
});

describe("Erros do motor com apresentação própria (RF-09 do requirements; RF-08 da UI)", () => {
  const erroValidacao: ErroValidacao = {
    tipo: "erro-validacao",
    ofensores: [
      {
        campo: "pesoKg",
        codigo: "PESO_FORA_DE_FAIXA",
        mensagem: "Peso fora da faixa plausível",
      },
      {
        campo: "glicemias[0]",
        codigo: "GLICEMIA_FORA_DE_FAIXA",
        mensagem: "Glicemia fora da faixa plausível",
      },
    ],
  };

  const foraDoEscopo: ForaDoEscopoDaFonte = {
    tipo: "fora-do-escopo",
    motivo: "O guia não titula insulinas análogas no DM2",
    orientacao: "A conduta exige avaliação clínica individual",
  };

  it("ErroValidacao lista todos os campos ofensores", () => {
    renderizaSucesso({ estado: { estado: "erro", saida: erroValidacao } });
    expect(screen.getByText(/peso fora da faixa/i)).toBeTruthy();
    expect(screen.getByText(/glicemia fora da faixa/i)).toBeTruthy();
    expect(screen.queryByText(/16 UI/)).toBeNull();
  });

  it("ForaDoEscopoDaFonte explica o limite e orienta, sem sugerir número", () => {
    renderizaSucesso({ estado: { estado: "erro", saida: foraDoEscopo } });
    expect(screen.getByText(/não titula insulinas análogas/i)).toBeTruthy();
    expect(screen.getByText(/avaliação clínica individual/i)).toBeTruthy();
    expect(screen.queryByTestId("bloco-pronto-para-prescrever")).toBeNull();
  });

  it("falha inesperada exibe o painel honesto orientando a não prescrever (EC-07)", () => {
    const estado: EstadoResultado = { estado: "falha-inesperada" };
    renderizaSucesso({ estado });
    expect(screen.getByText(/não prescreva/i)).toBeTruthy();
    expect(screen.queryByText(/16 UI/)).toBeNull();
  });
});

// T018 (feature 001-integrar-design-claude) — saídas novas de antidiabéticos orais.
describe("Feature 001 — alerta e recomendações de metformina/TFG renderizados", () => {
  const referenciaMetformina = {
    fonteId: "guia-rapido-dm-sms-rio",
    versaoEdicao: "2.ª ed. atualizada, 2023",
    localizacao: "p. 28; p. 58",
  } as const;

  const resultadoComAntidiabeticos: ResultadoTitulacao = {
    ...resultadoComHipoglicemia,
    alertas: [
      {
        tipo: "METFORMINA_NAO_OTIMIZADA",
        mensagem:
          "Dose de metformina abaixo da faixa otimizada (2000–2550 mg/dia).",
        referencia: referenciaMetformina,
      },
    ],
    recomendacoesAoPrescritor: [
      {
        tipo: "SUSPENDER_METFORMINA_TFG",
        mensagem: "TFG abaixo de 30: suspender a metformina.",
        referencia: referenciaMetformina,
      },
      {
        tipo: "SUSPENDER_SULFONILUREIA",
        mensagem:
          "Uso de sulfonilureia não informado: se estiver em uso, suspender ao fracionar a NPH.",
        referencia: referenciaMetformina,
      },
    ],
    referencias: [referencia, referenciaMetformina],
  };

  it("o alerta novo aparece no bloco de alertas", () => {
    renderizaSucesso({
      estado: { estado: "sucesso", saida: resultadoComAntidiabeticos },
    });
    expect(screen.getByText(/abaixo da faixa otimizada/i)).toBeTruthy();
  });

  it("as recomendações novas aparecem na lista ao prescritor", () => {
    renderizaSucesso({
      estado: { estado: "sucesso", saida: resultadoComAntidiabeticos },
    });
    expect(screen.getByText(/suspender a metformina/i)).toBeTruthy();
    expect(
      screen.getByText(/se estiver em uso, suspender ao fracionar/i),
    ).toBeTruthy();
  });

  it("a referência nova (p. 28; p. 58) aparece na fonte clínica", () => {
    renderizaSucesso({
      estado: { estado: "sucesso", saida: resultadoComAntidiabeticos },
    });
    expect(screen.getByText(/p\. 28; p\. 58/)).toBeTruthy();
  });
});

// T002 (feature 005-redacao-metformina-tfg) — adjacência subordinada do par
// metformina × TFG (RF-01/RF-03 da feature; cenários Gherkin do requirements §7).
// Nenhuma asserção de texto de mensagem clínica muda: só a estrutura da lista.
describe("Feature 005 — recomendação de TFG subordinada à de manutenção", () => {
  const referenciaInicio = {
    fonteId: "guia-rapido-dm-sms-rio",
    versaoEdicao: "2.ª ed. atualizada, 2023",
    localizacao: "p. 60; Figura 4, p. 62",
  } as const;

  const referenciaTfg = {
    fonteId: "guia-rapido-dm-sms-rio",
    versaoEdicao: "2.ª ed. atualizada, 2023",
    localizacao: "p. 58",
  } as const;

  const manterMetformina = {
    tipo: "MANTER_METFORMINA",
    mensagem: "Manter a metformina ao iniciar a insulina NPH.",
    referencia: referenciaInicio,
  } as const;

  const manterSulfonilureia = {
    tipo: "MANTER_SULFONILUREIA",
    mensagem: "Manter a sulfonilureia ao iniciar a insulina NPH.",
    referencia: referenciaInicio,
  } as const;

  const aferirJejum = {
    tipo: "AFERIR_JEJUM_3X_SEMANA_15_DIAS",
    mensagem:
      "Orientar aferição de glicemia capilar em jejum três vezes por semana, com registro, durante 15 dias.",
    referencia: referenciaInicio,
  } as const;

  const reduzirPorTfg = {
    tipo: "REDUZIR_METFORMINA_TFG",
    mensagem:
      "TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%.",
    referencia: referenciaTfg,
  } as const;

  const suspenderPorTfg = {
    tipo: "SUSPENDER_METFORMINA_TFG",
    mensagem:
      "TFG abaixo de 30 mL/min/1,73 m²: suspender a metformina, pelo risco de acidose lática.",
    referencia: referenciaTfg,
  } as const;

  const resultadoInicioBase: ResultadoInicio = {
    tipo: "resultado",
    modo: "inicio",
    faixaDoseUi: { minUi: 10, maxUi: 15 },
    faixaPorPesoUi: { minUi: 8, maxUi: 16 },
    aplicacaoSugerida: { insulina: "NPH", momento: "ao_deitar" },
    alertas: [],
    recomendacoesAoPrescritor: [
      manterMetformina,
      manterSulfonilureia,
      aferirJejum,
    ],
    referencias: [referenciaInicio],
  };

  function itemDaLista(padrao: RegExp): HTMLElement {
    const item = screen.getByText(padrao).closest("li");
    if (!item) throw new Error(`Recomendação fora de <li>: ${padrao}`);
    return item as HTMLElement;
  }

  it("com TFG em faixa de redução, o item de redução aninha sob o de manutenção (RF-01)", () => {
    renderizaSucesso({
      estado: {
        estado: "sucesso",
        saida: {
          ...resultadoInicioBase,
          recomendacoesAoPrescritor: [
            manterMetformina,
            manterSulfonilureia,
            aferirJejum,
            reduzirPorTfg,
          ],
          referencias: [referenciaInicio, referenciaTfg],
        },
      },
    });

    const itemManter = itemDaLista(/manter a metformina ao iniciar/i);
    const itemReduzir = itemDaLista(/reduzir a dose de metformina em 50%/i);
    expect(itemManter.contains(itemReduzir)).toBe(true);
    expect(itemManter.querySelector("ul")).not.toBeNull();
    expect(
      itemDaLista(/manter a sulfonilureia/i).contains(itemReduzir),
    ).toBe(false);
  });

  it("sem TFG em faixa de redução, a lista permanece plana (RF-03)", () => {
    renderizaSucesso({
      estado: { estado: "sucesso", saida: resultadoInicioBase },
    });

    const itemManter = itemDaLista(/manter a metformina ao iniciar/i);
    expect(itemManter.querySelector("ul")).toBeNull();
    expect(
      screen.queryByText(/reduzir a dose de metformina/i),
    ).toBeNull();
  });

  it("com TFG de suspensão, a supressão da feature 001 segue valendo e nada aninha", () => {
    renderizaSucesso({
      estado: {
        estado: "sucesso",
        saida: {
          ...resultadoInicioBase,
          recomendacoesAoPrescritor: [
            manterSulfonilureia,
            aferirJejum,
            suspenderPorTfg,
          ],
          referencias: [referenciaInicio, referenciaTfg],
        },
      },
    });

    expect(
      screen.queryByText(/manter a metformina ao iniciar/i),
    ).toBeNull();
    const itemSuspender = itemDaLista(/suspender a metformina/i);
    expect(itemSuspender.parentElement?.closest("li")).toBeNull();
  });

  it("redução por TFG sem item de manutenção permanece no topo (fallback, titulação sem fracionamento)", () => {
    renderizaSucesso({
      estado: {
        estado: "sucesso",
        saida: {
          ...resultadoComHipoglicemia,
          recomendacoesAoPrescritor: [reduzirPorTfg],
          referencias: [referencia, referenciaTfg],
        },
      },
    });

    const itemReduzir = itemDaLista(/reduzir a dose de metformina em 50%/i);
    expect(itemReduzir.parentElement?.closest("li")).toBeNull();
  });
});

describe("Disclaimer permanente e novo cálculo (RF-08/RF-10 do requirements)", () => {
  it("o disclaimer de apoio à decisão está sempre visível", () => {
    for (const estado of [
      { estado: "vazio" },
      { estado: "sucesso", saida: resultadoComHipoglicemia },
      { estado: "falha-inesperada" },
    ] as EstadoResultado[]) {
      renderizaSucesso({ estado });
      expect(screen.getByText(/não substitui o julgamento/i)).toBeTruthy();
      cleanup();
    }
  });

  it("'novo cálculo' aciona a limpeza no contêiner", () => {
    const { onNovoCalculo } = renderizaSucesso();
    fireEvent.click(screen.getByRole("button", { name: /novo cálculo/i }));
    expect(onNovoCalculo).toHaveBeenCalled();
  });
});
