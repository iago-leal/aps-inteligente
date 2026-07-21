import { afterEach, describe, expect, test } from "vitest";
import { ErroDeBanco, encerrar, query, saude } from "../../../infra/database";

// Contrato da conexão com o banco (feature 003; RF-02, RF-04; RN-03, RN-05;
// _reversa_forward/003-banco-de-dados-psql-pg/interfaces/conexao-banco.md).
// Exige DATABASE_URL apontando para um banco de pé — local: `npm run db:up`;
// CI: service container do job de contrato. O contrato de GET /api/v1/status
// não é tocado por este arquivo (W006): saúde do banco é verificação separada.

const URL_ORIGINAL = process.env.DATABASE_URL;

describe("saúde do banco (infra/database)", () => {
  afterEach(async () => {
    if (URL_ORIGINAL === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = URL_ORIGINAL;
    }
    await encerrar();
  });

  test("saude() responde { ok: true } com o banco de pé", async () => {
    await expect(saude()).resolves.toEqual({ ok: true });
  });

  test("consulta parametrizada retorna o valor ecoado (RF-02)", async () => {
    const linhas = await query<{ eco: string }>("SELECT $1::text AS eco", [
      "aps",
    ]);
    expect(linhas).toEqual([{ eco: "aps" }]);
  });

  test("banco fora: ErroDeBanco de conexão dentro do tempo-limite, sem sucesso silencioso", async () => {
    await encerrar();
    process.env.DATABASE_URL = "postgres://ninguem:nada@127.0.0.1:9/fora";

    const inicio = Date.now();
    const promessa = saude().then(
      () => ({ resolveu: true as const }),
      (erro: unknown) => ({ resolveu: false as const, erro }),
    );
    const desfecho = await promessa;
    const duracao = Date.now() - inicio;

    expect(desfecho.resolveu).toBe(false);
    if (!desfecho.resolveu) {
      expect(desfecho.erro).toBeInstanceOf(ErroDeBanco);
      expect(desfecho.erro).toMatchObject({
        name: "ErroDeBanco",
        causa: "conexao",
      });
    }
    // Tempo-limite de conexão do contrato: 5 000 ms; margem para o overhead do runner.
    expect(duracao).toBeLessThan(6_000);
  }, 10_000);

  test("DATABASE_URL ausente: ErroDeBanco de configuração apontando o gabarito", async () => {
    await encerrar();
    delete process.env.DATABASE_URL;

    await expect(saude()).rejects.toMatchObject({
      name: "ErroDeBanco",
      causa: "configuracao",
      message: expect.stringContaining(".env.example"),
    });
  });
});
