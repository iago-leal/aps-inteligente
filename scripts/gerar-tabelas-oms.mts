// Gerador das tabelas de referência da OMS: `.xlsx` em disco → módulos TypeScript
// versionados. Realiza D-03 do roadmap da feature 017-puericultura-crescimento e cumpre o
// contrato de aquisição
// `_reversa_forward/017-puericultura-crescimento/interfaces/tabelas-de-referencia.md`.
//
// **Esta ferramenta não toca a rede** (contrato §5.1, achado A007 da auditoria cruzada). Ela
// lê do disco o que `scripts/baixar-tabelas-oms.mts` trouxe, confere o `sha256` de cada
// arquivo contra o manifesto versionado e só então converte. A separação existe para que a
// conversão — a parte que decide números clínicos — seja determinística, repetível offline e
// auditável sem depender de o `cdn.who.int` continuar servindo o mesmo caminho.
//
// Três promessas, nesta ordem de importância:
//
//  1. **Nenhuma escrita parcial** (contrato §5): as 14 tabelas são lidas, verificadas e
//     emitidas EM MEMÓRIA; o primeiro byte só chega ao disco quando a última passou. Uma
//     falha na décima quarta não deixa treze módulos novos ao lado de um antigo.
//  2. **Falha ruidosa e localizada** (contrato §7): a mensagem diz qual arquivo e em que
//     verificação parou. Avisar e seguir seria o pior modo de falha possível aqui.
//  3. **Idempotência byte a byte** (contrato §6): rodar duas vezes sobre as mesmas origens
//     produz arquivos idênticos, e o `git diff` vazio é a prova de que a origem não mudou.
//
// Uso:  node scripts/gerar-tabelas-oms.mts
//       (o Node do `engines` executa TypeScript nativamente — D-14; sem `npx tsx`.)
//
// RF-02, D-03, D-04, D-14 do roadmap da feature 017-puericultura-crescimento.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { lerPlanilha } from "./lib/planilha.mts";
import { emitirModulo } from "./oms/emitir-modulo.mts";
import { FalhaDeVerificacao } from "./oms/falha.mts";
import {
  CAMINHO_MANIFESTO,
  ORIGENS,
  PASTA_ORIGENS,
  type EntradaManifesto,
  type Manifesto,
  type Origem,
} from "./oms/origens.mts";
import { verificar, type TabelaVerificada } from "./oms/verificacoes.mts";

/** Onde os módulos gerados vivem, ao lado do manifesto que os justifica. */
const PASTA_DESTINO = "models/puericultura/oms/tabelas";

interface ModuloPronto {
  readonly origem: Origem;
  readonly arquivo: string;
  readonly conteudo: string;
  readonly tabela: TabelaVerificada;
}

async function lerManifesto(): Promise<Manifesto> {
  if (!existsSync(CAMINHO_MANIFESTO)) {
    throw new FalhaDeVerificacao(
      "manifesto",
      CAMINHO_MANIFESTO,
      "manifesto ausente — rode `node scripts/baixar-tabelas-oms.mts` primeiro",
    );
  }
  return JSON.parse(await readFile(CAMINHO_MANIFESTO, "utf8")) as Manifesto;
}

/**
 * O `sha256` do arquivo em disco tem de bater com o do manifesto. É aqui que uma revisão
 * futura da OMS aparece como divergência de hash, e não como surpresa num escore.
 */
function conferirProcedencia(
  origem: Origem,
  bytes: Uint8Array,
  manifesto: Manifesto,
): EntradaManifesto {
  const entrada = manifesto.origens.find((item) => item.id === origem.id);
  if (!entrada) {
    throw new FalhaDeVerificacao(
      "manifesto",
      origem.arquivo,
      `sem entrada no manifesto — rode o baixador para registrar a procedência`,
    );
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== entrada.sha256) {
    throw new FalhaDeVerificacao(
      "manifesto",
      origem.arquivo,
      `sha256 divergente: manifesto diz ${entrada.sha256}, arquivo em disco é ${sha256}. ` +
        `A origem foi revista ou o arquivo foi alterado — confira o \`git diff\` do ` +
        `manifesto antes de aceitar`,
    );
  }
  return entrada;
}

/** Leitura → procedência → verificação → emissão, para uma origem. Nada em disco ainda. */
async function preparar(
  origem: Origem,
  manifesto: Manifesto,
): Promise<ModuloPronto> {
  const caminho = join(PASTA_ORIGENS, origem.arquivo);
  if (!existsSync(caminho)) {
    throw new FalhaDeVerificacao(
      "aquisição",
      caminho,
      `arquivo ausente — rode \`node scripts/baixar-tabelas-oms.mts\``,
    );
  }
  const bytes = await readFile(caminho);
  const entrada = conferirProcedencia(origem, bytes, manifesto);
  const tabela = verificar(lerPlanilha(caminho), origem, caminho);
  const { arquivo, conteudo } = await emitirModulo(tabela, entrada);
  return { origem, arquivo, conteudo, tabela };
}

function relatar(pronto: ModuloPronto): void {
  console.log(`✓ ${pronto.origem.id} → ${pronto.arquivo}`);
  for (const linha of pronto.tabela.relatorio) console.log(`    ${linha}`);
}

/** Duas origens não podem reivindicar o mesmo módulo: o dado de uma sobrescreveria o da outra. */
function conferirUnicidade(prontos: readonly ModuloPronto[]): void {
  const vistos = new Map<string, string>();
  for (const pronto of prontos) {
    const anterior = vistos.get(pronto.arquivo);
    if (anterior) {
      throw new FalhaDeVerificacao(
        "emissão",
        pronto.arquivo,
        `duas origens emitem o mesmo módulo: ${anterior} e ${pronto.origem.id}`,
      );
    }
    vistos.set(pronto.arquivo, pronto.origem.id);
  }
}

async function principal(): Promise<void> {
  const manifesto = await lerManifesto();
  console.log(
    `Gerando de ${PASTA_ORIGENS} (${ORIGENS.length} origens) para ${PASTA_DESTINO}\n`,
  );

  // Fase 1: tudo em memória. Uma falha aqui não deixa rastro no disco.
  const prontos: ModuloPronto[] = [];
  for (const origem of ORIGENS) {
    const pronto = await preparar(origem, manifesto);
    prontos.push(pronto);
    relatar(pronto);
  }
  conferirUnicidade(prontos);

  // Fase 2: escrita, só agora que as 14 se provaram.
  let inalterados = 0;
  for (const pronto of prontos) {
    const destino = join(PASTA_DESTINO, pronto.arquivo);
    const anterior = existsSync(destino)
      ? await readFile(destino, "utf8")
      : null;
    if (anterior === pronto.conteudo) {
      inalterados++;
      continue;
    }
    await writeFile(destino, pronto.conteudo);
  }

  const linhas = prontos.reduce((soma, item) => soma + item.tabela.m.length, 0);
  const bytes = prontos.reduce((soma, item) => soma + item.conteudo.length, 0);
  console.log(
    `\n✓ ${prontos.length} módulos em ${PASTA_DESTINO} ` +
      `(${inalterados} já idênticos, ${prontos.length - inalterados} escritos)`,
  );
  console.log(
    `✓ ${linhas.toLocaleString("pt-BR")} linhas L/M/S · ` +
      `${(bytes / 1024).toFixed(0)} kB de texto-fonte`,
  );
  console.log(
    `\nConfira o \`git diff\`: vazio significa que nada mudou na origem (contrato §6).`,
  );
}

try {
  await principal();
} catch (erro) {
  if (erro instanceof FalhaDeVerificacao) {
    console.error(
      `\n✗ GERAÇÃO ABORTADA — nada foi escrito.\n  ${erro.message}`,
    );
    process.exit(1);
  }
  throw erro;
}
