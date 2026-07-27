// Oráculo das curvas pós-natais de pré-termo: as tabelas de z-score que o próprio projeto
// INTERGROWTH-21st publica, em ±1, ±2 e ±3 desvios por semana pós-menstrual.
//
// POR QUE CONGELAR: MD-0002 decidiu implementar essas curvas como seis expressões fechadas,
// e não como tabela embarcada — de modo que, no repositório, não sobra registro tabular
// algum do pré-termo. A conferência de T004 (1596 células, nenhuma fora da tolerância) rodou
// sobre PDFs que vivem em `referencias/intergrowth/`, pasta que o `.gitignore` exclui. Sem
// este congelamento, T012 não teria contra o que comparar em clone limpo.
//
// A extração usa `pdftotext -layout` (poppler). É dependência de AMBIENTE, não do projeto:
// roda uma vez, no congelamento, e nunca em teste nem em build. Ausente ela, o script para
// com a mensagem do que falta — jamais congela tabela pela metade.
//
// Módulo DEV-TIME: nunca importado por código de aplicação (fronteira do roadmap §5).
// T008 · RF-18, D-02 do roadmap da feature 017-puericultura-crescimento.
import { execFileSync } from "node:child_process";
import { chaveDoDesvio } from "./oms.mts";

/** Desvios publicados em cada tabela, na ordem das colunas impressas. */
export const DESVIOS_PUBLICADOS: readonly number[] = Object.freeze([
  -3, -2, -1, 0, 1, 2, 3,
]);

/** Janela da curva pós-natal, em semanas de idade pós-menstrual (D-01, RF-19). */
export const PRIMEIRA_SEMANA = 27;
export const ULTIMA_SEMANA = 64;

export interface OrigemIntergrowth {
  readonly id: string;
  readonly medida: "peso" | "comprimento" | "perimetro-cefalico";
  readonly sexo: "masculino" | "feminino";
  readonly unidade: "kg" | "cm";
  /** Nome do arquivo em `referencias/intergrowth/` — irregular na origem. */
  readonly arquivo: string;
  /** Título impresso na primeira página, conferido antes de extrair. */
  readonly tituloEsperado: string;
}

// A sexta tabela é a única sem o sufixo `_Sheet1`. Como no caso da OMS, a verificação é do
// conteúdo: cada arquivo declara o título que a página tem de trazer.
export const ORIGENS_INTERGROWTH: readonly OrigemIntergrowth[] = Object.freeze([
  {
    id: "peso-masculino",
    medida: "peso",
    sexo: "masculino",
    unidade: "kg",
    arquivo: "PPFS_zscores_boys_weight_2_Dec_15_Sheet1.pdf",
    tituloEsperado: "Weight (boys)",
  },
  {
    id: "peso-feminino",
    medida: "peso",
    sexo: "feminino",
    unidade: "kg",
    arquivo: "PPFS_zscores_girls_weight_2_Dec_15.pdf",
    tituloEsperado: "Weight (girls)",
  },
  {
    id: "comprimento-masculino",
    medida: "comprimento",
    sexo: "masculino",
    unidade: "cm",
    arquivo: "PPFS_zscores_boys_length_2_Dec_15_Sheet1.pdf",
    tituloEsperado: "Length (boys)",
  },
  {
    id: "comprimento-feminino",
    medida: "comprimento",
    sexo: "feminino",
    unidade: "cm",
    arquivo: "PPFS_zscores_girls_length_2_Dec_15_Sheet1.pdf",
    tituloEsperado: "Length (girls)",
  },
  {
    id: "perimetro-cefalico-masculino",
    medida: "perimetro-cefalico",
    sexo: "masculino",
    unidade: "cm",
    arquivo: "PPFS_zscores_boys_headcirc_2_Dec_15_Sheet1.pdf",
    tituloEsperado: "Head Circumference (boys)",
  },
  {
    id: "perimetro-cefalico-feminino",
    medida: "perimetro-cefalico",
    sexo: "feminino",
    unidade: "cm",
    arquivo: "PPFS_zscores_girls_headcirc_2_Dec_15_Sheet1.pdf",
    tituloEsperado: "Head Circumference (girls)",
  },
]);

export const PASTA_INTERGROWTH = "referencias/intergrowth";

export interface LinhaSemana {
  readonly semana: number;
  /** Medida publicada em cada desvio, indexada por `chaveDoDesvio` (`z-3`, …, `z3`). */
  readonly z: Readonly<Record<string, number>>;
}

export interface TabelaIntergrowth {
  readonly origem: string;
  readonly medida: string;
  readonly sexo: string;
  readonly unidade: string;
  readonly arquivo: string;
  readonly sha256: string;
  readonly semanas: readonly LinhaSemana[];
}

/** Texto do PDF em layout preservado. Falha ruidosa quando o poppler não está instalado. */
function textoDoPdf(caminho: string): string {
  try {
    return execFileSync("pdftotext", ["-layout", caminho, "-"], {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    });
  } catch (erro) {
    const causa = erro as NodeJS.ErrnoException;
    if (causa.code === "ENOENT") {
      throw new Error(
        "`pdftotext` não encontrado. As tabelas do INTERGROWTH-21st são PDF e a extração " +
          "depende do poppler: instale com `brew install poppler` e rode de novo. " +
          "Nada foi escrito.",
      );
    }
    throw new Error(`falha ao extrair texto de ${caminho}: ${String(erro)}`);
  }
}

/** Uma linha de dados: a semana e os sete valores, na ordem impressa. */
const LINHA_DE_DADOS = /^\s*(\d{2})\s+((?:\d+\.\d+\s+){6}\d+\.\d+)\s*$/;

function extrairSemanas(
  texto: string,
  origem: OrigemIntergrowth,
): LinhaSemana[] {
  const semanas: LinhaSemana[] = [];
  for (const linha of texto.split("\n")) {
    const casado = LINHA_DE_DADOS.exec(linha);
    if (casado === null) continue;
    const valores = casado[2].trim().split(/\s+/).map(Number);
    if (valores.length !== DESVIOS_PUBLICADOS.length) {
      throw new Error(
        `${origem.arquivo}: semana ${casado[1]} traz ${valores.length} valores, ` +
          `e a tabela publica ${DESVIOS_PUBLICADOS.length}`,
      );
    }
    semanas.push({
      semana: Number(casado[1]),
      z: Object.fromEntries(
        DESVIOS_PUBLICADOS.map((n, i) => [chaveDoDesvio(n), valores[i]]),
      ),
    });
  }
  return semanas;
}

/** A tabela cobre 27 a 64 semanas, uma linha por semana, sem buraco nem repetição. */
function conferirJanela(
  semanas: readonly LinhaSemana[],
  origem: OrigemIntergrowth,
): void {
  const esperadas = ULTIMA_SEMANA - PRIMEIRA_SEMANA + 1;
  if (semanas.length !== esperadas) {
    throw new Error(
      `${origem.arquivo}: ${semanas.length} semanas extraídas, e a janela pede ${esperadas} ` +
        `(${PRIMEIRA_SEMANA} a ${ULTIMA_SEMANA})`,
    );
  }
  semanas.forEach((linha, i) => {
    const esperada = PRIMEIRA_SEMANA + i;
    if (linha.semana !== esperada) {
      throw new Error(
        `${origem.arquivo}: na posição ${i} veio a semana ${linha.semana}, esperada ${esperada}`,
      );
    }
  });
}

/** Os sete valores de cada semana crescem com o desvio: a curva não se cruza. */
function conferirMonotonia(
  semanas: readonly LinhaSemana[],
  origem: OrigemIntergrowth,
): void {
  for (const linha of semanas) {
    const valores = DESVIOS_PUBLICADOS.map((n) => linha.z[chaveDoDesvio(n)]);
    for (let i = 1; i < valores.length; i++) {
      if (valores[i] <= valores[i - 1]) {
        throw new Error(
          `${origem.arquivo}: na semana ${linha.semana}, o valor em z=${DESVIOS_PUBLICADOS[i]} ` +
            `(${valores[i]}) não é maior que o de z=${DESVIOS_PUBLICADOS[i - 1]} ` +
            `(${valores[i - 1]}) — extração desalinhada`,
        );
      }
    }
  }
}

/** Lê o PDF da origem e devolve a tabela congelável, já conferida. */
export function congelarIntergrowth(
  origem: OrigemIntergrowth,
  caminho: string,
  sha256: string,
): { tabela: TabelaIntergrowth; celulas: number } {
  const texto = textoDoPdf(caminho);
  if (!texto.includes(origem.tituloEsperado)) {
    throw new Error(
      `${origem.arquivo}: o título "${origem.tituloEsperado}" não aparece no PDF — ` +
        `arquivo trocado. A verificação é do conteúdo, jamais do nome.`,
    );
  }
  const semanas = extrairSemanas(texto, origem);
  conferirJanela(semanas, origem);
  conferirMonotonia(semanas, origem);
  return {
    tabela: {
      origem: origem.id,
      medida: origem.medida,
      sexo: origem.sexo,
      unidade: origem.unidade,
      arquivo: origem.arquivo,
      sha256,
      semanas,
    },
    celulas: semanas.length * DESVIOS_PUBLICADOS.length,
  };
}
