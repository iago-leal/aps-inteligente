// infra/database.ts — único ponto de acesso ao banco (feature 003; RF-02; RN-02, RN-04, RN-05).
// Contrato: _reversa_forward/003-banco-de-dados-psql-pg/interfaces/conexao-banco.md,
// revisto por _reversa_forward/022-status-healthcheck-e-deploy/interfaces/conexao-banco.md.
// Pool preguiçoso, consultas sempre parametrizadas, erros nomeados com causa preservada,
// log estruturado sem URL nem credencial (host sempre mascarado). Sem retentativa
// automática: falha barulhenta; retry é decisão do chamador.
//
// Feature 022 (RF-07; D-03, D-06): teto de tempo por chamada, realizado NO SERVIDOR por
// statement_timeout. É o único mecanismo que cancela de fato — o temporizador do driver
// deixaria a consulta viva e o cliente voltaria ao pool com resposta pendente, que é o
// modo de transformar degradação em indisponibilidade.
//
// Feature 024 (RF-01, RF-02, RF-03, RF-05, RF-07; RN-01, RN-03, RN-06, RN-08, RN-09;
// D-01 a D-03, D-05): `saude()` devolve a leitura completa, e não mais um booleano de
// valor único. Muda a largura da linha que a consulta traz, e nada além disso: segue
// uma ida só, sob o mesmo teto e sem retentativa. Contrato desta revisão em
// _reversa_forward/024-status-conexoes-do-banco/interfaces/conexao-banco.md §1.
import { Pool, type PoolClient, type QueryResultRow } from "pg";

const TETO_PADRAO_MS = 3_000;
const MAXIMO_DE_CONEXOES = 5;

/** `query_canceled`: o servidor abortou a consulta ao atingir o statement_timeout. */
const CODIGO_DE_CANCELAMENTO = "57014";

const AJUSTE_DE_TETO = "SELECT set_config('statement_timeout', $1, false)";

export type CausaDeErroDeBanco =
  "conexao" | "consulta" | "configuracao" | "tempo_esgotado";

export class ErroDeBanco extends Error {
  readonly causa: CausaDeErroDeBanco;

  constructor(causa: CausaDeErroDeBanco, mensagem: string, origem?: unknown) {
    super(mensagem, origem === undefined ? undefined : { cause: origem });
    this.name = "ErroDeBanco";
    this.causa = causa;
  }
}

let pool: Pool | undefined;

// Teto que o pool vigente carrega na sessão. Fixado na criação do pool, e não a cada
// consulta, porque é ele que viaja nos parâmetros de inicialização da conexão.
let tetoPadraoAplicadoMs = TETO_PADRAO_MS;

type ErroComCodigo = Error & { code?: string };

// Códigos de rede e de recusa do servidor tratados como falha de CONEXÃO;
// o restante (SQL inválido, resultado inesperado) é falha de CONSULTA.
// Feature 022 (D-02): ETIMEDOUT saiu daqui — estouro de tempo tem causa própria,
// porque lentidão e defeito pedem leituras clínicas diferentes de quem opera.
const CODIGOS_DE_CONEXAO = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EHOSTUNREACH",
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
  return /connection terminated/i.test(mensagem);
}

// A espera pela conexão e o cancelamento da consulta são o mesmo desfecho para quem
// lê o healthcheck: o orçamento acabou. A instância suspensa que demora a despertar
// cai aqui, e não em `conexao` — não é banco fora (D-02).
function ehEstouroDeTempo(erro: unknown): boolean {
  const codigo = (erro as ErroComCodigo | undefined)?.code;
  if (codigo === CODIGO_DE_CANCELAMENTO || codigo === "ETIMEDOUT") return true;
  const mensagem = erro instanceof Error ? erro.message : "";
  // "Connection terminated due to connection timeout" é como o driver anuncia o
  // estouro da espera pelo pool, e precisa ser reconhecido ANTES de `ehErroDeConexao`,
  // que casaria com o "connection terminated" de uma queda de conexão — outra coisa.
  return /timeout exceeded when trying to connect|connection terminated due to connection timeout|statement timeout|canceling statement/i.test(
    mensagem,
  );
}

/** Teto vindo do ambiente (D-06). Malformado cai no padrão e faz barulho: um NaN
 *  desligaria a proteção em silêncio, e silêncio é o defeito que a 022 combate. */
function tetoDoAmbiente(): number {
  const bruto = process.env.APS_TIMEOUT_SAUDE_MS;
  if (bruto === undefined || bruto.trim() === "") return TETO_PADRAO_MS;

  const valor = Number(bruto);
  if (!Number.isInteger(valor) || valor <= 0) {
    console.error(
      JSON.stringify({
        nivel: "erro",
        origem: "infra/database",
        causa: "configuracao",
        erro: "APS_TIMEOUT_SAUDE_MS inválida: esperado inteiro positivo em ms",
        recebido: bruto.slice(0, 20),
        teto_aplicado_ms: TETO_PADRAO_MS,
      }),
    );
    return TETO_PADRAO_MS;
  }
  return valor;
}

function registrar(
  causa: CausaDeErroDeBanco,
  erro: unknown,
  duracaoMs?: number,
  tetoMs?: number,
): void {
  console.error(
    JSON.stringify({
      nivel: "erro",
      origem: "infra/database",
      causa,
      erro: nomeDoErro(erro),
      host: hostMascarado(),
      ...(duracaoMs !== undefined && { duracao_ms: duracaoMs }),
      ...(tetoMs !== undefined && { teto_ms: tetoMs }),
    }),
  );
}

function obterPool(): Pool {
  if (!pool) {
    tetoPadraoAplicadoMs = tetoDoAmbiente();
    pool = new Pool({
      connectionString: urlDeConexao(),
      max: MAXIMO_DE_CONEXOES,
      connectionTimeoutMillis: tetoPadraoAplicadoMs,
      // Viaja nos parâmetros de inicialização da sessão: o caminho quente não paga
      // round-trip, e o cancelamento fica a cargo do servidor.
      statement_timeout: tetoPadraoAplicadoMs,
    });
    // Cliente ocioso pode falhar fora de uma consulta; sem este handler o processo cai.
    pool.on("error", (origem) => registrar("conexao", origem));
  }
  return pool;
}

/** Ajusta o teto da sessão. `is_local = false` porque a consulta não está em
 *  transação; o preço é ter de restaurar o padrão antes de devolver o cliente. */
async function aplicarTeto(cliente: PoolClient, ms: number): Promise<void> {
  await cliente.query(AJUSTE_DE_TETO, [String(ms)]);
}

function classificar(
  origem: unknown,
  texto: string,
  duracaoMs: number,
  tetoMs: number,
): ErroDeBanco {
  if (ehEstouroDeTempo(origem)) {
    registrar("tempo_esgotado", origem, duracaoMs, tetoMs);
    return new ErroDeBanco(
      "tempo_esgotado",
      `${nomeDoErro(origem)}: teto de ${tetoMs} ms atingido no banco (host ${hostMascarado()}) após ${duracaoMs} ms`,
      origem,
    );
  }
  if (ehErroDeConexao(origem)) {
    registrar("conexao", origem, duracaoMs);
    return new ErroDeBanco(
      "conexao",
      `${nomeDoErro(origem)}: falha de conexão com o banco (host ${hostMascarado()}) após ${duracaoMs} ms`,
      origem,
    );
  }
  registrar("consulta", origem, duracaoMs);
  return new ErroDeBanco(
    "consulta",
    `${nomeDoErro(origem)}: falha na consulta "${texto.slice(0, 40)}" após ${duracaoMs} ms`,
    origem,
  );
}

export async function query<Linha extends QueryResultRow = QueryResultRow>(
  texto: string,
  parametros: unknown[] = [],
  opcoes: { tetoMs?: number } = {},
): Promise<Linha[]> {
  const inicio = Date.now();
  const teto = opcoes.tetoMs ?? tetoPadraoAplicadoMs;
  let cliente: PoolClient | undefined;
  let descartar = false;

  try {
    const alvo = obterPool();
    // O relógio começa antes de obter a conexão: o orçamento é total, e a espera
    // pelo pool já é limitada por connectionTimeoutMillis.
    cliente = await alvo.connect();
    if (teto !== tetoPadraoAplicadoMs) await aplicarTeto(cliente, teto);
    const resultado = await cliente.query<Linha>(texto, parametros as never[]);
    return resultado.rows;
  } catch (origem) {
    const duracaoMs = Date.now() - inicio;
    descartar = true;
    if (origem instanceof ErroDeBanco) {
      registrar(origem.causa, origem.cause ?? origem, duracaoMs);
      throw origem;
    }
    throw classificar(origem, texto, duracaoMs, teto);
  } finally {
    if (cliente) await devolver(cliente, descartar, teto);
  }
}

/** Devolve o cliente ao pool. Descartado no caminho de erro, para que nenhuma
 *  conexão fique pendurada; no de sucesso com teto próprio, a sessão volta ao
 *  padrão antes de ser reaproveitada — `is_local = false` sobrevive à consulta. */
async function devolver(
  cliente: PoolClient,
  descartar: boolean,
  tetoAplicado: number,
): Promise<void> {
  if (descartar || tetoAplicado === tetoPadraoAplicadoMs) {
    cliente.release(descartar);
    return;
  }
  try {
    await aplicarTeto(cliente, tetoPadraoAplicadoMs);
    cliente.release();
  } catch (origem) {
    registrar("consulta", origem);
    cliente.release(true);
  }
}

/** O que a verificação de saúde apura, numa ida só (feature 024; RF-01, RF-02, RF-03,
 *  RF-05). O teto é o do servidor alcançado; a contagem é a do banco corrente, e inclui
 *  a própria requisição, de modo que o piso é um.
 *
 *  Os campos grafam-se em `snake_case`, contra o camelCase do restante do módulo, e a
 *  exceção é deliberada: este tipo **é a forma do fio**. `infra/saude.ts` o espalha no
 *  ramo íntegro de `EstadoDoBanco`, que o handler serializa inteiro sem remapear (D-08),
 *  de modo que renomear aqui renomearia o corpo público. Ou o nome do fio vive neste
 *  tipo, ou algum módulo do caminho vira tradutor, e nenhum deles quer sê-lo. */
export type LeituraDeSaude = {
  readonly teto_de_conexoes: number;
  readonly conexoes_abertas: number;
  readonly versao: string;
};

// Quatro colunas numa linha, e uma viagem só (D-01): repetir a ida dobraria o custo da
// única rota de observabilidade do sistema. A contagem filtra pelo banco corrente
// porque a instância pode hospedar outros (D-02, RN-08).
const CONSULTA_DE_SAUDE = `SELECT $1::int AS ok,
       current_setting('max_connections')::int AS teto_de_conexoes,
       (SELECT count(*) FROM pg_stat_activity
         WHERE datname = current_database())::int AS conexoes_abertas,
       current_setting('server_version') AS versao`;

/** Prefixo numérico da versão, ancorado no início. Imagens derivadas de Debian anexam
 *  sufixo entre parênteses ao `server_version`, e o contrato público promete só o
 *  número (D-03, RN-06). */
const PREFIXO_DE_VERSAO = /^\d+(?:\.\d+)*/;

/** Converte a coluna numérica, ou devolve `undefined` quando ela reprova o formato. O
 *  piso é parâmetro porque teto e contagem são grandezas distintas que por ora coincidem
 *  no limite inferior. Devolve valor, e não booleano, para que o estreitamento de tipo
 *  sobreviva à checagem conjunta lá embaixo. */
function inteiroAPartirDe(valor: unknown, piso: number): number | undefined {
  const inteiro =
    typeof valor === "number" && Number.isInteger(valor) && valor >= piso;
  return inteiro ? valor : undefined;
}

/** Extrai o número da versão. Devolve `undefined` quando não há prefixo numérico, que
 *  é o que reprova a leitura. Jamais usa `version()`: aquela cadeia nomeia o produto, a
 *  arquitetura e o compilador, e cairia na denylist do corpo público (D-03). */
function versaoNumerica(bruta: unknown): string | undefined {
  if (typeof bruta !== "string") return undefined;
  return PREFIXO_DE_VERSAO.exec(bruta.trim())?.[0];
}

export async function saude(
  opcoes: { tetoMs?: number } = {},
): Promise<LeituraDeSaude> {
  const linhas = await query<{
    ok: unknown;
    teto_de_conexoes: unknown;
    conexoes_abertas: unknown;
    versao: unknown;
  }>(CONSULTA_DE_SAUDE, [1], opcoes);
  if (linhas.length !== 1 || linhas[0].ok !== 1) {
    throw new ErroDeBanco(
      "consulta",
      "verificação de saúde retornou resultado inesperado",
    );
  }

  // Feature 024 (D-05, RN-03): coluna fora do formato reprova a verificação inteira, e
  // com a mesma causa de sempre. `consulta` já significa "a conexão abriu e a consulta
  // de saúde não devolveu o resultado esperado"; uma quinta causa diria a quem lê o
  // healthcheck algo que ele não pode acionar.
  const teto = inteiroAPartirDe(linhas[0].teto_de_conexoes, 1);
  const abertas = inteiroAPartirDe(linhas[0].conexoes_abertas, 1);
  const numero = versaoNumerica(linhas[0].versao);

  if (teto === undefined || abertas === undefined || numero === undefined) {
    const reprovadas = [
      teto === undefined ? "teto_de_conexoes" : undefined,
      abertas === undefined ? "conexoes_abertas" : undefined,
      numero === undefined ? "versao" : undefined,
    ].filter((coluna): coluna is string => coluna !== undefined);
    // Esta é a única degradação que não nasce de exceção do driver, e por isso a única
    // que passaria sem rastro se o log ficasse a cargo de `classificar`. A RN-03 aceita
    // que a falta de permissão de leitura degrade TODA requisição, e degradação perpétua
    // sem log seria indistinguível de banco fora. O log nomeia a coluna, jamais o valor.
    console.error(
      JSON.stringify({
        nivel: "erro",
        origem: "infra/database",
        causa: "consulta",
        erro: "estatísticas de conexão fora do formato esperado",
        colunas: reprovadas,
        host: hostMascarado(),
      }),
    );
    throw new ErroDeBanco(
      "consulta",
      `verificação de saúde reprovou a leitura em: ${reprovadas.join(", ")}`,
    );
  }

  return {
    teto_de_conexoes: teto,
    conexoes_abertas: abertas,
    versao: numero,
  };
}

export async function encerrar(): Promise<void> {
  if (!pool) return;
  const drenando = pool;
  pool = undefined;
  await drenando.end();
}
