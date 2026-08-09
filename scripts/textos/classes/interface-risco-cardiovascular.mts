// Classe declarada dos literais de `interface/risco-cardiovascular/**` (T012).
//
// A TERCEIRA EXCEÇÃO DA CAMADA está aqui: `resultado.tsx` transcreve as quatro categorias
// de risco do 2019 ACC/AHA, cortes incluídos. As outras duas estão em
// `interface-cardiologia.mts`.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, citacoes, identificadores } from "./declarar.mts";

export const MAPA: MapaDeClasses = {
  // ─── interface/risco-cardiovascular ─────────────────────────────────────────────

  "interface/risco-cardiovascular/formulario.tsx": [
    ...autorais([
      "Branca",
      "Preta / afro-americana",
      "Outra",
      "Paciente",
      "Sexo",
      "Masculino",
      "Feminino",
      "Raça / cor",
      "Idade (anos)",
      "Exames e pressão",
      "Colesterol total (mg/dL)",
      "HDL (mg/dL)",
      "Pressão arterial sistólica (mmHg)",
      "Em tratamento anti-hipertensivo",
      "Fatores de risco",
      "Diabetes",
      "Tabagismo atual",
      "Histórico cardiovascular",
      "Doença cardiovascular já estabelecida (infarto, AVC, revascularização)",
      "Estimar risco",
    ]),
    ...identificadores(["sexo", "raca"]),
  ],

  "interface/risco-cardiovascular/proveniencia.tsx": [
    ...autorais([
      "Por que Pooled Cohort Equations, e não a AHA PREVENT?",
      "A AHA PREVENT (2023) é uma calculadora mais recente, sexo-específica e sem variável de raça, derivada de mais de 6,5 milhões de adultos e capaz de incorporar função renal e determinantes sociais. Foi criada para modernizar a estimativa e ampliar sua aplicabilidade à população geral dos Estados Unidos.",
      "Esta ferramenta usa, ainda assim, as Pooled Cohort Equations, porque a recomendação de estatina em prevenção primária da USPSTF (2022) foi calibrada sobre elas, e é esse limiar que dá sentido clínico ao número estimado. A PREVENT estima risco sistematicamente menor: adotá-la descasaria o risco estimado do limiar que fundamenta a conduta. Fica como candidata a uma calculadora futura, com fonte própria.",
      "Calculadora AHA PREVENT (site oficial, em inglês):",
      "professional.heart.org · PREVENT™ Online Calculator",
    ]),
    // Valor do atributo `rel` do vínculo externo.
    ...identificadores(["noopener noreferrer"]),
  ],

  "interface/risco-cardiovascular/resultado.tsx": [
    // As quatro categorias do 2019 ACC/AHA, com os cortes que a diretriz publica.
    ...citacoes(
      "2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease: cortes 5% / 7,5% / 20%",
      [
        "Baixo (< 5%)",
        "Limítrofe (5 a < 7,5%)",
        "Intermediário (7,5 a < 20%)",
        "Alto (≥ 20%)",
      ],
    ),
    ...autorais([
      "Resultado",
      "Informe sexo, raça, idade, os exames e os fatores de risco, e estime o risco cardiovascular em 10 anos.",
      "Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça a estimativa.",
      "Nova estimativa",
      "Fora do escopo da fonte",
      "Fonte clínica",
      "Pooled Cohort Equations (ACC/AHA 2013) ·",
      "Entrada incompleta ou implausível",
      "Resultado desatualizado: os dados foram editados após a estimativa. Estime novamente.",
      "Risco de ASCVD em 10 anos:",
      "%",
      "Categoria de risco:",
    ]),
  ],

  "interface/risco-cardiovascular/tela.tsx": [
    ...autorais([
      "Risco cardiovascular em 10 anos (Pooled Cohort Equations)",
      "APS Inteligente · Fonte única:",
      "(Goff et al., 2014)",
    ]),
  ],
};
