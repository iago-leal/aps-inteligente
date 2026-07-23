// @vitest-environment jsdom
// T007 — Página inicial por seções (RF-05; RN-08: duas seções, nenhuma vazia;
// D-07: renderizada a partir do catálogo tipado).
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TelaInicio } from "interface/inicio/tela";
import { CATALOGO } from "interface/inicio/catalogo";

afterEach(cleanup);

describe("Seções da home (RF-05; RN-08)", () => {
  it("exibe exatamente as duas seções decididas, com os títulos literais", () => {
    render(<TelaInicio />);
    expect(
      screen.getByRole("heading", { name: /diabetes mellitus tipo 2/i }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: /pré-natal/i })).toBeTruthy();
  });

  it("cada calculadora do catálogo vira um link com a rota correspondente", () => {
    render(<TelaInicio />);
    for (const secao of CATALOGO) {
      for (const calculadora of secao.calculadoras) {
        const link = screen.getByRole("link", {
          name: new RegExp(calculadora.titulo, "i"),
        });
        expect(link.getAttribute("href")).toBe(calculadora.rota);
      }
    }
  });

  it("nenhuma seção é renderizada vazia (RN-08)", () => {
    render(<TelaInicio />);
    for (const secao of CATALOGO) {
      expect(secao.calculadoras.length).toBeGreaterThan(0);
      const regiao = screen.getByRole("region", {
        name: new RegExp(secao.titulo, "i"),
      });
      expect(within(regiao).getAllByRole("link").length).toBe(
        secao.calculadoras.length,
      );
    }
  });
});

describe("Estrutura acessível (RNF de acessibilidade)", () => {
  it("há um heading principal da plataforma e um main como landmark", () => {
    render(<TelaInicio />);
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByRole("main")).toBeTruthy();
  });

  it("o selo de privacidade da plataforma está presente", () => {
    render(<TelaInicio />);
    expect(screen.getByText(/nada é salvo nem enviado/i)).toBeTruthy();
  });
});

// T004 (feature 008-design-mais-bonito-da-home) — acréscimos de apresentação
// (RF-04/RF-05; RN-01/RN-02): asserções anteriores permanecem byte a byte.
describe("Apresentação da home (feature 008)", () => {
  it("usa a moldura na variante destaque como área introdutória (RF-04)", () => {
    const { container } = render(<TelaInicio />);
    expect(
      container.querySelector('[data-apresentacao="destaque"]'),
    ).toBeTruthy();
  });

  it("ícones de seção são decorativos e não alteram os nomes acessíveis", () => {
    const { container } = render(<TelaInicio />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    }
    for (const secao of CATALOGO) {
      for (const calculadora of secao.calculadoras) {
        expect(
          screen.getByRole("link", { name: calculadora.titulo }),
        ).toBeTruthy();
      }
    }
  });

  it("cada cartão continua com um único link (stretched link não duplica âncoras, RF-05)", () => {
    const { container } = render(<TelaInicio />);
    const cartoes = container.querySelectorAll(".inicio-cartao");
    expect(cartoes.length).toBeGreaterThan(0);
    for (const cartao of cartoes) {
      expect(cartao.querySelectorAll("a").length).toBe(1);
    }
  });
});
