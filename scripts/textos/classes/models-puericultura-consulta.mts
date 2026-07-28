// Classe declarada dos literais de `models/puericultura/consulta/**` (feature 020, T028).
//
// É o primeiro módulo da coleção que DERIVA declarações em vez de escrevê-las uma a uma, e a
// diferença pede justificativa, porque D-04 da feature 018 manda declarar literal a literal.
//
// O QUE AQUELA DECISÃO QUER IMPEDIR, e o que ela não impede. Ela impede que a classe seja
// INFERIDA do diretório — o defeito que `pages-e-arquivos.mts` nomeia, e que erraria em
// silêncio revisando citação por omissão. Aqui não há inferência por caminho: a origem de
// cada rótulo é a PÁGINA IMPRESSA que o próprio campo declara, escrita por quem o
// transcreveu, e que existe por outra razão — o invariante 3 da família exige
// `ReferenciaClinica` em toda saída. A declaração de classe passa a ser consequência escrita
// de um dado que já tinha de estar lá, e a decisão continua sendo uma só, tomada uma vez.
//
// POR QUE NÃO AS TREZENTAS E CINQUENTA À MÃO. Satisfaria a letra de D-04 e derrotaria o seu
// propósito: um mapa dessa extensão passa a ser mantido no automático, que é exatamente o
// modo de falha que aquela decisão nomeia. A tensão está registrada no roadmap §2 desta
// feature, sem proposta de mudança no princípio IX.
//
// O que continua escrito à mão, e é o que exige julgamento: os literais AUTORAIS do
// submódulo — as quatro notas do domínio, os nomes das seções do SOAP e os rótulos neutros
// dos índices —, mais as mensagens de invariante interno, que parecem prosa e nunca chegam à
// tela.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.

import { FICHAS } from "../../../models/puericultura/consulta/fichas/indice.ts";
import type { Declaracao, MapaDeClasses } from "../classificacao.mts";
import { autorais, citacoes } from "./declarar.mts";

const CADERNETA = "Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020)";

/** A pasta em que cada ficha mora; o `id` da ficha É o nome do arquivo, por construção. */
const PASTA_DAS_FICHAS = "models/puericultura/consulta/fichas";

/**
 * Os textos citados de uma ficha, cada um com a página que ele próprio declara. Um campo
 * pode citar página diferente da ficha — não ocorre hoje, porque cada consulta datada cabe
 * numa página, mas o dado permite e a declaração acompanha o dado, não a suposição.
 */
function citacoesDaFicha(
  ficha: (typeof FICHAS)[number],
): readonly Declaracao[] {
  const porPagina = new Map<number, string[]>();

  function acrescentar(pagina: number, texto: string): void {
    const daPagina = porPagina.get(pagina) ?? [];
    if (!daPagina.includes(texto)) daPagina.push(texto);
    porPagina.set(pagina, daPagina);
  }

  acrescentar(ficha.pagina, ficha.titulo);

  for (const secao of ficha.secoes) {
    acrescentar(ficha.pagina, secao.titulo);
    for (const campo of secao.campos) {
      acrescentar(campo.pagina, campo.rotulo);
      if (campo.rotuloFeminino !== undefined) {
        acrescentar(campo.pagina, campo.rotuloFeminino);
      }
      if (campo.orientacao !== undefined) {
        acrescentar(campo.pagina, campo.orientacao);
      }
      if (campo.natureza === "escolha") {
        for (const opcao of campo.opcoes) acrescentar(campo.pagina, opcao);
      }
    }
  }

  return [...porPagina.entries()].flatMap(([pagina, textos]) =>
    citacoes(`${CADERNETA}, p. ${pagina}`, textos),
  );
}

/** Uma entrada por ficha, chaveada pelo arquivo em que ela foi transcrita. */
const DAS_FICHAS: MapaDeClasses = Object.fromEntries(
  FICHAS.map((ficha) => [
    `${PASTA_DAS_FICHAS}/${ficha.id}.ts`,
    citacoesDaFicha(ficha),
  ]),
);

export const MAPA: MapaDeClasses = {
  ...DAS_FICHAS,

  // As quatro notas são do PRODUTO, e é por não estarem na caderneta que precisam ser ditas:
  // o que a organização em SOAP tem de autoral, quais fichas ficaram de fora, qual campo foi
  // suprimido e que nada é salvo. Autorais, e alcançadas pela norma de `docs/redacao.md`.
  "models/puericultura/consulta/fonte-clinica.ts": [
    ...autorais([
      "A matéria desta ficha vem da Caderneta da Criança; a organização do texto em subjetivo, objetivo, avaliação e plano é do produto. A fonte imprime os itens em seções numeradas e não menciona o registro clínico orientado por problemas. Cada campo foi atribuído a uma das quatro seções por decisão editorial, e nenhum campo aparece em duas.",
      "Esta tela cobre as dez consultas datadas, da 1.ª Semana ao 36.º Mês. Três registros das mesmas páginas ficaram fora desta entrega e serão acrescentados depois: Pré-Natal, Parto, Nascimento, Internação Neonatal e Alta (p. 67), Triagens Neonatais (p. 68) e Outras Medidas e Consultas Necessárias (p. 75), esta com a tabela de aferição da pressão arterial. Quem confere a tela contra a caderneta precisa saber que ela não cobre as páginas verdes inteiras.",
      "A Caderneta da Criança imprime “Criptorquidia” entre os sinais de alerta da Consulta do 2.º Mês nas duas tiragens, inclusive na da menina. Por ser achado do exame da bolsa escrotal, o campo é exibido apenas na ficha de sexo masculino. A diferença é do produto e não da fonte, e por isso vai declarada aqui.",
      "Nada do que se preenche aqui é salvo ou enviado: o registro é montado no próprio navegador e some ao recarregar a página. Copie o texto antes de sair desta tela.",
    ]),

    // Localização bibliográfica, no molde das da feature 017.
    ...citacoes(`${CADERNETA}, pp. 66–75`, [
      "pp. 66–75, Acompanhamento da Criança e Consultas Recomendadas: as dez consultas datadas, da 1.ª Semana ao 36.º Mês",
    ]),
  ],

  // Os nomes das quatro seções do SOAP e os rótulos neutros dos índices são do produto: a
  // caderneta não fala em SOAP, e o rótulo clínico do índice é o que o domínio da 017
  // devolve, não o que a tela intitula (`MD-0012`).
  "models/puericultura/consulta/registro.ts": [
    ...autorais([
      "Peso para a idade",
      "Comprimento/estatura para a idade",
      "IMC para a idade",
      "Perímetro cefálico para a idade",
      // O eixo que a avaliação nomeia, e as duas formas do singular na idade em prosa.
      "Crescimento",
      "1 dia",
      "1 mês",
    ]),
  ],
};
