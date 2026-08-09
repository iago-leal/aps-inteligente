// Classe declarada dos literais de `interface/cardiologia/**` (T012).
//
// DUAS DAS TRÊS EXCEÇÕES DA CAMADA vivem aqui, e valem por si:
//
//   · `referencias.tsx` mistura ENQUADRAMENTO AUTORAL — os títulos das quatro seções — com
//     CONTEÚDO CITADO do TeleCondutas, que ali é reproduzido para consulta "fora do cálculo
//     desta ferramenta", como o próprio rodapé do componente diz;
//   · `formulario.tsx` transcreve os três critérios do Quadro 1 como rótulos de caixa de
//     seleção: o enunciado do critério é da fonte, e não nosso.
//
// A terceira está em `interface-risco-cardiovascular.mts`.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, citacoes, identificadores } from "./declarar.mts";

const TELECONDUTAS =
  "TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017)";

export const MAPA: MapaDeClasses = {
  // ─── interface/cardiologia ──────────────────────────────────────────────────────

  "interface/cardiologia/formulario.tsx": [
    // Os três critérios do Quadro 1, como a fonte os enuncia.
    ...citacoes(`${TELECONDUTAS}, Quadro 1, p. 4`, [
      "Desconforto ou dor retroesternal",
      "Provocada por exercício ou estresse emocional",
      "Alívio rápido (≈1 min) com repouso ou nitrato",
    ]),
    ...autorais([
      "Diabetes",
      "Tabagismo",
      "Hipertensão",
      "Dislipidemia",
      "Paciente",
      "Idade (anos)",
      "Sexo",
      "Masculino",
      "Feminino",
      "Características da dor (Quadro 1)",
      "Fatores de risco",
      "Sinais clínicos adicionais",
      "ECG basal altera a interpretação da ergometria ou o paciente não pode exercitar-se",
      "Sinais de angina instável ou dor aguda (repouso, início recente, em crescendo)",
      "Avaliar",
    ]),
    ...identificadores(["sexo"]),
  ],

  "interface/cardiologia/referencias.tsx": [
    // Enquadramento: os títulos das quatro seções e o rodapé são do produto.
    ...autorais([
      "Classificação funcional da angina estável (CCS)",
      "Tratamento farmacológico e Tabela 1 de medicamentos",
      "Acompanhamento na APS",
      "Manejo da doença arterial coronariana aguda e encaminhamento",
      "Material de referência",
      "Conteúdo consultável do",
      "(TelessaúdeRS-UFRGS, 2017), fora do cálculo desta ferramenta.",
    ]),

    ...citacoes(`${TELECONDUTAS}, Quadro 3, p. 5`, [
      "Quadro 3, p. 5 (Sociedade Canadense Cardiovascular)",
      "Classe I — atividades comuns (caminhar, subir escadas) não causam angina; sintoma só em esforço extenuante ou prolongado.",
      "Classe II — limitação leve; angina ao caminhar mais de duas quadras no plano ou subir mais de um lance de escadas.",
      "Classe III — limitação marcada; angina ao caminhar 1 a 2 quadras ou subir um lance de escadas.",
      "Classe IV — angina a qualquer atividade física, podendo ocorrer em repouso.",
    ]),

    ...citacoes(`${TELECONDUTAS}, pp. 9–11`, [
      "p. 9-11 (cardiopatia isquêmica estabelecida)",
      "Prevenção cardiovascular: antiagregante plaquetário (AAS 100 mg/dia; clopidogrel 75 mg/dia na intolerância ou alergia) e estatina de alta intensidade como prevenção secundária.",
      "Antianginosos: betabloqueador (primeira escolha, alvo de FC próxima a 60 bpm), bloqueador de canal de cálcio (anlodipino, verapamil ou diltiazem) e nitrato (sublingual para sintomas agudos; de uso fixo com intervalo livre de 12 h para evitar tolerância).",
      "IECA: benéfico na redução de mortalidade e eventos, sobretudo pós-infarto, disfunção ventricular, diabetes e hipertensão.",
      "Betabloqueadores: propranolol, atenolol, metoprolol, carvedilol.",
      "Bloqueadores de canal de cálcio: anlodipino, verapamil, diltiazem (nifedipina retard).",
      "Nitratos: isossorbida (di/mononitrato); dinitrato sublingual 5 mg até 3 comprimidos; propatilnitrato.",
      "IECA: enalapril, captopril. Antiplaquetários: AAS, clopidogrel, ticlopidina. Estatinas: sinvastatina, atorvastatina, rosuvastatina, pravastatina.",
    ]),

    ...citacoes(`${TELECONDUTAS}, pp. 8–9`, [
      "p. 8-9 (periodicidade e controle de fatores de risco)",
      "Periodicidade das consultas: em torno de 4 a 12 meses, conforme gravidade, adesão e fatores de risco.",
      "A cada consulta, reavaliar a classe funcional da angina; piora sugere otimizar tratamento e investigar fatores de descompensação.",
      "Controle de fatores de risco: cessação do tabagismo, dieta cardioprotetora, exercício regular, PA < 140/90 e, em diabéticos, HbA1c < 7%.",
      "Aumento da frequência ou duração da dor, ou dor em repouso: encaminhar à emergência (angina instável / IAM).",
    ]),

    ...citacoes(`${TELECONDUTAS}, p. 12`, [
      "p. 12 (suspeita de IAM ou angina instável)",
      "Suspeita de IAM ou angina instável: encaminhar para atendimento emergencial.",
      "Enquanto aguarda a ambulância: repouso, sinais vitais e ECG, AAS 100 mg (3 comprimidos mastigados), oxigênio se hipóxia e nitrato sublingual (exceto em hipotensão ou uso de inibidores da fosfodiesterase-5).",
      "Encaminhamento ao cardiologista: estratificação após evento agudo; diagnóstico recente de alto risco (> 90%); sintomático apesar de tratamento otimizado; ou impossibilidade de investigação não invasiva em probabilidade intermediária/alta.",
    ]),
  ],

  "interface/cardiologia/resultado.tsx": [
    ...citacoes(`${TELECONDUTAS}, Quadro 1, p. 4`, [
      "Angina típica",
      "Angina atípica",
      "Dor não anginosa",
    ]),
    ...autorais([
      "Probabilidade pré-teste (base):",
      "%",
      "Ajustada por fatores de risco:",
      "% a",
      "(pode ultrapassar 90%)",
      "Resultado",
      "Informe idade, sexo, as características da dor e os fatores de risco, e avalie.",
      "Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça a avaliação.",
      "Nova avaliação",
      "Fora do escopo da fonte",
      "Fonte clínica",
      "·",
      "Entrada incompleta ou implausível",
      "Resultado desatualizado: os dados foram editados após a avaliação. Avalie novamente.",
      "Estrato de probabilidade:",
      "Conduta",
      "Investigar causas não cardíacas:",
    ]),
  ],

  "interface/cardiologia/tela.tsx": [
    ...autorais([
      "Probabilidade pré-teste de cardiopatia isquêmica",
      "APS Inteligente · Fonte única:",
      "(TelessaúdeRS-UFRGS, 2017)",
    ]),
  ],
};
