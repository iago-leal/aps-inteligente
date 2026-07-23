// @vitest-environment jsdom
// T010 — Tela da avaliação de dor torácica (RF-01..RF-07, RF-09, RF-10;
// RN-06/RN-09; D-08: sem ritual de revisão — estratificar não é prescrever dose).
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppCardiologia } from "interface/cardiologia/app";

afterEach(cleanup);

/** Asserções de resultado são escopadas ao painel (aside role=complementary),
 *  para não colidir com o material de referência consultável (RF-10). */
function painel() {
  return within(screen.getByRole("complementary", { name: /resultado/i }));
}

function preencheIdade(valor: string) {
  fireEvent.change(screen.getByLabelText(/idade/i), {
    target: { value: valor },
  });
}

function marca(rotulo: RegExp) {
  fireEvent.click(screen.getByLabelText(rotulo));
}

function avalia() {
  fireEvent.click(screen.getByRole("button", { name: /^avaliar$/i }));
}

describe("Angina típica de alto risco (RF-01/RF-02/RF-04; requirements §7)", () => {
  it("homem 55 com as 3 características → angina típica, base 93%, estrato alto, encaminhamento", () => {
    render(<AppCardiologia />);
    preencheIdade("55");
    marca(/masculino/i);
    marca(/retroesternal/i);
    marca(/exercício ou estresse/i);
    marca(/alívio rápido/i);
    avalia();

    expect(painel().getByRole("heading", { name: /angina típica/i })).toBeTruthy();
    expect(painel().getByText(/93%/)).toBeTruthy();
    expect(painel().getByText(/^alta$/i)).toBeTruthy();
    expect(painel().getByText(/cardiologista/i)).toBeTruthy();
    expect(painel().getAllByText(/telecondutas/i).length).toBeGreaterThan(0);
  });
});

describe("Dor não anginosa sem fatores → baixa (RF-04; requirements §7)", () => {
  it("uma característica, sem fator → não anginosa, exame não indicado, causas não cardíacas", () => {
    render(<AppCardiologia />);
    preencheIdade("55");
    marca(/masculino/i);
    marca(/retroesternal/i);
    avalia();

    expect(
      painel().getByRole("heading", { name: /dor não anginosa/i }),
    ).toBeTruthy();
    expect(painel().getByText(/exame funcional não indicado/i)).toBeTruthy();
    expect(painel().getByText(/musculoesquelética/i)).toBeTruthy();
  });
});

describe("Fora do escopo por idade (RF-06/RN-06)", () => {
  it("idade 74 → mensagem de fora do escopo, sem número de probabilidade", () => {
    render(<AppCardiologia />);
    preencheIdade("74");
    marca(/masculino/i);
    marca(/retroesternal/i);
    avalia();

    expect(painel().getByText(/fora do escopo da fonte/i)).toBeTruthy();
    expect(painel().getByText(/30 a 69/)).toBeTruthy();
    expect(painel().queryByText(/estrato de probabilidade/i)).toBeNull();
  });
});

describe("Advertência de instabilidade (RF-07/RN-07)", () => {
  it("sinais de instabilidade geram alerta de encaminhamento emergencial", () => {
    render(<AppCardiologia />);
    preencheIdade("55");
    marca(/masculino/i);
    marca(/retroesternal/i);
    marca(/angina instável/i);
    avalia();
    const alertas = painel().getAllByRole("alert");
    expect(
      alertas.some((a) => /emergencial/i.test(a.textContent ?? "")),
    ).toBe(true);
  });
});

describe("Validação com coleta total (RF-09/RN-09)", () => {
  it("idade vazia e sexo não informado → dois ofensores de uma vez, sem resultado", () => {
    render(<AppCardiologia />);
    avalia();
    const alertas = painel().getAllByRole("alert");
    expect(alertas.length).toBeGreaterThanOrEqual(2);
    expect(painel().getByText(/idade inválida/i)).toBeTruthy();
    expect(painel().getByText(/sexo inválido/i)).toBeTruthy();
    expect(
      painel().queryByRole("heading", { name: /angina|dor não anginosa/i }),
    ).toBeNull();
  });
});

describe("Sem ritual de revisão nesta tela (D-08)", () => {
  it("não há checkbox 'Revisei' nem bloco 'pronto para prescrever'", () => {
    render(<AppCardiologia />);
    preencheIdade("55");
    marca(/masculino/i);
    marca(/retroesternal/i);
    avalia();
    expect(screen.queryByText(/pronto para prescrever/i)).toBeNull();
    expect(screen.queryByLabelText(/revisei/i)).toBeNull();
  });
});

describe("Material de referência (RF-10)", () => {
  it("exibe os blocos consultáveis de CCS e tratamento, sem cálculo", () => {
    render(<AppCardiologia />);
    expect(screen.getByText(/classificação funcional da angina/i)).toBeTruthy();
    expect(screen.getByText(/tratamento farmacológico e tabela 1/i)).toBeTruthy();
  });
});

describe("Invalidação por edição e falha honesta (padrões do legado)", () => {
  it("editar depois de avaliar marca o resultado como desatualizado", () => {
    render(<AppCardiologia />);
    preencheIdade("55");
    marca(/masculino/i);
    marca(/retroesternal/i);
    avalia();
    marca(/exercício ou estresse/i);
    expect(painel().getByText(/desatualizado/i)).toBeTruthy();
  });

  it("exceção do motor leva ao painel honesto, sem valores clínicos", () => {
    render(
      <AppCardiologia
        motor={{
          avaliar() {
            throw new Error("bug");
          },
        }}
      />,
    );
    preencheIdade("55");
    marca(/masculino/i);
    marca(/retroesternal/i);
    avalia();
    expect(painel().getByText(/falha inesperada/i)).toBeTruthy();
    expect(painel().queryByText(/estrato de probabilidade/i)).toBeNull();
  });
});
