// Montagem TLV do BR Code (feature 019: RF-01; roadmap D-03).
// O padrão EMV é uma sequência de triplas <id><comprimento><valor>, sem
// delimitador; subtemplates repetem a estrutura dentro do próprio valor.
// Expressá-lo como composição de uma função pura deixa cada campo legível ao
// lado da tabela do Banco Central, e o comprimento CALCULADO em vez de escrito à
// mão: é o número que o aplicativo do banco usa para fatiar a cadeia, e um
// literal errado ali produz código que se recusa em silêncio.

/** `campo("58", "BR")` produz `5802BR`. */
export function campo(id: string, valor: string): string {
  return `${id}${String(valor.length).padStart(2, "0")}${valor}`;
}

/** Agrupa triplas internas sob um identificador, declarando o comprimento do conjunto. */
export function subtemplate(id: string, internos: readonly string[]): string {
  return campo(id, internos.join(""));
}
