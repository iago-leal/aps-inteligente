// Inventário da superfície textual: código do produto → `tests/apoio/inventario-textual.json`,
// versionado. Realiza T006 e T014 do plano da feature 018-revisao-linguagem-textos.
//
// O PROBLEMA QUE ELE RESOLVE. "Revisar todos os textos" não tem critério de pronto sem uma
// lista fechada do que são "todos os textos". Escrita à mão, a lista envelhece na primeira
// feature seguinte e ninguém a reconfere; gerada, ela é reproduzível, e o `git diff` vazio
// vira o sinal de que a superfície textual não mudou. É a mesma disciplina de
// `gerar-tabelas-oms.mts` e de `congelar-casos-oraculo.mts`, já compreendida no projeto.
//
// POR QUE ÁRVORE SINTÁTICA, E NÃO EXPRESSÃO REGULAR (D-03). Regex confunde literal exibido
// com a mesma sequência dentro de um comentário, e este repositório é dense em comentário
// longo: `models/puericultura/fonte-clinica.ts` tem quinze travessões, quase todos em prosa
// de cabeçalho. A árvore distingue `StringLiteral`, template sem substituição e `JsxText`
// de trivia de comentário sem heurística nenhuma. O `typescript` já é devDependency do
// projeto, usado pelo `npm run typecheck`: não há dependência nova.
//
// O QUE ELE NÃO FAZ, E É DELIBERADO (D-04). Ele não infere a classe de literal nenhum.
// Autoral, citação e identificador são decisão declarada em `scripts/textos/classes/`, e
// candidato sem entrada faz o gerador PARAR, nomeando arquivo e linha. Classificar por
// diretório erraria nas duas direções — `models/*/validacao.ts` é autoral, `interface/**`
// pode ser citação — e erraria em silêncio, revisando citação por omissão, que é o pior
// modo de falha possível nesta feature.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
//
// Uso:
//   node scripts/inventariar-textos.mts --listar    # candidatos, sem exigir classe (T007)
//
// Princípio IX de `.reversa/principles.md`; guia em `docs/redacao.md`.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import ts from "typescript";

/** Raiz do repositório: este arquivo mora em `scripts/`. */
const RAIZ = join(import.meta.dirname, "..");

/**
 * As camadas da superfície textual, na fronteira fixada em 27/07 (L-01): entra o que o
 * usuário lê na tela, o que sai para fora do navegador e o `README.md`. Ficam fora os
 * comentários de código, os artefatos de `_reversa_sdd/` e as mensagens de commit.
 */
const CAMADAS = [
  { nome: "models", raiz: "models" },
  { nome: "interface", raiz: "interface" },
  { nome: "pages", raiz: "pages" },
] as const;

/**
 * Subárvores excluídas da travessia, cada uma com a razão declarada. Excluir em silêncio
 * seria o mesmo defeito que D-04 combate na classificação.
 */
const EXCLUSOES: ReadonlyArray<{ caminho: string; razao: string }> = [
  {
    caminho: join("models", "puericultura", "oms", "tabelas"),
    razao:
      "arquivos GERADOS por `scripts/gerar-tabelas-oms.mts`, cujo conteúdo é dado numérico; " +
      "a única prosa deles vive em comentário de cabeçalho, que a árvore já descarta, e seria " +
      "reescrita na próxima execução daquele gerador",
  },
];

/**
 * A RÉGUA DE CANDIDATURA, e por que ela tem duas metades.
 *
 * A primeira versão usava só o corte de três palavras declarado em §2.1 do
 * `requirements.md`. A execução de T007 mostrou que ele não serve sozinho, e o modo como
 * não serve é o que importa: dos 1837 literais que ficavam abaixo do corte, 164 são texto
 * exibido, e entre eles estão **rótulos de classificação transcritos da Caderneta da
 * Criança** — "Eutrofia", "Magreza acentuada", "Obesidade grave", "Sobrepeso". São classe
 * `citacao`, e ficariam fora da linha de base de RF-07: o guarda da citação nasceria cego
 * exatamente onde a feature mais precisa dele.
 *
 * A régua passa a ser a UNIÃO de dois critérios, por decisão do usuário em 27/07 sobre a
 * medição de T007:
 *
 *   · POSIÇÃO — o literal aparece onde texto exibido aparece: filho de JSX, valor de prop
 *     de texto, valor de propriedade de texto em objeto. É o que "literal exibido" quer
 *     dizer, e captura o rótulo curto que o corte de palavras perde;
 *   · PALAVRAS — o literal tem três ou mais palavras. Mantém a régua do plano e apanha a
 *     prosa que chega à tela por caminho não catalogado (array de cadeias, argumento de
 *     função, template montado adiante).
 *
 * A união produz falso positivo previsível e barato: `MEDIDA_NAO_INFORMADA` mora num campo
 * `motivo:` e entra por posição. Ele é candidato, e o mapa de D-04 o declara `identificador`
 * — que é precisamente para isso que existem três classes e não duas.
 */
const MINIMO_DE_PALAVRAS = 3;

/**
 * Propriedades e atributos cujo valor chega ao usuário. Lista declarada, no espírito de
 * D-04: inferir "parece texto" pelo conteúdo devolveria pela porta dos fundos a heurística
 * que a feature inteira recusa. Nome novo que carregue texto exibido entra aqui à mão.
 */
const PROPRIEDADES_DE_TEXTO: ReadonlySet<string> = new Set([
  "titulo",
  "subtitulo",
  "rotulo",
  "descricao",
  "mensagem",
  "motivo",
  "conduta",
  "texto",
  "aviso",
  "legenda",
  "resumo",
  "nota",
  "localizacao",
  "versaoEdicao",
  "fonte",
  "label",
  "placeholder",
  "aria-label",
  "alt",
  "title",
  "content",
  "name",
]);

/** Os três campos textuais do manifesto, lidos por chave e não por travessia (D-02). */
const CAMPOS_DO_MANIFESTO = ["name", "short_name", "description"] as const;

/** Por qual das duas metades da régua o literal entrou. Alimenta o relatório e o mapa. */
export type MotivoDaCandidatura = "posicao" | "palavras" | "ambos";

export type Candidato = {
  readonly arquivo: string;
  readonly linha: number;
  readonly texto: string;
  readonly camada: string;
  readonly especie: "StringLiteral" | "Template" | "JsxText" | "JsonField" | "Markdown";
  /** `true` quando o literal ocupa posição de exibição na árvore. */
  readonly exibido: boolean;
};

export class FalhaDoInventario extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = "FalhaDoInventario";
  }
}

/**
 * Normaliza espaço em branco. É indispensável para o `JsxText`, que chega da árvore com as
 * quebras de linha e o recuo do JSX embutidos: sem isto, o inventário registraria um literal
 * que não corresponde ao que o navegador exibe — o `<title>` de `/cardiologia/risco-cardiovascular`
 * é exatamente esse caso (contrato `interfaces/metadados-html.md`, nota de implementação).
 */
function normalizar(bruto: string): string {
  return bruto.replace(/\s+/g, " ").trim();
}

function contarPalavras(texto: string): number {
  return texto.split(" ").filter((p) => p.length > 0).length;
}

function ehExcluido(caminhoRelativo: string): boolean {
  return EXCLUSOES.some(
    (e) => caminhoRelativo === e.caminho || caminhoRelativo.startsWith(e.caminho + sep),
  );
}

/** Percorre a subárvore devolvendo os arquivos `.ts` e `.tsx`, em ordem estável. */
function arquivosDe(raizRelativa: string): string[] {
  const encontrados: string[] = [];

  function descer(diretorio: string): void {
    const entradas = readdirSync(diretorio).sort();
    for (const entrada of entradas) {
      const absoluto = join(diretorio, entrada);
      const caminhoRelativo = relative(RAIZ, absoluto);
      if (ehExcluido(caminhoRelativo)) continue;

      if (statSync(absoluto).isDirectory()) {
        descer(absoluto);
        continue;
      }
      if (entrada.endsWith(".ts") || entrada.endsWith(".tsx")) {
        encontrados.push(absoluto);
      }
    }
  }

  const raizAbsoluta = join(RAIZ, raizRelativa);
  descer(raizAbsoluta);
  return encontrados;
}

/**
 * Coleta os literais de um arquivo TypeScript pela árvore sintática.
 *
 * Três espécies de nó interessam, e só três: `StringLiteral` (a aspa comum),
 * `NoSubstitutionTemplateLiteral` (a crase sem interpolação — a crase COM interpolação fica
 * de fora de propósito, porque o texto exibido ali é montado em tempo de execução e não
 * existe como literal único) e `JsxText` (o texto solto entre tags).
 */
export function coletarDeArquivoTs(absoluto: string, camada: string): Candidato[] {
  const fonte = readFileSync(absoluto, "utf8");
  const arquivo = relative(RAIZ, absoluto).split(sep).join("/");

  const arvore = ts.createSourceFile(
    absoluto,
    fonte,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    absoluto.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const achados: Candidato[] = [];

  /**
   * O literal ocupa posição de exibição? Três formas, e só três: texto solto entre tags,
   * valor de atributo JSX de texto (na forma literal ou entre chaves) e valor de
   * propriedade de texto num objeto.
   */
  function emPosicaoDeExibicao(no: ts.Node): boolean {
    if (ts.isJsxText(no)) return true;

    const pai = no.parent;
    if (!pai) return false;

    if (ts.isJsxAttribute(pai) && PROPRIEDADES_DE_TEXTO.has(pai.name.getText(arvore))) {
      return true;
    }
    if (
      ts.isJsxExpression(pai) &&
      pai.parent &&
      ts.isJsxAttribute(pai.parent) &&
      PROPRIEDADES_DE_TEXTO.has(pai.parent.name.getText(arvore))
    ) {
      return true;
    }
    if (
      ts.isPropertyAssignment(pai) &&
      PROPRIEDADES_DE_TEXTO.has(pai.name.getText(arvore).replace(/['"]/g, ""))
    ) {
      return true;
    }
    return false;
  }

  function registrar(no: ts.Node, bruto: string, especie: Candidato["especie"]): void {
    const texto = normalizar(bruto);
    if (texto.length === 0) return;
    const { line } = arvore.getLineAndCharacterOfPosition(no.getStart(arvore));
    achados.push({
      arquivo,
      linha: line + 1,
      texto,
      camada,
      especie,
      exibido: emPosicaoDeExibicao(no),
    });
  }

  function visitar(no: ts.Node): void {
    if (ts.isStringLiteral(no)) {
      registrar(no, no.text, "StringLiteral");
    } else if (ts.isNoSubstitutionTemplateLiteral(no)) {
      registrar(no, no.text, "Template");
    } else if (ts.isJsxText(no)) {
      registrar(no, no.text, "JsxText");
    }
    ts.forEachChild(no, visitar);
  }

  visitar(arvore);
  return achados;
}

/** Caminho de leitura próprio do manifesto: JSON, lido por chave (D-02, contrato do PWA). */
export function coletarDoManifesto(): Candidato[] {
  const arquivo = "public/manifest.webmanifest";
  const bruto = readFileSync(join(RAIZ, arquivo), "utf8");

  let manifesto: Record<string, unknown>;
  try {
    manifesto = JSON.parse(bruto) as Record<string, unknown>;
  } catch (erro) {
    throw new FalhaDoInventario(
      `${arquivo} não é JSON válido: ${erro instanceof Error ? erro.message : String(erro)}`,
    );
  }

  const linhas = bruto.split("\n");
  return CAMPOS_DO_MANIFESTO.map((campo) => {
    const valor = manifesto[campo];
    if (typeof valor !== "string") {
      throw new FalhaDoInventario(
        `${arquivo}: o campo obrigatório \`${campo}\` está ausente ou não é texto`,
      );
    }
    const indice = linhas.findIndex((l) => l.includes(`"${campo}"`));
    return {
      arquivo,
      linha: indice >= 0 ? indice + 1 : 0,
      texto: normalizar(valor),
      camada: "manifesto",
      especie: "JsonField" as const,
      // Os três campos do manifesto são exibidos por definição: `name` e `short_name`
      // ficam sob o ícone de quem instalou, `description` aparece na tela de instalação.
      exibido: true,
    };
  });
}

/**
 * Caminho de leitura próprio do `README.md`, incluído no escopo pela resolução de L-01.
 *
 * A unidade aqui é o **bloco de linha**, e não o literal: markdown não tem literais, e as
 * regras mecânicas que o alcançam — travessão contra hífen, teto de sinais expressivos,
 * forma do ponto médio — se aplicam por linha de prosa. Blocos de código cercados por
 * crase tripla ficam de fora, porque ali `-` é sintaxe e não pontuação. Coerente com D-10:
 * o README é revisado e verificado nas regras mecânicas, mas não congelado literal a literal.
 */
export function coletarDoReadme(): Candidato[] {
  const arquivo = "README.md";
  const linhas = readFileSync(join(RAIZ, arquivo), "utf8").split("\n");

  const achados: Candidato[] = [];
  let dentroDeCodigo = false;

  linhas.forEach((linha, indice) => {
    if (linha.trimStart().startsWith("```")) {
      dentroDeCodigo = !dentroDeCodigo;
      return;
    }
    if (dentroDeCodigo) return;

    const texto = normalizar(linha);
    if (texto.length === 0) return;

    achados.push({
      arquivo,
      linha: indice + 1,
      texto,
      camada: "readme",
      especie: "Markdown" as const,
      // Linha de prosa do README é lida por quem chega ao repositório: exibida por definição.
      exibido: true,
    });
  });

  return achados;
}

/** Junta as cinco origens numa lista só, em ordem estável (idempotência: `MD-0008`). */
export function coletarTudo(): Candidato[] {
  const achados: Candidato[] = [];

  for (const camada of CAMADAS) {
    for (const absoluto of arquivosDe(camada.raiz)) {
      achados.push(...coletarDeArquivoTs(absoluto, camada.nome));
    }
  }
  achados.push(...coletarDoManifesto());
  achados.push(...coletarDoReadme());

  return achados;
}

/**
 * A união das duas metades da régua. Devolve por qual delas o literal entrou, ou `null`
 * quando não entrou por nenhuma.
 */
export function motivoDaCandidatura(c: Candidato): MotivoDaCandidatura | null {
  const porPalavras = contarPalavras(c.texto) >= MINIMO_DE_PALAVRAS;
  if (c.exibido && porPalavras) return "ambos";
  if (c.exibido) return "posicao";
  if (porPalavras) return "palavras";
  return null;
}

export function ehCandidato(c: Candidato): boolean {
  return motivoDaCandidatura(c) !== null;
}

/**
 * Modo de listagem (T007): emite os candidatos e as contagens SEM exigir classe, para que
 * o dimensionamento da premissa de risco médio seja conferido antes de haver trabalho de
 * classificação feito.
 */
function listar(): void {
  const tudo = coletarTudo();
  const candidatos = tudo.filter(ehCandidato);
  const descartados = tudo.length - candidatos.length;

  const porCamada = new Map<string, { candidatos: number; descartados: number }>();
  const porMotivo = { posicao: 0, palavras: 0, ambos: 0 };
  for (const c of tudo) {
    const atual = porCamada.get(c.camada) ?? { candidatos: 0, descartados: 0 };
    const motivo = motivoDaCandidatura(c);
    if (motivo) {
      atual.candidatos += 1;
      porMotivo[motivo] += 1;
    } else {
      atual.descartados += 1;
    }
    porCamada.set(c.camada, atual);
  }

  console.log("Superfície textual — modo de listagem (T007, sem classe exigida)\n");
  console.log("camada      candidatos  abaixo do corte");
  for (const [camada, n] of porCamada) {
    console.log(
      `${camada.padEnd(12)}${String(n.candidatos).padStart(10)}${String(n.descartados).padStart(17)}`,
    );
  }
  console.log(
    `${"TOTAL".padEnd(12)}${String(candidatos.length).padStart(10)}${String(descartados).padStart(17)}\n`,
  );

  const porArquivo = new Map<string, number>();
  for (const c of candidatos) {
    porArquivo.set(c.arquivo, (porArquivo.get(c.arquivo) ?? 0) + 1);
  }
  const maiores = [...porArquivo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  console.log("Concentração (15 maiores):");
  for (const [arquivo, n] of maiores) {
    console.log(`  ${String(n).padStart(4)}  ${arquivo}`);
  }

  console.log(
    `\nRégua: união de posição de exibição e corte de ${MINIMO_DE_PALAVRAS} palavras.\n` +
      `  só por posição:  ${porMotivo.posicao}\n` +
      `  só por palavras: ${porMotivo.palavras}\n` +
      `  pelas duas:      ${porMotivo.ambos}\n` +
      `  fora da régua:   ${descartados}`,
  );
  for (const e of EXCLUSOES) {
    console.log(`Excluído da travessia: ${e.caminho} — ${e.razao}`);
  }
}

/**
 * A linha de comando só corre quando este arquivo é o ponto de entrada. Sem a guarda, os
 * verificadores da fase 2, que importam `coletarTudo` para ler a superfície, disparariam o
 * CLI ao importar — e um módulo que age ao ser importado é dívida de teste na primeira
 * curva.
 */
const ehPontoDeEntrada = process.argv[1] === import.meta.filename;

if (ehPontoDeEntrada) {
  const MODO = process.argv[2];
  try {
    if (MODO === "--listar") {
      listar();
    } else {
      console.error(
        "✗ modo não reconhecido. Hoje só existe `--listar` (T007); a emissão do inventário " +
          "e da linha de base entra em T014 e T053.",
      );
      process.exit(1);
    }
  } catch (erro) {
    const motivo = erro instanceof Error ? erro.message : String(erro);
    console.error(`\n✗ INVENTÁRIO ABORTADO — nada foi escrito.\n  ${motivo}`);
    process.exit(1);
  }
}
