// Classe declarada de cada literal candidato de `models/gestacao/**`,
// `models/cardiopatia-isquemica/**` e `models/risco-cardiovascular/**` (T011).
//
// Os três domínios repetem o mesmo arranjo: `fonte-clinica.ts` guarda as localizações
// bibliográficas (citação) ao lado dos textos de conduta e das notas (autorais), e
// `validacao.ts` é autoral por inteiro. A exceção do arranjo é a lista de causas não
// cardíacas da cardiopatia, que a p. 4 do TeleCondutas enumera e o produto reproduz.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.

import type { MapaDeClasses } from "../classificacao.mts";
import {
  autorais,
  citacoes,
  identificadores,
  internas,
  nomesDeFonte,
} from "./declarar.mts";

const TELECONDUTAS =
  "TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017)";
const PRE_NATAL = "Guia Rápido Pré-Natal (SMS-Rio, 4.ª ed., 2025)";
const PCE =
  "Pooled Cohort Equations (ACC/AHA 2013; Goff et al., Circulation 2014)";

export const MAPA: MapaDeClasses = {
  // ─── Cardiopatia isquêmica ──────────────────────────────────────────────────────

  "models/cardiopatia-isquemica/calculadora.ts": [
    ...identificadores(["IDADE_FORA_DA_TABELA"]),
    ...internas(["Resultado sem referência clínica"]),
  ],

  "models/cardiopatia-isquemica/fonte-clinica.ts": [
    ...nomesDeFonte(["TeleCondutas — Cardiopatia Isquêmica"]),

    ...citacoes(TELECONDUTAS, ["TelessaúdeRS-UFRGS, 2017"]),
    ...citacoes(`${TELECONDUTAS}, pp. 4–6`, [
      "Quadro 1, p. 4 (classificação clínica da dor torácica; CESAR et al., 2014)",
      "Quadro 2, p. 5 (probabilidade pré-teste de DAC por idade e sexo; DUNCAN et al., 2013)",
      "Quadro 2, nota *, p. 5 (fatores de risco aumentam a estimativa em 2 a 3 vezes)",
      "p. 4-5 (estratos < 10% / 10–90% / > 90% e conduta de investigação; nota ** do Quadro 2)",
      "p. 6 (ECG e teste ergométrico iniciais; método não invasivo quando o ECG basal impede a interpretação ou o paciente não pode exercitar)",
      "p. 6 (angina instável: alta probabilidade de evento agudo — encaminhamento emergencial)",
    ]),

    // A p. 4 enumera as causas não cardíacas a investigar; o produto reproduz a lista.
    ...citacoes(`${TELECONDUTAS}, p. 4`, [
      "dor musculoesquelética",
      "transtornos psiquiátricos (ansiedade, transtorno do pânico)",
      "distúrbios gastrointestinais (DRGE, cólica biliar, espasmo esofágico)",
      "doenças pulmonares (pneumonia, neoplasia torácica, pneumotórax)",
    ]),

    // Condutas e advertência: o fluxo é da fonte, a frase é do produto — o cabeçalho do
    // arquivo as declara "textos fixos ... fonte única anti-drift", no molde da gestação.
    ...autorais([
      "Probabilidade pré-teste baixa (dor não anginosa e sem fatores de risco): exame funcional não indicado na avaliação inicial. Investigar causas não cardíacas.",
      "Probabilidade pré-teste intermediária: indicar exame não invasivo para confirmar ou afastar a suspeita em quadro clínico duvidoso.",
      "Probabilidade pré-teste alta: exame não invasivo para estratificação prognóstica e identificação de candidatos à revascularização; probabilidade > 90% requer estratificação por método invasivo, com encaminhamento ao cardiologista.",
      "Exame inicial: ECG de repouso e teste ergométrico.",
      "ECG basal impede a interpretação da ergometria ou o paciente não pode exercitar: preferir método não invasivo (ecocardiograma de estresse, cintilografia miocárdica ou ressonância magnética cardiovascular).",
      "Sinais de angina instável ou dor aguda: alta probabilidade de evento agudo em curto prazo. Encaminhar para atendimento emergencial, e não seguir o fluxo eletivo de investigação.",
    ]),
  ],

  "models/cardiopatia-isquemica/validacao.ts": [
    ...autorais([
      "Sexo inválido: informe masculino ou feminino. A probabilidade pré-teste é específica por sexo.",
    ]),
  ],

  // ─── Gestação ───────────────────────────────────────────────────────────────────

  "models/gestacao/calculadora.ts": [
    ...autorais([
      "Ultrassom de 3.º trimestre: a fonte não parametriza margem de erro para arbitrar entre as datações, e a avaliação é do julgamento clínico.",
    ]),
    ...internas([
      "Ultrassom incompleto atravessou a validação",
      "Resultado sem referência clínica",
    ]),
  ],

  "models/gestacao/fonte-clinica.ts": [
    ...nomesDeFonte(["Guia Rápido Pré-Natal — SMS-Rio"]),

    ...citacoes(PRE_NATAL, ["4.ª ed., 2025"]),
    ...citacoes(`${PRE_NATAL}, pp. 31–113`, [
      "p. 31 (dias decorridos desde a DUM ÷ 7, em semanas e dias)",
      "p. 31 (confiável se o 1.º dia da última menstruação é conhecido e os ciclos eram regulares)",
      "p. 32 (DPP: acrescentar 7 dias à DUM e somar 9 meses — regra de Naegele)",
      "p. 32 (desconsiderar a DUM fora da margem de erro da USG: 1 semana no 1.º trimestre, 2 no 2.º)",
      "p. 113 (USG para datação quando a DUM é incerta ou a IG não pode ser calculada por ela)",
    ]),
    ...autorais([
      "Datação a partir da última menstruação: confiável quando o primeiro dia é conhecido e os ciclos eram regulares.",
      "Idade gestacional calculada na data de referência informada; a datação é estimativa e não substitui a avaliação clínica.",
    ]),
  ],

  "models/gestacao/validacao.ts": [
    ...autorais([
      "Data de referência inválida: use o formato AAAA-MM-DD com data de calendário real.",
      "DUM inválida: use o formato AAAA-MM-DD com data de calendário real.",
      "DUM no futuro: a data da última menstruação deve ser até a data de referência.",
      "Datação por ultrassom incompleta: informe a data do exame e a IG do laudo (semanas e dias).",
      "Data do exame inválida: use o formato AAAA-MM-DD com data de calendário real.",
      "Data do exame no futuro: informe um exame já realizado, até a data de referência.",
      "Nenhuma datação informada: informe a DUM ou o ultrassom (data do exame e IG do laudo).",
    ]),
  ],

  // ─── Risco cardiovascular ───────────────────────────────────────────────────────

  "models/risco-cardiovascular/calculadora.ts": [
    ...internas(["Resultado sem referência clínica"]),
  ],

  "models/risco-cardiovascular/elegibilidade.ts": [
    ...autorais([
      "Doença cardiovascular prévia (prevenção secundária): as Pooled Cohort Equations estimam risco apenas em prevenção primária. A conduta segue a estratificação de risco secundário, fora do escopo desta ferramenta.",
    ]),
    ...identificadores(["DCV_PREVIA", "IDADE_FORA_DA_FAIXA"]),
  ],

  "models/risco-cardiovascular/fonte-clinica.ts": [
    ...nomesDeFonte(["2013 ACC/AHA Guideline — Pooled Cohort Equations"]),

    ...citacoes(PCE, [
      "ACC/AHA 2013 (Goff et al., Circulation 2014)",
      "Pooled Cohort Equations, Tabela A (Goff et al., 2013): risco de ASCVD em 10 anos, adultos de 40 a 79 anos sem DCV prévia",
      "2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease: cortes de risco 5% / 7,5% / 20%",
      "ASCVD Risk Estimator Plus (ACC): faixa de validação 40–79 anos, prevenção primária (sem DCV prévia)",
    ]),
    // Nota de transportabilidade: julgamento do produto sobre o alcance da fonte, e não
    // texto da fonte. Autoral, e alcançada pela norma.
    ...autorais([
      "As Pooled Cohort Equations foram derivadas de coortes dos Estados Unidos (ARIC, CHS, CARDIA, Framingham) e são específicas para as categorias raciais branco e afro-americano do contexto norte-americano. Não há calibração validada para a população brasileira; a categoria “outra” adota os coeficientes de brancos, como o ASCVD Risk Estimator Plus oficial. Use a estimativa como apoio à decisão, ponderando essa limitação de transportabilidade.",
    ]),
  ],

  // ─── Contribuição (feature 019; domínio NÃO clínico, MD-0022) ───────────────────
  //
  // Não há citação aqui, e a ausência é declarada: o módulo obedece à especificação
  // do BR Code do Banco Central, que não é fonte clínica e não entra no catálogo
  // congelado de referências. Toda a prosa é autoral, e o alvo dela é o mantenedor
  // sozinho, meses depois, lendo por que a configuração foi recusada.

  "models/contribuicao/validacao.ts": [
    ...autorais([
      "Chave PIX ausente: informe a chave de recebimento em interface/contribuicao/beneficiario.ts.",
      "Nome do beneficiário ausente: informe o nome em interface/contribuicao/beneficiario.ts.",
      "Nome do beneficiário acima do limite do padrão, que é de 25 caracteres: use uma forma mais curta. O código recusa em vez de truncar, porque nome cortado gera código válido com beneficiário errado.",
      "Cidade do beneficiário ausente: informe a cidade em interface/contribuicao/beneficiario.ts.",
      "Cidade do beneficiário acima do limite do padrão, que é de 15 caracteres: use uma forma mais curta. O código recusa em vez de truncar.",
      "Identificação da contribuição acima do limite do padrão, que é de 25 caracteres: use uma forma mais curta ou omita o campo.",
      "Valor sugerido inválido: informe um número positivo e finito, ou omita o campo para deixar o valor à escolha de quem contribui.",
    ]),
  ],

  "models/risco-cardiovascular/validacao.ts": [
    ...autorais([
      "Sexo inválido: informe masculino ou feminino. As equações são específicas por sexo.",
      "Raça inválida: informe branca, preta/afro-americana ou outra.",
      "Colesterol total inválido: informe um valor positivo em mg/dL.",
      "HDL inválido: informe um valor positivo em mg/dL.",
      "Pressão arterial sistólica inválida: informe um valor positivo em mmHg.",
    ]),
  ],
};
