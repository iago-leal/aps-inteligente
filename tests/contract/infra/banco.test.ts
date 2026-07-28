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

  // Teto de tempo por chamada (feature 022; RF-07; D-03;
  // _reversa_forward/022-status-healthcheck-e-deploy/interfaces/conexao-banco.md §2).
  // O que se afere aqui é o MECANISMO, e por isso a consulta é deliberadamente lenta:
  // a consulta de saúde é rápida demais para estourar teto algum de forma confiável.

  test("teto excedido: causa tempo_esgotado, e o cliente descartado não prende o pool", async () => {
    const inicio = Date.now();
    const desfecho = await query("SELECT pg_sleep(5)", [], {
      tetoMs: 200,
    }).then(
      () => ({ resolveu: true as const }),
      (erro: unknown) => ({ resolveu: false as const, erro }),
    );
    const duracao = Date.now() - inicio;

    expect(desfecho.resolveu).toBe(false);
    if (!desfecho.resolveu) {
      expect(desfecho.erro).toBeInstanceOf(ErroDeBanco);
      expect(desfecho.erro).toMatchObject({
        name: "ErroDeBanco",
        causa: "tempo_esgotado",
      });
    }
    // Cancelamento no servidor, e não temporizador de cliente: a resposta chega
    // muito antes dos 5 s que a consulta pediu.
    expect(duracao).toBeLessThan(1_000);

    // O risco alto do roadmap: cliente devolvido sujo esgotaria as cinco conexões e
    // transformaria degradação em indisponibilidade. Dez chamadas seguidas provam
    // que o pool continua entregando conexão.
    for (let i = 0; i < 10; i += 1) {
      await expect(saude()).resolves.toEqual({ ok: true });
    }
  }, 20_000);

  test("teto explícito não contamina a chamada seguinte, que volta ao padrão", async () => {
    await expect(saude({ tetoMs: 200 })).resolves.toEqual({ ok: true });
    await expect(query("SELECT pg_sleep(0.5)")).resolves.toHaveLength(1);
  }, 20_000);
});
