// @vitest-environment jsdom
// T024 (feature 019) — o painel de contribuição visto de fora (RF-05..RF-09,
// RF-15, RF-16). A área de transferência entra dublada por prop, no molde da
// feature 006: nada aqui toca `navigator`, e nenhuma dependência de teste nova
// acompanha a feature.
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BENEFICIARIO } from "interface/contribuicao/beneficiario";
import { BlocoDeApoio } from "interface/contribuicao/bloco-de-apoio";
import { montarBrCode } from "models/contribuicao/br-code";
import { comoOk } from "../../apoio/contribuicao";

afterEach(cleanup);

const PAYLOAD = comoOk(
  montarBrCode({
    chave: BENEFICIARIO.chave,
    nomeBeneficiario: BENEFICIARIO.nome,
    cidade: BENEFICIARIO.cidade,
  }),
);

function copiaQueFunciona() {
  return vi.fn().mockResolvedValue({ ok: true });
}

function abrirPainel(copiar = copiaQueFunciona()) {
  render(<BlocoDeApoio copiar={copiar} />);
  fireEvent.click(screen.getByRole("button", { name: /contribuir por pix/i }));
  return copiar;
}

describe("Comando de apoio (RF-05)", () => {
  it("o painel só existe depois do comando: nada de modal montado à toa", () => {
    render(<BlocoDeApoio />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("o comando abre o painel como diálogo nomeado", async () => {
    abrirPainel();
    const painel = await screen.findByRole("dialog");
    expect(within(painel).getByText(/contribuição voluntária/i)).toBeTruthy();
  });
});

describe("Caracterização da contribuição (RF-08; RN-01/RN-02)", () => {
  it("declara os três enunciados: voluntária, gratuita e nada processado aqui", async () => {
    abrirPainel();
    const painel = await screen.findByRole("dialog");
    expect(
      within(painel).getByText(
        /não compra funcionalidade, prioridade, suporte nem acesso/i,
      ),
    ).toBeTruthy();
    expect(
      within(painel).getByText(
        /gratuita e continua gratuita para quem não contribuir/i,
      ),
    ).toBeTruthy();
    expect(
      within(painel).getByText(/nada é processado nem confirmado aqui/i),
    ).toBeTruthy();
  });
});

describe("Desenho do código (RF-06)", () => {
  it("o QR é desenhado no cliente, com nome acessível e sem buscar nada na rede", async () => {
    abrirPainel();
    const painel = await screen.findByRole("dialog");
    const desenho = within(painel).getByRole("img", {
      name: /leitura pela câmera/i,
    });
    expect(desenho.tagName.toLowerCase()).toBe("svg");
    // Marcação da própria origem: nenhum <img src> a ser buscado.
    expect(painel.querySelectorAll("img")).toHaveLength(0);
  });
});

describe("Cópia da chave (RF-07)", () => {
  it("exibe a chave em texto legível", async () => {
    abrirPainel();
    const painel = await screen.findByRole("dialog");
    expect(within(painel).getByText(BENEFICIARIO.chave)).toBeTruthy();
  });

  it("copia a chave e confirma de forma visível", async () => {
    const copiar = abrirPainel();
    fireEvent.click(
      await screen.findByRole("button", { name: /copiar chave/i }),
    );
    const confirmacao = await screen.findByText(/chave copiada/i);
    expect(confirmacao.closest("[role=status]")).not.toBeNull();
    expect(copiar).toHaveBeenCalledWith(BENEFICIARIO.chave);
  });
});

describe("Cópia do código copia e cola (RF-15; RN-10)", () => {
  it("copia exatamente o payload que gerou o QR, byte a byte", async () => {
    const copiar = abrirPainel();
    fireEvent.click(
      await screen.findByRole("button", {
        name: /copiar código copia e cola/i,
      }),
    );
    await waitFor(() => expect(copiar).toHaveBeenCalledTimes(1));
    expect(copiar.mock.calls[0][0]).toBe(PAYLOAD);
  });

  it("confirma a cópia dizendo o que fazer com o código", async () => {
    abrirPainel();
    fireEvent.click(
      await screen.findByRole("button", {
        name: /copiar código copia e cola/i,
      }),
    );
    expect(
      await screen.findByText(/cole no aplicativo do banco/i),
    ).toBeTruthy();
  });

  it("os dois comandos vêm antes do QR na ordem do DOM (RF-16)", async () => {
    abrirPainel();
    const painel = await screen.findByRole("dialog");
    const copiaECola = within(painel).getByRole("button", {
      name: /copiar código copia e cola/i,
    });
    const chave = within(painel).getByRole("button", { name: /copiar chave/i });
    const desenho = within(painel).getByRole("img", {
      name: /leitura pela câmera/i,
    });
    const vemDepois = (no: Element) =>
      Boolean(
        copiaECola.compareDocumentPosition(no) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    expect(vemDepois(chave)).toBe(true);
    expect(vemDepois(desenho)).toBe(true);
  });
});

describe("Falha da área de transferência (RF-07; RNF de observabilidade)", () => {
  it("mostra recado nomeado e mantém a chave visível para cópia manual", async () => {
    abrirPainel(vi.fn().mockResolvedValue({ ok: false }));
    fireEvent.click(
      await screen.findByRole("button", { name: /copiar chave/i }),
    );
    const falha = await screen.findByText(/não foi possível copiar/i);
    expect(falha.closest("[role=alert]")).not.toBeNull();
    expect(screen.getByText(BENEFICIARIO.chave)).toBeTruthy();
  });
});

describe("Fechamento e foco (RF-09)", () => {
  it("fecha por Esc e devolve o foco ao comando que o abriu", async () => {
    abrirPainel();
    const painel = await screen.findByRole("dialog");
    fireEvent.keyDown(painel, { key: "Escape", code: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: /contribuir por pix/i }),
      ),
    );
  });

  // O nome acessível do comando de fechar vem do próprio Dialog do Primer, que
  // não é localizado e o publica em inglês ("Close"). Fica registrado como
  // observação da entrega: é o único texto exibido da feature que não passa pelo
  // inventário, porque não é literal nosso.
  it("fecha pelo comando explícito de fechar", async () => {
    abrirPainel();
    const painel = await screen.findByRole("dialog");
    fireEvent.click(within(painel).getByRole("button", { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

describe("Privacidade (RN-03)", () => {
  it("abrir e fechar o painel não escreve nada no armazenamento do navegador", async () => {
    const antes = JSON.stringify({ ...localStorage });
    abrirPainel();
    const painel = await screen.findByRole("dialog");
    fireEvent.keyDown(painel, { key: "Escape", code: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(JSON.stringify({ ...localStorage })).toBe(antes);
    expect(Object.keys({ ...sessionStorage })).toHaveLength(0);
  });
});
