// @vitest-environment jsdom
// T004 (feature 008-design-mais-bonito-da-home) — Moldura nas duas apresentações
// (RF-04/RF-07; RN-02): a variante `destaque` muda apenas a apresentação; h1,
// selo de privacidade e alternador de tema mantêm os mesmos nomes acessíveis.
import { cleanup, render, screen } from "@testing-library/react";
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
