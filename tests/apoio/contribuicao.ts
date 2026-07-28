// Apoio dos testes do domínio de contribuição (feature 019, T003), no molde de
// `tests/apoio/puericultura.ts`: construtor de entrada válida com sobreposição
// por campo e narrowing da união de saída.
//
// Desvio declarado do `actions.md`: a ação previa acrescentar o construtor a
// `tests/apoio/construtores.ts`, que é declaradamente de insulina. Arquivo
// próprio por domínio é o precedente que já existe, e evita que um módulo não
// clínico entre no apoio de um motor clínico.
import type {
  OfensorPix,
  ParametrosPix,
  SaidaBrCode,
} from "models/contribuicao/tipos";

/** Parâmetros válidos por construção; qualquer campo pode ser sobreposto. */
export function parametros(extras: Partial<ParametrosPix> = {}): ParametrosPix {
  return {
    chave: "00000000-0000-0000-0000-000000000000",
    nomeBeneficiario: "FULANO DE TAL",
    cidade: "GOIANIA",
    ...extras,
  };
}

export function comoOk(saida: SaidaBrCode): string {
  if (saida.tipo !== "ok") {
    throw new Error(
      `Esperava payload, veio: ${JSON.stringify(saida).slice(0, 300)}`,
    );
  }
  return saida.payload;
}

export function comoOfensores(saida: SaidaBrCode): readonly OfensorPix[] {
  if (saida.tipo !== "ParametroInvalido") {
    throw new Error(
      `Esperava ParametroInvalido, veio: ${JSON.stringify(saida).slice(0, 300)}`,
    );
  }
  return saida.ofensores;
}

export function codigos(saida: SaidaBrCode): string[] {
  return comoOfensores(saida).map((ofensor) => ofensor.codigo);
}

/**
 * Lê a cadeia TLV como lista de triplas do primeiro nível. Serve de decodificador
 * INDEPENDENTE da montagem: percorre o payload sem saber como ele foi gerado,
 * o que é o mínimo para um teste não provar apenas que o código concorda consigo
 * mesmo.
 */
export function lerCampos(payload: string): Map<string, string> {
  const campos = new Map<string, string>();
  let posicao = 0;
  while (posicao < payload.length) {
    const id = payload.slice(posicao, posicao + 2);
    const comprimento = Number(payload.slice(posicao + 2, posicao + 4));
    if (id.length < 2 || !Number.isInteger(comprimento)) {
      throw new Error(`TLV malformado na posição ${posicao}: ${payload}`);
    }
    campos.set(id, payload.slice(posicao + 4, posicao + 4 + comprimento));
    posicao += 4 + comprimento;
  }
  return campos;
}
