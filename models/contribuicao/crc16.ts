// CRC16-CCITT/FALSE do BR Code (feature 019: RF-02; roadmap D-04).
// Parâmetros em `interfaces/br-code.md` §3: polinômio 0x1021, valor inicial
// 0xFFFF, sem reflexão de entrada ou de saída, sem xor final, saída em quatro
// dígitos hexadecimais MAIÚSCULOS.
//
// Arquivo próprio porque é a parte mais fácil de errar e a mais fácil de provar
// em isolamento: meia dúzia de variantes compartilham o mesmo polinômio e diferem
// só nos demais parâmetros, e todas produzem quatro dígitos plausíveis. O vetor
// conhecido ("123456789" produz 29B1) é o que distingue esta das outras.
//
// A ENTRADA INCLUI `6304`. Quem chama passa a cadeia já acrescida do
// identificador e do comprimento do próprio campo de verificação; apenas os
// quatro dígitos do valor ficam de fora. Calcular sem esse sufixo produz código
// que nenhum aplicativo aceita.

const POLINOMIO = 0x1021;
const VALOR_INICIAL = 0xffff;

/** Bytes UTF-8: o payload é ASCII por normalização, e isto o mantém correto se deixar de ser. */
const CODIFICADOR = new TextEncoder();

export function crc16(cadeia: string): string {
  let registro = VALOR_INICIAL;

  for (const octeto of CODIFICADOR.encode(cadeia)) {
    registro ^= octeto << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      registro =
        (registro & 0x8000) !== 0
          ? ((registro << 1) ^ POLINOMIO) & 0xffff
          : (registro << 1) & 0xffff;
    }
  }

  return registro.toString(16).toUpperCase().padStart(4, "0");
}
