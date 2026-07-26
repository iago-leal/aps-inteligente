// Apoio de teste do quinto domínio (feature 017-puericultura-crescimento, ação T007).
// Duas coisas, no molde de `tests/apoio/construtores.ts`: tabelas LMS **sintéticas**,
// que D-08 tornou possíveis ao pôr o acervo atrás de uma porta injetável, e o
// construtor de entrada de avaliação.
//
// A tabela sintética é o que separa o teste de uma regra do peso do dado real: exercitar
// a leitura de uma fronteira não deveria carregar 12.964 linhas de `L/M/S`. Os valores
// são deliberadamente reconhecíveis — `m` cresce com a chave —, de modo que uma leitura
// na linha errada aparece como número errado, não como igualdade acidental.
import type {
  RepositorioDeTabelasOms,
  TabelaLms,
  UnidadeDaTabela,
} from "models/puericultura/oms/leitura";
import type {
  EntradaAvaliacao,
  ErroValidacao,
  ForaDoEscopoDaFonte,
  Indice,
  IndiceAntropometrico,
  IndiceCalculado,
  ResultadoAvaliacao,
  SaidaAvaliacao,
  Sexo,
} from "models/puericultura/tipos";

interface FormaDaTabelaSintetica {
  readonly unidade: UnidadeDaTabela;
  readonly inicio: number;
  readonly fim: number;
  /** `m` na posição `chave`; o padrão devolve a própria chave, para leitura óbvia. */
  readonly m?: (chave: number) => number;
  readonly l?: (chave: number) => number;
  readonly s?: (chave: number) => number;
}

export function tabelaSintetica({
  unidade,
  inicio,
  fim,
  m = (chave) => chave,
  l = () => 1,
  s = () => 0.1,
}: FormaDaTabelaSintetica): TabelaLms {
  const chaves = Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);
  return Object.freeze({
    unidade,
    inicio,
    fim,
    l: Object.freeze(chaves.map(l)),
    m: Object.freeze(chaves.map(m)),
    s: Object.freeze(chaves.map(s)),
  });
}

export interface EntradaDeAcervo {
  readonly indice: Indice;
  readonly unidade: UnidadeDaTabela;
  readonly sexo: Sexo;
  readonly tabela: TabelaLms;
}

/** Acervo sob medida: só as combinações que o teste declara existem nele. */
export function repositorioSintetico(
  entradas: readonly EntradaDeAcervo[],
): RepositorioDeTabelasOms {
  const acervo = new Map(
    entradas.map((e) => [`${e.indice}:${e.unidade}:${e.sexo}`, e.tabela]),
  );
  return {
    obter: (indice, unidade, sexo) =>
      acervo.get(`${indice}:${unidade}:${sexo}`) ?? null,
  };
}

/** Menino nascido em 2026-01-10 e medido aos 7 meses — o primeiro cenário Gherkin. */
export function entradaAvaliacao(
  extras: Partial<EntradaAvaliacao> = {},
): EntradaAvaliacao {
  return {
    sexo: "masculino",
    dataDeNascimento: "2026-01-10",
    dataDaMedicao: "2026-08-10",
    pesoKg: 8.2,
    comprimentoCm: 68.5,
    posicaoDaMedicao: "deitado",
    perimetroCefalicoCm: 44.0,
    ...extras,
  };
}

function falhaDeNarrowing(esperado: string, saida: SaidaAvaliacao): never {
  throw new Error(
    `Esperava ${esperado}, veio: ${JSON.stringify(saida).slice(0, 300)}`,
  );
}

export function comoResultado(saida: SaidaAvaliacao): ResultadoAvaliacao {
  if (saida.tipo !== "resultado") falhaDeNarrowing("ResultadoAvaliacao", saida);
  return saida;
}

export function comoForaDoEscopo(saida: SaidaAvaliacao): ForaDoEscopoDaFonte {
  if (saida.tipo !== "fora-do-escopo") {
    falhaDeNarrowing("ForaDoEscopoDaFonte", saida);
  }
  return saida;
}

export function comoErroValidacao(saida: SaidaAvaliacao): ErroValidacao {
  if (saida.tipo !== "erro-validacao") falhaDeNarrowing("ErroValidacao", saida);
  return saida;
}

export function indiceDe(
  resultado: ResultadoAvaliacao,
  indice: Indice,
): IndiceAntropometrico {
  const achado = resultado.indices.find((i) => i.indice === indice);
  if (!achado) {
    throw new Error(
      `Sem o índice ${indice} em: ${resultado.indices.map((i) => i.indice).join(", ")}`,
    );
  }
  return achado;
}

export function comoCalculado(
  resultado: ResultadoAvaliacao,
  indice: Indice,
): IndiceCalculado {
  const achado = indiceDe(resultado, indice);
  if (achado.estado !== "calculado") {
    throw new Error(
      `Esperava ${indice} calculado, veio ${achado.estado}: ${JSON.stringify(achado)}`,
    );
  }
  return achado;
}

export function codigosDe(erro: ErroValidacao): string[] {
  return erro.ofensores.map((o) => o.codigo);
}
