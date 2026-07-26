// Verificações do gerador das tabelas da OMS — a mecânica dos critérios declarados em
// `criterios.mts`, conforme o contrato de aquisição
// `_reversa_forward/017-puericultura-crescimento/interfaces/tabelas-de-referencia.md` §5.
//
// Regra de ouro do contrato §1: a verificação é do CONTEÚDO, jamais do nome do arquivo.
// Se a curva errada entrar sob o rótulo certo, a ferramenta produz um número plausível,
// bem formatado, rastreável e FALSO. Por isso cada tabela precisa provar-se antes de virar
// código, e o modo de falha é único: exceção dizendo qual arquivo e qual verificação parou.
//
// Aqui vivem V1, V2 e V4 a V7; **V3 vive em `extracao.mts`**, porque a continuidade da faixa
// só se apura durante a varredura das linhas.
//
// **Nada aqui escreve em disco.** A promessa de "nenhuma escrita parcial" (contrato §5) é
// estrutural: quem escreve é o orquestrador, e só depois de as 14 tabelas passarem.
//
// Módulo DEV-TIME: nunca importado por código de aplicação (fronteira do roadmap §5).
// RF-02, D-03, D-04, D-14 do roadmap da feature 017-puericultura-crescimento.
import type { Planilha } from "../lib/planilha.mts";
import {
  ANCORAS,
  COLUNAS_OBRIGATORIAS,
  COLUNAS_TOLERADAS,
  DEGRAUS,
  DESVIOS_CONFERIDOS,
  GRANDEZA,
  MONOTONICOS,
  TOLERANCIA_V6,
  type Degrau,
} from "./criterios.mts";
import { extrairRecorte, type LinhaLms } from "./extracao.mts";
import { FalhaDeVerificacao } from "./falha.mts";
import type { Origem } from "./origens.mts";

export { FalhaDeVerificacao };

export interface TabelaVerificada {
  readonly origem: Origem;
  /** Nome da aba lido do arquivo, prova de conteúdo de V1. */
  readonly aba: string;
  readonly unidade: "dia" | "mes";
  readonly inicio: number;
  readonly fim: number;
  /** Arrays paralelos, indexados por `índice − inicio` (data-delta §3.1). */
  readonly l: readonly number[];
  readonly m: readonly number[];
  readonly s: readonly number[];
  /** Uma linha por verificação, para o relatório do orquestrador. */
  readonly relatorio: readonly string[];
}

/** V1 — o nome da aba contém o acrônimo do indicador e o sexo esperados. */
function v1Aba(planilha: Planilha, origem: Origem, arquivo: string): string {
  const aba = planilha.aba.toLowerCase();
  if (!origem.abaEsperada.some((acronimo) => aba.includes(acronimo))) {
    throw new FalhaDeVerificacao(
      "V1",
      arquivo,
      `a aba "${planilha.aba}" não contém nenhum dos acrônimos esperados ` +
        `(${origem.abaEsperada.join(", ")}) — arquivo trocado na origem`,
    );
  }
  return `V1 aba "${planilha.aba}" confere o indicador e o sexo`;
}

/** V2 — o cabeçalho traz as colunas do contrato §3, com o índice esperado. */
function v2Cabecalho(
  planilha: Planilha,
  origem: Origem,
  arquivo: string,
): string {
  const conhecidas = new Set([
    origem.colunaIndice,
    ...COLUNAS_OBRIGATORIAS,
    ...COLUNAS_TOLERADAS,
  ]);
  const desconhecidas = planilha.cabecalho.filter(
    (nome) => nome !== "" && !conhecidas.has(nome),
  );
  if (desconhecidas.length > 0) {
    throw new FalhaDeVerificacao(
      "V2",
      arquivo,
      `coluna inesperada no cabeçalho (${desconhecidas.join(", ")}) — o formato mudou; ` +
        `cabeçalho lido: ${planilha.cabecalho.join(" | ")}`,
    );
  }
  const ausentes = [origem.colunaIndice, ...COLUNAS_OBRIGATORIAS].filter(
    (nome) => !planilha.cabecalho.includes(nome),
  );
  if (ausentes.length > 0) {
    throw new FalhaDeVerificacao(
      "V2",
      arquivo,
      `coluna obrigatória ausente (${ausentes.join(", ")}); cabeçalho lido: ` +
        `${planilha.cabecalho.join(" | ")}`,
    );
  }

  const extras = planilha.cabecalho.length - 13;
  return (
    `V2 cabeçalho com ${planilha.cabecalho.length} colunas, índice "${origem.colunaIndice}"` +
    (extras > 0 ? ` (${extras} tolerada(s): StDev, SD5neg)` : "")
  );
}

/** V4 — `M` está na ordem de grandeza do indicador (barreira do arquivo mal nomeado). */
function v4Grandeza(
  linhas: readonly LinhaLms[],
  origem: Origem,
  arquivo: string,
): string {
  const faixa = GRANDEZA[origem.indicador];
  for (const linha of linhas) {
    if (linha.m < faixa.de || linha.m > faixa.ate) {
      throw new FalhaDeVerificacao(
        "V4",
        arquivo,
        `M = ${linha.m} em ${origem.colunaIndice}=${linha.indice} fora da faixa de ` +
          `${origem.indicador} (${faixa.de} a ${faixa.ate}) — indicador trocado`,
      );
    }
  }
  const valores = linhas.map((linha) => linha.m);
  return (
    `V4 M entre ${Math.min(...valores)} e ${Math.max(...valores)}, dentro da faixa de ` +
    `${origem.indicador}`
  );
}

/** Um degrau declarado ocorreu: existe, e a queda cabe no limite? */
function conferirDegrau(
  degrau: Degrau | undefined,
  anterior: LinhaLms,
  atual: LinhaLms,
  origem: Origem,
  arquivo: string,
): void {
  if (!degrau) {
    throw new FalhaDeVerificacao(
      "V5",
      arquivo,
      `M cai de ${anterior.m} para ${atual.m} entre ${origem.colunaIndice} ` +
        `${anterior.indice} e ${atual.indice}, onde nenhum degrau é esperado — ` +
        `colunas embaralhadas ou fronteira mudou na origem`,
    );
  }
  const queda = 1 - atual.m / anterior.m;
  if (queda > degrau.maximoRelativo) {
    throw new FalhaDeVerificacao(
      "V5",
      arquivo,
      `o degrau esperado em ${origem.colunaIndice}=${atual.indice} (${degrau.porque}) ` +
        `mede ${(queda * 100).toFixed(3)}%, acima do limite de ` +
        `${(degrau.maximoRelativo * 100).toFixed(1)}% — magnitude anômala`,
    );
  }
}

/**
 * V5 — `M` cresce com a idade em peso, comprimento/estatura e perímetro cefálico, exceto nos
 * degraus declarados em `criterios.mts`, cuja magnitude é vigiada. Queda em qualquer outro
 * ponto, degrau acima do limite ou degrau declarado que não apareça: todos são falha.
 */
function v5Monotonia(
  linhas: readonly LinhaLms[],
  origem: Origem,
  arquivo: string,
): string {
  if (!MONOTONICOS.includes(origem.indicador)) {
    return `V5 dispensada: ${origem.indicador} não é monotônico por natureza`;
  }
  const declarados = DEGRAUS[`${origem.indicador}-${origem.familia}`] ?? [];
  const vistos = new Set<number>();

  for (let i = 1; i < linhas.length; i++) {
    if (linhas[i].m >= linhas[i - 1].m) continue;
    const degrau = declarados.find((item) => item.indice === linhas[i].indice);
    conferirDegrau(degrau, linhas[i - 1], linhas[i], origem, arquivo);
    vistos.add(linhas[i].indice);
  }

  const noRecorte = declarados.filter(
    (item) =>
      item.indice >= origem.recorte.de && item.indice <= origem.recorte.ate,
  );
  const ausente = noRecorte.find((item) => !vistos.has(item.indice));
  if (ausente) {
    throw new FalhaDeVerificacao(
      "V5",
      arquivo,
      `o degrau declarado em ${origem.colunaIndice}=${ausente.indice} ` +
        `(${ausente.porque}) não aparece na tabela — a fonte foi revista`,
    );
  }
  return (
    `V5 M crescente nas ${linhas.length} linhas` +
    (noRecorte.length > 0
      ? `, com ${noRecorte.length} degrau(s) declarado(s) dentro do limite`
      : "")
  );
}

/** Medida em `z` desvios pela LMS: o caso `L = 0` é o limite log da mesma expressão. */
function medidaEmZ(l: number, m: number, s: number, z: number): number {
  return l === 0 ? m * Math.exp(s * z) : m * Math.pow(1 + l * s * z, 1 / l);
}

/**
 * V6 — reconstrói `SD3neg`…`SD3` a partir de `L`, `M`, `S` já canonizados e confere contra
 * as colunas publicadas. É a verificação mais valiosa do contrato: usa o próprio arquivo
 * como oráculo de si mesmo e captura, de uma vez, erro de coluna, de arredondamento e de
 * leitura. Como roda sobre os valores canonizados, prova de passagem que a limpeza do §4.2
 * não altera escore algum.
 */
function v6Desvios(
  linhas: readonly LinhaLms[],
  origem: Origem,
  arquivo: string,
): string {
  let pior = 0;
  let conferidas = 0;
  for (const linha of linhas) {
    for (const [nome, z] of Object.entries(DESVIOS_CONFERIDOS)) {
      const publicado = linha.desvios[nome];
      const reconstruido = medidaEmZ(linha.l, linha.m, linha.s, z);
      const desvio = Math.abs(reconstruido - publicado);
      conferidas++;
      if (desvio > pior) pior = desvio;
      if (desvio > TOLERANCIA_V6) {
        throw new FalhaDeVerificacao(
          "V6",
          arquivo,
          `em ${origem.colunaIndice}=${linha.indice}, ${nome} publicado ${publicado} e ` +
            `reconstruído ${reconstruido} de L=${linha.l} M=${linha.m} S=${linha.s} ` +
            `(desvio ${desvio.toExponential(3)} acima da tolerância ` +
            `${TOLERANCIA_V6.toExponential(3)}) — LMS não corresponde aos desvios`,
        );
      }
    }
  }
  return `V6 ${conferidas} desvios reconstruídos da LMS; pior ${pior.toExponential(3)}`;
}

/**
 * V7 — os valores-âncora conhecidos batem, quando a origem tem um declarado. Pega o que V6
 * não pega: uma revisão coerente da tabela, com os desvios recalculados junto do `M`, passa
 * incólume pela reconstrução da LMS e para só aqui.
 */
function v7Ancoras(
  linhas: readonly LinhaLms[],
  origem: Origem,
  arquivo: string,
): string {
  const ancora = ANCORAS[origem.id];
  if (!ancora) return "V7 sem âncora declarada para esta origem";
  const linha = linhas.find((item) => item.indice === ancora.indice);
  if (!linha) {
    throw new FalhaDeVerificacao(
      "V7",
      arquivo,
      `a âncora pede ${origem.colunaIndice}=${ancora.indice} e o recorte não a contém`,
    );
  }
  if (linha.m !== ancora.m) {
    throw new FalhaDeVerificacao(
      "V7",
      arquivo,
      `âncora em ${origem.colunaIndice}=${ancora.indice}: esperado M = ${ancora.m}, ` +
        `lido ${linha.m} — revisão silenciosa da tabela na origem`,
    );
  }
  return `V7 âncora ${origem.colunaIndice}=${ancora.indice} com M = ${ancora.m} confirmada`;
}

/**
 * Roda as sete verificações do contrato §5 em ordem e devolve a tabela pronta para emissão.
 * Falha na primeira que não se confirmar, dizendo qual arquivo e qual verificação parou
 * (contrato §7) — nunca avisa e segue, nunca devolve dado meio provado.
 */
export function verificar(
  planilha: Planilha,
  origem: Origem,
  arquivo: string,
): TabelaVerificada {
  const relatorio = [
    v1Aba(planilha, origem, arquivo),
    v2Cabecalho(planilha, origem, arquivo),
  ];

  const { linhas, relatorio: v3 } = extrairRecorte(planilha, origem, arquivo);
  relatorio.push(
    v3,
    v4Grandeza(linhas, origem, arquivo),
    v5Monotonia(linhas, origem, arquivo),
    v6Desvios(linhas, origem, arquivo),
    v7Ancoras(linhas, origem, arquivo),
  );

  return {
    origem,
    aba: planilha.aba,
    unidade: origem.familia === "2006" ? "dia" : "mes",
    inicio: origem.recorte.de,
    fim: origem.recorte.ate,
    l: linhas.map((linha) => linha.l),
    m: linhas.map((linha) => linha.m),
    s: linhas.map((linha) => linha.s),
    relatorio,
  };
}
