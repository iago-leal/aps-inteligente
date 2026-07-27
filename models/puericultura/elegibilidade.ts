// Recusa honesta quando a criança está fora do que a fonte cobre (RF-07, RN-08,
// RN-18; D-15, D-16). Aplicação direta de MD-0009 (`domain.md` §8): cenário
// plausível fora da cobertura produz recusa declarada, jamais extrapolação.
// Molde de `models/risco-cardiovascular/elegibilidade.ts`, com uma novidade que
// aquele não tem. Feature 017-puericultura-crescimento.
//
// **Duas espécies de recusa**, e a distinção é o que esta unit acrescenta ao molde:
//
//  · GLOBAL — a criança inteira está fora da fonte. Nenhum índice é calculado e
//    nenhum número aparece em tela. É o caso da idade acima da cobertura (D-15) e do
//    recém-nascido abaixo da curva de pré-termo (RN-18).
//  · PARCIAL — só um índice está fora. O perímetro cefálico da OMS termina aos 730
//    dias, mas peso, estatura e IMC seguem calculáveis até os dez anos. Derrubar o
//    resultado inteiro por causa dele seria recusar o que a fonte responde.
//
// Qual idade decide: a que INDEXA a curva, isto é, a corrigida enquanto a correção
// vale e a cronológica depois (`idades.diasCorrigidos` já é essa resolução). O
// escopo é propriedade da tabela que se vai ler, não da criança em abstrato.
import {
  JANELA_PRETERMO_EM_SEMANAS,
  REFERENCIAS,
  referencia,
} from "./fonte-clinica";
import {
  ULTIMO_DIA_COBERTO,
  ULTIMO_DIA_DO_PERIMETRO_CEFALICO,
} from "./oms/leitura";
import type {
  ForaDoEscopoDaFonte,
  IdadesDerivadas,
  IndiceForaDoEscopo,
} from "./tipos";

/** Anos aproximados, só para a mensagem: o corte real é o número de dias. */
function emAnosEMeses(dias: number): string {
  const anos = Math.floor(dias / 365);
  const meses = Math.floor((dias - anos * 365) / 30.4375);
  return meses === 0 ? `${anos} anos` : `${anos} anos e ${meses} meses`;
}

/**
 * Recusa GLOBAL, ou `null` quando a criança está dentro da cobertura. A fronteira de
 * pré-termo vem primeiro porque, abaixo de 27 semanas pós-menstruais, não existe
 * régua alguma — nem a da OMS, que pressupõe o nascimento a termo, nem a do
 * INTERGROWTH-21st, que começa ali.
 */
export function foraDoEscopo(
  idades: IdadesDerivadas,
): ForaDoEscopoDaFonte | null {
  const posMenstruais = idades.semanasPosMenstruais;
  if (posMenstruais !== null && posMenstruais < JANELA_PRETERMO_EM_SEMANAS.de) {
    return {
      tipo: "fora-do-escopo",
      motivo: "ABAIXO_DA_CURVA_DE_PRETERMO",
      mensagem: `Idade pós-menstrual de ${posMenstruais.toFixed(1).replace(".", ",")} semanas: as curvas de crescimento para nascidos pré-termo começam em ${JANELA_PRETERMO_EM_SEMANAS.de} semanas. A fonte não publica referência abaixo disso, e estimá-la seria inventar curva para o recém-nascido mais frágil.`,
      referencia: REFERENCIAS.preTermo,
    };
  }

  if (idades.diasCorrigidos > ULTIMO_DIA_COBERTO) {
    return {
      tipo: "fora-do-escopo",
      motivo: "IDADE_FORA_DA_COBERTURA",
      mensagem: `Idade de ${emAnosEMeses(idades.diasCorrigidos)}: a Caderneta da Criança acompanha o crescimento de 0 a 10 anos, e os gráficos terminam no mês 120. Nenhum escore é estimado além da última linha publicada.`,
      referencia: REFERENCIAS.cobertura,
    };
  }

  return null;
}

/**
 * Recusa PARCIAL do perímetro cefálico (RN-08, D-16), ou `null` quando ele ainda é
 * calculável. Devolve a variante de ÍNDICE, e não a de saída: é isso que o mantém
 * incapaz de derrubar os demais.
 */
export function perimetroCefalicoForaDoEscopo(
  idades: IdadesDerivadas,
): IndiceForaDoEscopo | null {
  if (idades.diasCorrigidos <= ULTIMO_DIA_DO_PERIMETRO_CEFALICO) return null;

  return {
    estado: "fora-do-escopo",
    indice: "perimetro-cefalico-idade",
    motivo: "PC_ACIMA_DE_2_ANOS",
    mensagem:
      "O gráfico de perímetro cefálico da Caderneta da Criança cobre de 0 a 2 anos. Acima dessa idade a fonte não publica referência, e os demais índices seguem válidos.",
    referencia: referencia(
      "p. 88, gráfico de perímetro cefálico para idade de 0 a 2 anos",
    ),
  };
}
