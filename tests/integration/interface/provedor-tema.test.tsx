// @vitest-environment jsdom
// T005 (feature 004-estilo-primer-nas-telas) — adaptador entre preferencia-de-tema.ts
// e o color mode do Primer (D-03, RN-04): a chave localStorage e os valores
// claro/escuro são invariantes; o ThemeProvider é mero consumidor.
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gravarTema } from "interface/calculadora/preferencia-de-tema";
import { ProvedorTemaPrimer } from "interface/calculadora/provedor-tema";

function colorModeAtual(container: HTMLElement): string | null {
  const alvo = container.querySelector("[data-component='ThemeProvider']");
  return alvo ? alvo.getAttribute("data-color-mode") : null;
}

// O jsdom não implementa localStorage; um stub em memória reproduz o contrato.
function instalaStorage(): void {
  const memoria = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (chave: string) => memoria.get(chave) ?? null,
      setItem: (chave: string, valor: string) => {
        memoria.set(chave, String(valor));
      },
      removeItem: (chave: string) => {
        memoria.delete(chave);
      },
      clear: () => {
        memoria.clear();
      },
      get length() {
        return memoria.size;
      },
    },
  });
}

function instalaStorageBloqueado(): void {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: () => {
        throw new Error("storage bloqueado");
      },
      setItem: () => {
        throw new Error("storage bloqueado");
      },
    },
  });
}

describe("ProvedorTemaPrimer", () => {
  beforeEach(() => {
    instalaStorage();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renderiza os filhos dentro do provider", () => {
    const { getByText } = render(
      <ProvedorTemaPrimer>
        <p>conteúdo da tela</p>
      </ProvedorTemaPrimer>,
    );
    expect(getByText("conteúdo da tela")).toBeDefined();
  });

  it("tema claro persistido vira color mode light", () => {
    window.localStorage.setItem("aps-inteligente:tema", "claro");
    const { container } = render(
      <ProvedorTemaPrimer>
        <p>x</p>
      </ProvedorTemaPrimer>,
    );
    expect(colorModeAtual(container)).toBe("light");
  });

  it("tema escuro persistido vira color mode dark", () => {
    window.localStorage.setItem("aps-inteligente:tema", "escuro");
    const { container } = render(
      <ProvedorTemaPrimer>
        <p>x</p>
      </ProvedorTemaPrimer>,
    );
    expect(colorModeAtual(container)).toBe("dark");
  });

  it("alternar o tema em runtime atualiza o color mode sem trocar a chave", () => {
    const { container } = render(
      <ProvedorTemaPrimer>
        <p>x</p>
      </ProvedorTemaPrimer>,
    );
    expect(colorModeAtual(container)).toBe("light");

    act(() => {
      gravarTema("escuro");
    });
    expect(colorModeAtual(container)).toBe("dark");
    // Invariante de dados (data-delta §3): a chave e o valor gravados não mudam.
    expect(window.localStorage.getItem("aps-inteligente:tema")).toBe("escuro");
    expect(window.localStorage.length).toBe(1);
  });

  it("storage bloqueado degrada para o modo claro (RN-04)", () => {
    instalaStorageBloqueado();
    const { container } = render(
      <ProvedorTemaPrimer>
        <p>x</p>
      </ProvedorTemaPrimer>,
    );
    expect(colorModeAtual(container)).toBe("light");
  });
});
