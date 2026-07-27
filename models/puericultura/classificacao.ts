// Classificação literal por índice e faixa etária (RF-04; RN-04 a RN-07).
// Feature 017-puericultura-crescimento.
//
// Duas trocas de conjunto acontecem com a idade, e nenhuma delas é cosmética:
//
//  1. **O IMC troca de NOMENCLATURA aos 5 anos** (1826 dias). O mesmo escore z de
//     +2,5 é "Sobrepeso" numa criança de 4 anos e "Obesidade" numa de 6 — os três
//     rótulos superiores deslizam um degrau. É a armadilha central da fonte, e errá-la
//     produz laudo nutricional trocado sem que nenhum número pareça errado.
//  2. **O comprimento troca de SUBSTANTIVO aos 2 anos** (730 dias): a caderneta
//     imprime "Comprimento" nos gráficos de 0 a 2 anos e "Estatura" a partir daí, na
//     mesma fronteira em que troca a posição de medida (D-16). Achado da transcrição
//     de T023 — o plano só antecipava a troca do IMC.
//
// Esta é a fronteira DE RÓTULO. A fronteira DE TABELA, aos 1856 dias, mora em
// `oms/leitura.ts` e de propósito não coincide com esta: entre 1826 e 1856 dias vale
// a tabela de 0 a 5 anos com os rótulos de 5 a 10 (D-05). Alinhá-las produziria ora
// rótulo trocado, ora buraco de cobertura de 30 dias.
import {
  CORTES_COMPRIMENTO,
  CORTES_ESTATURA,
  CORTES_IMC_ATE_5_ANOS,
  CORTES_IMC_DE_5_A_10_ANOS,
  CORTES_PERIMETRO_CEFALICO,
  CORTES_PESO,
  FRONTEIRAS,
  type CorteDeClassificacao,
} from "./fonte-clinica";
import { ErroDeInvariante, type Indice } from "./tipos";

/**
 * O conjunto de rótulos que vale para o índice naquela idade. `diasParaRotulo` é a
 * idade que INDEXA a curva — corrigida quando a correção vale (premissa do roadmap
 * §4): num prematuro entre 4a11m e 5a de idade corrigida, usar a cronológica tiraria
 * o rótulo da faixa errada da fonte.
 */
export function cortesDe(
  indice: Indice,
  diasParaRotulo: number,
): readonly CorteDeClassificacao[] {
  switch (indice) {
    case "peso-idade":
      return CORTES_PESO;
    case "comprimento-estatura-idade":
      return diasParaRotulo <= FRONTEIRAS.doisAnosEmDias
        ? CORTES_COMPRIMENTO
        : CORTES_ESTATURA;
    case "imc-idade":
      return diasParaRotulo < FRONTEIRAS.cincoAnosEmDias
        ? CORTES_IMC_ATE_5_ANOS
        : CORTES_IMC_DE_5_A_10_ANOS;
    case "perimetro-cefalico-idade":
      return CORTES_PERIMETRO_CEFALICO;
  }
}

function satisfaz(corte: CorteDeClassificacao, escoreZ: number): boolean {
  switch (corte.tipo) {
    case "acimaDe":
      return escoreZ > corte.z;
    case "aPartirDe":
      return escoreZ >= corte.z;
    case "abaixoDeTudo":
      return true;
  }
}

/**
 * O rótulo literal da caderneta para o escore. Percorre os cortes na ordem impressa,
 * do maior para o menor, e devolve o primeiro que o escore satisfaz — de modo que a
 * faixa fechada de cada rótulo nasce da ordem, sem repetir o limite superior em
 * cada linha (onde ele poderia divergir do inferior da linha de cima).
 */
export function classificar(
  indice: Indice,
  escoreZ: number,
  diasParaRotulo: number,
): string {
  if (!Number.isFinite(escoreZ)) {
    throw new ErroDeInvariante(
      `Escore z não finito ao classificar ${indice}: ${escoreZ}`,
    );
  }

  const corte = cortesDe(indice, diasParaRotulo).find((c) =>
    satisfaz(c, escoreZ),
  );
  if (corte === undefined) {
    // Impossível por construção: todo conjunto termina em `abaixoDeTudo`.
    throw new ErroDeInvariante(
      `Conjunto de cortes de ${indice} sem faixa final para o escore ${escoreZ}`,
    );
  }
  return corte.rotulo;
}
