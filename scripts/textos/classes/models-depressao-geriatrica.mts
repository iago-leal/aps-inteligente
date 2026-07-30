// Classe declarada de cada literal candidato de `models/depressao-geriatrica/**` (T003/T017
// da feature 023-saude-do-idoso-gds).
//
// POR QUE MÓDULO PRÓPRIO, E NÃO MAIS UMA SEÇÃO EM `models-demais.mts` (D-11). O arranjo
// deste domínio não é o dos três que aquele módulo agrega: aqui a citação é o corpo do
// instrumento — quinze enunciados e três rótulos de faixa —, e não uma localização
// bibliográfica ao lado de textos autorais. Separado, o mapa se lê como o que é: a
// transcrição de uma escala, conferível contra `tests/apoio/gds-fonte-congelada.json`.
//
// A CITAÇÃO DESTE MÓDULO TEM ORÁCULO PRÓPRIO. Os literais de classe `citacao` daqui não
// entram na comparação contra `citacao-linha-de-base.json`, congelada em 27/07 e jamais
// regerada (`MD-0018`): a subárvore consta em `SUBARVORES_COM_ORACULO_PROPRIO` de
// `tests/unit/textos/citacao.test.ts`, pela porta estreita que `MD-0027` abriu. O que os
// guarda no lugar é `tests/unit/dominio-depressao-geriatrica/transcricao.test.ts`, que os
// confere contra a cópia datada da fonte — e não contra um congelado nosso da nossa própria
// transcrição.
//
// A LINHA QUE SEPARA CITAÇÃO DE AUTORAL NESTE DOMÍNIO. Da fonte vêm os enunciados, os
// rótulos de faixa, a instrução de pontuação, a providência e a referência bibliográfica que
// a própria página cita. Do produto vêm duas frases, e as duas afirmam coisa clínica: a
// advertência de que o instrumento rastreia e não diagnostica, e o público a que ele se
// dirige. A segunda merece nota, porque não é prosa de apresentação: sem campo de idade nem
// regra de recusa (RN-07), ela carrega sozinha o papel que noutras telas é de um ofensor.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.

import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, citacoes, internas, nomesDeFonte } from "./declarar.mts";

const GDS =
  "Escala de Depressão Geriátrica (GDS), Linhas de Cuidado, Ministério da Saúde " +
  "(página lida em 30/07/2026; cópia datada em `referencias/saude-do-idoso/`)";

export const MAPA: MapaDeClasses = {
  // Os quinze enunciados, na redação da tabela da fonte, inclusive o desdobramento de gênero
  // entre parênteses que ela adota. A resposta que pontua não é texto: vem da marcação de
  // célula (`MD-0038`), e por isso não aparece aqui.
  "models/depressao-geriatrica/itens.ts": [
    ...citacoes(`${GDS}, tabela dos quinze itens`, [
      "Está satisfeito(a) com sua vida?",
      "Interrompeu muitas de suas atividades?",
      "Acha sua vida vazia?",
      "Aborrece-se com frequência?",
      "Sente-se bem com a vida na maior parte do tempo?",
      "Teme que algo ruim lhe aconteça?",
      "Sente-se alegre a maior parte do tempo?",
      "Sente-se desamparado com frequência?",
      "Prefere ficar em casa a sair e fazer coisas novas?",
      "Acha que tem mais problemas de memória que outras pessoas?",
      "Acha que é maravilhoso estar vivo(a)?",
      "Sente-se inútil?",
      "Sente-se cheio(a) de energia?",
      "Sente-se sem esperança?",
      "Acha que os outros têm mais sorte que você?",
    ]),
  ],

  // Os três rótulos de faixa, como a fonte os imprime em "Avaliações dos resultados". São
  // fragmentos de período, e não frases inteiras, porque é assim que a página os escreve: o
  // corte numérico fica à esquerda do rótulo, e o produto o exibe como número, não como
  // prosa.
  "models/depressao-geriatrica/classificacao.ts": [
    ...citacoes(`${GDS}, "Avaliações dos resultados"`, [
      "se considera normal",
      "indica depressão leve",
      "depressão severa",
    ]),
  ],

  "models/depressao-geriatrica/fonte-clinica.ts": [
    ...nomesDeFonte(["Escala de Depressão Geriátrica (GDS)"]),

    // A fonte é página, e não impresso: sem número de edição, a versão se apoia na data de
    // acesso. É o que `MD-0039` custeia, e o que a cópia com `sha256` torna reconferível.
    ...citacoes(GDS, ["Ministério da Saúde, acesso em 30/07/2026"]),

    // Localizações dentro da página, que ocupam aqui o lugar que a página impressa ocupa
    // nas outras units.
    ...citacoes(GDS, [
      "Tabela da escala, quinze itens (a resposta que pontua vem marcada na célula)",
      "Nota de pontuação sob a tabela (um ponto por item marcado)",
      "Avaliações dos resultados (três faixas de escore)",
      "Providências com os achados/resultados",
    ]),

    // Transcrições. A providência termina em ponto porque é assim que a página a imprime, e
    // a referência bibliográfica é a que a PRÓPRIA FONTE cita sob a tabela.
    ...citacoes(`${GDS}, "Providências com os achados/resultados"`, [
      "escores elevados sugerem encaminhamento para avaliação neuropsicológica específica.",
    ]),
    ...citacoes(`${GDS}, nota de pontuação sob a tabela`, [
      "Considerar 1 ponto quando os itens em cinza (sim ou não) estiverem marcados.",
    ]),
    ...citacoes(`${GDS}, legenda sob a tabela`, [
      "Fonte: J Psychiatr Res. 1982-1983; 17(1): 37-49 e Arq Neuropsiquiatr. 1999; 57(2-B): 421-426",
    ]),

    // As duas frases do produto. Nenhum guia escreve nenhuma das duas, e as duas afirmam
    // coisa clínica: por isso moram no domínio e são autorais.
    ...autorais([
      "A escala rastreia sintomas depressivos e não estabelece diagnóstico. A avaliação e a conduta são do profissional que a aplica.",
      "O instrumento se dirige à pessoa idosa. A fonte não publica faixa etária de aplicação, de modo que a indicação de aplicá-lo permanece do profissional.",
    ]),
  ],

  "models/depressao-geriatrica/calculadora.ts": [
    ...internas(["Resultado sem referência clínica"]),
  ],
};
