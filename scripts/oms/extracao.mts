// Extração numérica das tabelas da OMS: células de texto viram linhas `L/M/S` tipadas, já
// recortadas ao escopo da fonte (D-04) e já canonizadas na precisão publicada (contrato §4.2).
//
// **A verificação V3 do contrato §5 vive aqui**, e não em `verificacoes.mts`, porque a
// continuidade da faixa só se apura durante a varredura — separá-la obrigaria a percorrer o
// arquivo duas vezes e a manter dois lugares sabendo qual coluna é qual.
//
// Tudo o que sai daqui já é o dado que vai virar código: é sobre ele, e não sobre o bruto,
// que V4 a V7 precisam valer.
//
// Módulo DEV-TIME: nunca importado por código de aplicação (fronteira do roadmap §5).
// RF-02, D-03, D-04 do roadmap da feature 017-puericultura-crescimento.
import { coluna, type Planilha } from "../lib/planilha.mts";
import { DESVIOS_CONFERIDOS, PRECISAO } from "./criterios.mts";
import { FalhaDeVerificacao } from "./falha.mts";
import type { Origem } from "./origens.mts";

export interface LinhaLms {
  readonly indice: number;
  readonly l: number;
  readonly m: number;
  readonly s: number;
  /** Desvios publicados, como lidos — só V6 os usa; não são embarcados. */
  readonly desvios: Readonly<Record<string, number>>;
}

/**
 * Canoniza um valor na precisão publicada. Medição de 26/07 sobre as 14 tabelas: a operação
 * é IDÊNTICA em todas as 12.964 linhas — o `18.505700000000001` da planilha já é o mesmo
 * número de ponto flutuante que `18,5057`. O "ruído" do contrato §4.2 é de grafia, não de
 * valor, e é por isso que a limpeza não pode alterar escore algum.
 */
function canonizar(valor: number, casas: number): number {
  return Number(valor.toFixed(casas));
}

function numero(
  texto: string | undefined,
  arquivo: string,
  onde: string,
): number {
  const valor = Number(texto);
  if (texto === undefined || texto === "" || !Number.isFinite(valor)) {
    throw new FalhaDeVerificacao(
      "V3",
      arquivo,
      `valor não numérico em ${onde}: "${texto ?? "(célula ausente)"}"`,
    );
  }
  return valor;
}

interface Colunas {
  readonly indice: number;
  readonly l: number;
  readonly m: number;
  readonly s: number;
  readonly desvios: readonly (readonly [string, number])[];
}

/** Onde cada coluna que interessa está, resolvida pelo NOME do cabeçalho (contrato §3). */
function localizarColunas(
  planilha: Planilha,
  origem: Origem,
  arquivo: string,
): Colunas {
  return {
    indice: coluna(planilha, origem.colunaIndice, arquivo),
    l: coluna(planilha, "L", arquivo),
    m: coluna(planilha, "M", arquivo),
    s: coluna(planilha, "S", arquivo),
    desvios: Object.keys(DESVIOS_CONFERIDOS).map(
      (nome) => [nome, coluna(planilha, nome, arquivo)] as const,
    ),
  };
}

function extrairLinha(
  celulas: readonly string[],
  indice: number,
  colunas: Colunas,
  origem: Origem,
  arquivo: string,
): LinhaLms {
  const onde = `${origem.colunaIndice}=${indice}`;
  const ler = (posicao: number, nome: string) =>
    numero(celulas[posicao], arquivo, `${nome} em ${onde}`);
  return {
    indice,
    l: canonizar(ler(colunas.l, "L"), PRECISAO.l),
    m: canonizar(ler(colunas.m, "M"), PRECISAO.m),
    s: canonizar(ler(colunas.s, "S"), PRECISAO.s),
    desvios: Object.fromEntries(
      colunas.desvios.map(([nome, posicao]) => [nome, ler(posicao, nome)]),
    ),
  };
}

/**
 * V3 — a faixa do índice é contínua, sem buraco nem repetição, e cobre o recorte pedido.
 * Devolve as linhas do recorte na ordem do índice, prontas para as verificações seguintes.
 */
export function extrairRecorte(
  planilha: Planilha,
  origem: Origem,
  arquivo: string,
): { linhas: readonly LinhaLms[]; relatorio: string } {
  const colunas = localizarColunas(planilha, origem, arquivo);
  const lidas: LinhaLms[] = [];
  let anterior: number | null = null;

  for (const linha of planilha.linhas) {
    const indice = numero(
      linha[colunas.indice],
      arquivo,
      `coluna ${origem.colunaIndice}`,
    );
    if (anterior !== null && indice !== anterior + 1) {
      throw new FalhaDeVerificacao(
        "V3",
        arquivo,
        `faixa descontínua: ${origem.colunaIndice} ${anterior} seguido de ${indice} — ` +
          `download truncado`,
      );
    }
    anterior = indice;
    if (indice < origem.recorte.de || indice > origem.recorte.ate) continue;
    lidas.push(extrairLinha(linha, indice, colunas, origem, arquivo));
  }

  const esperadas = origem.recorte.ate - origem.recorte.de + 1;
  if (lidas.length !== esperadas) {
    throw new FalhaDeVerificacao(
      "V3",
      arquivo,
      `o recorte ${origem.recorte.de}–${origem.recorte.ate} pede ${esperadas} linhas e o ` +
        `arquivo entrega ${lidas.length} — a fonte não cobre o recorte`,
    );
  }
  return {
    linhas: lidas,
    relatorio:
      `V3 faixa contínua; recorte ${origem.colunaIndice} ${origem.recorte.de}–` +
      `${origem.recorte.ate} completo em ${lidas.length} linhas`,
  };
}
