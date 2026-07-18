// @vitest-environment jsdom
// T014 — Painel de resultado (RF-03/RF-04/RF-08/RF-09 do requirements; RF-04..RF-08/EC-07 da UI).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PainelResultado,
  type EstadoResultado,
} from "@/interface/calculadora/resultado";
import type {
  ErroValidacao,
  ForaDoEscopoDaFonte,
  ResultadoTitulacao,
} from "@/dominio/insulina/tipos";

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
