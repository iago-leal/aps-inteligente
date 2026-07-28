// T007 (feature 020) — o oráculo de transcrição das dez fichas (D-12, `MD-0010`).
//
// O QUE ESTE TESTE PROVA, E CONTRA O QUÊ. Todo texto de classe citação declarado em
// `models/puericultura/consulta/fichas/**` — título de ficha, título de seção, rótulo de
// campo e opção de escolha — tem de OCORRER no texto que o `pdftotext` extraiu da página
// que o próprio dado aponta. A fonte da comparação é `tests/apoio/fichas-caderneta-congeladas.json`,
// congelado do PDF por `scripts/congelar-fichas-caderneta.mts`: não veio de quem transcreveu,
// e é isso que faz dele oráculo em vez de segunda leitura nossa.
//
// A REGRA DA OCORRÊNCIA, e por que ela é frouxa de propósito. Basta ocorrer em UMA das
// quatro variantes congeladas (duas tiragens × duas passagens do extrator). As páginas são
// diagramadas em duas colunas, e `-layout` intercala as colunas na mesma linha enquanto o
// fluxo de leitura às vezes as mantém contíguas. Exigir as duas passagens reprovaria todo
// rótulo que o layout parte, e a lista de exceções deixaria de caber numa lista.
//
// A NORMALIZAÇÃO É REGRA, NÃO EXCEÇÃO. Antes de comparar, as sequências de sublinhado — as
// linhas onde se escreve à mão — somem, e o espaço em branco colapsa. Sem isso, "Convulsões
// ou movimentos anormais" nunca ocorreria contíguo: a fonte imprime a primeira metade acima
// da linha de preenchimento da coluna vizinha. A linha de preenchimento não é texto, e
// removê-la é ler a página, não afrouxar o guarda.
//
// A LISTA DE EXCEÇÕES É FECHADA (D-12, nota de execução do `actions.md`). Cada entrada traz
// o motivo, e o teto é de dez. Passando disso, a decisão D-12 se reabre em vez de a exceção
// crescer em silêncio: exceção que cresce sob demanda deixa de ser exceção e vira o
// comportamento.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FICHAS } from "models/puericultura/consulta/fichas/indice";
import type { Campo, Ficha } from "models/puericultura/consulta/tipos";

const CONGELADO = "tests/apoio/fichas-caderneta-congeladas.json";
const TETO_DE_EXCECOES = 10;

type Congelado = {
  readonly dados: Readonly<
    Record<string, { readonly paginas: Record<string, Record<string, string>> }>
  >;
};

/**
 * Exceções de layout, com o motivo de cada uma. Vazia enquanto as quatro variantes derem
 * conta; cada entrada é uma dívida declarada, e o teto acima é o gatilho de reabertura.
 */
const EXCECOES_DE_LAYOUT: ReadonlyMap<string, string> = new Map([
  [
    "69|Convulsões ou movimentos anormais",
    "o rótulo ocupa duas linhas da coluna direita e o cabeçalho “5. Exame ocular”, da coluna " +
      "esquerda, se intercala entre elas nas quatro variantes. Conferido à mão contra a página " +
      "impressa das duas tiragens em 28/07: as duas metades são contíguas no papel.",
  ],
  [
    "71|Orientações sobre saúde bucal do bebê: higiene bucal, nascimento dos dentes, uso de chupeta ou bico, etc.",
    "o rótulo ocupa três linhas da coluna direita, e as linhas da coluna esquerda — “Provável " +
      "atraso no desenvolvimento” e “Observações:” — se intercalam entre elas nas quatro " +
      "variantes. Conferido à mão contra a página impressa em 28/07.",
  ],
  [
    "73|Dificuldades para respirar (FR>50 ou <30)",
    "o corte de frequência respiratória cai na linha seguinte ao rótulo, e “Quantas porções " +
      "de fruta/dia?”, da coluna esquerda, se intercala entre os dois nas quatro variantes. " +
      "Nas pp. 70 a 72 o mesmo rótulo sai contíguo, o que confirma que a causa é a " +
      "diagramação desta página e não a transcrição. Conferido à mão em 28/07.",
  ],
  [
    "74|Dificuldades para respirar (FR>50 ou <30)",
    "mesma diagramação da p. 73, e o mesmo rótulo partido por “Quantas porções de fruta/dia?”. " +
      "Conferido à mão em 28/07.",
  ],
]);

function chaveDaExcecao(pagina: number, texto: string): string {
  return `${pagina}|${texto}`;
}

function normalizar(bruto: string): string {
  return bruto.replace(/_{2,}/g, " ").replace(/\s+/g, " ").trim();
}

const congelado = JSON.parse(readFileSync(CONGELADO, "utf8")) as Congelado;

/** As quatro variantes de cada página, já normalizadas: duas tiragens, duas passagens. */
function variantesDaPagina(
  pagina: number,
  tiragens: readonly string[],
): string[] {
  return tiragens.flatMap((tiragem) => {
    const daPagina = congelado.dados[tiragem]?.paginas[String(pagina)];
    if (daPagina === undefined) {
      throw new Error(
        `página ${pagina} ausente do congelado da tiragem ${tiragem}: regere com ` +
          `\`node scripts/congelar-fichas-caderneta.mts\``,
      );
    }
    return Object.values(daPagina).map(normalizar);
  });
}

const AMBAS: readonly string[] = ["menino", "menina"];

/**
 * Um texto citado, a página que ele declara e em quais tiragens ele deve ser procurado. A
 * flexão feminina só existe numa das duas, e procurá-la na outra reprovaria por acerto.
 */
type TextoCitado = {
  readonly texto: string;
  readonly pagina: number;
  readonly tiragens: readonly string[];
  readonly onde: string;
};

function citacoesDoCampo(
  campo: Campo,
  ficha: Ficha,
  secao: string,
): TextoCitado[] {
  const onde = `${ficha.id} · ${secao} · ${campo.id}`;
  const citacoes: TextoCitado[] = [
    {
      texto: campo.rotulo,
      pagina: campo.pagina,
      // Com flexão declarada, o rótulo-base é o da tiragem masculina (RN-07, D-06).
      tiragens: campo.rotuloFeminino === undefined ? AMBAS : ["menino"],
      onde: `${onde} · rótulo`,
    },
  ];

  if (campo.rotuloFeminino !== undefined) {
    citacoes.push({
      texto: campo.rotuloFeminino,
      pagina: campo.pagina,
      tiragens: ["menina"],
      onde: `${onde} · rótulo feminino`,
    });
  }

  if (campo.natureza === "escolha") {
    for (const opcao of campo.opcoes) {
      citacoes.push({
        texto: opcao,
        pagina: campo.pagina,
        tiragens: AMBAS,
        onde: `${onde} · opção`,
      });
    }
  }

  return citacoes;
}

function citacoesDaFicha(ficha: Ficha): TextoCitado[] {
  const citacoes: TextoCitado[] = [
    {
      texto: ficha.titulo,
      pagina: ficha.pagina,
      tiragens: AMBAS,
      onde: `${ficha.id} · título`,
    },
  ];

  for (const secao of ficha.secoes) {
    citacoes.push({
      texto: secao.titulo,
      pagina: ficha.pagina,
      tiragens: AMBAS,
      onde: `${ficha.id} · seção ${secao.numero} · título`,
    });
    for (const campo of secao.campos) {
      citacoes.push(...citacoesDoCampo(campo, ficha, `seção ${secao.numero}`));
    }
  }

  return citacoes;
}

describe("Oráculo de transcrição das fichas de consulta (D-12)", () => {
  it.each(FICHAS.map((ficha) => [ficha.id, ficha] as const))(
    "a ficha %s reproduz a página impressa, texto a texto",
    (_id, ficha) => {
      const naoEncontrados: string[] = [];

      for (const citacao of citacoesDaFicha(ficha)) {
        if (
          EXCECOES_DE_LAYOUT.has(chaveDaExcecao(citacao.pagina, citacao.texto))
        ) {
          continue;
        }
        const alvo = normalizar(citacao.texto);
        const ocorre = variantesDaPagina(citacao.pagina, citacao.tiragens).some(
          (variante) => variante.includes(alvo),
        );
        if (!ocorre) {
          naoEncontrados.push(
            `p. ${citacao.pagina} · ${citacao.onde}\n      "${citacao.texto}"`,
          );
        }
      }

      expect(
        naoEncontrados,
        `textos que não ocorrem na página que declaram:\n    ${naoEncontrados.join("\n    ")}\n` +
          `  Confira a digitação contra a página impressa. Se o layout em duas colunas ` +
          `partiu o rótulo nas quatro variantes, declare a exceção em EXCECOES_DE_LAYOUT ` +
          `com o motivo.`,
      ).toEqual([]);
    },
  );

  it("mantém fechada a lista de exceções de layout (D-12)", () => {
    expect(
      EXCECOES_DE_LAYOUT.size,
      `a lista de exceções passou de ${TETO_DE_EXCECOES}. Pare e reabra a decisão D-12 do ` +
        `roadmap em vez de crescer a exceção: exceção que cresce sob demanda deixa de ser ` +
        `exceção e vira o comportamento.`,
    ).toBeLessThanOrEqual(TETO_DE_EXCECOES);
  });

  it("declara o motivo de cada exceção que abrir", () => {
    for (const [chave, motivo] of EXCECOES_DE_LAYOUT) {
      expect(
        motivo.trim().length,
        `exceção sem motivo: ${chave}`,
      ).toBeGreaterThan(0);
    }
  });
});
