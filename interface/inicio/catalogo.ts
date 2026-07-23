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
          "Idade gestacional, data provável do parto e trimestre pela DUM ou pelo último ultrassom, pelo Guia Rápido Pré-Natal (SMS-Rio, 2025).",
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
]);
