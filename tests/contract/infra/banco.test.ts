import { afterEach, describe, expect, test } from "vitest";
import {
  ErroDeBanco,
  encerrar,
  query,
  saude,
  type LeituraDeSaude,
} from "../../../infra/database";

// Contrato da conexão com o banco (feature 003; RF-02, RF-04; RN-03, RN-05;
// _reversa_forward/003-banco-de-dados-psql-pg/interfaces/conexao-banco.md).
// Exige DATABASE_URL apontando para um banco de pé — local: `npm run db:up`;
// CI: service container do job de contrato. O contrato de GET /api/v1/status
// não é tocado por este arquivo (W006): saúde do banco é verificação separada.
//
// Feature 024 (RF-01, RF-02, RF-03; RN-06, RN-08, RN-09; D-01 a D-03;
// _reversa_forward/024-status-conexoes-do-banco/interfaces/conexao-banco.md §1):
// `saude()` deixou de devolver um booleano de valor único. Contra um banco real, o que
// se afere aqui é a forma da linha e a plausibilidade dos números; a coluna malformada
// fica com a suíte de unidade, porque servidor algum a produz.

const URL_ORIGINAL = process.env.DATABASE_URL;

/** Conferência de forma da leitura, aplicada a toda chamada bem-sucedida deste arquivo.
 *  Os números são aferidos por plausibilidade, e não por valor: teto e contagem dependem
 *  da instância que atendeu, e prendê-los a constantes tornaria o teste refém do
 *  ambiente. A quarta coluna, `ok`, prova-se por ausência de erro: valesse outra coisa,
 *  a chamada teria rejeitado antes de chegar aqui. */
function conferirLeitura(leitura: LeituraDeSaude): void {
  expect(Object.keys(leitura).sort()).toEqual([
    "conexoes_abertas",
    "teto_de_conexoes",
    "versao",
  ]);

  expect(Number.isInteger(leitura.teto_de_conexoes)).toBe(true);
  expect(leitura.teto_de_conexoes).toBeGreaterThanOrEqual(1);

  // O piso é um porque a própria consulta se conta (RN-08, e a premissa P-03 do plano).
  expect(Number.isInteger(leitura.conexoes_abertas)).toBe(true);
  expect(leitura.conexoes_abertas).toBeGreaterThanOrEqual(1);

  // Os dois universos diferem — a contagem filtra pelo banco corrente, o teto é do
  // servidor —, mas o primeiro jamais ultrapassa o segundo.
  expect(leitura.conexoes_abertas).toBeLessThanOrEqual(
    leitura.teto_de_conexoes,
  );

  // RN-06: só o número. A cadeia completa nomearia o produto e cairia na denylist.
  expect(leitura.versao).toMatch(/^\d+(?:\.\d+)*$/);
}

describe("saúde do banco (infra/database)", () => {
  afterEach(async () => {
    if (URL_ORIGINAL === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = URL_ORIGINAL;
    }
    await encerrar();
  });

  test("saude() devolve teto, conexões abertas e versão com o banco de pé", async () => {
    conferirLeitura(await saude());
  });

  test("a versão publicada é o prefixo numérico do que o servidor reporta", async () => {
    const [linha] = await query<{ bruta: string }>(
      "SELECT current_setting('server_version') AS bruta",
    );
    const { versao } = await saude();

    // A sanitização se afere aqui contra a cadeia real da imagem em uso, e não contra
    // uma cadeia inventada: o que a unidade prova é a regra, o que este teste prova é
    // que a regra alcança o servidor que de fato responde (D-03).
    expect(linha.bruta.startsWith(versao)).toBe(true);
    expect(versao).not.toMatch(/postgres/i);
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
      conferirLeitura(await saude());
    }
  }, 20_000);

  test("teto explícito não contamina a chamada seguinte, que volta ao padrão", async () => {
    conferirLeitura(await saude({ tetoMs: 200 }));
    await expect(query("SELECT pg_sleep(0.5)")).resolves.toHaveLength(1);
  }, 20_000);
});
