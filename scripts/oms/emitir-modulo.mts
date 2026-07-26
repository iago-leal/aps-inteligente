// Emissão dos módulos TypeScript de dado de referência — realiza D-03 do roadmap da feature
// 017-puericultura-crescimento, conforme `data-delta.md` §3.1 e o contrato de aquisição
// `_reversa_forward/017-puericultura-crescimento/interfaces/tabelas-de-referencia.md` §4.
//
// Recebe uma tabela JÁ verificada e produz **texto**: nenhuma aritmética acontece aqui, e
// nenhuma escrita — quem grava é o orquestrador, depois de as 14 passarem (contrato §5).
//
// Duas exigências governam o formato:
//
//  1. **Idempotência byte a byte** (contrato §6): nada no texto emitido pode depender do
//     relógio, do sistema de arquivos ou da ordem de execução. A data que aparece no
//     cabeçalho é a do *download*, lida do manifesto, e não a da geração — do contrário o
//     `git diff` mudaria a cada rodada e deixaria de ser a prova de que a origem não mudou.
//  2. **Round-trip exato**: cada número é serializado na precisão publicada e reconferido
//     por releitura. Se `Number(texto) !== valor`, o gerador para: uma tabela clínica não
//     pode perder um dígito na passagem para o código.
//
// Módulo DEV-TIME: nunca importado por código de aplicação (fronteira do roadmap §5).
import { format } from "prettier";
import { PRECISAO } from "./criterios.mts";
import { FalhaDeVerificacao } from "./falha.mts";
import type { EntradaManifesto, Indicador, Origem } from "./origens.mts";
import type { TabelaVerificada } from "./verificacoes.mts";

/** Nome do módulo por indicador e família, conforme o inventário de `data-delta.md` §3.2. */
const NOMES: Readonly<Record<string, string>> = Object.freeze({
  "peso-2006": "peso-idade-0-5",
  "comprimento-estatura-2006": "comprimento-estatura-idade-0-5",
  "imc-2006": "imc-idade-0-5",
  "perimetro-cefalico-2006": "perimetro-cefalico-idade-0-2",
  "peso-2007": "peso-idade-5-10",
  "comprimento-estatura-2007": "estatura-idade-5-10",
  "imc-2007": "imc-idade-5-10",
});

/** Como a fonte chama cada indicador, para o cabeçalho de procedência. */
const INDICADOR_POR_EXTENSO: Readonly<Record<Indicador, string>> =
  Object.freeze({
    peso: "peso-para-idade",
    "comprimento-estatura": "comprimento/estatura-para-idade",
    imc: "IMC-para-idade",
    "perimetro-cefalico": "perímetro cefálico-para-idade",
  });

const FONTE: Readonly<Record<string, string>> = Object.freeze({
  "2006": "WHO Child Growth Standards 2006, tabela expandida de escore z",
  "2007": "WHO Growth Reference 2007 (5–19 anos), tabela expandida de escore z",
});

/** `peso-idade-0-5-masculino` → `PESO_IDADE_0_5_MASCULINO`. */
function constante(nomeDoModulo: string): string {
  return nomeDoModulo.toUpperCase().replaceAll("-", "_");
}

export function nomeDoModulo(origem: Origem): string {
  const nome = NOMES[`${origem.indicador}-${origem.familia}`];
  if (!nome) {
    throw new FalhaDeVerificacao(
      "emissão",
      origem.arquivo,
      `sem nome de módulo declarado para ${origem.indicador}/${origem.familia}`,
    );
  }
  return `${nome}-${origem.sexo}`;
}

/**
 * Serializa na grafia mínima que relê para o mesmo número — que é o que `String` faz com um
 * `double` — e prova as duas metades da promessa do contrato §4.2 do lado da saída:
 *
 *  - **round-trip:** `Number(texto)` devolve o valor exato, sem perda de dígito;
 *  - **precisão publicada:** o texto não traz mais casas do que a fonte publica, o que
 *    confirma que a canonização da extração pegou todo o ruído de ponto flutuante. Se um
 *    `18.505700000000001` escapasse até aqui, esta guarda o pararia.
 */
function serializar(valor: number, casas: number, onde: string): string {
  const texto = String(valor === 0 ? 0 : valor);
  if (Number(texto) !== valor) {
    throw new FalhaDeVerificacao(
      "emissão",
      onde,
      `round-trip falhou: ${valor} serializado como "${texto}" relê ${Number(texto)}`,
    );
  }
  const decimais = texto.split(".")[1]?.length ?? 0;
  if (decimais > casas) {
    throw new FalhaDeVerificacao(
      "emissão",
      onde,
      `"${texto}" tem ${decimais} casas decimais, acima das ${casas} que a fonte publica — ` +
        `ruído de ponto flutuante escapou da canonização`,
    );
  }
  return texto;
}

function arranjo(
  valores: readonly number[],
  casas: number,
  onde: string,
): string {
  return `Object.freeze([${valores
    .map((valor) => serializar(valor, casas, onde))
    .join(", ")}])`;
}

/**
 * Cabeçalho de procedência exigido pelo contrato §4.4 e pelo Princípio VI: quem abrir este
 * arquivo em 2028 precisa saber de onde veio cada número sem sair do arquivo.
 */
function cabecalho(
  tabela: TabelaVerificada,
  entrada: EntradaManifesto,
  nome: string,
): string {
  const { origem } = tabela;
  const linhas = tabela.m.length;
  const indice = origem.colunaIndice;
  return [
    `// ARQUIVO GERADO por \`scripts/gerar-tabelas-oms.mts\` — não editar à mão.`,
    `// Regerar com: node scripts/gerar-tabelas-oms.mts (o \`git diff\` vazio é a prova de`,
    `// que a origem não mudou; contrato §6).`,
    `//`,
    `// Indicador: ${INDICADOR_POR_EXTENSO[origem.indicador]}, sexo ${origem.sexo}.`,
    `// Fonte: ${FONTE[origem.familia]}.`,
    `// URL: ${entrada.url}`,
    `// Baixado em ${entrada.baixadoEm} · sha256 ${entrada.sha256}`,
    `// Aba de origem: "${tabela.aba}" · coluna de índice: ${indice}`,
    `// Faixa emitida: ${indice} ${tabela.inicio}–${tabela.fim} (${linhas} linhas),`,
    `// recortada ao escopo da Caderneta da Criança (D-04). A leitura é por`,
    `// ${tabela.unidade === "dia" ? "dia" : "mês"} inteiro, sem interpolação (D-06).`,
    `// Verificações V1 a V7 do contrato de aquisição aprovadas na geração.`,
    `//`,
    `// Precisão como publicada: L e M com ${PRECISAO.l} casas, S com ${PRECISAO.s}.`,
    `// RF-02 (escore z pelo LMS) · D-03 (dado embarcado e versionado) · D-04 (recorte)`,
    `// da feature 017-puericultura-crescimento.`,
    `//`,
    `// Busca aritmética: posição = ${tabela.unidade === "dia" ? "dias" : "meses"} − inicio` +
      ` (D-05, D-06).`,
    `// Os arrays \`l\`, \`m\` e \`s\` são paralelos e têm ${linhas} posições cada.`,
    `// Nome da constante: ${constante(nome)}`,
  ].join("\n");
}

/**
 * Devolve o nome do arquivo e o conteúdo completo do módulo, já formatado pelo Prettier do
 * projeto — assim o `format:check` do CI fica verde por construção e a formatação deixa de
 * ser uma segunda fonte de diff.
 */
export async function emitirModulo(
  tabela: TabelaVerificada,
  entrada: EntradaManifesto,
): Promise<{ arquivo: string; conteudo: string }> {
  const nome = nomeDoModulo(tabela.origem);
  const onde = tabela.origem.arquivo;
  const corpo = [
    cabecalho(tabela, entrada, nome),
    ``,
    `export const ${constante(nome)} = Object.freeze({`,
    `  unidade: "${tabela.unidade}",`,
    `  inicio: ${tabela.inicio},`,
    `  fim: ${tabela.fim},`,
    `  l: ${arranjo(tabela.l, PRECISAO.l, onde)},`,
    `  m: ${arranjo(tabela.m, PRECISAO.m, onde)},`,
    `  s: ${arranjo(tabela.s, PRECISAO.s, onde)},`,
    `});`,
    ``,
  ].join("\n");

  return {
    arquivo: `${nome}.ts`,
    conteudo: await format(corpo, { parser: "typescript" }),
  };
}
