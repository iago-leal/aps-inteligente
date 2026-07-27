// Congelador dos casos-oráculo da puericultura: fontes clínicas em `referencias/` →
// `tests/apoio/casos-oraculo-puericultura.json`, versionado. Realiza T008 do plano da
// feature 017-puericultura-crescimento.
//
// O PROBLEMA QUE ELE RESOLVE. A suíte precisa de valores que digam, por fora da nossa
// implementação, qual escore z é o certo. Esses valores existem, e são exatos:
//
//   · a OMS publica, ao lado de `L`, `M` e `S`, a medida em cada desvio-padrão — de modo
//     que a medida em `SD2neg` tem de devolver exatamente −2;
//   · o INTERGROWTH-21st publica a tabela de z-score da curva pós-natal em ±1, ±2 e ±3
//     desvios por semana pós-menstrual.
//
// Nenhum dos dois sobrevive no repositório: as colunas `SDn` são consumidas na verificação
// V6 e ficam de fora dos módulos emitidos (T031), e as curvas de pré-termo entraram como
// equações fechadas, sem tabela (MD-0002). Os dois vivem em `referencias/`, pasta que o
// `.gitignore` exclui. Congelar aqui é o que mantém T010, T012 e T019 executáveis em clone
// limpo, sem R, sem rede e sem as fontes na mão.
//
// Três promessas, na disciplina de `scripts/gerar-tabelas-oms.mts`:
//
//  1. **Nenhuma escrita parcial.** Tudo é lido, conferido e montado em memória; o arquivo só
//     é escrito quando a última tabela passou.
//  2. **Falha ruidosa e localizada.** A mensagem diz qual fonte e qual conferência parou.
//  3. **Idempotência.** Nenhuma data de relógio entra no documento, e rodar duas vezes sobre
//     as mesmas fontes produz o mesmo arquivo — `git diff` vazio significa origem intacta.
//
// Uso:  node scripts/congelar-casos-oraculo.mts
//       (exige `referencias/oms/`, `referencias/intergrowth/` e o poppler para os PDFs.)
//
// RF-02, RF-03, RF-18, D-02, D-10 do roadmap da feature 017-puericultura-crescimento.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";
import {
  CAMINHO_MANIFESTO,
  ORIGENS,
  PASTA_ORIGENS,
  type Manifesto,
} from "./oms/origens.mts";
import {
  congelarTabela,
  DESVIOS_CONGELADOS,
  PRECISAO_DOS_DESVIOS,
  TOLERANCIA_ORACULO,
  type TabelaOraculo,
} from "./oraculo/oms.mts";
import {
  congelarIntergrowth,
  DESVIOS_PUBLICADOS,
  ORIGENS_INTERGROWTH,
  PASTA_INTERGROWTH,
  PRIMEIRA_SEMANA,
  ULTIMA_SEMANA,
  type TabelaIntergrowth,
} from "./oraculo/intergrowth.mts";

const DESTINO = "tests/apoio/casos-oraculo-puericultura.json";

/** Falha do congelamento: aborta a rodada inteira, sem tocar no arquivo em disco. */
class FalhaDoCongelamento extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = "FalhaDoCongelamento";
  }
}

function sha256De(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function lerManifesto(): Promise<Manifesto> {
  if (!existsSync(CAMINHO_MANIFESTO)) {
    throw new FalhaDoCongelamento(
      `manifesto ausente em ${CAMINHO_MANIFESTO} — rode ` +
        `\`node scripts/baixar-tabelas-oms.mts\` primeiro`,
    );
  }
  return JSON.parse(await readFile(CAMINHO_MANIFESTO, "utf8")) as Manifesto;
}

/** O arquivo em disco tem de ser o mesmo que o manifesto registra (contrato §6). */
async function conferirProcedencia(
  id: string,
  caminho: string,
  esperado: string | undefined,
): Promise<string> {
  if (!existsSync(caminho)) {
    throw new FalhaDoCongelamento(`${id}: arquivo ausente em ${caminho}`);
  }
  const sha256 = sha256De(await readFile(caminho));
  if (esperado !== undefined && sha256 !== esperado) {
    throw new FalhaDoCongelamento(
      `${id}: sha256 divergente — o manifesto diz ${esperado} e o arquivo em disco é ` +
        `${sha256}. A fonte foi revista; não congele antes de entender o que mudou`,
    );
  }
  return sha256;
}

async function congelarOms(): Promise<{
  tabelas: TabelaOraculo[];
  casos: number;
  pares: number;
  piorEmZ: number;
}> {
  const manifesto = await lerManifesto();
  const tabelas: TabelaOraculo[] = [];
  let casos = 0;
  let pares = 0;
  let piorEmZ = 0;

  for (const origem of ORIGENS) {
    const caminho = join(PASTA_ORIGENS, origem.arquivo);
    const entrada = manifesto.origens.find((item) => item.id === origem.id);
    await conferirProcedencia(origem.id, caminho, entrada?.sha256);
    const resultado = congelarTabela(origem, caminho);
    tabelas.push(resultado.tabela);
    casos += resultado.tabela.casos.length;
    pares += resultado.conferidos;
    piorEmZ = Math.max(piorEmZ, resultado.piorEmZ);
    console.log(
      `✓ ${origem.id.padEnd(38)} ${String(resultado.tabela.casos.length).padStart(3)} casos ` +
        `de ${String(resultado.tabela.linhasNaOrigem).padStart(4)} linhas · ` +
        `${resultado.conferidos} pares · pior em z ${resultado.piorEmZ.toExponential(2)}`,
    );
  }
  return { tabelas, casos, pares, piorEmZ };
}

async function congelarPreTermo(): Promise<{
  tabelas: TabelaIntergrowth[];
  celulas: number;
}> {
  const tabelas: TabelaIntergrowth[] = [];
  let celulas = 0;

  for (const origem of ORIGENS_INTERGROWTH) {
    const caminho = join(PASTA_INTERGROWTH, origem.arquivo);
    const sha256 = await conferirProcedencia(origem.id, caminho, undefined);
    const resultado = congelarIntergrowth(origem, caminho, sha256);
    tabelas.push(resultado.tabela);
    celulas += resultado.celulas;
    console.log(
      `✓ ${origem.id.padEnd(38)} ${resultado.tabela.semanas.length} semanas · ` +
        `${resultado.celulas} células`,
    );
  }
  return { tabelas, celulas };
}

/** A nota de leitura que acompanha o arquivo — o "por que" que o JSON não conta sozinho. */
function meta(): Record<string, unknown> {
  return {
    esquema: "casos-oraculo-puericultura/1",
    feature: "017-puericultura-crescimento",
    acao: "T008",
    geradoPor: "scripts/congelar-casos-oraculo.mts",
    aviso:
      "ARQUIVO GERADO — não editar à mão. Regerar exige as fontes clínicas em " +
      "`referencias/`, que o .gitignore exclui; `git diff` vazio prova que a origem não mudou.",
    porQueExiste:
      "As colunas SDn da OMS não entram nos módulos emitidos (T031) e as curvas de " +
      "pré-termo entraram como equações fechadas, sem tabela (MD-0002). Os dois oráculos " +
      "só existem nas fontes fora do git; congelados aqui, T010, T012 e T019 rodam em " +
      "clone limpo, sem R e sem rede.",
    consumidores: [
      "tests/unit/dominio-puericultura/lms.test.ts (T010)",
      "tests/unit/dominio-puericultura/intergrowth.test.ts (T012)",
      "tests/unit/dominio-puericultura/casos-oraculo.test.ts (T019)",
    ],
  };
}

/** Arredonda para cima na primeira casa significativa: 8,19e-4 vira 9e-4. */
function arredondarParaCima(valor: number): number {
  const escala = Math.pow(10, Math.floor(Math.log10(valor)));
  return Number((Math.ceil(valor / escala) * escala).toPrecision(1));
}

function metaOms(
  tabelas: readonly TabelaOraculo[],
  piorEmZ: number,
): Record<string, unknown> {
  return {
    fonte:
      "WHO Child Growth Standards 2006 e WHO Reference 2007, tabelas expandidas de escore z",
    oQueECadaCaso:
      "Uma linha da tabela: o índice, o L/M/S publicado e a medida em cada desvio. A " +
      "medida em `sd.z2` tem de devolver exatamente 2 pela fórmula LMS da mesma linha.",
    comoLerAChave:
      "As chaves de `sd` e de `z` são `z-4`…`z4`: o prefixo evita que o JSON reordene as " +
      "colunas, porque chave inteira positiva é tratada como índice de array. Leia com " +
      "`Number(chave.slice(1))`.",
    desviosCongelados: Object.values(DESVIOS_CONGELADOS),
    sobreOsDesviosDeQuatro:
      "De -3 a +3 a coluna SDn é LMS pura. Em ±4 não é: nos indicadores baseados em peso a " +
      "própria OMS publica o valor já com a correção de cauda (D-10). No peso masculino ao " +
      "nascer a LMS prevê 5,6945 kg em z=4 e a fonte publica 5,642, que é exatamente " +
      "SD3 + (SD3 − SD2). O congelamento comprovou isso caso a caso nas 14 tabelas.",
    ondeOOraculoESilencioso:
      "Comprimento/estatura-para-idade e perímetro cefálico-para-idade têm L = 1 em todas " +
      "as tabelas, e com L = 1 a LMS já é linear em z, de passo SD3 − SD2. Ali extrapolar " +
      "devolve o que a LMS devolveria: a diferença medida entre as duas regras é de 1e-14. " +
      "Logo a metade negativa de RN-03 — a cauda NÃO se aplica a esses dois — não se prova " +
      "por este oráculo; exercite-a com tabela sintética de L ≠ 1 (T007). Em compensação, " +
      "o erro nesses dois seria clinicamente inócuo, enquanto omitir a cauda no peso " +
      "desloca o escore em até 10,4 unidades de IMC. A severidade do teste segue essa " +
      "assimetria.",
    precisaoPublicada: {
      lms: "L e M com 4 casas, S com 5",
      desvios: `${PRECISAO_DOS_DESVIOS} casas`,
      medidoEm:
        "canonizar os desvios a 3 casas é identidade nas 109.536 células das 14 planilhas",
    },
    toleranciaNaMedida: Number(TOLERANCIA_ORACULO.toPrecision(1)),
    piorDesvioEmZ: Number(piorEmZ.toPrecision(4)),
    toleranciaEmZ: arredondarParaCima(2 * piorEmZ),
    sobreATolerancia:
      "Duas escalas, e confundi-las é o erro fácil. NA MEDIDA, a tolerância é metade da " +
      "última casa publicada (5e-4): o desvio publicado é o valor exato arredondado a três " +
      "casas, e é assim que o congelamento confere cada par. EM z, o mesmo arredondamento " +
      "se amplifica por 1/(M·S) — mais de duas vezes no peso ao nascer —, então a " +
      "tolerância do teste é maior e vai MEDIDA, não estimada: `piorDesvioEmZ` é o pior " +
      "caso observado nas 14 tabelas e `toleranciaEmZ` é o dobro dele, arredondado para " +
      "cima. A folga não afrouxa nada que importe: erro de implementação (fórmula trocada, " +
      "linha errada, sexo errado) desvia na ordem de 0,1, não de 0,001.",
    criterioDaAmostra:
      "Passo fixo (60 dias na família 2006, 6 meses na 2007) mais as fronteiras " +
      "obrigatórias, que o campo `porque` de cada caso nomeia. Determinístico por desenho.",
    limiteConhecido:
      "Nenhuma das 14 tabelas tem linha com L = 0, de modo que o ramo logarítmico da LMS " +
      "não é exercitável por dado real da OMS. A cobertura dele é do acervo sintético de " +
      "`tests/apoio/puericultura.ts` (T007).",
    conferidoNoCongelamento:
      "Cada par (medida, n) foi reproduzido pela LMS da própria linha, dentro da " +
      "tolerância, antes de entrar no arquivo.",
    tabelas: tabelas.length,
  };
}

function metaIntergrowth(): Record<string, unknown> {
  return {
    fonte:
      "INTERGROWTH-21st, International Postnatal Growth Standards for Preterm Infants " +
      "(Villar et al., Lancet Glob Health 2015;3:e681-91)",
    oQueECadaLinha:
      "Uma semana de idade pós-menstrual e a medida publicada em cada desvio. A equação " +
      "fechada de μ e σ (T035) tem de reproduzir cada célula.",
    janela: { de: PRIMEIRA_SEMANA, ate: ULTIMA_SEMANA, unidade: "semana" },
    desviosPublicados: DESVIOS_PUBLICADOS,
    precisaoPublicada: "2 casas",
    toleranciaSugerida: 0.005,
    sobreATolerancia:
      "Meia unidade da última casa publicada. Foi a folga com que T004 conferiu as 1596 " +
      "células contra as expressões fechadas: nenhuma fora, pior desvio exatamente 0,005.",
    extraidoDe:
      "PDF, via `pdftotext -layout` (poppler). Dependência de ambiente do congelamento, " +
      "nunca do teste nem do build.",
    semIMC:
      "A curva pós-natal não publica IMC — RF-18 trata a ausência como variante do índice, " +
      "jamais como erro.",
  };
}

/** Formatado pelo Prettier do projeto, para que o `format:check` não seja 2.ª fonte de diff. */
async function serializar(documento: unknown): Promise<string> {
  const texto = JSON.stringify(documento, null, 2);
  return format(texto, { parser: "json" });
}

async function principal(): Promise<void> {
  console.log(`Congelando casos-oráculo para ${DESTINO}\n`);
  console.log("— OMS, colunas SDn —");
  const oms = await congelarOms();
  console.log("\n— INTERGROWTH-21st, tabelas de z-score —");
  const preTermo = await congelarPreTermo();

  const documento = {
    ...meta(),
    oms: { ...metaOms(oms.tabelas, oms.piorEmZ), dados: oms.tabelas },
    intergrowth: { ...metaIntergrowth(), dados: preTermo.tabelas },
  };
  const conteudo = await serializar(documento);

  const anterior = existsSync(DESTINO) ? await readFile(DESTINO, "utf8") : null;
  if (anterior === conteudo) {
    console.log(`\n✓ ${DESTINO} já idêntico — nada escrito.`);
  } else {
    await writeFile(DESTINO, conteudo);
    console.log(`\n✓ ${DESTINO} escrito.`);
  }

  console.log(
    `✓ OMS: ${oms.casos} casos de 14 tabelas · ${oms.pares} pares (medida, z) conferidos ` +
      `pela LMS na tolerância de ${TOLERANCIA_ORACULO.toExponential(1)} na escala da medida`,
  );
  console.log(
    `  pior desvio correspondente em z: ${oms.piorEmZ.toExponential(2)} → tolerância ` +
      `declarada ao teste ${arredondarParaCima(2 * oms.piorEmZ).toExponential(1)}`,
  );
  console.log(
    `✓ INTERGROWTH-21st: ${preTermo.tabelas.length} tabelas · ${preTermo.celulas} células`,
  );
  console.log(
    `✓ ${(conteudo.length / 1024).toFixed(0)} kB. Confira o \`git diff\`: vazio significa ` +
      `que nada mudou nas fontes.`,
  );
}

try {
  await principal();
} catch (erro) {
  if (erro instanceof FalhaDoCongelamento) {
    console.error(
      `\n✗ CONGELAMENTO ABORTADO — nada foi escrito.\n  ${erro.message}`,
    );
    process.exit(1);
  }
  if (erro instanceof Error) {
    console.error(
      `\n✗ CONGELAMENTO ABORTADO — nada foi escrito.\n  ${erro.message}`,
    );
    process.exit(1);
  }
  throw erro;
}
