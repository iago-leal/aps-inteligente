// Leitor de `.xlsx` com os built-ins do Node — sem dependência (D-14, ficha MD-0004).
// Um `.xlsx` é um contêiner ZIP com partes XML: `xl/workbook.xml` nomeia as abas,
// `xl/sharedStrings.xml` guarda os textos e `xl/worksheets/sheet1.xml` traz as células.
// Aqui basta o suficiente para planilhas tabulares simples, que é o caso das tabelas da
// OMS: uma aba, cabeçalho na linha 1, números daí para baixo.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação (fronteira do roadmap §5).
// Falha ruidosamente — toda anomalia vira exceção com o arquivo e o motivo, jamais um
// valor plausível.
//
// D-14 do roadmap da feature 017-puericultura-crescimento.
import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

/** Assinaturas do formato ZIP (little-endian). */
const FIM_DO_DIRETORIO = 0x06054b50;
const ENTRADA_DO_DIRETORIO = 0x02014b50;
const CABECALHO_LOCAL = 0x04034b50;
/** O comentário final de um ZIP cabe em 64 KiB; a varredura do fim não precisa ir além. */
const MAXIMO_COMENTARIO = 66_000;

export class PlanilhaIlegivel extends Error {
  readonly arquivo: string;

  constructor(arquivo: string, motivo: string) {
    super(`planilha ilegível em ${arquivo}: ${motivo}`);
    this.name = "PlanilhaIlegivel";
    this.arquivo = arquivo;
  }
}

/** Abre o contêiner ZIP e devolve as partes descomprimidas por nome. */
function abrirContainer(buffer: Buffer, arquivo: string): Map<string, Buffer> {
  let fim = -1;
  const piso = Math.max(0, buffer.length - MAXIMO_COMENTARIO);
  for (let i = buffer.length - 22; i >= piso; i--) {
    if (buffer.readUInt32LE(i) === FIM_DO_DIRETORIO) {
      fim = i;
      break;
    }
  }
  if (fim < 0) {
    throw new PlanilhaIlegivel(
      arquivo,
      "não é um contêiner ZIP (sem diretório central)",
    );
  }

  const total = buffer.readUInt16LE(fim + 10);
  let cursor = buffer.readUInt32LE(fim + 16);
  const partes = new Map<string, Buffer>();

  for (let n = 0; n < total; n++) {
    if (buffer.readUInt32LE(cursor) !== ENTRADA_DO_DIRETORIO) {
      throw new PlanilhaIlegivel(
        arquivo,
        `entrada ${n} do diretório central corrompida`,
      );
    }
    const metodo = buffer.readUInt16LE(cursor + 10);
    const bytesComprimidos = buffer.readUInt32LE(cursor + 20);
    const tamanhoNome = buffer.readUInt16LE(cursor + 28);
    const tamanhoExtra = buffer.readUInt16LE(cursor + 30);
    const tamanhoComentario = buffer.readUInt16LE(cursor + 32);
    const deslocamento = buffer.readUInt32LE(cursor + 42);
    const nome = buffer.toString(
      "utf8",
      cursor + 46,
      cursor + 46 + tamanhoNome,
    );
    cursor += 46 + tamanhoNome + tamanhoExtra + tamanhoComentario;

    if (buffer.readUInt32LE(deslocamento) !== CABECALHO_LOCAL) {
      throw new PlanilhaIlegivel(
        arquivo,
        `cabeçalho local inválido em "${nome}"`,
      );
    }
    const nomeLocal = buffer.readUInt16LE(deslocamento + 26);
    const extraLocal = buffer.readUInt16LE(deslocamento + 28);
    const inicio = deslocamento + 30 + nomeLocal + extraLocal;
    const bruto = buffer.subarray(inicio, inicio + bytesComprimidos);

    if (metodo === 0) {
      partes.set(nome, Buffer.from(bruto));
    } else if (metodo === 8) {
      try {
        partes.set(nome, inflateRawSync(bruto));
      } catch (erro) {
        throw new PlanilhaIlegivel(
          arquivo,
          `falha ao descomprimir "${nome}": ${String(erro)}`,
        );
      }
    } else {
      throw new PlanilhaIlegivel(
        arquivo,
        `método de compressão ${metodo} não suportado em "${nome}"`,
      );
    }
  }
  return partes;
}

/** Converte a referência de coluna do XLSX (`A`, `B`, …, `AA`) em índice base zero. */
function indiceDaColuna(referencia: string): number {
  let valor = 0;
  for (const letra of referencia) {
    valor = valor * 26 + (letra.charCodeAt(0) - 64);
  }
  return valor - 1;
}

function decodificarXml(texto: string): string {
  return texto
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");
}

function textosCompartilhados(partes: Map<string, Buffer>): string[] {
  const parte = partes.get("xl/sharedStrings.xml");
  if (!parte) return [];
  const xml = parte.toString("utf8");
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((item) =>
    decodificarXml(
      [...item[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
        .map((t) => t[1])
        .join(""),
    ),
  );
}

export interface Planilha {
  /** Nome da aba, usado na verificação de conteúdo V1 do contrato. */
  readonly aba: string;
  /** Cabeçalho da linha 1, já resolvido contra `sharedStrings`. */
  readonly cabecalho: readonly string[];
  /** Linhas de dados, na ordem do arquivo, com as células como texto cru. */
  readonly linhas: readonly (readonly string[])[];
}

/**
 * Lê a primeira aba de um `.xlsx` tabular. As células saem como texto: a conversão para
 * número é do chamador, que conhece a semântica da coluna — e é lá que o ruído de ponto
 * flutuante da origem (`18.505700000000001`) é tratado, nunca aqui.
 */
export function lerPlanilha(arquivo: string): Planilha {
  const partes = abrirContainer(readFileSync(arquivo), arquivo);

  const workbook = partes.get("xl/workbook.xml");
  if (!workbook) throw new PlanilhaIlegivel(arquivo, "sem xl/workbook.xml");
  const aba = /<sheet[^>]*\bname="([^"]+)"/.exec(
    workbook.toString("utf8"),
  )?.[1];
  if (!aba)
    throw new PlanilhaIlegivel(arquivo, "nenhuma aba declarada no workbook");

  const folha = partes.get("xl/worksheets/sheet1.xml");
  if (!folha)
    throw new PlanilhaIlegivel(arquivo, "sem xl/worksheets/sheet1.xml");

  const compartilhados = textosCompartilhados(partes);
  const bruto: string[][] = [];

  for (const linha of folha
    .toString("utf8")
    .matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const celulas: string[] = [];
    for (const celula of linha[1].matchAll(
      /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,
    )) {
      const atributos = celula[1] ?? "";
      const corpo = celula[2] ?? "";
      const referencia = /\br="([A-Z]+)\d+"/.exec(atributos)?.[1];
      const coluna = referencia ? indiceDaColuna(referencia) : celulas.length;
      const tipo = /\bt="([^"]+)"/.exec(atributos)?.[1];

      let valor =
        /<v>([\s\S]*?)<\/v>/.exec(corpo)?.[1] ??
        [...corpo.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
          .map((t) => t[1])
          .join("");
      if (tipo === "s") {
        const indice = Number(valor);
        valor = compartilhados[indice] ?? "";
      } else {
        valor = decodificarXml(valor);
      }

      while (celulas.length < coluna) celulas.push("");
      celulas[coluna] = valor;
    }
    bruto.push(celulas);
  }

  if (bruto.length < 2) {
    throw new PlanilhaIlegivel(
      arquivo,
      `só ${bruto.length} linha(s) — planilha vazia ou truncada`,
    );
  }

  return {
    aba,
    cabecalho: bruto[0].map((c) => c.trim()),
    linhas: bruto.slice(1),
  };
}

/**
 * Índice de uma coluna PELO NOME do cabeçalho — nunca pela posição, que varia entre os
 * arquivos da OMS (contrato §3). Falha ruidosamente quando a coluna não existe.
 */
export function coluna(
  planilha: Planilha,
  nome: string,
  arquivo: string,
): number {
  const indice = planilha.cabecalho.indexOf(nome);
  if (indice < 0) {
    throw new PlanilhaIlegivel(
      arquivo,
      `coluna "${nome}" ausente; cabeçalho lido: ${planilha.cabecalho.join(" | ")}`,
    );
  }
  return indice;
}
