// Medidas antropométricas: conversão de posição e IMC (RF-08, RN-09; D-11, D-16).
// Feature 017-puericultura-crescimento.
//
// A regra da p. 85 da caderneta: criança menor de 2 anos mede-se DEITADA
// (comprimento); de 2 anos em diante, EM PÉ (estatura). Entre as duas posições há
// uma diferença sistemática de 0,7 cm, e a fonte manda converter antes de plotar —
// subtrair 0,7 de quem foi medido deitado com 2 anos ou mais, somar 0,7 a quem foi
// medido em pé antes disso.
//
// Duas escolhas governam este módulo:
//
//  1. **A conversão é declarada, nunca silenciosa** (RN-09). Ela altera o número que
//     produz o escore, e o médico tem de poder ver que ela ocorreu — sobretudo
//     porque a diferença de 0,7 cm desloca o escore de estatura de forma visível na
//     criança pequena. A posição é entrada obrigatória quando há medida: dado
//     clínico, não suposição.
//  2. **O IMC usa a medida JÁ convertida** (D-11). A tabela de IMC da OMS é indexada
//     pela mesma medida que a de estatura; usar a bruta num índice e a convertida no
//     outro produziria incoerência dentro do mesmo resultado.
//
// Sobre o ruído de ponto flutuante: `90 − 0,7` dá 89,30000000000001 em binário, e
// aqui ele NÃO é arredondado. A alternativa — devolver 89,3 redondo — implicaria
// escolher uma precisão de saída dentro do domínio, e o efeito da diferença sobre o
// escore z é da ordem de 1e-15. Quem arredonda é a apresentação; a mensagem do aviso
// já sai com uma casa decimal, que é a escala em que a medida foi tomada.
import { CONVERSAO_DE_POSICAO_EM_CM, FRONTEIRAS } from "./fonte-clinica";
import type { Aviso, EntradaAvaliacao, PosicaoDaMedicao } from "./tipos";

/** D-16: deitado até 730 dias, em pé de 731 em diante — o mesmo número de RN-08. */
export function posicaoEsperadaEm(diasDeVida: number): PosicaoDaMedicao {
  return diasDeVida <= FRONTEIRAS.doisAnosEmDias ? "deitado" : "em-pe";
}

function umaCasa(valor: number): string {
  return valor.toFixed(1).replace(".", ",");
}

export interface ComprimentoParaAvaliar {
  /** A medida na posição que a curva espera; igual à informada quando coincidem. */
  readonly valorCm: number;
  readonly aviso: Aviso | null;
}

/**
 * Converte a medida para a posição que a curva da idade espera. Quando a posição
 * informada já é a esperada, devolve a medida intacta e nenhum aviso.
 */
export function converterPosicao(
  comprimentoCm: number,
  posicaoInformada: PosicaoDaMedicao,
  diasDeVida: number,
): ComprimentoParaAvaliar {
  const esperada = posicaoEsperadaEm(diasDeVida);
  if (posicaoInformada === esperada) {
    return { valorCm: comprimentoCm, aviso: null };
  }

  const deitadoEmCriancaMaior = posicaoInformada === "deitado";
  const delta = deitadoEmCriancaMaior
    ? -CONVERSAO_DE_POSICAO_EM_CM
    : CONVERSAO_DE_POSICAO_EM_CM;
  const valorCm = comprimentoCm + delta;
  const sinal = deitadoEmCriancaMaior ? "subtraídos" : "somados";
  const contexto = deitadoEmCriancaMaior
    ? "aferida deitada em criança de 2 anos ou mais"
    : "aferida em pé em criança menor de 2 anos";

  return {
    valorCm,
    aviso: {
      campo: "comprimentoCm",
      codigo: "CONVERSAO_DE_POSICAO_APLICADA",
      mensagem: `Medida ${contexto}: ${sinal} ${umaCasa(CONVERSAO_DE_POSICAO_EM_CM)} cm antes de classificar (${umaCasa(comprimentoCm)} cm → ${umaCasa(valorCm)} cm), conforme a Caderneta da Criança, p. 85.`,
    },
  };
}

/** IMC em kg/m², sobre a medida já convertida (D-11). */
export function imcDe(pesoKg: number, comprimentoCm: number): number {
  const metros = comprimentoCm / 100;
  return pesoKg / (metros * metros);
}

export interface MedidasDerivadas {
  /** Ausente quando a medida não foi informada — RF-06 já na origem. */
  readonly comprimentoCm?: number;
  /** Ausente quando falta peso OU comprimento: o IMC depende dos dois. */
  readonly imc?: number;
  /** Vazio quando nenhuma conversão foi necessária. */
  readonly avisos: readonly Aviso[];
}

/**
 * Deriva o que os índices vão consumir. A posição chega presente sempre que há
 * comprimento — a validação (RN-11) trata a sua falta como ofensor —, de modo que
 * assumir uma posição aqui seria justamente o default silencioso que RN-09 proíbe.
 */
export function derivarMedidas(
  entrada: EntradaAvaliacao,
  diasDeVida: number,
): MedidasDerivadas {
  const { comprimentoCm, posicaoDaMedicao, pesoKg } = entrada;
  if (comprimentoCm === undefined || posicaoDaMedicao === undefined) {
    return { avisos: [] };
  }

  const convertido = converterPosicao(
    comprimentoCm,
    posicaoDaMedicao,
    diasDeVida,
  );
  const avisos = convertido.aviso === null ? [] : [convertido.aviso];

  return {
    comprimentoCm: convertido.valorCm,
    imc: pesoKg === undefined ? undefined : imcDe(pesoKg, convertido.valorCm),
    avisos,
  };
}
