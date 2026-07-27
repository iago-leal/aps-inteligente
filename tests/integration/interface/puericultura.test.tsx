// @vitest-environment jsdom
// T047 — Tela da avaliação do crescimento infantil (RF-11 a RF-16, RF-20, RF-21;
// RN-09, RN-13). Feature 017. Cobre os cenários 1, 9, 14, 16, 17 e 18 de
// `requirements.md` §7, mais as recusas honestas que a tela precisa saber exibir.
//
// O caso-base é o mesmo da fachada (T018), de propósito: um menino de 212 dias com
// 8,2 kg, 68,5 cm deitado e 44,0 cm de perímetro cefálico. Onde a unidade prova o
// número, a integração prova que ele CHEGA À TELA na forma que o prescritor lê —
// uma casa decimal, sinal explícito, rótulo literal, padrão, idade e página.
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppCrescimento } from "interface/puericultura/app";
import type { EntradaAvaliacao } from "models/puericultura/tipos";
import { ErroDeInvariante } from "models/puericultura/tipos";

afterEach(cleanup);

const HOJE = "2026-08-10";
const NASCIMENTO = "2026-01-10";

function painel() {
  return within(screen.getByRole("complementary", { name: /resultado/i }));
}

function bloco(nome: RegExp): HTMLElement {
  return screen.getByRole("region", { name: nome });
}

function preenche(rotulo: RegExp, valor: string) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
}

function marca(rotulo: RegExp) {
  fireEvent.click(screen.getByLabelText(rotulo));
}

function avalia() {
  fireEvent.click(screen.getByRole("button", { name: /avaliar crescimento/i }));
}

/** Cenário 1: lactente a termo com as três medidas. */
function preencheCasoBase() {
  marca(/^masculino$/i);
  preenche(/data de nascimento/i, NASCIMENTO);
  preenche(/data da medição/i, HOJE);
  preenche(/peso \(kg\)/i, "8.2");
  preenche(/comprimento\/estatura/i, "68.5");
  marca(/deitado \(comprimento\)/i);
  preenche(/perímetro cefálico/i, "44.0");
}

describe("Cenário 1: lactente a termo com medidas completas (RF-11/RF-20)", () => {
  it("exibe os quatro índices com escore de uma casa decimal e sinal explícito", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    preencheCasoBase();
    avalia();

    expect(bloco(/peso para a idade/i).textContent).toContain("Escore z: −0.1");
    expect(bloco(/comprimento\/estatura para a idade/i).textContent).toContain(
      "Escore z: −0.3",
    );
    expect(bloco(/imc para a idade/i).textContent).toContain("Escore z: +0.1");
    expect(bloco(/perímetro cefálico para a idade/i).textContent).toContain(
      "Escore z: +0.0",
    );
  });

  it("cada bloco traz o rótulo literal da caderneta, com a concordância da fonte", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    preencheCasoBase();
    avalia();

    expect(painel().getByText("Peso adequado para idade")).toBeTruthy();
    // "Comprimento adequada": a concordância é da fonte impressa, não um lapso.
    expect(painel().getByText("Comprimento adequada para idade")).toBeTruthy();
    expect(painel().getByText("Eutrofia")).toBeTruthy();
    expect(painel().getByText("PC adequado para idade")).toBeTruthy();
  });

  it("cada bloco declara padrão, idade usada e página do gráfico (RF-20)", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    preencheCasoBase();
    avalia();

    const peso = bloco(/peso para a idade/i).textContent ?? "";
    expect(peso).toContain("Padrão: OMS");
    expect(peso).toContain("idade cronológica: 212 dias");
    expect(peso).toContain("p. 89");
  });

  it("não emite conduta: a tela informa e classifica, sem prescrever (ADR 0005)", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    preencheCasoBase();
    avalia();

    expect(
      painel().queryByText(/encaminhe|prescrev|suplement|recomenda-se/i),
    ).toBeNull();
  });
});

describe("Cenário 9: medida ausente não invalida as demais (RF-06)", () => {
  it("só o peso informado → peso calculado e os outros três declarados não calculados", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    marca(/^masculino$/i);
    preenche(/data de nascimento/i, NASCIMENTO);
    preenche(/peso \(kg\)/i, "8.2");
    avalia();

    expect(bloco(/peso para a idade/i).textContent).toContain("Escore z: −0.1");
    for (const nome of [
      /comprimento\/estatura para a idade/i,
      /imc para a idade/i,
      /perímetro cefálico para a idade/i,
    ]) {
      expect(bloco(nome).textContent).toContain("Medida não informada");
    }
  });
});

describe("Cenário 8/RF-16: idade gestacional ausente declara a premissa de termo", () => {
  it("sem idade gestacional, o resultado diz que nenhuma correção foi aplicada", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    preencheCasoBase();
    avalia();

    expect(
      painel().getByText(/tratada como nascida a termo e nenhuma correção/i),
    ).toBeTruthy();
  });
});

describe("Cenário 14: edição invalida o resultado (RF-12)", () => {
  it("alterar um campo após avaliar marca o resultado como desatualizado", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    preencheCasoBase();
    avalia();
    expect(painel().queryByText(/desatualizado/i)).toBeNull();

    preenche(/peso \(kg\)/i, "9.0");
    expect(painel().getByText(/resultado desatualizado/i)).toBeTruthy();
  });

  it("nova avaliação limpa o painel e o formulário", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    preencheCasoBase();
    avalia();
    fireEvent.click(screen.getByRole("button", { name: /nova avaliação/i }));

    expect(painel().getByText(/informe o sexo, as duas datas/i)).toBeTruthy();
    expect(
      (screen.getByLabelText(/peso \(kg\)/i) as HTMLInputElement).value,
    ).toBe("");
  });
});

describe("Cenário 16: proveniência e limites fora do painel (RF-13)", () => {
  it("o bloco de proveniência existe antes de qualquer avaliação e fica fora do painel", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    const proveniencia = screen.getByRole("region", {
      name: /proveniência e limites/i,
    });

    expect(proveniencia.textContent).toContain(
      "A classificação vale para esta medição isolada",
    );
    expect(proveniencia.textContent).toMatch(/INTERGROWTH-21st/);
    expect(
      screen
        .queryByRole("complementary", { name: /resultado/i })
        ?.contains(proveniencia),
    ).toBe(false);
  });

  it("declara os limites da fonte, inclusive o do perímetro cefálico", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    const proveniencia = screen.getByRole("region", {
      name: /proveniência e limites/i,
    });
    expect(proveniencia.textContent).toContain("0 a 10 anos");
    expect(proveniencia.textContent).toContain(
      "0 a 2 anos no perímetro cefálico",
    );
  });
});

describe("Cenário 17: a tela não pede confirmação de revisão (RF-15/RN-13)", () => {
  it("nenhum checkbox existe no DOM, nem antes nem depois de avaliar", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);

    preencheCasoBase();
    avalia();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(screen.queryByText(/revisei|confiro|conferi/i)).toBeNull();
  });
});

describe("Cenário 18: falha inesperada não produz número (RF-21)", () => {
  it("exceção do motor → painel honesto e evento anônimo, sem escore em tela", () => {
    const reportar = vi.fn();
    const motorQueQuebra = {
      avaliar(): never {
        throw new ErroDeInvariante("bug interno simulado");
      },
    };
    render(
      <AppCrescimento
        dataDeHoje={HOJE}
        motor={
          motorQueQuebra as unknown as { avaliar(e: EntradaAvaliacao): never }
        }
        relator={{ reportar }}
      />,
    );
    preencheCasoBase();
    avalia();

    expect(painel().getByText(/falha inesperada/i)).toBeTruthy();
    expect(painel().queryByText(/escore z/i)).toBeNull();
    expect(reportar).toHaveBeenCalledWith({ nome: "ErroDeInvariante" });
  });
});

describe("Recusas honestas em tela (RF-09, RN-09, RN-11)", () => {
  it("entrada inválida em três pontos → os três ofensores de uma vez, sem número", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    preenche(/data de nascimento/i, ""); // sem sexo, sem datas, sem medidas
    preenche(/data da medição/i, "");
    avalia();

    const ofensores = painel().getAllByRole("alert");
    expect(ofensores.length).toBeGreaterThanOrEqual(3);
    expect(painel().getByText(/sexo inválido/i)).toBeTruthy();
    expect(painel().getByText(/data de nascimento inválida/i)).toBeTruthy();
    expect(painel().getByText(/informe ao menos uma medida/i)).toBeTruthy();
    expect(painel().queryByText(/escore z/i)).toBeNull();
  });

  it("comprimento sem posição da medição → recusa explícita (RN-09)", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    marca(/^masculino$/i);
    preenche(/data de nascimento/i, NASCIMENTO);
    preenche(/comprimento\/estatura/i, "68.5");
    avalia();

    expect(
      painel().getByText(/informe se a medida foi aferida deitada/i),
    ).toBeTruthy();
  });

  it("idade além da cobertura da fonte → recusa global, sem índice algum", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    marca(/^masculino$/i);
    preenche(/data de nascimento/i, "2010-01-10");
    preenche(/peso \(kg\)/i, "40");
    avalia();

    expect(painel().getByText(/fora do escopo da fonte/i)).toBeTruthy();
    expect(
      screen.queryByRole("region", { name: /peso para a idade/i }),
    ).toBeNull();
  });

  it("perímetro cefálico acima dos 2 anos → recusa PARCIAL, com os demais índices intactos", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    marca(/^feminino$/i);
    preenche(/data de nascimento/i, "2022-01-10");
    preenche(/peso \(kg\)/i, "16");
    preenche(/perímetro cefálico/i, "50");
    avalia();

    expect(bloco(/perímetro cefálico para a idade/i).textContent).toMatch(
      /2 anos/i,
    );
    expect(bloco(/peso para a idade/i).textContent).toContain("Escore z:");
  });
});

describe("Conversão de posição declarada em tela (RF-08/RN-09)", () => {
  it("criança de 2 anos medida deitada → aviso da conversão de 0,7 cm nos dois índices que a consomem", () => {
    render(<AppCrescimento dataDeHoje={HOJE} />);
    marca(/^masculino$/i);
    preenche(/data de nascimento/i, "2023-08-10");
    preenche(/comprimento\/estatura/i, "90.0");
    preenche(/peso \(kg\)/i, "13");
    marca(/deitado \(comprimento\)/i);
    avalia();

    expect(bloco(/comprimento\/estatura para a idade/i).textContent).toMatch(
      /0,7 cm/,
    );
    expect(bloco(/imc para a idade/i).textContent).toMatch(/0,7 cm/);
  });
});
