// Construtores de entradas de teste e narrowing da union de saída do motor.
// Consumido pelos testes de unidade e de integração (T007..T014).
import type {
  AplicacaoInsulina,
  EntradaCalculo,
  ErroValidacao,
  EsquemaInsulina,
  ForaDoEscopoDaFonte,
  GlicemiaAferida,
  MomentoAfericao,
  MomentoAplicacao,
  ResultadoInicio,
  ResultadoTitulacao,
  SaidaCalculo,
} from "@/dominio/insulina/tipos";

export function jejum(...valores: number[]): GlicemiaAferida[] {
  return valores.map((valorMgDl) => ({ valorMgDl, momento: "jejum" as const }));
}

export function afericao(
  momento: MomentoAfericao,
  ...valores: number[]
): GlicemiaAferida[] {
  return valores.map((valorMgDl) => ({ valorMgDl, momento }));
}

export function nph(
  doseUi: number,
  momento: MomentoAplicacao = "ao_deitar",
): AplicacaoInsulina {
  return { insulina: "NPH", momento, doseUi };
}

export function regular(
  doseUi: number,
  momento: MomentoAplicacao,
): AplicacaoInsulina {
  return { insulina: "Regular", momento, doseUi };
}

export function esquemaBasal(
  doseUi: number,
  momento: MomentoAplicacao = "ao_deitar",
): EsquemaInsulina {
  return { tipo: "basal", aplicacoes: [nph(doseUi, momento)] };
}

export function esquema(
  tipo: EsquemaInsulina["tipo"],
  ...aplicacoes: AplicacaoInsulina[]
): EsquemaInsulina {
  return { tipo, aplicacoes };
}

export function entradaInicio(
  pesoKg = 80,
  extras: Partial<EntradaCalculo> = {},
): EntradaCalculo {
  return { modo: "inicio", pesoKg, glicemias: [], ...extras };
}

export function entradaTitulacao(
  esquemaAtual: EsquemaInsulina,
  glicemias: GlicemiaAferida[],
  extras: Partial<EntradaCalculo> = {},
): EntradaCalculo {
  return { modo: "titulacao", pesoKg: 80, glicemias, esquemaAtual, ...extras };
}

function falhaDeNarrowing(esperado: string, saida: SaidaCalculo): never {
  throw new Error(
    `Esperava ${esperado}, veio: ${JSON.stringify(saida).slice(0, 300)}`,
  );
}

export function comoResultadoInicio(saida: SaidaCalculo): ResultadoInicio {
  if (saida.tipo !== "resultado" || saida.modo !== "inicio") {
    falhaDeNarrowing("ResultadoInicio", saida);
  }
  return saida;
}

export function comoResultadoTitulacao(
  saida: SaidaCalculo,
): ResultadoTitulacao {
  if (saida.tipo !== "resultado" || saida.modo !== "titulacao") {
    falhaDeNarrowing("ResultadoTitulacao", saida);
  }
  return saida;
}

export function comoErroValidacao(saida: SaidaCalculo): ErroValidacao {
  if (saida.tipo !== "erro-validacao") falhaDeNarrowing("ErroValidacao", saida);
  return saida;
}

export function comoForaDoEscopo(saida: SaidaCalculo): ForaDoEscopoDaFonte {
  if (saida.tipo !== "fora-do-escopo")
    falhaDeNarrowing("ForaDoEscopoDaFonte", saida);
  return saida;
}

export function doseDe(
  resultado: ResultadoTitulacao,
  insulina: AplicacaoInsulina["insulina"],
  momento: MomentoAplicacao,
): number {
  const aplicacao = resultado.esquemaSugerido.find(
    (a) => a.insulina === insulina && a.momento === momento,
  );
  if (!aplicacao) {
    throw new Error(
      `Sem aplicação ${insulina} ${momento} em: ${JSON.stringify(resultado.esquemaSugerido)}`,
    );
  }
  return aplicacao.doseUi;
}

export function codigosDe(erro: ErroValidacao): string[] {
  return erro.ofensores.map((o) => o.codigo);
}

export function tiposDeRecomendacao(
  r: ResultadoInicio | ResultadoTitulacao,
): string[] {
  return r.recomendacoesAoPrescritor.map((rec) => rec.tipo);
}

export function tiposDeAlerta(
  r: ResultadoInicio | ResultadoTitulacao,
): string[] {
  return r.alertas.map((a) => a.tipo);
}
