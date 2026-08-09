// Classe declarada dos literais de `interface/inicio/**` (T012).
//
// O catálogo é fonte única de navegação e, desde a feature 018, também oráculo da descrição
// da plataforma: o que ele lista é o que se pode afirmar em `<title>`, `<meta>` e manifesto
// (RN-06 de `interface-inicio`). Daí que a prosa das fichas seja autoral e revisável, ainda
// que cada uma cite a fonte clínica da sua calculadora com autoria e ano: quem escreve a
// descrição somos nós, e o que nela se nomeia é que vem da fonte.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
import type { MapaDeClasses } from "../classificacao.mts";
import { autorais } from "./declarar.mts";

export const MAPA: MapaDeClasses = {
  // ─── interface/inicio ───────────────────────────────────────────────────────────

  // Fonte única das seções e rotas (D-07 da feature 007, anti-drift). É também o oráculo
  // contra o qual a descrição da home é verificada (D-05).
  "interface/inicio/catalogo.ts": [
    ...autorais([
      "Diabetes Mellitus tipo 2",
      "Calculadora de insulina",
      "Início de insulinização, titulação da NPH e intensificação com Regular, pelo Guia Rápido Diabetes Mellitus (SMS-Rio, 2023).",
      "Pré-natal",
      "Calculadora de idade gestacional",
      "Idade gestacional, data provável do parto e trimestre a partir da DUM ou do último ultrassom, pelo Guia Rápido Pré-Natal (SMS-Rio, 2025).",
      "Cardiologia",
      "Calculadora de probabilidade pré-teste de cardiopatia isquêmica",
      "Classificação da dor torácica, probabilidade pré-teste de doença arterial coronariana e conduta de investigação, pelo TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017).",
      "Calculadora de risco cardiovascular em 10 anos",
      "Risco de doença cardiovascular aterosclerótica (ASCVD) em 10 anos pelas Pooled Cohort Equations (ACC/AHA 2013, Goff et al.).",
      "Puericultura",
      "Avaliação do crescimento infantil",
      "Escores z de peso, comprimento/estatura, IMC e perímetro cefálico com a classificação nutricional da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020), inclusive para nascidos pré-termo.",
      // Segunda ficha da seção Puericultura (feature 020).
      "Ficha de consulta de puericultura",
      "As dez consultas datadas da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020) em ficha preenchível, com o registro pronto em SOAP para colar no prontuário.",
      // Quinta seção (feature 023). O catálogo é fonte única das seções, e por isso as três
      // linhas entram aqui e não no módulo próprio da tela nova: o arquivo é o do catálogo.
      "Saúde da pessoa idosa",
      "Rastreamento de depressão na pessoa idosa",
      "Escala de Depressão Geriátrica em quinze itens, com o escore e a faixa na redação das Linhas de Cuidado (Ministério da Saúde).",
    ]),
  ],

  // O subtítulo é hoje byte a byte igual à `description` do manifesto (D-18, RN-05).
  "interface/inicio/tela.tsx": [
    ...autorais([
      "APS Inteligente",
      "Calculadoras clínicas para a Atenção Primária à Saúde · Cálculo 100% no navegador",
    ]),
  ],
};
