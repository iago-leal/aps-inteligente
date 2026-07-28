// Classe declarada dos literais candidatos de `pages/**`, dos três campos textuais do
// manifesto e da prosa do `README.md` (T013).
//
// Os metadados das seis rotas são a superfície que sai do navegador, e é onde vive o defeito
// de exatidão de §2.3: a `description` da raiz nomeia duas das quatro seções do catálogo.
// Ela está aqui declarada AUTORAL na forma de hoje; quando T033 a corrigir, a chave deixa de
// casar e a entrada nova a substitui.
//
// O `README.md` recebe tratamento próprio, e a razão está mais abaixo, em `UNIFORMES`.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.

import type { ClasseDeTexto, MapaDeClasses } from "../classificacao.mts";
import { autorais, identificadores } from "./declarar.mts";

/** Atributos e valores de HTML que a travessia apanha por serem `content`/`name`. */
const ATRIBUTOS_DE_HTML = ["description", "viewport", "width=device-width, initial-scale=1"];

export const MAPA: MapaDeClasses = {
  "pages/index.tsx": [
    ...autorais([
      "APS Inteligente · Calculadoras clínicas para a APS",
      "Calculadoras clínicas para a Atenção Primária à Saúde, por seção: Diabetes Mellitus tipo 2, Pré-natal, Cardiologia e Puericultura. Cálculo 100% no navegador: nada é salvo nem enviado.",
    ]),
    ...identificadores(ATRIBUTOS_DE_HTML),
  ],

  "pages/dm2/insulina.tsx": [
    ...autorais([
      "Calculadora de insulina no DM2 · APS Inteligente",
      "Apoio à decisão para insulinização no DM2 pelo Guia Rápido Diabetes Mellitus (SMS-Rio, 2.ª ed. 2023). Cálculo 100% no navegador: nada é salvo nem enviado.",
    ]),
    ...identificadores(ATRIBUTOS_DE_HTML),
  ],

  "pages/pre-natal/idade-gestacional.tsx": [
    ...autorais([
      "Calculadora de idade gestacional · APS Inteligente",
      "Idade gestacional, data provável do parto e trimestre pela DUM ou pelo último ultrassom, pelo Guia Rápido Pré-Natal (SMS-Rio, 2025). Cálculo 100% no navegador: nada é salvo nem enviado.",
    ]),
    ...identificadores(ATRIBUTOS_DE_HTML),
  ],

  "pages/cardiologia/dor-toracica.tsx": [
    ...autorais([
      "Probabilidade pré-teste de cardiopatia isquêmica · APS Inteligente",
      "Classificação da dor torácica, probabilidade pré-teste de doença arterial coronariana e conduta de investigação, pelo TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017). Cálculo 100% no navegador: nada é salvo nem enviado.",
    ]),
    ...identificadores(ATRIBUTOS_DE_HTML),
  ],

  "pages/cardiologia/risco-cardiovascular.tsx": [
    ...autorais([
      "Risco cardiovascular em 10 anos (Pooled Cohort Equations) · APS Inteligente",
      "Estimativa do risco de doença cardiovascular aterosclerótica (ASCVD) em 10 anos pelas Pooled Cohort Equations (ACC/AHA 2013). Cálculo 100% no navegador: nada é salvo nem enviado.",
    ]),
    ...identificadores(ATRIBUTOS_DE_HTML),
  ],

  "pages/puericultura/crescimento.tsx": [
    ...autorais([
      "Avaliação do crescimento infantil · APS Inteligente",
      "Escores z de peso, comprimento/estatura, IMC e perímetro cefálico com a classificação da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020), inclusive para nascidos pré-termo. Cálculo 100% no navegador: nada é salvo nem enviado.",
    ]),
    ...identificadores(ATRIBUTOS_DE_HTML),
  ],

  "pages/puericultura/consulta.tsx": [
    ...autorais([
      "Ficha de consulta de puericultura · APS Inteligente",
      "As dez consultas datadas da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020) em ficha preenchível, com o registro pronto em SOAP para colar no prontuário. Preenchimento 100% no navegador: nada é salvo nem enviado.",
    ]),
    ...identificadores(ATRIBUTOS_DE_HTML),
  ],

  "pages/_document.tsx": [...identificadores(["theme-color", "#0969da"])],

  // Corpo de erro de `GET /api/v1/status`. É autoral — alguém a escreveu —, mas pertence ao
  // contrato declarado em `_reversa_sdd/openapi/status.yaml`, e por isso é MANTIDA: revisá-la
  // alteraria um contrato externo, o que esta feature declarou fora de escopo.
  "pages/api/v1/status.ts": [...autorais(["Método não permitido; use GET."])],

  // `name` e `short_name` são a marca fixada pela feature 009 e não se tocam (T022 os vigia).
  // A `description` é hoje byte a byte igual ao subtítulo da home (D-18).
  "public/manifest.webmanifest": [
    ...autorais([
      "APS Inteligente",
      "APSi",
      "Calculadoras clínicas para a Atenção Primária à Saúde · Cálculo 100% no navegador",
    ]),
  ],
};

/**
 * DECLARAÇÃO DE CLASSE POR ARQUIVO, e por que ela existe apesar de D-04.
 *
 * D-04 manda declarar a classe literal a literal, e a razão é impedir que a classificação
 * seja inferida do diretório. O `README.md` é o único arquivo do escopo onde essa forma se
 * volta contra o seu propósito, e convém dizer por quê em vez de abrir a exceção em
 * silêncio.
 *
 * Primeiro, a classe dele não é matéria de dúvida: `requirements.md` §2.1 declara que "sua
 * prosa é integralmente autoral", e não há uma linha transcrita de fonte clínica em 190
 * linhas de documentação. Não existe a decisão que a declaração literal a literal serve
 * para tomar.
 *
 * Segundo, e decisivo, a forma literal a literal CONTRADIRIA D-10. Aquela decisão tirou o
 * `README.md` do congelamento de RF-06 justamente porque ele muda a cada feature; um mapa
 * com 129 entradas o congelaria por outra via, pior — não por um teste que se atualiza com
 * o oráculo, mas pela parada do gerador a cada parágrafo acrescentado. A revisão de hoje já
 * o provaria: as quinze linhas que a seção "Norma de redação" trouxe deslocariam a contagem
 * de T007 e exigiriam quinze declarações novas antes que qualquer coisa voltasse a rodar.
 *
 * O que se declara aqui, portanto, é a ORIGEM do arquivo inteiro, uma vez, com a razão
 * escrita. O literal continua entrando no inventário um a um, e a norma de RF-05 continua
 * alcançando cada linha; o que não se repete é a decisão, porque ela é uma só.
 *
 * A porta fica estreita de propósito: só entra aqui arquivo cuja prosa seja integralmente
 * de uma classe POR ORIGEM, e a razão vai escrita ao lado. Arquivo de código não se
 * qualifica, e é bom que não se qualifique — foi exatamente ali que a inferência por
 * diretório erraria.
 */
export const UNIFORMES: Readonly<
  Record<string, { readonly classe: ClasseDeTexto; readonly razao: string }>
> = {
  "README.md": {
    classe: "autoral",
    razao:
      "prosa integralmente autoral (requirements.md §2.1); a declaração é por arquivo porque " +
      "a forma literal a literal congelaria o README por via oblíqua, contra D-10",
  },
};
