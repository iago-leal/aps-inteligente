// Apoio de teste da ficha de consulta (feature 020, ações T008 a T013), no molde de
// `tests/apoio/puericultura.ts`. Duas coisas: fichas SINTÉTICAS, que exercitam as regras
// de seleção e de montagem sem carregar os trezentos e cinquenta rótulos do acervo real, e
// construtores de contexto e preenchimento.
//
// A ficha sintética é o que separa o teste de uma regra do peso do dado citado: conferir
// que seção vazia é omitida não deveria depender de qual campo a caderneta imprime no 4.º
// mês. O acervo real tem oráculo próprio, e é o de T007.
import { derivarIdades } from "models/puericultura/idades";
import type {
  Campo,
  ContextoDaConsulta,
  Ficha,
  Preenchimento,
  Resposta,
  SecaoDaFicha,
  SecaoSoap,
} from "models/puericultura/consulta/tipos";
import type {
  IdadeGestacional,
  PosicaoDaMedicao,
  Sexo,
} from "models/puericultura/tipos";

const PAGINA_SINTETICA = 70;

export function marcacao(
  id: string,
  rotulo: string,
  secaoSoap: SecaoSoap,
  extras: Partial<Campo> = {},
): Campo {
  return {
    id,
    rotulo,
    secaoSoap,
    pagina: PAGINA_SINTETICA,
    natureza: "marcacao",
    ...extras,
  } as Campo;
}

export function texto(id: string, rotulo: string, secaoSoap: SecaoSoap): Campo {
  return {
    id,
    rotulo,
    secaoSoap,
    pagina: PAGINA_SINTETICA,
    natureza: "texto",
  };
}

export function escolha(
  id: string,
  rotulo: string,
  secaoSoap: SecaoSoap,
  opcoes: readonly string[],
): Campo {
  return {
    id,
    rotulo,
    secaoSoap,
    pagina: PAGINA_SINTETICA,
    natureza: "escolha",
    opcoes,
  };
}

export function medida(
  id: string,
  rotulo: string,
  unidade: "g" | "cm",
  vinculoAntropometrico?: "peso" | "comprimento" | "perimetroCefalico",
): Campo {
  return {
    id,
    rotulo,
    secaoSoap: "O",
    pagina: PAGINA_SINTETICA,
    natureza: "medida",
    unidade,
    ...(vinculoAntropometrico === undefined ? {} : { vinculoAntropometrico }),
  };
}

export function secao(
  numero: number,
  titulo: string,
  campos: readonly Campo[],
): SecaoDaFicha {
  return { numero, titulo, campos };
}

export function fichaSintetica(
  secoes: readonly SecaoDaFicha[],
  extras: Partial<Ficha> = {},
): Ficha {
  return {
    id: "ficha-sintetica",
    titulo: "Consulta sintética",
    pagina: PAGINA_SINTETICA,
    faixaEmDias: { de: 0, ate: 30 },
    secoes,
    ...extras,
  };
}

export function preenchimento(
  entradas: Readonly<Record<string, Resposta>>,
): Preenchimento {
  return new Map(Object.entries(entradas));
}

export function sim(): Resposta {
  return { natureza: "marcacao", valor: "sim" };
}

export function nao(): Resposta {
  return { natureza: "marcacao", valor: "nao" };
}

export function livre(texto: string): Resposta {
  return { natureza: "texto", texto };
}

export function opcaoDe(opcao: string, complemento?: string): Resposta {
  return {
    natureza: "escolha",
    opcao,
    ...(complemento === undefined ? {} : { complemento }),
  };
}

export function medidaDe(bruto: string): Resposta {
  return { natureza: "medida", bruto };
}

export interface FormaDoContexto {
  readonly sexo?: Sexo;
  readonly dataDeNascimento?: string;
  readonly dataDaConsulta?: string;
  readonly idadeGestacionalAoNascer?: IdadeGestacional;
  readonly posicaoDaMedicao?: PosicaoDaMedicao;
}

/** As idades vêm de `derivarIdades` da 017 — nenhuma aritmética de datas nova (D-01). */
export function contexto({
  sexo = "masculino",
  dataDeNascimento = "2026-03-10",
  dataDaConsulta = "2026-07-20",
  idadeGestacionalAoNascer,
  posicaoDaMedicao,
}: FormaDoContexto = {}): ContextoDaConsulta {
  return {
    sexo,
    dataDeNascimento,
    dataDaConsulta,
    ...(idadeGestacionalAoNascer === undefined
      ? {}
      : { idadeGestacionalAoNascer }),
    ...(posicaoDaMedicao === undefined ? {} : { posicaoDaMedicao }),
    idades: derivarIdades({
      sexo,
      dataDeNascimento,
      dataDaMedicao: dataDaConsulta,
      ...(idadeGestacionalAoNascer === undefined
        ? {}
        : { idadeGestacionalAoNascer }),
    }),
  };
}
