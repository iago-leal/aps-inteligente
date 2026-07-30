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

// T011 (feature 010-dor-toracica-pre-teste) — a home ganha a seção Cardiologia
// (RF-08). Asserções anteriores permanecem byte a byte.
describe("Seção Cardiologia na home (feature 010; RF-08)", () => {
  it("exibe a seção Cardiologia com a calculadora de probabilidade pré-teste", () => {
    render(<TelaInicio />);
    expect(
      screen.getByRole("heading", { name: /^cardiologia$/i }),
    ).toBeTruthy();
    const link = screen.getByRole("link", {
      name: /probabilidade pré-teste de cardiopatia isquêmica/i,
    });
    expect(link.getAttribute("href")).toBe("/cardiologia/dor-toracica");
  });
});

// T025 (feature 019-contribuicao-voluntaria-pix) — a home ganha o bloco de apoio
// ao pé das seções (RF-05/RF-11; D-12). As asserções anteriores permanecem byte a
// byte, e o CATALOGO é conferido intocado: o bloco entra FORA dele, porque o
// catálogo é fonte única de calculadoras e um item que não calcula nada ali
// dentro corromperia o que ele significa.
describe("Bloco de apoio na home (feature 019; RF-05/RF-11)", () => {
  it("exibe o comando de apoio ao pé da página", () => {
    render(<TelaInicio />);
    expect(
      screen.getByRole("button", { name: /contribuir por pix/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /apoie a plataforma/i }),
    ).toBeTruthy();
  });

  it("o painel não nasce montado: só o comando aparece antes do clique", () => {
    render(<TelaInicio />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("o bloco fica fora do CATALOGO, que segue com as mesmas seções e rotas", () => {
    render(<TelaInicio />);
    for (const secao of CATALOGO) {
      const regiao = screen.getByRole("region", {
        name: new RegExp(secao.titulo, "i"),
      });
      expect(
        within(regiao).queryByRole("button", { name: /contribuir/i }),
      ).toBeNull();
      expect(within(regiao).getAllByRole("link")).toHaveLength(
        secao.calculadoras.length,
      );
    }
    const rotas = CATALOGO.flatMap((secao) =>
      secao.calculadoras.map((calculadora) => calculadora.rota),
    );
    expect(rotas).toEqual([
      "/dm2/insulina",
      "/pre-natal/idade-gestacional",
      "/cardiologia/dor-toracica",
      "/cardiologia/risco-cardiovascular",
      "/puericultura/crescimento",
      // Feature 020: a seção Puericultura ganha a segunda ficha. As cinco entradas
      // anteriores permanecem byte a byte, e é isso que RF-01 daquela feature promete —
      // o diff no catálogo é aditivo, e este oráculo é o que o prova.
      "/puericultura/consulta",
      // Feature 023 (RF-12): a quinta seção entra com a sua única ficha. As seis entradas
      // acima permanecem byte a byte, e a lista continua sendo ordenada e exaustiva: é o
      // que a torna capaz de reprovar tanto o acréscimo silencioso quanto o reordenamento.
      "/saude-do-idoso/depressao-gds",
    ]);
  });
});

// T025 (feature 023-saude-do-idoso-gds) — a home ganha a quinta seção (RF-12). As
// asserções anteriores permanecem byte a byte.
describe("Seção Saúde da pessoa idosa na home (feature 023; RF-12)", () => {
  it("a home passa a exibir cinco seções e sete fichas", () => {
    render(<TelaInicio />);
    expect(CATALOGO).toHaveLength(5);
    expect(CATALOGO.flatMap((secao) => secao.calculadoras)).toHaveLength(7);
  });

  it("exibe a seção com a calculadora de rastreamento e a rota correspondente", () => {
    render(<TelaInicio />);
    expect(
      screen.getByRole("heading", { name: /^saúde da pessoa idosa$/i }),
    ).toBeTruthy();
    const link = screen.getByRole("link", {
      name: /rastreamento de depressão na pessoa idosa/i,
    });
    expect(link.getAttribute("href")).toBe("/saude-do-idoso/depressao-gds");
  });
});

// T020 (feature 014-risco-cardiovascular-pce) — a seção Cardiologia ganha a
// segunda ficha (risco cardiovascular). A ficha de dor torácica permanece byte a
// byte (asserção acima intocada).
describe("Segunda ficha de Cardiologia na home (feature 014; RF-08)", () => {
  it("exibe a calculadora de risco cardiovascular com a rota correspondente", () => {
    render(<TelaInicio />);
    const link = screen.getByRole("link", {
      name: /risco cardiovascular em 10 anos/i,
    });
    expect(link.getAttribute("href")).toBe("/cardiologia/risco-cardiovascular");
  });

  it("a seção Cardiologia passa a ter exatamente duas calculadoras", () => {
    render(<TelaInicio />);
    const regiao = screen.getByRole("region", { name: /^cardiologia$/i });
    expect(within(regiao).getAllByRole("link")).toHaveLength(2);
  });
});
