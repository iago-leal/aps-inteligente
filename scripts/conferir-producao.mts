// Confere se o que está publicado corresponde ao que este repositório entregou:
// consulta `GET /api/v1/status` e compara o SHA devolvido com o último commit
// local que de fato muda o que a Vercel serve.
//
// O PROBLEMA QUE ELE RESOLVE. A conferência era manual — rodar `curl`, copiar o
// SHA, comparar de olho com `git rev-parse HEAD` — e comparar com o HEAD é o
// erro que ela convidava. O HEAD carrega commits de encerramento de sessão, de
// artefato do Reversa e de documentação, nenhum dos quais chega ao build. Em
// 28/07/2026 a nota do projeto arrastava por quatro sessões uma pendência de
// "produção defasada" que era falso alarme: a produção estava no último commit
// de aplicação, e os commits à frente só tocavam `.harness/`.
//
// A RÉGUA, e ela é conservadora de propósito. Conta como aplicação **tudo**,
// exceto os diretórios de governança nomeados em GOVERNANCA. Arquivo novo de
// código, em pasta nova, entra na conta sem que ninguém precise lembrar de
// atualizar esta lista — o inverso (allowlist de caminhos servidos) produziria
// "em dia" silencioso justamente na entrega que ninguém previu.
//
// Três promessas:
//
//  1. **Nenhuma conclusão sem prova.** Cada linha da saída diz de onde veio o
//     número; quando algo não pôde ser apurado, ele aparece como desconhecido, e
//     não como zero.
//  2. **Falha ruidosa.** Rede fora, corpo fora do contrato ou SHA que o repo não
//     conhece param com mensagem específica e saída ≠ 0.
//  3. **Utilizável por máquina.** Saída 0 em dia, 1 defasado, 2 erro de
//     apuração. `--json` devolve o veredito estruturado.
//
// Uso:  node scripts/conferir-producao.mts [--url <origem>] [--json]
//       npm run status:conferir
//       (a origem também sai de APS_URL_PRODUCAO; o padrão é a produção.)
import { execFileSync } from "node:child_process";

const URL_PADRAO = "https://apsinteligente.app";
const CAMINHO = "/api/v1/status";
const TEMPO_LIMITE_MS = 10_000;

/** Diretórios cujo conteúdo jamais chega ao build servido (ver A RÉGUA, acima). */
const GOVERNANCA = [
  ".harness",
  ".reversa",
  ".claude",
  ".agents",
  "_reversa_forward",
  "_reversa_sdd",
  "_reversa_docs",
  "_reversa_bugs",
  "docs",
];

interface Argumentos {
  readonly origem: string;
  readonly json: boolean;
}

function leArgumentos(argv: readonly string[]): Argumentos {
  const i = argv.indexOf("--url");
  const origem =
    i >= 0 && argv[i + 1]
      ? argv[i + 1]!
      : (process.env.APS_URL_PRODUCAO ?? URL_PADRAO);
  return { origem: origem.replace(/\/$/, ""), json: argv.includes("--json") };
}

function git(...args: readonly string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

/** Pergunta ao git sem deixá-lo falar: só interessa se o comando teve êxito. */
function gitDizSim(...args: readonly string[]): boolean {
  try {
    execFileSync("git", args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const existeAqui = (sha: string) =>
  gitDizSim("cat-file", "-e", `${sha}^{commit}`);

/** `descendente` contém tudo o que `ancestral` contém (ou é o próprio). */
const contem = (ancestral: string, descendente: string) =>
  gitDizSim("merge-base", "--is-ancestor", ancestral, descendente);

/** Pathspecs que excluem a governança, para `git log`. */
function exclusoes(): readonly string[] {
  return GOVERNANCA.map((dir) => `:(exclude)${dir}`);
}

interface Status {
  readonly commit: string;
  readonly versao: string;
  readonly atualizadoEm: string;
  readonly ms: number;
}

async function consulta(origem: string): Promise<Status> {
  const inicio = performance.now();
  let resposta: Response;
  try {
    resposta = await fetch(`${origem}${CAMINHO}`, {
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
      headers: { accept: "application/json" },
    });
  } catch (erro) {
    throw new Error(
      `não foi possível falar com ${origem}${CAMINHO}: ${(erro as Error).message}`,
    );
  }
  const ms = Math.round(performance.now() - inicio);

  if (!resposta.ok) {
    throw new Error(`${origem}${CAMINHO} respondeu ${resposta.status}`);
  }

  const corpo = (await resposta.json()) as Record<string, unknown>;
  for (const campo of ["commit", "versao", "atualizado_em"]) {
    if (typeof corpo[campo] !== "string") {
      throw new Error(
        `corpo fora do contrato: falta o campo "${campo}" (ver interfaces/http-get-api-v1-status.md)`,
      );
    }
  }

  return {
    commit: corpo.commit as string,
    versao: corpo.versao as string,
    atualizadoEm: corpo.atualizado_em as string,
    ms,
  };
}

function curto(sha: string): string {
  return sha === "local" ? sha : sha.slice(0, 7);
}

async function principal(): Promise<number> {
  const { origem, json } = leArgumentos(process.argv.slice(2));
  const producao = await consulta(origem);

  const head = git("rev-parse", "HEAD");
  const ultimoDeAplicacao = git(
    "log",
    "-1",
    "--format=%H",
    "--",
    ".",
    ...exclusoes(),
  );

  // A pergunta NÃO é se os SHAs são iguais. O provedor publica todo push,
  // inclusive commits que só tocam governança, de modo que o SHA publicado
  // costuma estar À FRENTE do último commit de aplicação — e isso é estar em
  // dia, não defasado. O que interessa é se o publicado CONTÉM o que foi
  // entregue, isto é, se o último commit de aplicação é ancestral dele.
  const conhecido = producao.commit !== "local" && existeAqui(producao.commit);
  const emDia = conhecido && contem(ultimoDeAplicacao, producao.commit);

  // Quantos commits de aplicação faltam publicar.
  const atras =
    conhecido && !emDia
      ? Number(
          git(
            "rev-list",
            "--count",
            `${producao.commit}..${ultimoDeAplicacao}`,
            "--",
            ".",
            ...exclusoes(),
          ),
        )
      : null;

  // Sem upstream configurado a pergunta não se aplica; não é erro.
  const naoPushados = gitDizSim("rev-parse", "@{u}")
    ? Number(git("rev-list", "--count", "@{u}..HEAD") || "0")
    : 0;

  if (json) {
    console.log(
      JSON.stringify(
        {
          em_dia: emDia,
          origem,
          producao: {
            commit: producao.commit,
            versao: producao.versao,
            atualizado_em: producao.atualizadoEm,
            ms: producao.ms,
          },
          local: { head, ultimo_de_aplicacao: ultimoDeAplicacao },
          commits_de_aplicacao_atras: atras,
          sha_publicado_conhecido: conhecido,
          commits_nao_pushados: naoPushados,
        },
        null,
        2,
      ),
    );
    return emDia ? 0 : 1;
  }

  console.log("");
  console.log(
    `  produção  ${curto(producao.commit)} · v${producao.versao} · ${producao.ms} ms`,
  );
  console.log(
    `  local     ${curto(ultimoDeAplicacao)} (último commit de aplicação)`,
  );
  console.log("");

  if (emDia) {
    console.log("  ✓ EM DIA");
    if (producao.commit !== ultimoDeAplicacao) {
      console.log(
        "    O publicado está à frente, por commits que não tocam aplicação.",
      );
    }
  } else if (!conhecido) {
    console.log(
      `  ? INDETERMINADO — este repositório não conhece o commit ${curto(producao.commit)}.`,
    );
    console.log("    Produção pode estar à frente, ou falta um `git fetch`.");
  } else {
    const plural = atras === 1 ? "commit" : "commits";
    console.log(`  ✗ DEFASADA em ${atras} ${plural} de aplicação.`);
    console.log(`    Publicado: ${curto(producao.commit)}`);
  }

  // A nota só esclarece quando o HEAD local está à frente do que foi publicado.
  // Se o publicado JÁ é o HEAD, o veredito acima basta e ela viraria ruído.
  if (head !== ultimoDeAplicacao && head !== producao.commit) {
    const ignorados = Number(
      git("rev-list", "--count", `${ultimoDeAplicacao}..HEAD`),
    );
    const frase =
      ignorados === 1
        ? "o commit acima do último de aplicação só toca"
        : `os ${ignorados} commits acima do último de aplicação só tocam`;
    console.log("");
    console.log(`  nota: o HEAD local é ${curto(head)}, mas ${frase}`);
    console.log("        governança e não muda o que é servido.");
  }

  if (naoPushados > 0) {
    console.log("");
    console.log(
      `  atenção: ${naoPushados} commit(s) local(is) ainda não foram publicados.`,
    );
  }

  console.log("");
  return emDia ? 0 : 1;
}

principal()
  .then((codigo) => process.exit(codigo))
  .catch((erro: Error) => {
    console.error(`\n  erro: ${erro.message}\n`);
    process.exit(2);
  });
