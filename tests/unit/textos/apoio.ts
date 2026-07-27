// Leitura do inventário e da linha de base pelos verificadores da feature 018.
//
// Módulo de apoio, sem testes próprios: reúne o que quatro arquivos de teste fariam igual,
// para que a forma do JSON esteja escrita num lugar só.

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { NOME_PUBLICADO as NOME_CARDIOPATIA } from "models/cardiopatia-isquemica/fonte-clinica";
import { NOME_PUBLICADO as NOME_GESTACAO } from "models/gestacao/fonte-clinica";
import { NOME_PUBLICADO as NOME_INSULINA } from "models/insulina/fonte-clinica";
import { NOME_PUBLICADO as NOME_PUERICULTURA } from "models/puericultura/fonte-clinica";
import { NOME_PUBLICADO as NOME_RISCO } from "models/risco-cardiovascular/fonte-clinica";

const RAIZ = join(import.meta.dirname, "..", "..", "..");

/**
 * Os cinco nomes publicados, lidos do domínio e não escritos aqui. A diferença é a mesma
 * que o catálogo faz pela descrição da home: uma lista à mão neste arquivo aceitaria como
 * exceção um travessão que nenhuma fonte usa, e continuaria verde depois de a fonte mudar
 * de nome. Fonte nova entra na exceção por publicar `NOME_PUBLICADO`, não por ser lembrada.
 */
export const NOMES_PUBLICADOS: readonly string[] = Object.freeze([
  NOME_INSULINA,
  NOME_GESTACAO,
  NOME_CARDIOPATIA,
  NOME_RISCO,
  NOME_PUERICULTURA,
]);

/**
 * Apaga do literal os nomes de fonte, para que o que sobra seja só o que o produto redigiu.
 * É como a exceção de MD-0020 se torna verificável: o travessão que restar depois disto não
 * transcreve nome nenhum, e portanto está fazendo ofício que pertence a outro sinal.
 */
export function semNomesDeFonte(texto: string): string {
  return NOMES_PUBLICADOS.reduce(
    (restante, nome) => restante.split(nome).join("«nome da fonte»"),
    texto,
  );
}

export type EntradaDoInventario = {
  readonly arquivo: string;
  readonly linha: number;
  readonly classe: "autoral" | "citacao" | "identificador";
  readonly texto: string;
  readonly especie:
    "StringLiteral" | "Template" | "JsxText" | "JsonField" | "Markdown";
  readonly origem?: string;
  readonly excecao?: string;
};

/**
 * O literal é um BLOCO inteiro, ou um FRAGMENTO que a interpolação do JSX interrompe?
 * A distinção decide se as regras de início e fim de linha se aplicam: em
 * `TeleCondutas — Cardiopatia Isquêmica ·` o ponto médio não termina linha nenhuma —
 * termina o pedaço, e o valor interpolado que vem a seguir completa a frase.
 */
export function ehFragmento(entrada: EntradaDoInventario): boolean {
  return entrada.especie === "JsxText";
}

export type EntradaAutoral = EntradaDoInventario & {
  readonly classe: "autoral";
};

export type EntradaDaLinhaDeBase = {
  readonly arquivo: string;
  readonly texto: string;
  readonly origem?: string;
};

function lerJson<T>(caminhoRelativo: string, oQueE: string): T {
  try {
    return JSON.parse(readFileSync(join(RAIZ, caminhoRelativo), "utf8")) as T;
  } catch (erro) {
    throw new Error(
      `não foi possível ler ${caminhoRelativo} (${oQueE}): ` +
        `${erro instanceof Error ? erro.message : String(erro)}\n` +
        `Gere-o com \`node scripts/inventariar-textos.mts --gerar\`.`,
    );
  }
}

export function inventario(): readonly EntradaDoInventario[] {
  return lerJson<{ literais: EntradaDoInventario[] }>(
    "tests/apoio/inventario-textual.json",
    "inventário da superfície textual",
  ).literais;
}

export function autoraisDoInventario(): readonly EntradaAutoral[] {
  return inventario().filter(
    (e): e is EntradaAutoral => e.classe === "autoral",
  );
}

export function citacoesDoInventario(): readonly EntradaDoInventario[] {
  return inventario().filter((e) => e.classe === "citacao");
}

export function linhaDeBaseDaCitacao(): readonly EntradaDaLinhaDeBase[] {
  return lerJson<{ citacoes: EntradaDaLinhaDeBase[] }>(
    "tests/apoio/citacao-linha-de-base.json",
    "linha de base da classe citação, emitida uma vez e jamais regerada",
  ).citacoes;
}

/**
 * Prepara um literal para as regras mecânicas, tirando o que é SINTAXE e não pontuação.
 *
 * O `README.md` é markdown, e nele `-` inicia item de lista, `|---|` separa cabeçalho de
 * tabela e a crase delimita código, onde `-` e `--` são nome de coisa e não sinal. Aplicar
 * a norma sobre a sintaxe produziria dezenas de falhas que não são erros de redação, e o
 * efeito conhecido disso é o verificador que se aprende a ignorar.
 *
 * Nos arquivos de código não se retira nada: ali todo caractere do literal chega à tela.
 */
export function paraNorma(entrada: EntradaDoInventario): string {
  if (entrada.arquivo !== "README.md") return entrada.texto;

  return entrada.texto
    .replace(/`[^`]*`/g, "␣") // trecho de código: vira marca opaca
    .replace(/^\s*\|?[\s|:-]*\|[\s|:-]*$/, "") // linha separadora de tabela
    .replace(/^\s*[-*+]\s+/, "") // marcador de item de lista
    .replace(/^#{1,6}\s+/, ""); // marcador de título
}
