// @vitest-environment jsdom
// T019 — Tela da estimativa de risco cardiovascular (RF-01..RF-10; RN-06/RN-09;
// D-08: sem ritual de revisão; ADR 0005: informa, não prescreve). Feature 014.
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppRiscoCardiovascular } from "interface/risco-cardiovascular/app";

afterEach(cleanup);

/** Asserções escopadas ao painel de resultado (aside role=complementary). */
function painel() {
  return within(screen.getByRole("complementary", { name: /resultado/i }));
}

function preenche(rotulo: RegExp, valor: string) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
}

function marca(rotulo: RegExp) {
  fireEvent.click(screen.getByLabelText(rotulo));
}

function estima() {
  fireEvent.click(screen.getByRole("button", { name: /estimar risco/i }));
}

/** Homem branco 55a, TC 213, HDL 50, PAS 120 → baseline ~5,4% (golden case). */
function preencheBaseline() {
  marca(/^masculino$/i);
  marca(/^branca$/i);
  preenche(/idade/i, "55");
  preenche(/colesterol total/i, "213");
  preenche(/hdl/i, "50");
  preenche(/sistólica/i, "120");
}

describe("Estimativa válida (RF-06/RF-07)", () => {
  it("homem branco baseline → risco ~5,4% e categoria limítrofe", () => {
    render(<AppRiscoCardiovascular />);
    preencheBaseline();
    estima();

    expect(painel().getByRole("heading", { name: /5\.4%|5,4%/ })).toBeTruthy();
    expect(painel().getByText(/limítrofe/i)).toBeTruthy();
    expect(painel().getAllByText(/pooled cohort equations/i).length).toBeGreaterThan(0);
  });

  it("não emite nenhuma recomendação de conduta — não menciona estatina (ADR 0005)", () => {
    render(<AppRiscoCardiovascular />);
    preencheBaseline();
    estima();
    expect(painel().queryByText(/estatina/i)).toBeNull();
    expect(painel().queryByText(/prescrever|recomenda-se iniciar/i)).toBeNull();
  });

  it("exibe a nota de proveniência (RF-10)", () => {
    render(<AppRiscoCardiovascular />);
    preencheBaseline();
    estima();
    expect(
      painel().getByText(/não há calibração validada para a população brasileira/i),
    ).toBeTruthy();
  });
});

describe("Contexto metodológico da fonte (PCE × PREVENT)", () => {
  it("exibe a observação sempre, mesmo antes de estimar, com link para a PREVENT em nova aba", () => {
    render(<AppRiscoCardiovascular />);
    expect(
      screen.getByRole("heading", { name: /por que pooled cohort equations/i }),
    ).toBeTruthy();
    const link = screen.getByRole("link", { name: /prevent/i });
    expect(link.getAttribute("href")).toBe(
      "https://professional.heart.org/en/guidelines-and-statements/prevent-calculator",
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("a menção metodológica à estatina fica no contexto, nunca dentro do painel de resultado (ADR 0005)", () => {
    render(<AppRiscoCardiovascular />);
    preencheBaseline();
    estima();
    // Contexto (fora do painel) explica o limiar de estatina da USPSTF...
    expect(screen.getByText(/recomendação de estatina/i)).toBeTruthy();
    // ...mas o painel de resultado não recomenda conduta ao paciente.
    expect(painel().queryByText(/estatina/i)).toBeNull();
  });
});

describe("Fora do escopo (RF-05/RN-02; D-06)", () => {
  it("idade fora de 40–79 → mensagem de fora do escopo, sem risco percentual", () => {
    render(<AppRiscoCardiovascular />);
    marca(/^masculino$/i);
    marca(/^branca$/i);
    preenche(/idade/i, "35");
    preenche(/colesterol total/i, "213");
    preenche(/hdl/i, "50");
    preenche(/sistólica/i, "120");
    estima();

    expect(painel().getByText(/fora do escopo da fonte/i)).toBeTruthy();
    expect(painel().getByText(/40 a 79/)).toBeTruthy();
    expect(painel().queryByRole("heading", { name: /risco de ascvd/i })).toBeNull();
  });

  it("DCV prévia → fora do escopo (prevenção secundária)", () => {
    render(<AppRiscoCardiovascular />);
    preencheBaseline();
    marca(/doença cardiovascular já estabelecida/i);
    estima();

    expect(painel().getByText(/fora do escopo da fonte/i)).toBeTruthy();
    expect(painel().getByText(/prevenção secundária/i)).toBeTruthy();
  });
});

describe("Validação com coleta total (RF-09/RN-08)", () => {
  it("sem sexo, sem raça e sem idade → múltiplos ofensores de uma vez, sem resultado", () => {
    render(<AppRiscoCardiovascular />);
    preenche(/colesterol total/i, "213");
    preenche(/hdl/i, "50");
    preenche(/sistólica/i, "120");
    estima();

    const alertas = painel().getAllByRole("alert");
    expect(alertas.length).toBeGreaterThanOrEqual(2);
    expect(painel().getByText(/sexo inválido/i)).toBeTruthy();
    expect(painel().getByText(/idade inválida/i)).toBeTruthy();
    expect(painel().queryByRole("heading", { name: /risco de ascvd/i })).toBeNull();
  });
});

describe("Clamp como aviso (RN-07/D-07)", () => {
  it("PAS acima da faixa fisiológica → resultado com aviso de possível superestimativa", () => {
    render(<AppRiscoCardiovascular />);
    marca(/^masculino$/i);
    marca(/^branca$/i);
    preenche(/idade/i, "55");
    preenche(/colesterol total/i, "213");
    preenche(/hdl/i, "50");
    preenche(/sistólica/i, "260");
    estima();
    expect(painel().getByText(/fora da faixa fisiológica/i)).toBeTruthy();
    expect(painel().getByRole("heading", { name: /risco de ascvd/i })).toBeTruthy();
  });
});

describe("Sem ritual de revisão nesta tela (D-08)", () => {
  it("não há checkbox 'Revisei' nem bloco 'pronto para prescrever'", () => {
    render(<AppRiscoCardiovascular />);
    preencheBaseline();
    estima();
    expect(screen.queryByText(/pronto para prescrever/i)).toBeNull();
    expect(screen.queryByLabelText(/revisei/i)).toBeNull();
  });
});

describe("Invalidação por edição e falha honesta (padrões do legado)", () => {
  it("editar depois de estimar marca o resultado como desatualizado", () => {
    render(<AppRiscoCardiovascular />);
    preencheBaseline();
    estima();
    marca(/tabagismo atual/i);
    expect(painel().getByText(/desatualizado/i)).toBeTruthy();
  });

  it("exceção do motor leva ao painel honesto, sem valores clínicos", () => {
    render(
      <AppRiscoCardiovascular
        motor={{
          estimar() {
            throw new Error("bug");
          },
        }}
      />,
    );
    preencheBaseline();
    estima();
    expect(painel().getByText(/falha inesperada/i)).toBeTruthy();
    expect(painel().queryByRole("heading", { name: /risco de ascvd/i })).toBeNull();
  });
});
