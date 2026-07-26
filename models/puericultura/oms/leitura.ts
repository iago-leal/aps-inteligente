// Repositório e leitura das tabelas LMS da OMS (feature 017-puericultura-crescimento).
// Origem: RF-02 e RF-07 do requirements; RN-02 e RN-08; decisões D-05, D-06, D-08,
// D-15 e D-16 do roadmap. Converte "que criança, que índice, que idade" em um trio
// `L/M/S` da linha exata publicada pela OMS — o cálculo do escore é de `lms.ts`.
//
// Três compromissos governam este módulo:
//
//  1. **Sem interpolação** (D-06). Até 5 anos lê-se o DIA inteiro, porque é assim que
//     a OMS publica; de 5 a 10 anos, o MÊS completo `⌊dias / 30,4375⌋`. Nenhum valor
//     usado no cálculo é estimado por nós, decisão de produto travada na clarificação.
//  2. **Busca aritmética** (D-05). `posição = chave − inicio`, sem varredura: os
//     módulos de dado são arrays paralelos indexados por posição.
//  3. **Acervo injetável** (D-08). A fachada recebe o repositório por construtor, com
//     o real por omissão — o teste de uma regra de leitura não carrega 12.964 linhas.
//
// Sobre as DUAS fronteiras dos 5 anos, que de propósito não coincidem (D-05): a de
// TABELA mora aqui (dia 1856 é a última linha de 2006; mês 61 é a primeira de 2007);
// a de RÓTULO, aos 1826 dias, é da classificação e mora em `classificacao.ts`.
// Confundi-las produziria ora rótulo trocado, ora buraco de cobertura de 30 dias.
import { COMPRIMENTO_ESTATURA_IDADE_0_5_FEMININO } from "./tabelas/comprimento-estatura-idade-0-5-feminino";
import { COMPRIMENTO_ESTATURA_IDADE_0_5_MASCULINO } from "./tabelas/comprimento-estatura-idade-0-5-masculino";
import { ESTATURA_IDADE_5_10_FEMININO } from "./tabelas/estatura-idade-5-10-feminino";
import { ESTATURA_IDADE_5_10_MASCULINO } from "./tabelas/estatura-idade-5-10-masculino";
import { IMC_IDADE_0_5_FEMININO } from "./tabelas/imc-idade-0-5-feminino";
import { IMC_IDADE_0_5_MASCULINO } from "./tabelas/imc-idade-0-5-masculino";
import { IMC_IDADE_5_10_FEMININO } from "./tabelas/imc-idade-5-10-feminino";
import { IMC_IDADE_5_10_MASCULINO } from "./tabelas/imc-idade-5-10-masculino";
import { PERIMETRO_CEFALICO_IDADE_0_2_FEMININO } from "./tabelas/perimetro-cefalico-idade-0-2-feminino";
import { PERIMETRO_CEFALICO_IDADE_0_2_MASCULINO } from "./tabelas/perimetro-cefalico-idade-0-2-masculino";
import { PESO_IDADE_0_5_FEMININO } from "./tabelas/peso-idade-0-5-feminino";
import { PESO_IDADE_0_5_MASCULINO } from "./tabelas/peso-idade-0-5-masculino";
import { PESO_IDADE_5_10_FEMININO } from "./tabelas/peso-idade-5-10-feminino";
import { PESO_IDADE_5_10_MASCULINO } from "./tabelas/peso-idade-5-10-masculino";
import { ErroDeInvariante, type Indice, type Sexo } from "../tipos";

/** Unidade do índice de linha da tabela; é também a faixa etária que ela cobre. */
export type UnidadeDaTabela = "dia" | "mes";

/** Forma dos módulos gerados por `scripts/gerar-tabelas-oms.mts` (`data-delta.md` §3.1). */
export interface TabelaLms {
  readonly unidade: UnidadeDaTabela;
  readonly inicio: number;
  readonly fim: number;
  readonly l: readonly number[];
  readonly m: readonly number[];
  readonly s: readonly number[];
}

export interface ParametrosLms {
  readonly l: number;
  readonly m: number;
  readonly s: number;
}

/** D-08: o acervo é uma porta, não um `import` chumbado no cálculo. */
export interface RepositorioDeTabelasOms {
  /** `null` quando a combinação não existe no acervo — p. ex. PC de 5 a 10 anos. */
  obter(indice: Indice, unidade: UnidadeDaTabela, sexo: Sexo): TabelaLms | null;
}

/** D-06: 30,4375 = 365,25 / 12, o mês médio que a referência 2007 pressupõe. */
export const DIAS_POR_MES = 30.4375;

/** D-05: última linha da tabela 2006, por dia. O dia 1857 já é o mês 61 de 2007. */
export const ULTIMO_DIA_DA_TABELA_POR_DIA = 1856;

/** D-05: primeira linha da referência 2007, por mês. */
export const PRIMEIRO_MES_DA_TABELA_POR_MES = 61;

/** D-15: última linha publicada; o mês 120 cobre os dias 3653 a 3682. */
export const ULTIMO_MES_DA_TABELA_POR_MES = 120;

/** D-15: a cobertura termina aqui — 3683 dias já é o mês 121, que a fonte não publica. */
export const ULTIMO_DIA_COBERTO = 3682;

/** D-16: onde a tabela de perímetro cefálico da OMS termina; 731 já está fora. */
export const ULTIMO_DIA_DO_PERIMETRO_CEFALICO = 730;

/** D-06: mês completo, sem arredondar para cima e sem interpolar. */
export function mesCompletoDe(diasDeVida: number): number {
  return Math.floor(diasDeVida / DIAS_POR_MES);
}

/**
 * Motivo pelo qual a OMS não tem linha para esta combinação. É informação de leitura,
 * não a política clínica de recusa: quem a traduz em `ForaDoEscopoDaFonte`, global ou
 * parcial, é `elegibilidade.ts` (RF-07).
 */
export type MotivoSemTabela =
  "IDADE_ACIMA_DA_COBERTURA" | "PERIMETRO_CEFALICO_ACIMA_DE_2_ANOS";

export type LeituraLms =
  | {
      readonly tipo: "lida";
      readonly parametros: ParametrosLms;
      readonly unidade: UnidadeDaTabela;
      /** A chave efetivamente lida: dia inteiro ou mês completo (D-06). */
      readonly chave: number;
    }
  | { readonly tipo: "sem-tabela"; readonly motivo: MotivoSemTabela };

type Selecao =
  | {
      readonly tipo: "selecionada";
      readonly unidade: UnidadeDaTabela;
      readonly chave: number;
    }
  | { readonly tipo: "sem-tabela"; readonly motivo: MotivoSemTabela };

/**
 * Decide, só pela idade em dias, qual tabela vale e com que chave lê-la. Separada da
 * leitura porque é aqui que moram as fronteiras — e fronteira errada é o modo de falha
 * que o roadmap §9 classifica como alto.
 */
function selecionar(indice: Indice, diasDeVida: number): Selecao {
  if (indice === "perimetro-cefalico-idade") {
    return diasDeVida > ULTIMO_DIA_DO_PERIMETRO_CEFALICO
      ? { tipo: "sem-tabela", motivo: "PERIMETRO_CEFALICO_ACIMA_DE_2_ANOS" }
      : { tipo: "selecionada", unidade: "dia", chave: diasDeVida };
  }

  if (diasDeVida <= ULTIMO_DIA_DA_TABELA_POR_DIA) {
    return { tipo: "selecionada", unidade: "dia", chave: diasDeVida };
  }

  const mes = mesCompletoDe(diasDeVida);
  return mes > ULTIMO_MES_DA_TABELA_POR_MES
    ? { tipo: "sem-tabela", motivo: "IDADE_ACIMA_DA_COBERTURA" }
    : { tipo: "selecionada", unidade: "mes", chave: mes };
}

/**
 * Lê o trio `L/M/S` da linha exata. `diasDeVida` chega inteiro e não negativo: a
 * validação (RN-11) já recusou data de nascimento posterior à medição, de modo que
 * o contrário aqui é bug interno, não fluxo esperado (ADR 0004).
 */
export function lerLms(
  indice: Indice,
  sexo: Sexo,
  diasDeVida: number,
  repositorio: RepositorioDeTabelasOms = REPOSITORIO_OMS,
): LeituraLms {
  if (!Number.isInteger(diasDeVida) || diasDeVida < 0) {
    throw new ErroDeInvariante(
      `Idade em dias deve ser inteira e não negativa; veio ${diasDeVida}`,
    );
  }

  const selecao = selecionar(indice, diasDeVida);
  if (selecao.tipo === "sem-tabela") return selecao;

  const tabela = repositorio.obter(indice, selecao.unidade, sexo);
  if (tabela === null) {
    throw new ErroDeInvariante(
      `Acervo sem tabela para ${indice}/${selecao.unidade}/${sexo}`,
    );
  }

  const posicao = selecao.chave - tabela.inicio;
  if (posicao < 0 || posicao > tabela.fim - tabela.inicio) {
    throw new ErroDeInvariante(
      `Chave ${selecao.chave} fora da tabela ${indice}/${selecao.unidade}/${sexo}, que cobre de ${tabela.inicio} a ${tabela.fim}`,
    );
  }

  return {
    tipo: "lida",
    parametros: {
      l: tabela.l[posicao],
      m: tabela.m[posicao],
      s: tabela.s[posicao],
    },
    unidade: selecao.unidade,
    chave: selecao.chave,
  };
}

function chaveDeAcervo(
  indice: Indice,
  unidade: UnidadeDaTabela,
  sexo: Sexo,
): string {
  return `${indice}:${unidade}:${sexo}`;
}

/**
 * Guarda contra dado gerado incoerente: unidade trocada ou array mais curto do que a
 * faixa declarada produziria escore silenciosamente errado, que é o pior modo de falha
 * desta feature. Devolve a própria tabela para poder compor na montagem do acervo.
 */
export function conferirTabela(
  tabela: TabelaLms,
  unidadeEsperada: UnidadeDaTabela,
  rotulo: string,
): TabelaLms {
  if (tabela.unidade !== unidadeEsperada) {
    throw new ErroDeInvariante(
      `Tabela ${rotulo}: unidade "${tabela.unidade}", esperada "${unidadeEsperada}"`,
    );
  }

  const linhas = tabela.fim - tabela.inicio + 1;
  if (
    tabela.l.length !== linhas ||
    tabela.m.length !== linhas ||
    tabela.s.length !== linhas
  ) {
    throw new ErroDeInvariante(
      `Tabela ${rotulo}: faixa ${tabela.inicio}–${tabela.fim} pede ${linhas} linhas, e os arrays têm ${tabela.l.length}/${tabela.m.length}/${tabela.s.length}`,
    );
  }

  return tabela;
}

interface DescritorDeTabela {
  readonly indice: Indice;
  readonly unidade: UnidadeDaTabela;
  readonly sexo: Sexo;
  readonly tabela: TabelaLms;
}

/**
 * As 14 combinações que a OMS publica dentro da cobertura da caderneta (D-04). Não há
 * perímetro cefálico por mês: a tabela da OMS termina aos 730 dias, e é isso que RN-08
 * traduz em recusa parcial.
 */
const DESCRITORES: readonly DescritorDeTabela[] = [
  {
    indice: "peso-idade",
    unidade: "dia",
    sexo: "masculino",
    tabela: PESO_IDADE_0_5_MASCULINO,
  },
  {
    indice: "peso-idade",
    unidade: "dia",
    sexo: "feminino",
    tabela: PESO_IDADE_0_5_FEMININO,
  },
  {
    indice: "peso-idade",
    unidade: "mes",
    sexo: "masculino",
    tabela: PESO_IDADE_5_10_MASCULINO,
  },
  {
    indice: "peso-idade",
    unidade: "mes",
    sexo: "feminino",
    tabela: PESO_IDADE_5_10_FEMININO,
  },
  {
    indice: "comprimento-estatura-idade",
    unidade: "dia",
    sexo: "masculino",
    tabela: COMPRIMENTO_ESTATURA_IDADE_0_5_MASCULINO,
  },
  {
    indice: "comprimento-estatura-idade",
    unidade: "dia",
    sexo: "feminino",
    tabela: COMPRIMENTO_ESTATURA_IDADE_0_5_FEMININO,
  },
  {
    indice: "comprimento-estatura-idade",
    unidade: "mes",
    sexo: "masculino",
    tabela: ESTATURA_IDADE_5_10_MASCULINO,
  },
  {
    indice: "comprimento-estatura-idade",
    unidade: "mes",
    sexo: "feminino",
    tabela: ESTATURA_IDADE_5_10_FEMININO,
  },
  {
    indice: "imc-idade",
    unidade: "dia",
    sexo: "masculino",
    tabela: IMC_IDADE_0_5_MASCULINO,
  },
  {
    indice: "imc-idade",
    unidade: "dia",
    sexo: "feminino",
    tabela: IMC_IDADE_0_5_FEMININO,
  },
  {
    indice: "imc-idade",
    unidade: "mes",
    sexo: "masculino",
    tabela: IMC_IDADE_5_10_MASCULINO,
  },
  {
    indice: "imc-idade",
    unidade: "mes",
    sexo: "feminino",
    tabela: IMC_IDADE_5_10_FEMININO,
  },
  {
    indice: "perimetro-cefalico-idade",
    unidade: "dia",
    sexo: "masculino",
    tabela: PERIMETRO_CEFALICO_IDADE_0_2_MASCULINO,
  },
  {
    indice: "perimetro-cefalico-idade",
    unidade: "dia",
    sexo: "feminino",
    tabela: PERIMETRO_CEFALICO_IDADE_0_2_FEMININO,
  },
];

const ACERVO: ReadonlyMap<string, TabelaLms> = new Map(
  DESCRITORES.map((d) => [
    chaveDeAcervo(d.indice, d.unidade, d.sexo),
    conferirTabela(
      d.tabela,
      d.unidade,
      chaveDeAcervo(d.indice, d.unidade, d.sexo),
    ),
  ]),
);

/** O acervo real, embarcado e versionado (D-03); padrão de `lerLms` e da fachada. */
export const REPOSITORIO_OMS: RepositorioDeTabelasOms = Object.freeze({
  obter(indice: Indice, unidade: UnidadeDaTabela, sexo: Sexo) {
    return ACERVO.get(chaveDeAcervo(indice, unidade, sexo)) ?? null;
  },
});
