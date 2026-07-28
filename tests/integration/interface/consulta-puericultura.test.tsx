// @vitest-environment jsdom
// T013 (feature 020) — o que se confere é o que se copia (RF-08; D-03).
//
// A identidade entre o texto exibido e o entregue à área de transferência é ESTRUTURAL: uma
// função de projeção, uma variável, dois consumidores. Este teste guarda a estrutura, e o
// modo de falha que ele vigia é preciso — o dia em que alguém montar a cadeia de novo para
// copiar, em vez de reusar a que a tela já exibe, o prescritor passa a conferir um texto e a
// colar outro, sem sinal nenhum.
//
// A área de transferência entra DUBLADA POR PROP, no molde de `AcaoCopiar` da 019: nada aqui
// toca `navigator`, e nenhuma dependência de teste nova acompanha a feature.
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppConsulta } from "interface/puericultura/consulta/app";

afterEach(cleanup);

const NASCIMENTO = "2026-03-10";
const CONSULTA = "2026-07-20";

function copiaQueFunciona() {
  return vi.fn().mockResolvedValue({ ok: true });
}

function identificar() {
  fireEvent.click(screen.getByRole("radio", { name: "Masculino" }));
  fireEvent.change(screen.getByLabelText("Data de nascimento"), {
    target: { value: NASCIMENTO },
  });
  fireEvent.change(screen.getByLabelText("Data da consulta"), {
    target: { value: CONSULTA },
  });
}

function textoExibido(container: HTMLElement): string {
  const bloco = container.querySelector(".consulta-registro-texto");
  if (bloco === null) throw new Error("o texto do registro não está na tela");
  return bloco.textContent ?? "";
}

describe("A cadeia exibida e a copiada são a mesma (RF-08)", () => {
  it("entrega à área de transferência exatamente o que está na tela", async () => {
    const copiar = copiaQueFunciona();
    const { container } = render(
      <AppConsulta copiar={copiar} dataDeHoje={CONSULTA} />,
    );

    identificar();
    const grupo = screen.getByRole("group", { name: "Diarreia/Constipação" });
    fireEvent.click(within(grupo).getByRole("radio", { name: "Sim" }));

    const naTela = textoExibido(container);
    expect(naTela).toContain("Diarreia/Constipação: Sim");

    fireEvent.click(screen.getByRole("button", { name: /copiar registro/i }));
    expect(copiar).toHaveBeenCalledWith(naTela);
  });

  it("mantém a identidade depois de uma segunda edição", () => {
    const copiar = copiaQueFunciona();
    const { container } = render(
      <AppConsulta copiar={copiar} dataDeHoje={CONSULTA} />,
    );

    identificar();
    const grupo = screen.getByRole("group", { name: "Diarreia/Constipação" });
    fireEvent.click(within(grupo).getByRole("radio", { name: "Sim" }));
    fireEvent.click(within(grupo).getByRole("radio", { name: "Não" }));

    fireEvent.click(screen.getByRole("button", { name: /copiar registro/i }));
    expect(copiar).toHaveBeenCalledWith(textoExibido(container));
  });
});

// T040 (feature 020) — o fluxo inteiro visto de fora, e o que a tela NÃO tem.
//
// O teste negativo do ritual de revisão vale tanto quanto os positivos: ADR 0012 restringe a
// confirmação à prescrição de dose, e preencher ficha de consulta não prescreve nada. Uma
// tela que pedisse "revisei" antes de copiar um registro estaria pedindo cerimônia onde não
// há risco de dose, e a cerimônia gratuita é o que faz a cerimônia necessária virar hábito.
describe("Fluxo da consulta, da identificação à cópia (RF-02, RF-03, RF-06)", () => {
  it("sugere a ficha do 4.º Mês para a idade informada e a exibe", () => {
    render(<AppConsulta copiar={copiaQueFunciona()} dataDeHoje={CONSULTA} />);
    identificar();
    expect(screen.getByText("4 meses e 10 dias")).toBeDefined();
    expect(
      screen.getByRole("button", { name: /consulta do 4º mês/i }),
    ).toBeDefined();
  });

  it("não escreve no registro o campo deixado em branco (RN-10)", () => {
    const { container } = render(
      <AppConsulta copiar={copiaQueFunciona()} dataDeHoje={CONSULTA} />,
    );
    identificar();
    const grupo = screen.getByRole("group", { name: "Diarreia/Constipação" });
    fireEvent.click(within(grupo).getByRole("radio", { name: "Sim" }));

    const texto = textoExibido(container);
    expect(texto).toContain("Diarreia/Constipação");
    expect(texto).not.toContain("Estrabismo");
  });

  it("abre o painel de crescimento sem pedir redigitação das medidas (RF-09)", async () => {
    render(<AppConsulta copiar={copiaQueFunciona()} dataDeHoje={CONSULTA} />);
    identificar();

    fireEvent.change(screen.getByLabelText("Peso (g)"), {
      target: { value: "6400" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /avaliar crescimento/i }),
    );

    const painel = await screen.findByRole("dialog");
    // Nenhum campo a digitar dentro do painel: a medida veio da ficha (D-08). A única
    // entrada é a posição da medição, que a caderneta não pergunta e o motor exige (D-09).
    expect(within(painel).queryAllByRole("textbox")).toHaveLength(0);
    await waitFor(() =>
      expect(within(painel).getByText(/escore z/i)).toBeDefined(),
    );
  });

  it("não tem ritual de revisão, e o comando de cópia fica sempre disponível (RN-14)", () => {
    render(<AppConsulta copiar={copiaQueFunciona()} dataDeHoje={CONSULTA} />);
    identificar();
    const grupo = screen.getByRole("group", { name: "Diarreia/Constipação" });
    fireEvent.click(within(grupo).getByRole("radio", { name: "Sim" }));

    expect(screen.queryByRole("checkbox", { name: /revis/i })).toBeNull();
    expect(
      screen.getByRole("button", { name: /copiar registro/i }),
    ).not.toHaveProperty("disabled", true);
  });
});

describe("Proveniência e aviso, antes de qualquer preenchimento (RF-12, RF-13)", () => {
  it("exibe as duas coisas na primeira renderização", () => {
    render(<AppConsulta copiar={copiaQueFunciona()} dataDeHoje={CONSULTA} />);
    expect(
      screen.getByText(/Nada do que se preenche aqui é salvo/),
    ).toBeDefined();
    expect(
      screen.getByRole("region", { name: /proveniência e limites/i }),
    ).toBeDefined();
  });

  it("nomeia as três fichas ausentes e o campo suprimido (RN-03, RN-08)", () => {
    render(<AppConsulta copiar={copiaQueFunciona()} dataDeHoje={CONSULTA} />);
    const bloco = screen.getByRole("region", {
      name: /proveniência e limites/i,
    });
    expect(
      within(bloco).getByText(/Triagens Neonatais \(p\. 68\)/),
    ).toBeDefined();
    expect(within(bloco).getByText(/Criptorquidia/)).toBeDefined();
  });
});

describe("Supressão declarada na ficha feminina (RF-05, `MD-0026`)", () => {
  /** 2.º Mês: nascimento em 2026-05-20 para uma consulta em 2026-07-20, 61 dias. */
  function abrirSegundoMes(sexo: "Masculino" | "Feminino") {
    render(<AppConsulta copiar={copiaQueFunciona()} dataDeHoje={CONSULTA} />);
    fireEvent.click(screen.getByRole("radio", { name: sexo }));
    fireEvent.change(screen.getByLabelText("Data de nascimento"), {
      target: { value: "2026-05-20" },
    });
    fireEvent.change(screen.getByLabelText("Data da consulta"), {
      target: { value: CONSULTA },
    });
  }

  it("não exibe “Criptorquidia” na ficha feminina", () => {
    abrirSegundoMes("Feminino");
    expect(
      screen.getByRole("button", { name: /consulta do 2º mês/i }),
    ).toBeDefined();
    expect(screen.queryByRole("group", { name: "Criptorquidia" })).toBeNull();
  });

  it("exibe “Criptorquidia” na ficha masculina", () => {
    abrirSegundoMes("Masculino");
    expect(screen.getByRole("group", { name: "Criptorquidia" })).toBeDefined();
  });
});
