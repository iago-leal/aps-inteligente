// Aquisição das tabelas de referência da OMS — a ÚNICA ferramenta desta feature que toca
// a rede (contrato de aquisição §5.1, achado A007 da auditoria cruzada). Baixa os 14 `.xlsx`
// para `referencias/oms/`, pasta ignorada pelo git (MD-0008), e grava o manifesto de
// procedência versionado que o gerador confere antes de converter qualquer número.
//
// A separação entre baixar e gerar existe para que a conversão — a parte que decide números
// clínicos — seja determinística, repetível offline e auditável sem depender de o
// `cdn.who.int` continuar servindo o mesmo caminho.
//
// Política de erro (contrato §7): sem retentativa automática, tempo-limite generoso e
// mensagem que diga QUAL URL falhou. Nada de download parcial: o arquivo só é escrito
// depois de chegar inteiro.
//
// Uso:  node scripts/baixar-tabelas-oms.mts [--forcar]
//       (o Node 26 do `engines` executa TypeScript nativamente — D-14; sem `npx tsx`.
//        A extensão é `.mts` porque o `package.json` do Next não declara `type: module`:
//        assim o módulo é ESM sem ambiguidade e sem aviso de reparse.)
//
// RF-02, D-03, D-14 do roadmap da feature 017-puericultura-crescimento.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  CAMINHO_MANIFESTO,
  ORIGENS,
  PASTA_ORIGENS,
  type EntradaManifesto,
  type Manifesto,
  type Origem,
} from "./oms/origens.mts";

const TEMPO_LIMITE_MS = 120_000;

// Nota de sintaxe (D-14): o Node executa TypeScript em *strip-only mode* — ele apaga os
// tipos, não os compila. Ficam fora do vocabulário deste script as construções que exigem
// emissão de código: parameter properties (`constructor(readonly x: T)`), `enum`,
// `namespace` e decorators. Daí a atribuição explícita abaixo.
class FalhaDeAquisicao extends Error {
  readonly origem: Origem;

  constructor(origem: Origem, motivo: string) {
    super(`[${origem.id}] ${motivo}\n  URL: ${origem.url}`);
    this.name = "FalhaDeAquisicao";
    this.origem = origem;
  }
}

function sha256(dados: Uint8Array): string {
  return createHash("sha256").update(dados).digest("hex");
}

async function baixar(origem: Origem): Promise<Uint8Array> {
  const relogio = AbortSignal.timeout(TEMPO_LIMITE_MS);
  let resposta: Response;
  try {
    resposta = await fetch(origem.url, { signal: relogio, redirect: "follow" });
  } catch (erro) {
    throw new FalhaDeAquisicao(
      origem,
      `rede indisponível ou tempo-limite: ${String(erro)}`,
    );
  }
  if (!resposta.ok) {
    throw new FalhaDeAquisicao(
      origem,
      `HTTP ${resposta.status} ${resposta.statusText}`,
    );
  }
  const corpo = new Uint8Array(await resposta.arrayBuffer());
  if (corpo.length === 0) {
    throw new FalhaDeAquisicao(origem, "corpo vazio");
  }
  // `.xlsx` é contêiner ZIP: os dois primeiros bytes são `PK`. Barreira contra página
  // de erro em HTML servida com status 200, que é o modo de falha silencioso do CDN.
  if (corpo[0] !== 0x50 || corpo[1] !== 0x4b) {
    throw new FalhaDeAquisicao(
      origem,
      `o conteúdo não é um contêiner ZIP (bytes iniciais ${corpo[0]?.toString(16)} ${corpo[1]?.toString(16)}) — provável página de erro`,
    );
  }
  return corpo;
}

async function principal(): Promise<void> {
  const forcar = process.argv.includes("--forcar");
  await mkdir(PASTA_ORIGENS, { recursive: true });
  await mkdir(dirname(CAMINHO_MANIFESTO), { recursive: true });

  const entradas: EntradaManifesto[] = [];
  for (const origem of ORIGENS) {
    const destino = join(PASTA_ORIGENS, origem.arquivo);
    let corpo: Uint8Array;
    let baixadoAgora = false;

    if (existsSync(destino) && !forcar) {
      corpo = await readFile(destino);
      console.log(
        `· ${origem.id}: já em disco (${corpo.length} bytes), mantido`,
      );
    } else {
      corpo = await baixar(origem);
      await writeFile(destino, corpo);
      baixadoAgora = true;
      console.log(`↓ ${origem.id}: ${corpo.length} bytes`);
    }

    entradas.push({
      id: origem.id,
      url: origem.url,
      arquivo: origem.arquivo,
      baixadoEm: baixadoAgora
        ? new Date().toISOString().slice(0, 10)
        : dataAnterior(origem.id),
      bytes: corpo.length,
      sha256: sha256(corpo),
    });
  }

  const manifesto: Manifesto = {
    contrato:
      "_reversa_forward/017-puericultura-crescimento/interfaces/tabelas-de-referencia.md",
    geradoEm: new Date().toISOString().slice(0, 10),
    origens: entradas,
  };
  await writeFile(CAMINHO_MANIFESTO, `${JSON.stringify(manifesto, null, 2)}\n`);
  console.log(`\n✓ ${entradas.length} origens em ${PASTA_ORIGENS}`);
  console.log(`✓ manifesto de procedência em ${CAMINHO_MANIFESTO}`);
}

/** Preserva a data de download de quem já estava em disco, se o manifesto anterior existir. */
function dataAnterior(id: string): string {
  if (!existsSync(CAMINHO_MANIFESTO))
    return new Date().toISOString().slice(0, 10);
  try {
    const anterior = JSON.parse(
      readFileSync(CAMINHO_MANIFESTO, "utf8"),
    ) as Manifesto;
    return (
      anterior.origens.find((o) => o.id === id)?.baixadoEm ??
      new Date().toISOString().slice(0, 10)
    );
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

await principal();
