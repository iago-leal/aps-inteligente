import { afterEach, describe, expect, test, vi } from "vitest";
import { ErroDeBanco } from "../../../infra/database";
import { verificarBanco } from "../../../infra/saude";

// Unidade de infra/saude.ts (feature 022; RF-01, RF-02; RN-03; D-07;
// _reversa_forward/022-status-healthcheck-e-deploy/interfaces/conexao-banco.md §4).
// O duplo entra no lugar do banco: os cinco desfechos se exercitam sem servidor de pé,
// que é a razão de a conversão morar aqui e não no handler.
//
// A asserção que não pode faltar é a de que a função NUNCA rejeita. Erro esperado é
// valor (invariante 2 do domain.md); exceção que escape daqui é bug, não estado.

vi.mock("../../../infra/database", async (original) => {
  const real = await original<typeof import("../../../infra/database")>();
  return { ...real, saude: vi.fn() };
});

const { saude } = await import("../../../infra/database");
const saudeDuplo = vi.mocked(saude);

afterEach(() => {
  vi.mocked(saudeDuplo).mockReset();
});

describe("verificarBanco", () => {
  test("banco respondendo: estado íntegro, sem causa", async () => {
    saudeDuplo.mockResolvedValue({ ok: true });

    await expect(verificarBanco()).resolves.toEqual({ estado: "integro" });
  });

  test.each([
    ["conexao"],
    ["consulta"],
    ["configuracao"],
    ["tempo_esgotado"],
  ] as const)(
    "ErroDeBanco de causa %s vira valor degradado, sem rejeitar",
    async (causa) => {
      saudeDuplo.mockRejectedValue(
        new ErroDeBanco(
          causa,
          "mensagem interna que jamais atravessa a fronteira",
        ),
      );

      await expect(verificarBanco()).resolves.toEqual({
        estado: "degradado",
        causa,
      });
    },
  );

  test("erro que não é ErroDeBanco também vira valor, e não exceção", async () => {
    saudeDuplo.mockRejectedValue(new TypeError("defeito inesperado do driver"));
    const registro = vi.spyOn(console, "error").mockImplementation(() => {});

    // Cai no balde genérico do próprio infra/database.ts, onde tudo o que não é
    // conexão, configuração ou tempo é falha de consulta. E é barulhento: a linha
    // de log existe porque chegar aqui significa contrato interno quebrado.
    await expect(verificarBanco()).resolves.toEqual({
      estado: "degradado",
      causa: "consulta",
    });
    expect(registro).toHaveBeenCalledOnce();

    registro.mockRestore();
  });

  test("o teto pedido chega a saude() como veio, e a ausência dele também", async () => {
    saudeDuplo.mockResolvedValue({ ok: true });

    await verificarBanco(750);
    expect(saudeDuplo).toHaveBeenCalledWith({ tetoMs: 750 });

    saudeDuplo.mockClear();
    await verificarBanco();
    expect(saudeDuplo).toHaveBeenCalledWith(undefined);
  });

  test("a mensagem interna do erro não aparece no valor devolvido", async () => {
    saudeDuplo.mockRejectedValue(
      new ErroDeBanco(
        "conexao",
        "ECONNREFUSED: falha de conexão com o banco (host loca•••) após 12 ms; SELECT $1::int",
      ),
    );

    const estado = await verificarBanco();
    const serializado = JSON.stringify(estado);

    expect(serializado).not.toMatch(/host|select|•••|ECONNREFUSED/i);
    expect(Object.keys(estado).sort()).toEqual(["causa", "estado"]);
  });
});
