// A escolha da régua: INTERGROWTH-21st ou OMS (RF-18, RF-19; RN-17, RN-19; D-01).
// Feature 017-puericultura-crescimento.
//
// Este é o ÚNICO ponto de fronteira entre as duas famílias de curvas, e existir num
// arquivo só é a razão de ser de D-01. Espalhar a decisão por `if` dentro de cada
// índice a tornaria inauditável — e ela é a decisão de maior consequência clínica do
// motor, porque a mesma criança recebe escores diferentes conforme a régua.
//
// A regra vem da p. 87 da caderneta: enquanto o pré-termo estiver entre 27 e 64
// semanas pós-menstruais, valem as curvas de pré-termo; passadas as 64, "o
// acompanhamento das crianças deve ser transferido para as curvas da OMS/MS", sobre
// idade corrigida. A escolha é por CRIANÇA, não por índice: uma criança não pode ter
// o peso lido numa régua e o comprimento noutra.
import { JANELA_PRETERMO_EM_SEMANAS } from "./fonte-clinica";
import {
  ErroDeInvariante,
  type IdadeUsada,
  type IdadesDerivadas,
} from "./tipos";

export type EscolhaDePadrao =
  | {
      readonly padrao: "INTERGROWTH-21st";
      /** Semanas pós-menstruais exatas; a curva é contínua e não precisa de linha. */
      readonly semanasPosMenstruais: number;
      readonly idadeUsada: IdadeUsada;
    }
  | {
      readonly padrao: "OMS";
      /** A idade que indexa a tabela: corrigida enquanto a correção vale. */
      readonly diasParaLeitura: number;
      readonly idadeUsada: IdadeUsada;
    };

/**
 * Decide a régua. Pressupõe que a elegibilidade já correu: abaixo de 27 semanas
 * pós-menstruais não existe régua alguma, e a recusa global é de `elegibilidade.ts`
 * (RN-18). Chegar aqui com esse caso é bug interno, não fluxo esperado (ADR 0004).
 */
export function escolherPadrao(idades: IdadesDerivadas): EscolhaDePadrao {
  const posMenstruais = idades.semanasPosMenstruais;

  if (posMenstruais !== null) {
    if (posMenstruais < JANELA_PRETERMO_EM_SEMANAS.de) {
      throw new ErroDeInvariante(
        `Idade pós-menstrual de ${posMenstruais} semanas está abaixo da curva de pré-termo; a recusa é de elegibilidade.ts`,
      );
    }

    if (posMenstruais <= JANELA_PRETERMO_EM_SEMANAS.ate) {
      return {
        padrao: "INTERGROWTH-21st",
        semanasPosMenstruais: posMenstruais,
        idadeUsada: {
          especie: "pos-menstrual",
          valor: posMenstruais,
          unidade: "semana",
        },
      };
    }
  }

  // Fora da janela do pré-termo — ou porque a criança é a termo, ou porque já a
  // ultrapassou. A idade que indexa a OMS é a corrigida enquanto a correção vale
  // (RN-16), e `diasCorrigidos` já traz essa resolução.
  return {
    padrao: "OMS",
    diasParaLeitura: idades.diasCorrigidos,
    idadeUsada: {
      especie: idades.correcaoAtiva ? "corrigida" : "cronologica",
      valor: idades.diasCorrigidos,
      unidade: "dia",
      ...(idades.correcaoAtiva
        ? { descontoDeSemanas: idades.descontoDeSemanas }
        : {}),
    },
  };
}
