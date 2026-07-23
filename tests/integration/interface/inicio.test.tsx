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
