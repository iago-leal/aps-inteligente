// infra/database.ts — único ponto de acesso ao banco (feature 003; RF-02; RN-02, RN-04, RN-05).
// Contrato: _reversa_forward/003-banco-de-dados-psql-pg/interfaces/conexao-banco.md.
// Pool preguiçoso, consultas sempre parametrizadas, erros nomeados com causa preservada,
// log estruturado sem URL nem credencial (host sempre mascarado). Sem retentativa
// automática: falha barulhenta; retry é decisão do chamador.
import { Pool, type QueryResultRow } from "pg";

const TEMPO_LIMITE_MS = 5_000;
const MAXIMO_DE_CONEXOES = 5;

export type CausaDeErroDeBanco = "conexao" | "consulta" | "configuracao";

export class ErroDeBanco extends Error {
  readonly causa: CausaDeErroDeBanco;

  constructor(causa: CausaDeErroDeBanco, mensagem: string, origem?: unknown) {
    super(mensagem, origem === undefined ? undefined : { cause: origem });
    this.name = "ErroDeBanco";
    this.causa = causa;
  }
}

let pool: Pool | undefined;

type ErroComCodigo = Error & { code?: string };

// Códigos de rede e de recusa do servidor tratados como falha de CONEXÃO;
// o restante (SQL inválido, timeout de consulta) é falha de CONSULTA.
const CODIGOS_DE_CONEXAO = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ETIMEDOUT",
  "28P01", // senha inválida
  "28000", // autorização recusada
  "3D000", // banco inexistente
  "57P03", // servidor ainda subindo
]);

function urlDeConexao(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new ErroDeBanco(
      "configuracao",
      "DATABASE_URL ausente: copie .env.example para .env.local e preencha a conexão",
    );
  }
  try {
    new URL(url);
  } catch (origem) {
    throw new ErroDeBanco(
      "configuracao",
      "DATABASE_URL malformada: siga o formato do gabarito em .env.example",
      origem,
    );
  }
  return url;
}

function hostMascarado(): string {
  try {
    const { hostname } = new URL(process.env.DATABASE_URL ?? "");
    return hostname.length <= 4 ? "•••" : `${hostname.slice(0, 4)}•••`;
  } catch {
    return "•••";
  }
}

function nomeDoErro(erro: unknown): string {
  const codigo = (erro as ErroComCodigo | undefined)?.code;
  if (codigo) return codigo;
  return erro instanceof Error ? erro.name : "ErroDesconhecido";
}

function ehErroDeConexao(erro: unknown): boolean {
  const codigo = (erro as ErroComCodigo | undefined)?.code;
  if (codigo !== undefined && CODIGOS_DE_CONEXAO.has(codigo)) return true;
  const mensagem = erro instanceof Error ? erro.message : "";
  return /timeout exceeded when trying to connect|connection terminated/i.test(
    mensagem,
  );
}

function registrar(
  causa: CausaDeErroDeBanco,
  erro: unknown,
  duracaoMs?: number,
): void {
  console.error(
    JSON.stringify({
      nivel: "erro",
      origem: "infra/database",
      causa,
      erro: nomeDoErro(erro),
      host: hostMascarado(),
      ...(duracaoMs !== undefined && { duracao_ms: duracaoMs }),
    }),
  );
}

function obterPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: urlDeConexao(),
      max: MAXIMO_DE_CONEXOES,
      connectionTimeoutMillis: TEMPO_LIMITE_MS,
      query_timeout: TEMPO_LIMITE_MS,
    });
    // Cliente ocioso pode falhar fora de uma consulta; sem este handler o processo cai.
    pool.on("error", (origem) => registrar("conexao", origem));
  }
  return pool;
}

export async function query<Linha extends QueryResultRow = QueryResultRow>(
  texto: string,
  parametros: unknown[] = [],
): Promise<Linha[]> {
  const inicio = Date.now();
  try {
    const resultado = await obterPool().query<Linha>(
      texto,
      parametros as never[],
    );
    return resultado.rows;
  } catch (origem) {
    const duracaoMs = Date.now() - inicio;
    if (origem instanceof ErroDeBanco) {
      registrar(origem.causa, origem.cause ?? origem, duracaoMs);
      throw origem;
    }
    if (ehErroDeConexao(origem)) {
      registrar("conexao", origem, duracaoMs);
      throw new ErroDeBanco(
        "conexao",
        `${nomeDoErro(origem)}: falha de conexão com o banco (host ${hostMascarado()}) após ${duracaoMs} ms`,
        origem,
      );
    }
    registrar("consulta", origem, duracaoMs);
    throw new ErroDeBanco(
      "consulta",
      `${nomeDoErro(origem)}: falha na consulta "${texto.slice(0, 40)}" após ${duracaoMs} ms`,
      origem,
    );
  }
}

export async function saude(): Promise<{ ok: true }> {
  const linhas = await query<{ ok: number }>("SELECT $1::int AS ok", [1]);
  if (linhas.length !== 1 || linhas[0].ok !== 1) {
    throw new ErroDeBanco(
      "consulta",
      "verificação de saúde retornou resultado inesperado",
    );
  }
  return { ok: true };
}

export async function encerrar(): Promise<void> {
  if (!pool) return;
  const drenando = pool;
  pool = undefined;
  await drenando.end();
}
