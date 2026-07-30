// @vitest-environment jsdom
// T026 (feature 023-saude-do-idoso-gds) — a tela do rastreamento de depressão na pessoa
// idosa (RF-03..RF-10; RN-06, RN-07, RN-11; D-07/D-08).
//
// Os quatro estados da máquina, a coleta total exibida, a invalidação por edição, e três
// AUSÊNCIAS que valem tanto quanto as presenças: nenhum campo de idade, nenhum ritual de
// revisão e nenhum valor pré-selecionado. As três são decisões registradas, e ausência que
// ninguém verifica volta por descuido na feature seguinte.
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppDepressaoGeriatrica } from "interface/saude-do-idoso/app";
import { ITENS } from "models/depressao-geriatrica/itens";
import type { RespostaDoItem } from "models/depressao-geriatrica/tipos";

afterEach(cleanup);

function painel() {
  return within(screen.getByRole("complementary", { name: /resultado/i }));
}

/** O grupo de um item, localizado pela sua `legend`, que é o enunciado impresso. */
function grupoDoItem(numero: number) {
  const item = ITENS.find((i) => i.numero === numero)!;
  return within(
    screen.getByRole("group", {
      name: new RegExp(`^${item.numero}\\.`),
    }),
  );
}

function responde(numero: number, resposta: RespostaDoItem) {
  const rotulo = resposta === "sim" ? /^sim$/i : /^não$/i;
  fireEvent.click(grupoDoItem(numero).getByLabelText(rotulo));
}

/** Responde à escala inteira, com `quantosPontuam` itens na direção que pontua. */
function respondeTudo(quantosPontuam: number) {
  ITENS.forEach((item, indice) => {
    const pontua = indice < quantosPontuam;
    const resposta = pontua
      ? item.respostaQuePontua
      : item.respostaQuePontua === "sim"
        ? "nao"
        : "sim";
    responde(item.numero, resposta);
  });
}

function calcula() {
  fireEvent.click(screen.getByRole("button", { name: /calcular escore/i }));
}

describe("Estado vazio (RF-08)", () => {
  it("convida a responder e não exibe escore algum", () => {
    render(<AppDepressaoGeriatrica />);
    expect(painel().getByText(/responda aos quinze itens/i)).toBeTruthy();
    expect(painel().queryByRole("heading", { level: 2 })).toBeNull();
  });

  it("os quinze itens aparecem, cada um como grupo rotulado pelo enunciado", () => {
    render(<AppDepressaoGeriatrica />);
    for (const item of ITENS) {
      expect(
        screen.getByRole("group", { name: new RegExp(`^${item.numero}\\.`) }),
      ).toBeTruthy();
    }
  });

  it("nenhum item nasce com resposta marcada (D-08)", () => {
    render(<AppDepressaoGeriatrica />);
    for (const marcado of screen.queryAllByRole("radio")) {
      expect((marcado as HTMLInputElement).checked).toBe(false);
    }
  });
});

describe("Resultado (RF-04, RF-04b, RF-07)", () => {
  it("escala inteira na direção que pontua: 15 pontos e a faixa severa", () => {
    render(<AppDepressaoGeriatrica />);
    respondeTudo(15);
    calcula();
    expect(
      painel().getByRole("heading", { name: /15 de 15 pontos/i }),
    ).toBeTruthy();
    expect(painel().getByText(/depressão severa/i)).toBeTruthy();
  });

  it("escala inteira na direção oposta: 0 ponto e a faixa que a fonte considera normal", () => {
    render(<AppDepressaoGeriatrica />);
    respondeTudo(0);
    calcula();
    expect(
      painel().getByRole("heading", { name: /0 de 15 pontos/i }),
    ).toBeTruthy();
    expect(painel().getByText(/se considera normal/i)).toBeTruthy();
  });

  it("a providência da fonte aparece mesmo na faixa mais baixa (RF-04b)", () => {
    render(<AppDepressaoGeriatrica />);
    respondeTudo(0);
    calcula();
    expect(
      painel().getByText(/encaminhamento para avaliação neuropsicológica/i),
    ).toBeTruthy();
  });

  it("a advertência de que o instrumento rastreia e não diagnostica acompanha (RF-07)", () => {
    render(<AppDepressaoGeriatrica />);
    respondeTudo(8);
    calcula();
    expect(painel().getByText(/não estabelece diagnóstico/i)).toBeTruthy();
  });

  it("a fonte clínica fica à vista, com a referência que a própria fonte cita (RF-02)", () => {
    render(<AppDepressaoGeriatrica />);
    respondeTudo(8);
    calcula();
    expect(
      painel().getAllByText(/escala de depressão geriátrica/i).length,
    ).toBeGreaterThan(0);
    expect(painel().getByText(/arq neuropsiquiatr/i)).toBeTruthy();
  });
});

describe("Coleta total de ofensores (RF-05; RN-06)", () => {
  it("três itens em branco: os três são nomeados e nenhum escore aparece", () => {
    render(<AppDepressaoGeriatrica />);
    for (const item of ITENS) {
      if ([2, 9, 14].includes(item.numero)) continue;
      responde(item.numero, "nao");
    }
    calcula();

    const alertas = painel().getAllByRole("alert");
    expect(alertas).toHaveLength(3);
    expect(alertas.map((a) => a.textContent).join(" ")).toMatch(/Item 2 /);
    expect(painel().queryByText(/de 15 pontos/i)).toBeNull();
  });

  it("escala inteira em branco: os quinze itens voltam de uma vez", () => {
    render(<AppDepressaoGeriatrica />);
    calcula();
    expect(painel().getAllByRole("alert")).toHaveLength(ITENS.length);
  });
});

describe("Invalidação por edição, e sem ritual de revisão (RN-11; RF-10)", () => {
  it("alterar uma resposta depois do cálculo marca o resultado como desatualizado", () => {
    render(<AppDepressaoGeriatrica />);
    respondeTudo(0);
    calcula();
    expect(painel().queryByText(/desatualizado/i)).toBeNull();

    responde(3, ITENS[2].respostaQuePontua);
    expect(painel().getByText(/desatualizado/i)).toBeTruthy();
  });

  it("não existe checkbox de revisão nesta tela: ela não prescreve dose (ADR 0012)", () => {
    render(<AppDepressaoGeriatrica />);
    respondeTudo(15);
    calcula();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByLabelText(/revisei/i)).toBeNull();
  });

  it("Nova avaliação devolve a tela ao estado vazio, com o formulário limpo", () => {
    render(<AppDepressaoGeriatrica />);
    respondeTudo(15);
    calcula();
    fireEvent.click(painel().getByRole("button", { name: /nova avaliação/i }));

    expect(painel().getByText(/responda aos quinze itens/i)).toBeTruthy();
    for (const marcado of screen.queryAllByRole("radio")) {
      expect((marcado as HTMLInputElement).checked).toBe(false);
    }
  });
});

describe("Sem campo de idade e sem recusa etária (RF-06; RN-07)", () => {
  it("o formulário não pede idade", () => {
    render(<AppDepressaoGeriatrica />);
    expect(screen.queryByLabelText(/idade/i)).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("a tela diz em prosa a quem o instrumento se dirige", () => {
    render(<AppDepressaoGeriatrica />);
    expect(screen.getByText(/se dirige à pessoa idosa/i)).toBeTruthy();
    expect(screen.getByText(/não publica faixa etária/i)).toBeTruthy();
  });
});

describe("Falha inesperada tem painel honesto (RF-08; EC-07)", () => {
  it("exceção do motor leva ao painel que instrui a não decidir por esta tela", () => {
    const motorQueQuebra = {
      avaliar() {
        throw new Error("bug interno");
      },
    };
    render(<AppDepressaoGeriatrica motor={motorQueQuebra} />);
    respondeTudo(0);
    calcula();
    expect(painel().getByRole("alert").textContent).toMatch(
      /falha inesperada/i,
    );
  });
});
