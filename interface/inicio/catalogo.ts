// Catálogo tipado da plataforma: fonte única das seções e rotas (D-07, anti-drift).
// Feature 007-idade-gestacional-e-home: RF-05/RF-06; RN-08 (duas seções, decisão do
// usuário em 2026-07-23; nenhuma seção nasce vazia). As rotas em `pages/` referenciam
// estas entradas — nova calculadora entra aqui primeiro (ver README).

export interface FichaCalculadora {
  readonly titulo: string;
  readonly descricao: string;
  readonly rota: string;
}

export interface SecaoDaPlataforma {
  readonly id: string;
  readonly titulo: string;
  readonly calculadoras: readonly FichaCalculadora[];
}

export const CATALOGO: readonly SecaoDaPlataforma[] = Object.freeze([
  Object.freeze({
    id: "dm2",
    titulo: "Diabetes Mellitus tipo 2",
    calculadoras: Object.freeze([
      Object.freeze({
        titulo: "Calculadora de insulina",
        descricao:
          "Início de insulinização, titulação da NPH e intensificação com Regular, pelo Guia Rápido Diabetes Mellitus (SMS-Rio, 2023).",
        rota: "/dm2/insulina",
      }),
    ]),
  }),
  Object.freeze({
    id: "pre-natal",
    titulo: "Pré-natal",
    calculadoras: Object.freeze([
      Object.freeze({
        titulo: "Calculadora de idade gestacional",
        descricao:
          "Idade gestacional, data provável do parto e trimestre a partir da DUM ou do último ultrassom, pelo Guia Rápido Pré-Natal (SMS-Rio, 2025).",
        rota: "/pre-natal/idade-gestacional",
      }),
    ]),
  }),
  Object.freeze({
    id: "cardiologia",
    titulo: "Cardiologia",
    calculadoras: Object.freeze([
      Object.freeze({
        titulo: "Calculadora de probabilidade pré-teste de cardiopatia isquêmica",
        descricao:
          "Classificação da dor torácica, probabilidade pré-teste de doença arterial coronariana e conduta de investigação, pelo TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017).",
        rota: "/cardiologia/dor-toracica",
      }),
      Object.freeze({
        titulo: "Calculadora de risco cardiovascular em 10 anos",
        descricao:
          "Risco de doença cardiovascular aterosclerótica (ASCVD) em 10 anos pelas Pooled Cohort Equations (ACC/AHA 2013, Goff et al.).",
        rota: "/cardiologia/risco-cardiovascular",
      }),
    ]),
  }),
  Object.freeze({
    id: "puericultura",
    titulo: "Puericultura",
    calculadoras: Object.freeze([
      Object.freeze({
        titulo: "Avaliação do crescimento infantil",
        descricao:
          "Escores z de peso, comprimento/estatura, IMC e perímetro cefálico com a classificação nutricional da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020), inclusive para nascidos pré-termo.",
        rota: "/puericultura/crescimento",
      }),
      Object.freeze({
        titulo: "Ficha de consulta de puericultura",
        descricao:
          "As dez consultas datadas da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020) em ficha preenchível, com o registro pronto em SOAP para colar no prontuário.",
        rota: "/puericultura/consulta",
      }),
    ]),
  }),
  // Feature 023 (RF-12; RN-13): quinta seção. Diff estritamente aditivo — as seis fichas
  // anteriores permanecem byte a byte, e `tests/integration/interface/inicio.test.tsx` o
  // prova por lista ordenada exaustiva.
  Object.freeze({
    id: "saude-do-idoso",
    titulo: "Saúde da pessoa idosa",
    calculadoras: Object.freeze([
      Object.freeze({
        titulo: "Rastreamento de depressão na pessoa idosa",
        descricao:
          "Escala de Depressão Geriátrica em quinze itens, com o escore e a faixa na redação das Linhas de Cuidado (Ministério da Saúde).",
        rota: "/saude-do-idoso/depressao-gds",
      }),
    ]),
  }),
]);
