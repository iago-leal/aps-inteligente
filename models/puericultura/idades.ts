// Idades derivadas da criança (RF-05, RF-16, RF-17; RN-10, RN-15 a RN-17).
// Cada regra temporal da caderneta vira um campo inspecionável de `IdadesDerivadas`,
// em vez de ficar espalhada pelo cálculo: quem audita um escore precisa poder ver,
// separadamente, quantos dias a criança tem, quanto lhe foi descontado e por quê.
// Feature 017-puericultura-crescimento.
//
// As três idades e para que serve cada uma:
//
//  · CRONOLÓGICA (`diasDeVida`) — o tempo desde o nascimento. Governa o escopo da
//    fonte (RN-08), a posição de medida (RN-09) e até quando a correção vale (RN-16).
//  · CORRIGIDA (`diasCorrigidos`) — a cronológica menos o desconto de prematuridade.
//    É a que indexa as curvas da OMS num RNPT dentro do período de correção.
//  · PÓS-MENSTRUAL (`semanasPosMenstruais`) — IG ao nascer mais o tempo de vida. É a
//    que indexa as curvas INTERGROWTH-21st, e a que decide se elas ainda valem.
//
// A idade que efetivamente indexou a curva sai declarada na saída (RF-20), porque
// duas crianças com o mesmo peso e a mesma data de nascimento recebem escores
// diferentes por terem nascido em idades gestacionais distintas.
import { diferencaEmDias } from "./datas";
import { FRONTEIRAS } from "./fonte-clinica";
import {
  ErroDeInvariante,
  type EntradaAvaliacao,
  type IdadeGestacional,
  type IdadesDerivadas,
} from "./tipos";

const DIAS_POR_SEMANA = 7;

/** IG ao nascer em dias — semanas completas mais os dias soltos (RN-15). */
export function idadeGestacionalEmDias(ig: IdadeGestacional): number {
  return ig.semanas * DIAS_POR_SEMANA + ig.dias;
}

/** IG ao nascer em semanas exatas, fracionárias; é a escala em que a fonte fala. */
export function idadeGestacionalEmSemanas(ig: IdadeGestacional): number {
  return idadeGestacionalEmDias(ig) / DIAS_POR_SEMANA;
}

/**
 * RN-15: pré-termo é IG ao nascer < 37 semanas. IG ausente NÃO é pré-termo — é
 * criança tratada como termo, e essa premissa é declarada no resultado, jamais
 * silenciada.
 */
export function ehPreTermo(ig: IdadeGestacional | undefined): boolean {
  return (
    ig !== undefined &&
    idadeGestacionalEmSemanas(ig) < FRONTEIRAS.igDeTermoEmSemanas
  );
}

/**
 * RN-16: o desconto que a caderneta manda aplicar, em dias — "40 semanas menos a IG
 * do nascimento". Zero para quem nasceu a termo ou sem IG informada.
 */
function descontoEmDias(ig: IdadeGestacional | undefined): number {
  if (ig === undefined || !ehPreTermo(ig)) return 0;
  return (
    FRONTEIRAS.semanasDeTermo * DIAS_POR_SEMANA - idadeGestacionalEmDias(ig)
  );
}

/**
 * RN-16: até quando a correção vale. Dois anos de idade CRONOLÓGICA, ou três quando
 * a IG ao nascer for menor que 28 semanas. Ultrapassado o limite, a leitura volta à
 * idade cronológica pura — e é isso que impede um prematuro de carregar desconto
 * pela vida inteira.
 */
function correcaoAindaVale(
  ig: IdadeGestacional | undefined,
  diasDeVida: number,
): boolean {
  if (ig === undefined || !ehPreTermo(ig)) return false;
  const limite =
    idadeGestacionalEmSemanas(ig) < FRONTEIRAS.igQueEstendeACorrecaoEmSemanas
      ? FRONTEIRAS.correcaoEstendidaAteEmDias
      : FRONTEIRAS.correcaoAteEmDias;
  return diasDeVida <= limite;
}

/**
 * RN-17: idade pós-menstrual em semanas exatas — IG ao nascer mais o tempo de vida.
 * `null` para quem é tratado como termo: a grandeza existe para todos, mas só tem
 * uso clínico onde as curvas de pré-termo podem valer, e devolvê-la fora disso
 * convidaria a usá-la onde a fonte não a usa.
 */
function semanasPosMenstruais(
  ig: IdadeGestacional | undefined,
  diasDeVida: number,
): number | null {
  if (ig === undefined || !ehPreTermo(ig)) return null;
  return (idadeGestacionalEmDias(ig) + diasDeVida) / DIAS_POR_SEMANA;
}

/**
 * Deriva as três idades. As datas chegam válidas — a validação (RN-11) já recusou
 * formato impossível e medição anterior ao nascimento —, de modo que o contrário
 * aqui é bug interno, não fluxo esperado (ADR 0004).
 */
export function derivarIdades(entrada: EntradaAvaliacao): IdadesDerivadas {
  const diasDeVida = diferencaEmDias(
    entrada.dataDeNascimento,
    entrada.dataDaMedicao,
  );
  if (diasDeVida === null || diasDeVida < 0) {
    throw new ErroDeInvariante(
      `Datas inválidas ou fora de ordem: nascimento ${entrada.dataDeNascimento}, medição ${entrada.dataDaMedicao}`,
    );
  }

  const ig = entrada.idadeGestacionalAoNascer;
  const desconto = descontoEmDias(ig);
  const correcaoAtiva = correcaoAindaVale(ig, diasDeVida);

  return {
    diasDeVida,
    descontoDeSemanas: desconto / DIAS_POR_SEMANA,
    diasCorrigidos: correcaoAtiva ? diasDeVida - desconto : diasDeVida,
    correcaoAtiva,
    semanasPosMenstruais: semanasPosMenstruais(ig, diasDeVida),
  };
}
