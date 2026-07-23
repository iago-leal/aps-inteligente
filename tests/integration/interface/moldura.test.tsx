// @vitest-environment jsdom
// T004 (feature 008-design-mais-bonito-da-home) — Moldura nas duas apresentações
// (RF-04/RF-07; RN-02): a variante `destaque` muda apenas a apresentação; h1,
// selo de privacidade e alternador de tema mantêm os mesmos nomes acessíveis.
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Moldura } from "interface/comum/moldura";

afterEach(cleanup);

function renderiza(apresentacao?: "padrao" | "destaque") {
  return render(
    <Moldura
      titulo="Título de teste"
      subtitulo="Subtítulo de teste"
      apresentacao={apresentacao}
    >
      <p>conteúdo</p>
    </Moldura>,
  );
}

describe("Variante de apresentação da Moldura (RF-04/RF-07)", () => {
  it("sem prop, apresenta-se como padrao (default retrocompatível)", () => {
    const { container } = renderiza();
    expect(container.querySelector('[data-apresentacao="padrao"]')).toBeTruthy();
  });

  it("com destaque, o marcador observável muda", () => {
    const { container } = renderiza("destaque");
    expect(
      container.querySelector('[data-apresentacao="destaque"]'),
    ).toBeTruthy();
  });

  it.each(["padrao", "destaque"] as const)(
    "na apresentação %s, h1, selo e alternador mantêm os mesmos nomes acessíveis (RN-02)",
    (apresentacao) => {
      renderiza(apresentacao);
      expect(
        screen.getByRole("heading", { level: 1, name: "Título de teste" }),
      ).toBeTruthy();
      expect(screen.getByText("Subtítulo de teste")).toBeTruthy();
      expect(screen.getByText(/nada é salvo nem enviado/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: /tema/i })).toBeTruthy();
      expect(screen.getByRole("main")).toBeTruthy();
    },
  );
});

// T001/T002 (feature 011-refatora-cabecalho) — o alternador de tema vira icônico
// (RF-01/RF-03; RN-01). Feature 016 (RF-03): o comando de início passa a uma prop
// dedicada `comInicio`, desacoplada da antiga `logoComoTitulo` (removida). O
// comportamento da regra 11 é preservado — ⌂ nas calculadoras, ausente na home.
describe("Cabeçalho refatorado (features 011 e 016)", () => {
  it("o alternador de tema é icônico: nome acessível pela ação, sem o texto 'Tema claro/escuro'", () => {
    renderiza();
    // Cliente nasce no tema claro; o glifo é o do tema-alvo (lua) e o nome
    // acessível descreve a ação de ir ao escuro.
    expect(
      screen.getByRole("button", { name: "Ativar tema escuro" }),
    ).toBeTruthy();
    // O rótulo textual antigo não existe mais como conteúdo visível.
    expect(screen.queryByText(/^Tema (claro|escuro)$/)).toBeNull();
  });

  it("com comInicio (calculadoras): a marca segue não-link e há um comando de início para '/', único link (RF-03, D-06)", () => {
    const { container } = render(
      <Moldura titulo="Calculadora de Insulina — DM2" subtitulo="Sub" comInicio>
        <p>conteúdo</p>
      </Moldura>,
    );
    // A marca de brand permanece decorativa e fora de qualquer âncora (D-04 da 009).
    const marca = container.querySelector(".cabecalho-marca");
    expect(marca).toBeTruthy();
    expect(marca?.closest("a")).toBeNull();
    // O comando de início é o único link, apontando para a home.
    const inicio = screen.getByRole("link", { name: "Início" });
    expect(inicio.getAttribute("href")).toBe("/");
    expect(container.querySelectorAll("a").length).toBe(1);
  });

  it("sem comInicio (home): não há comando de início e o cabeçalho não tem link algum (RN-03)", () => {
    const { container } = render(
      <Moldura titulo="APS Inteligente" subtitulo="Sub">
        <p>conteúdo</p>
      </Moldura>,
    );
    expect(screen.queryByRole("link", { name: "Início" })).toBeNull();
    expect(container.querySelectorAll("a").length).toBe(0);
  });
});

// Identidade unificada (feature 016-estrutura-cabecalho-home; RF-02/RF-04) — a
// logo é SEMPRE marca decorativa fora do h1 e o h1 é SEMPRE textual, em toda tela
// (inclusive a home, cujo h1 passa a ser o texto "APS Inteligente"). Isso dá à
// home a mesma estrutura de três blocos das calculadoras, igualando a altura do
// cabeçalho por construção. A prop `logoComoTitulo` (feature 009) foi removida.
describe("Identidade unificada e logo por tema (features 009 e 016)", () => {
  it("o h1 é textual e a logo é marca decorativa fora do heading, mesmo com o título da home (RF-02/RF-04, RN-05)", () => {
    const { container } = render(
      <Moldura titulo="APS Inteligente" subtitulo="Sub">
        <p>conteúdo</p>
      </Moldura>,
    );
    // h1 textual: nenhuma imagem contribui para o nome acessível do heading.
    const h1 = screen.getByRole("heading", { level: 1, name: "APS Inteligente" });
    expect(within(h1).queryByRole("img")).toBeNull();
    expect(h1.querySelector("img")).toBeNull();
    // Marca de brand presente, porém decorativa (aria-hidden, alt vazio): fica
    // fora do h1, não vira segundo heading nem link, e não altera nomes acessíveis.
    const marca = container.querySelector(".cabecalho-marca");
    expect(marca).toBeTruthy();
    expect(marca?.getAttribute("aria-hidden")).toBe("true");
    expect(marca?.getAttribute("alt")).toBe("");
    expect(marca?.closest("h1")).toBeNull();
    expect(marca?.closest("a")).toBeNull();
  });

  it("a variante da logo acompanha o tema: caminho claro por padrão no cliente", () => {
    const { container } = render(
      <Moldura titulo="APS Inteligente" subtitulo="Sub">
        <p>conteúdo</p>
      </Moldura>,
    );
    // A marca é decorativa (aria-hidden), logo não é exposta como role img;
    // lê-se o src diretamente. Sem preferência gravada, nasce no tema claro.
    const marca = container.querySelector(".cabecalho-marca");
    expect(marca?.getAttribute("src")).toBe("/apsi-light.png");
  });
});
