// Congelador da fonte da Escala de Depressão Geriátrica: a cópia datada em
// `referencias/saude-do-idoso/*.html` → `tests/apoio/gds-fonte-congelada.json`, versionado.
// Realiza T001 do plano da feature 023-saude-do-idoso-gds.
//
// O PROBLEMA QUE ELE RESOLVE (D-09, `MD-0010`). A escala mistura dez itens em que pontua o
// "Sim" com cinco em que pontua o "Não", e a chave de pontuação NÃO ESTÁ NO TEXTO: a fonte a
// publica pela cor da célula, que a página produz com a classe `bg-table-light-grey`
// (`MD-0038`). Transcrever essa chave à mão e conferi-la por releitura seria a segunda
// implementação que `MD-0010` recusa — quem transcreveu relê o que quis escrever, e o erro
// sai plausível: escore na faixa vizinha da correta, que nenhuma inspeção de tela pega.
// Congelada a chave por cadeia própria, a suíte passa a julgar o domínio contra o que a
// fonte diz, e não contra a memória de quem o escreveu.
//
// O QUE ELE NÃO É. Ele NÃO confere se a página publicada mudou desde 30/07/2026: lê a cópia
// local e nada mais. Essa outra conferência é manual por decisão registrada (`MD-0039`), e
// confundir as duas seria supor guarda onde há apenas disciplina humana. O `sha256` abaixo é
// o que liga uma coisa à outra: ele reprova se a cópia local for trocada sem que ninguém
// tenha reaberto a transcrição.
//
// POR QUE EXPRESSÃO REGULAR, E NÃO UM ANALISADOR DE HTML. Nenhum parser de HTML é
// dependência deste projeto, e acrescentar um para ler quinze linhas de uma tabela seria
// pagar manutenção perpétua por conveniência de uma execução rara (filtro de longevidade;
// D-14 recusa dependência nova para esta feature). O risco que a regex teria — casar o
// padrão em lugar errado — é fechado por guardas: a estrutura é conferida item a item, e
// qualquer desvio aborta sem escrever.
//
// Três promessas, na disciplina de `scripts/congelar-fichas-caderneta.mts`:
//
//  1. **Nenhuma escrita parcial.** Tudo é extraído e conferido em memória; o arquivo só é
//     escrito quando a última guarda passou.
//  2. **Falha ruidosa e localizada.** A mensagem diz o que faltou e onde.
//  3. **Idempotência.** Nenhuma data de relógio entra no documento, e rodar duas vezes sobre
//     a mesma cópia produz o mesmo arquivo — `git diff` vazio prova origem intacta.
//
// Uso:  node scripts/congelar-fonte-gds.mts
//       (exige a cópia datada em `referencias/saude-do-idoso/`.)
//
// A cópia da fonte é dependência editorial FORA do git (`MD-0008`); o congelado entra, e é
// ele que mantém a suíte executável em clone limpo.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";

const DESTINO = "tests/apoio/gds-fonte-congelada.json";
const ORIGEM = join(
  "referencias",
  "saude-do-idoso",
  "escala-de-depressao-geriatrica-linhas-de-cuidado-ms-20260730.html",
);

/** A cópia conferida em 30/07/2026 (`requirements.md` §2 e §9). Trocou, reabre a leitura. */
const SHA256_ESPERADO =
  "bb74f9bc285f9ae2d235cf41d42e6ac04691dfe617f2ecff3fe4fdf4e04802ef";

const URL_DA_FONTE =
  "https://linhasdecuidado.saude.gov.br/portal/tabagismo/escala-depressao-geriatrica/";

/** Data de ACESSO, escrita à mão. Relógio aqui quebraria a idempotência. */
const LIDA_EM = "2026-07-30";

/** A marcação de célula que a fonte usa para dizer qual resposta pontua (`MD-0038`). */
const CLASSE_QUE_PONTUA = "bg-table-light-grey";

const TOTAL_DE_ITENS = 15;
const ESCORE_MINIMO = 0;
const ESCORE_MAXIMO = 15;

class FalhaDoCongelamento extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = "FalhaDoCongelamento";
  }
}

function sha256De(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Texto visível de um fragmento de HTML: entidades resolvidas, marcação removida, espaço em
 * branco colapsado. O `&nbsp` da fonte vem SEM ponto e vírgula, e é assim que ela o imprime.
 */
function textoDe(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;?/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function bloco(
  html: string,
  abertura: RegExp,
  fechamento: string,
  oQue: string,
): string {
  const inicio = html.search(abertura);
  if (inicio < 0) {
    throw new FalhaDoCongelamento(
      `${oQue}: o trecho não foi encontrado na cópia da fonte. A página mudou de estrutura, ` +
        `e a transcrição precisa ser reaberta antes de o congelado ser regerado`,
    );
  }
  const fim = html.indexOf(fechamento, inicio);
  if (fim < 0) {
    throw new FalhaDoCongelamento(
      `${oQue}: abertura encontrada sem o fechamento ${fechamento}`,
    );
  }
  return html.slice(inicio, fim);
}

export type RespostaQuePontua = "sim" | "nao";

interface ItemCongelado {
  readonly numero: number;
  readonly texto: string;
  readonly respostaQuePontua: RespostaQuePontua;
}

interface AvaliacaoCongelada {
  readonly texto: string;
  readonly de: number;
  readonly ate: number;
  readonly rotulo: string;
}

/**
 * Os quinze itens, com a chave lida da marcação de célula. Cada linha tem de trazer três
 * células — enunciado, "Sim" e "Não" — e EXATAMENTE UMA delas marcada. Linha com nenhuma
 * marcação, ou com as duas, é ambiguidade da fonte, e ambiguidade aborta em vez de virar
 * palpite.
 */
function extrairItens(html: string): ItemCongelado[] {
  const corpo = bloco(html, /<tbody>/, "</tbody>", "a tabela dos itens");
  const linhas = [...corpo.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);

  if (linhas.length !== TOTAL_DE_ITENS) {
    throw new FalhaDoCongelamento(
      `a tabela trouxe ${linhas.length} linhas, e a escala tem ${TOTAL_DE_ITENS} itens`,
    );
  }

  return linhas.map((linha, indice) => {
    const esperado = indice + 1;
    const celulas = [...linha.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)].map(
      (m) => ({
        atributos: m[1],
        conteudo: m[2],
      }),
    );

    if (celulas.length !== 3) {
      throw new FalhaDoCongelamento(
        `item ${esperado}: ${celulas.length} células na linha, 3 esperadas ` +
          `(enunciado, "Sim" e "Não")`,
      );
    }

    const bruto = textoDe(celulas[0].conteudo);
    const enunciado = /^(\d{1,2})\.\s*(.+)$/.exec(bruto);
    if (enunciado === null) {
      throw new FalhaDoCongelamento(
        `item ${esperado}: o enunciado não começa por número e ponto — "${bruto}"`,
      );
    }
    if (Number(enunciado[1]) !== esperado) {
      throw new FalhaDoCongelamento(
        `a linha ${indice + 1} da tabela traz o item ${enunciado[1]}: a ordem impressa não é a ` +
          `da leitura, e o congelado não pode supor qual das duas vale`,
      );
    }

    const respostas = celulas.slice(1).map((celula, ordem) => {
      const texto = textoDe(celula.conteudo);
      const resposta = /\)\s*(Sim|Não)$/.exec(texto);
      if (resposta === null) {
        throw new FalhaDoCongelamento(
          `item ${esperado}: a célula de resposta ${ordem + 1} não termina em "Sim" nem em ` +
            `"Não" — "${texto}"`,
        );
      }
      return {
        valor: (resposta[1] === "Sim" ? "sim" : "nao") as RespostaQuePontua,
        marcada: celula.atributos.includes(CLASSE_QUE_PONTUA),
      };
    });

    if (respostas[0].valor !== "sim" || respostas[1].valor !== "nao") {
      throw new FalhaDoCongelamento(
        `item ${esperado}: as células de resposta não estão na ordem "Sim", "Não"`,
      );
    }

    const marcadas = respostas.filter((r) => r.marcada);
    if (marcadas.length !== 1) {
      throw new FalhaDoCongelamento(
        `item ${esperado}: ${marcadas.length} células marcadas com "${CLASSE_QUE_PONTUA}", 1 ` +
          `esperada. A chave de pontuação da fonte é a marcação da célula (MD-0038), e sem ` +
          `exatamente uma marcação não há chave a ler`,
      );
    }

    return {
      numero: esperado,
      texto: enunciado[2],
      respostaQuePontua: marcadas[0].valor,
    };
  });
}

/**
 * As três faixas de resultado, com os cortes lidos dos dois primeiros números de cada linha e
 * o rótulo lido do que vem depois deles. As guardas exigem cobertura contígua de 0 a 15: é a
 * propriedade que RN-04 afirma, e ela se confere na fonte, não no domínio.
 */
function extrairAvaliacoes(html: string): AvaliacaoCongelada[] {
  const anuncio = html.indexOf("Avaliações dos resultados");
  if (anuncio < 0) {
    throw new FalhaDoCongelamento(
      `a lista de avaliações não foi encontrada: a página não traz "Avaliações dos resultados"`,
    );
  }
  const lista = bloco(
    html.slice(anuncio),
    /<ul>/,
    "</ul>",
    "a lista de avaliações",
  );
  const itens = [...lista.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) =>
    textoDe(m[1]),
  );

  if (itens.length !== 3) {
    throw new FalhaDoCongelamento(
      `a lista de avaliações trouxe ${itens.length} entradas, 3 esperadas`,
    );
  }

  const avaliacoes = itens.map((texto) => {
    const corte = /(\d{1,2})\D+(\d{1,2})\s*(.+)$/.exec(texto);
    if (corte === null) {
      throw new FalhaDoCongelamento(
        `avaliação sem os dois cortes numéricos e o rótulo — "${texto}"`,
      );
    }
    return {
      texto,
      de: Number(corte[1]),
      ate: Number(corte[2]),
      rotulo: corte[3].trim(),
    };
  });

  let esperadoDe = ESCORE_MINIMO;
  for (const faixa of avaliacoes) {
    if (faixa.de !== esperadoDe || faixa.ate < faixa.de) {
      throw new FalhaDoCongelamento(
        `as faixas não cobrem ${ESCORE_MINIMO} a ${ESCORE_MAXIMO} sem buraco nem ` +
          `sobreposição: esperava faixa começando em ${esperadoDe}, veio ${faixa.de} a ${faixa.ate}`,
      );
    }
    esperadoDe = faixa.ate + 1;
  }
  if (esperadoDe !== ESCORE_MAXIMO + 1) {
    throw new FalhaDoCongelamento(
      `as faixas terminam em ${esperadoDe - 1}, e o escore máximo da escala é ${ESCORE_MAXIMO}`,
    );
  }

  return avaliacoes;
}

/**
 * A providência recomendada, em duas formas: o parágrafo como a fonte o imprime e a
 * recomendação em si, que é o que o produto transcreve (RN-04b). O prefixo até os dois-pontos
 * é rubrica da página, e não parte da recomendação.
 */
function extrairProvidencia(html: string): {
  paragrafo: string;
  recomendacao: string;
} {
  const trecho = /<p[^>]*>(\s*Providências[\s\S]*?)<\/p>/.exec(html);
  if (trecho === null) {
    throw new FalhaDoCongelamento(
      `o parágrafo de providências não foi encontrado na cópia da fonte`,
    );
  }
  const paragrafo = textoDe(trecho[1]);
  const separador = paragrafo.indexOf(":");
  if (separador < 0) {
    throw new FalhaDoCongelamento(
      `o parágrafo de providências não traz os dois-pontos que separam a rubrica da ` +
        `recomendação — "${paragrafo}"`,
    );
  }
  return {
    paragrafo,
    recomendacao: paragrafo.slice(separador + 1).trim(),
  };
}

/** A instrução que diz COMO se pontua, e que é a prosa por trás da marcação (`MD-0038`). */
function extrairInstrucaoDePontuacao(html: string): string {
  const trecho = /<li>\s*(Considerar[\s\S]*?)<\/li>/.exec(html);
  if (trecho === null) {
    throw new FalhaDoCongelamento(
      `a instrução de pontuação ("Considerar 1 ponto…") não foi encontrada`,
    );
  }
  return textoDe(trecho[1]);
}

/** A referência bibliográfica que a própria fonte cita, sob a tabela. */
function extrairReferenciaBibliografica(html: string): string {
  const legenda = bloco(
    html,
    /<div class="table-legend">/,
    "</div>",
    "a legenda com a referência bibliográfica",
  );
  const texto = textoDe(legenda);
  if (!texto.startsWith("Fonte:")) {
    throw new FalhaDoCongelamento(
      `a legenda não começa por "Fonte:" — "${texto}"`,
    );
  }
  return texto;
}

/** A nota de leitura que acompanha o arquivo — o "por que" que o JSON não conta sozinho. */
function meta(sha256: string) {
  return {
    esquema: "gds-fonte-congelada/1",
    feature: "023-saude-do-idoso-gds",
    acao: "T001",
    geradoPor: "scripts/congelar-fonte-gds.mts",
    aviso:
      "ARQUIVO GERADO — não editar à mão. Regerar exige a cópia datada da fonte em " +
      "`referencias/saude-do-idoso/`, que o .gitignore exclui; `git diff` vazio prova que a " +
      "origem não mudou, e `git diff` com conteúdo é LEITURA HUMANA OBRIGATÓRIA.",
    porQueExiste:
      "Oráculo de transcrição de D-09. A chave de pontuação da escala não está no texto: a " +
      "fonte a publica pela cor da célula (MD-0038), e é o ponto exato em que a transcrição " +
      "de instrumentos erra. Congelada a chave por cadeia própria, a suíte julga o domínio " +
      "contra a fonte em vez de contra a memória de quem o transcreveu.",
    oQueEleNaoProva:
      "Que a página publicada continua igual à cópia. Essa conferência é manual (MD-0039); " +
      "o sha256 abaixo apenas reprova a troca silenciosa da cópia local.",
    consumidores: [
      "tests/unit/dominio-depressao-geriatrica/transcricao.test.ts (T005)",
      "tests/unit/textos/citacao.test.ts (T004, isenção nominal de MD-0027)",
    ],
    fonte: {
      arquivo: ORIGEM,
      sha256,
      url: URL_DA_FONTE,
      lidaEm: LIDA_EM,
      publicadaPor: "Linhas de Cuidado, Ministério da Saúde",
      marcacaoQuePontua: CLASSE_QUE_PONTUA,
      sobreAMarcacao:
        "A célula que pontua traz a classe CSS acima. O texto extraído da página NÃO carrega " +
        "essa informação, e por isso quem reconferir a transcrição precisa saber onde olhar.",
    },
    comoLerNoTeste:
      "Cada item do domínio tem de bater, byte a byte, com o enunciado e a resposta que " +
      "pontua do item de mesmo número; os três rótulos de faixa e os seus cortes, com as " +
      "avaliações; e a providência do domínio tem de ocorrer no parágrafo congelado.",
  };
}

/** Formatado pelo Prettier do projeto, para que o `format:check` não seja 2.ª fonte de diff. */
async function serializar(documento: unknown): Promise<string> {
  return format(JSON.stringify(documento, null, 2), { parser: "json" });
}

async function principal(): Promise<void> {
  console.log(`Congelando a fonte da GDS para ${DESTINO}\n`);

  if (!existsSync(ORIGEM)) {
    throw new FalhaDoCongelamento(
      `cópia da fonte ausente em ${ORIGEM}. As fontes clínicas são dependência editorial ` +
        `fora do git (MD-0008); ponha a cópia datada no lugar e rode de novo`,
    );
  }

  const bytes = await readFile(ORIGEM);
  const sha256 = sha256De(bytes);
  if (sha256 !== SHA256_ESPERADO) {
    throw new FalhaDoCongelamento(
      `a cópia da fonte não é a conferida em ${LIDA_EM}.\n` +
        `  esperado: ${SHA256_ESPERADO}\n` +
        `  lido:     ${sha256}\n` +
        `Cópia diferente significa fonte possivelmente diferente: reabra a transcrição, ` +
        `confira item a item e só então atualize o sha256 deste script.`,
    );
  }

  const html = bytes.toString("utf8");
  const itens = extrairItens(html);
  const avaliacoes = extrairAvaliacoes(html);
  const providencia = extrairProvidencia(html);
  const instrucaoDePontuacao = extrairInstrucaoDePontuacao(html);
  const referenciaBibliografica = extrairReferenciaBibliografica(html);

  const pontuamComSim = itens.filter(
    (i) => i.respostaQuePontua === "sim",
  ).length;
  console.log(
    `✓ ${itens.length} itens · ${pontuamComSim} pontuam com "Sim", ` +
      `${itens.length - pontuamComSim} com "Não"`,
  );
  console.log(
    `✓ ${avaliacoes.length} faixas · ${avaliacoes
      .map((a) => `${a.de}–${a.ate}`)
      .join(", ")}`,
  );

  const conteudo = await serializar({
    ...meta(sha256),
    dados: {
      itens,
      instrucaoDePontuacao,
      avaliacoes,
      providencia,
      referenciaBibliografica,
    },
  });

  const anterior = existsSync(DESTINO) ? await readFile(DESTINO, "utf8") : null;
  if (anterior === conteudo) {
    console.log(`\n✓ ${DESTINO} já idêntico — nada escrito.`);
  } else {
    await writeFile(DESTINO, conteudo);
    console.log(`\n✓ ${DESTINO} escrito.`);
  }
  console.log(
    `✓ Confira o \`git diff\`: vazio significa que a fonte não mudou; com conteúdo, leia-o ` +
      `antes de aceitar.`,
  );
}

try {
  await principal();
} catch (erro) {
  const motivo = erro instanceof Error ? erro.message : String(erro);
  console.error(`\n✗ CONGELAMENTO ABORTADO — nada foi escrito.\n  ${motivo}`);
  process.exit(1);
}
