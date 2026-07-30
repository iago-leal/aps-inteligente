// Classe declarada de cada literal candidato de `interface/saude-do-idoso/**` e da rota
// `pages/saude-do-idoso/**` (T003/T027 da feature 023-saude-do-idoso-gds).
//
// POR QUE ESTE MÓDULO EXISTE (D-11). `scripts/textos/classes/interface.mts` está em 684
// linhas, acima do teto de 400, e é a dívida 3 de `architecture.md`. A saída que a própria
// extração propõe é parti-lo por camada de tela; esta feature paga o seu quinhão do refactor
// budget entrando pelo lado certo, em vez de engordar o arquivo por hábito. A tela nova e a
// casca da sua rota ficam juntas porque são a mesma superfície: o `<title>` e a
// `<meta name="description">` dizem, com outras palavras, o que o cabeçalho da tela diz.
//
// A TELA É AUTORAL POR INTEIRO, e é aí que ela se distingue do módulo do domínio. Os
// enunciados da escala, os rótulos de faixa e a providência chegam à tela vindos de
// `models/**`, onde estão declarados como citação com a sua origem; o que se escreve aqui é
// a prosa que os apresenta. Literal de citação neste arquivo seria sinal de que a tela
// reescreveu a fonte em vez de a ler do domínio.
//
// O CASO DE "Sim" E "Não", que merece a nota. A tabela da fonte também os imprime, e ainda
// assim eles entram como autorais: o que a página traz não é conteúdo clínico transcrito, e
// sim o vocabulário comum de uma resposta binária, que o formulário precisaria escrever de
// todo modo. Declará-los citação teria consequência operacional precisa e indesejada — a de
// pôr duas palavras do português corrente sob o oráculo de transcrição da escala.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.

import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, identificadores } from "./declarar.mts";

/** Atributos e valores de HTML que a travessia apanha por serem `content`/`name`. */
const ATRIBUTOS_DE_HTML = [
  "description",
  "viewport",
  "width=device-width, initial-scale=1",
];

export const MAPA: MapaDeClasses = {
  "interface/saude-do-idoso/tela.tsx": [
    ...autorais([
      "Rastreamento de depressão na pessoa idosa",
      // O extrator normaliza o espaço nas bordas: os dois fragmentos do subtítulo entram
      // sem o espaço que os cola ao nome publicado da fonte.
      "APS Inteligente · Fonte única:",
      ", Linhas de Cuidado, Ministério da Saúde",
    ]),
  ],

  "interface/saude-do-idoso/formulario.tsx": [
    ...autorais(["Itens da escala", "Sim", "Não", "Calcular escore"]),
  ],

  "interface/saude-do-idoso/resultado.tsx": [
    ...autorais([
      "Resultado",
      "Responda aos quinze itens da escala e calcule o escore.",
      "Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça a avaliação.",
      "Nova avaliação",
      "Escala incompleta",
      "Nenhum escore é exibido enquanto houver item sem resposta: a escala somada pela metade produz número que parece resultado e não é.",
      "Resultado desatualizado: as respostas foram editadas após o cálculo. Calcule novamente.",
      "de 15 pontos",
      "Faixa da fonte:",
      "Providência recomendada pela fonte",
      "Fonte clínica",
      "·",
    ]),
  ],

  "pages/saude-do-idoso/depressao-gds.tsx": [
    ...autorais([
      "Rastreamento de depressão na pessoa idosa · APS Inteligente",
      "Escala de Depressão Geriátrica em quinze itens, com o escore e a faixa na redação das Linhas de Cuidado (Ministério da Saúde). Cálculo 100% no navegador: nada é salvo nem enviado.",
    ]),
    ...identificadores(ATRIBUTOS_DE_HTML),
  ],
};
