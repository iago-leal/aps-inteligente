// Escore z pelo método LMS e a correção de cauda da OMS (RF-02, RF-03; RN-02, RN-03;
// D-10, D-10.1). Feature 017-puericultura-crescimento.
//
// O método LMS de Cole descreve a distribuição do indicador em cada idade por três
// parâmetros — `L` (assimetria), `M` (mediana) e `S` (coeficiente de variação) — e
// converte medida em escore por
//
//     z = ((X/M)^L − 1) / (L·S)     quando L ≠ 0
//     z = ln(X/M) / S               quando L = 0
//
// A CORREÇÃO DE CAUDA é o procedimento oficial da OMS para os indicadores baseados
// em peso, e só para eles: quando |z| passa de 3, o escore é recalculado por
// extrapolação linear a partir do último ponto confiável da curva, no passo que
// separa os desvios 2 e 3 daquele lado. Sem ela, a assimetria da distribuição do
// peso produz escores irrealistas justamente na desnutrição e na obesidade graves —
// onde a decisão clínica é mais consequente. Omiti-la desloca o escore em até 10,4
// unidades de IMC (medição de T008).
//
// A QUEM ELA NÃO SE APLICA — e por que o dado real não prova essa metade. Em
// comprimento/estatura-para-idade e perímetro cefálico-para-idade, `L = 1` em todas
// as 14 tabelas da OMS, e com `L = 1` a própria LMS já é linear em `z`, de passo
// exatamente `SD3 − SD2`. Corrigir e não corrigir dão o mesmo número, com diferença
// medida de 1e-14. O dado real é SILENCIOSO a respeito (D-10.1): a prova de que a
// cauda não se aplica a esses dois vive em acervo sintético com `L ≠ 1`, e não aqui.
import { ErroDeInvariante, type Indice } from "../tipos";
import type { ParametrosLms } from "./leitura";

/** RN-03: além deste desvio, os indicadores com cauda deixam a LMS e extrapolam. */
export const FRONTEIRA_DA_CAUDA = 3;

/**
 * D-10: os dois indicadores baseados em peso. A lista é dado, não `if`, para que a
 * pergunta "a cauda vale para este índice?" tenha um lugar só onde ser respondida —
 * e para que a sabotagem dela num teste seja possível e visível.
 */
export const INDICES_COM_CORRECAO_DE_CAUDA: readonly Indice[] = Object.freeze([
  "peso-idade",
  "imc-idade",
]);

export function aplicaCorrecaoDeCauda(indice: Indice): boolean {
  return INDICES_COM_CORRECAO_DE_CAUDA.includes(indice);
}

/** Escore z pelo LMS, sem correção alguma. */
export function escoreLms(medida: number, { l, m, s }: ParametrosLms): number {
  if (!Number.isFinite(medida) || medida <= 0) {
    throw new ErroDeInvariante(
      `Medida deve ser um número positivo para o cálculo LMS; veio ${medida}`,
    );
  }
  return l === 0
    ? Math.log(medida / m) / s
    : (Math.pow(medida / m, l) - 1) / (l * s);
}

/**
 * A inversa: a medida que corresponde ao escore `z` naquela linha — o `SDn` que as
 * tabelas expandidas da OMS publicam. É o que dá os dois pontos de apoio da cauda.
 */
export function medidaEmZ(z: number, { l, m, s }: ParametrosLms): number {
  return l === 0 ? m * Math.exp(s * z) : m * Math.pow(1 + l * s * z, 1 / l);
}

/**
 * Extrapolação linear além de ±3, na razão `SD3 − SD2` do lado correspondente
 * (RN-03). Os denominadores são positivos nos dois lados, de modo que o sinal da
 * distância se preserva — é aqui que um erro de implementação passa despercebido,
 * porque um escore de −4,2 trocado por +4,2 continua parecendo um número plausível.
 */
function escoreNaCauda(
  medida: number,
  parametros: ParametrosLms,
  sinal: 1 | -1,
): number {
  const borda = medidaEmZ(sinal * FRONTEIRA_DA_CAUDA, parametros);
  const anterior = medidaEmZ(sinal * (FRONTEIRA_DA_CAUDA - 1), parametros);
  const passo = sinal === 1 ? borda - anterior : anterior - borda;

  if (passo <= 0) {
    throw new ErroDeInvariante(
      `Passo de cauda não positivo (${passo}) em L=${parametros.l}, M=${parametros.m}, S=${parametros.s}`,
    );
  }

  return sinal * FRONTEIRA_DA_CAUDA + (medida - borda) / passo;
}

/**
 * O escore z que o índice devolve: LMS puro, com a cauda aplicada onde a OMS a
 * prevê. `aplicaCauda` chega decidido de fora (por `aplicaCorrecaoDeCauda`) para que
 * o teste possa exercitar as duas metades da regra sobre a mesma linha de dados.
 */
export function escoreZ(
  medida: number,
  parametros: ParametrosLms,
  aplicaCauda: boolean,
): number {
  const bruto = escoreLms(medida, parametros);
  if (!aplicaCauda || Math.abs(bruto) <= FRONTEIRA_DA_CAUDA) return bruto;
  return escoreNaCauda(medida, parametros, bruto > 0 ? 1 : -1);
}
