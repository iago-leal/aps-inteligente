// Fonte clínica da ficha de consulta de puericultura (feature 020: RF-12, RN-01 a RN-03,
// RN-08, RN-09, RN-13). É a MESMA fonte editorial da feature 017 — Caderneta da Criança,
// Ministério da Saúde, 2.ª ed., Brasília, 2020 —, aqui na seção "Acompanhamento da Criança
// e Consultas Recomendadas", pp. 66 a 75. ADR 0011 permanece intacto: uma fonte por unit,
// e este submódulo não traz uma segunda, apenas outra seção da primeira.
//
// Por isso `referencia`, `FONTE_ID` e `VERSAO_EDICAO` vêm de `../fonte-clinica` e não são
// redeclarados. Duas cópias da identificação da mesma edição divergiriam na primeira
// correção de digitação, e a divergência apareceria na tela como duas fontes distintas.
import { referencia } from "../fonte-clinica";
import type { ReferenciaClinica } from "../tipos";

/**
 * Invariante 3 da família: toda saída carrega `ReferenciaClinica`. Aqui a cobertura declara
 * o que a entrega alcança — as dez consultas datadas —, e é ela que fixa o limite do que a
 * ferramenta pode afirmar. A ausência das três fichas restantes vai dita ao usuário em
 * `NOTA_FICHAS_AUSENTES`, e não escondida na localização de uma referência.
 */
export const REFERENCIAS_DA_CONSULTA = Object.freeze({
  cobertura: referencia(
    "pp. 66–75, Acompanhamento da Criança e Consultas Recomendadas: as dez consultas datadas, da 1.ª Semana ao 36.º Mês",
  ),
});

/** RF-10: a página de onde a ficha foi transcrita, carimbada em cada registro montado. */
export function referenciaDaFicha(
  titulo: string,
  pagina: number,
): ReferenciaClinica {
  return referencia(`p. ${pagina}, ${titulo}`);
}

// ─────────────────────────────────────────────────────────────────────────────────────
// AS QUATRO NOTAS DO DOMÍNIO
//
// Cada uma é constante PRÓPRIA, no molde de `NOTA_CORRECAO_DE_CONCORDANCIA` da 017, e por
// duas razões que a decisão D-05 registrou: são quatro assuntos com ciclos de vida
// distintos, e um watch item vigia a permanência de cada declaração sobre símbolo
// exportado, que é preciso, e não sobre trecho dentro de um parágrafo, que não é.
//
// Todas as quatro são AUTORAIS: dizem o que o produto fez com a fonte, e é justamente por
// não estarem na caderneta que precisam ser ditas. A tela as lê daqui e não reescreve
// nenhuma, de modo que motor e apresentação não podem divergir sobre o que se promete.
// ─────────────────────────────────────────────────────────────────────────────────────

/** RN-09, RF-12: a matéria é da fonte, o arranjo é do produto. */
export const NOTA_ORGANIZACAO_EM_SOAP =
  "A matéria desta ficha vem da Caderneta da Criança; a organização do texto em subjetivo, objetivo, avaliação e plano é do produto. A fonte imprime os itens em seções numeradas e não menciona o registro clínico orientado por problemas. Cada campo foi atribuído a uma das quatro seções por decisão editorial, e nenhum campo aparece em duas.";

/** RN-03, RF-12: a fronteira da entrega, nomeada página a página. */
export const NOTA_FICHAS_AUSENTES =
  "Esta tela cobre as dez consultas datadas, da 1.ª Semana ao 36.º Mês. Três registros das mesmas páginas ficaram fora desta entrega e serão acrescentados depois: Pré-Natal, Parto, Nascimento, Internação Neonatal e Alta (p. 67), Triagens Neonatais (p. 68) e Outras Medidas e Consultas Necessárias (p. 75), esta com a tabela de aferição da pressão arterial. Quem confere a tela contra a caderneta precisa saber que ela não cobre as páginas verdes inteiras.";

/** RN-08, `MD-0026`: a supressão só é legítima porque é declarada. */
export const NOTA_SUPRESSAO_DE_CAMPO =
  "A Caderneta da Criança imprime “Criptorquidia” entre os sinais de alerta da Consulta do 2.º Mês nas duas tiragens, inclusive na da menina. Por ser achado do exame da bolsa escrotal, o campo é exibido apenas na ficha de sexo masculino. A diferença é do produto e não da fonte, e por isso vai declarada aqui.";

/** RN-13, RF-13: a consequência real de não persistir, dita antes de custar tempo. */
export const NOTA_NADA_E_SALVO =
  "Nada do que se preenche aqui é salvo ou enviado: o registro é montado no próprio navegador e some ao recarregar a página. Copie o texto antes de sair desta tela.";
