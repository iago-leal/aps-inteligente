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
// (RF-01/RF-03; RN-01) e as calculadoras ganham um comando de início (RF-04; RN-03).
describe("Cabeçalho refatorado (feature 011)", () => {
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

  it("sem logoComoTitulo (calculadora): a logo segue não-link e há um comando de início para '/' (RF-04, D-06)", () => {
    const { container } = render(
      <Moldura titulo="Calculadora de Insulina — DM2" subtitulo="Sub">
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

  it("com logoComoTitulo (home): não há comando de início (redundante na home)", () => {
    render(
      <Moldura titulo="APS Inteligente" subtitulo="Sub" logoComoTitulo>
        <p>conteúdo</p>
      </Moldura>,
    );
    expect(screen.queryByRole("link", { name: "Início" })).toBeNull();
  });
});

// T004 (feature 009-logo-apsi-no-cabecalho) — a logo APSi no cabeçalho
// (RF-01/RF-05; RN-02/RN-05). Asserções anteriores permanecem byte a byte.
describe("Logo APSi no cabeçalho (feature 009)", () => {
  it("com logoComoTitulo, a logo é uma imagem dentro do h1 e o nome acessível do heading é o título", () => {
    render(
      <Moldura titulo="APS Inteligente" subtitulo="Sub" logoComoTitulo>
        <p>conteúdo</p>
      </Moldura>,
    );
    const h1 = screen.getByRole("heading", { level: 1, name: "APS Inteligente" });
    const img = within(h1).getByRole("img", { name: "APS Inteligente" });
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("alt")).toBe("APS Inteligente");
  });

  it("sem logoComoTitulo (default), o h1 segue textual e a logo aparece como marca decorativa fora do heading (RN-05)", () => {
    const { container } = render(
      <Moldura titulo="Calculadora de Insulina — DM2" subtitulo="Sub">
        <p>conteúdo</p>
      </Moldura>,
    );
    // h1 textual: nenhuma imagem contribui para o nome acessível do heading.
    const h1 = screen.getByRole("heading", {
      level: 1,
      name: "Calculadora de Insulina — DM2",
    });
    expect(within(h1).queryByRole("img")).toBeNull();
    // Marca de brand presente, porém decorativa (aria-hidden, alt vazio):
    // não vira segundo heading nem link, e não altera nomes acessíveis.
    const marca = container.querySelector(".cabecalho-marca");
    expect(marca).toBeTruthy();
    expect(marca?.getAttribute("aria-hidden")).toBe("true");
    expect(marca?.getAttribute("alt")).toBe("");
    // A logo segue não-link (D-04 da 009). Desde a feature 011, o cabeçalho da
    // calculadora tem exatamente um link — o comando de início —, que NÃO é a logo.
    expect(marca?.closest("a")).toBeNull();
    expect(container.querySelectorAll("a").length).toBe(1);
  });

  it("a variante da logo acompanha o tema: caminho claro por padrão no cliente", () => {
    render(
      <Moldura titulo="APS Inteligente" subtitulo="Sub" logoComoTitulo>
        <p>conteúdo</p>
      </Moldura>,
    );
    const img = screen.getByRole("img", { name: "APS Inteligente" });
    // Sem preferência gravada, o cliente nasce no tema claro (preferencia-de-tema).
    expect(img.getAttribute("src")).toBe("/apsi-light.png");
  });
});
