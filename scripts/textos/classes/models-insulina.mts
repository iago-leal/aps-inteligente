// Classe declarada de cada literal candidato de `models/insulina/**` (T010).
//
// A concentração está em `fonte-clinica.ts`, e é quase toda citação: vinte e quatro
// localizações bibliográficas do Guia Rápido DM, cada uma apontando página e figura. O que
// ali é autoral são as quatro redações da recomendação de suspender sulfonilureia, que o
// próprio cabeçalho do arquivo declara como "redação única" do produto, fiel ao sentido da
// p. 62 sem transcrever a frase.
//
// As condutas de `regra-*.ts` são AUTORAIS, e é a correção que D-16 obrigou: são o texto
// que o prescritor mais lê, porque aparece no painel de resultado e no plano copiável, e
// não na mensagem de erro. O guia dá o fluxo; a frase é nossa.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.

import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, citacoes, identificadores } from "./declarar.mts";

const GUIA = "Guia Rápido Diabetes Mellitus (SMS-Rio, 2.ª ed. atualizada, 2023)";

export const MAPA: MapaDeClasses = {
  "models/insulina/calculadora.ts": [
    ...autorais([
      "A conduta exige avaliação clínica individual do prescritor; a calculadora não sugere dose fora da fonte adotada.",
      "Considerar compartilhamento de cuidados com especialista focal.",
      "Reavaliar a glicemia e ajustar novamente a cada 3 dias, até alcançar a meta.",
    ]),
  ],

  "models/insulina/fonte-clinica.ts": [
    ...citacoes(GUIA, ["2.ª ed. atualizada, 2023"]),

    // As vinte e quatro localizações do catálogo de referências.
    ...citacoes(`${GUIA}, pp. 28–70`, [
      "p. 60; Figura 4, p. 62 (faixa exibida — decisão AMB-01)",
      "p. 60 (aferição de jejum 3×/semana por 15 dias)",
      "p. 60; quadro da Figura 4, p. 62 (HbA1c ≥ 10% — decisão AMB-08)",
      "Figura 4, p. 62 (180 → +4 — decisão AMB-09)",
      "Figura 4, p. 62 (faixa-alvo 71–129 — decisões AMB-02 e AMB-05)",
      "p. 60 (média com hipoglicemia prevalecendo — decisão AMB-06)",
      "Figura 4, p. 62 (jejum ≤ 70 mg/dL → reduzir 4 UI)",
      "p. 61; Figura 4, p. 62 (½+½ preferencial, ⅔+⅓ alternativa — decisão AMB-10)",
      "p. 61; Figura 4, p. 62 (ao fracionar: suspender sulfonilureia, manter metformina)",
      "p. 59 (sulfonilureias utilizáveis com TFG > 30 mL/min/1,73 m² — apoio à redação condicional)",
      "p. 28 (otimizar metformina, máx. 2000–2550 mg/dia); p. 58 (posologia 1000–2550 mg/dia)",
      "p. 58 (TFG 30–45 mL/min/1,73 m²: reduzir a dose de metformina em 50%)",
      "p. 28; p. 58 (TFG < 30 mL/min/1,73 m²: interromper metformina — risco de acidose lática)",
      "p. 61 (insulinização plena 0,5–1,0 UI/kg/dia; conduta acima da faixa — decisão AMB-04)",
      "Figura 4, p. 62–63 (repetir HbA1c após 3 meses; > 7,0% → aferir AA/AJ/AD)",
      "Figura 4, p. 63 (HbA1c ≤ 7,0% → manter conduta, HbA1c a cada 6 meses)",
      "Figura 4, p. 63 (AA ≥ 130 → Regular 4 UI antes do café)",
      "Figura 4, p. 63 (AJ ≥ 130 — duas condutas equivalentes, decisão AMB-03)",
      "Figura 4, p. 63 (AD ≥ 130 → Regular 4 UI antes do jantar)",
      "Figura 4, p. 63; p. 64 (inferência espelhada — decisão AMB-07)",
      "Figura 4, p. 63 (ajustar Regular da refeição correspondente; avaliar encaminhamento)",
      "Figura 4, p. 63 (aferição pós-prandial sem parâmetro numérico no guia — NG-07)",
      "Figura 4, p. 62–63 (ajustar a cada 3 dias)",
      "p. 68–70 (caneta: 1–60 UI por aplicação, graduação de 1 UI)",
    ]),

    // Redação única da recomendação de suspender sulfonilureia (RN-03, D-05): o sentido é
    // da p. 62, a frase é do produto — e por isso a norma a alcança.
    ...autorais([
      "Ao fracionar a NPH, suspender a sulfonilureia.",
      "Esquema com NPH já fracionada: suspender a sulfonilureia.",
      "Uso de sulfonilureia não informado: se estiver em uso, suspender ao fracionar a NPH.",
      "Uso de sulfonilureia não informado: se estiver em uso, suspender, pois a NPH já está fracionada.",
    ]),
  ],

  "models/insulina/regra-inicio.ts": [
    ...autorais([
      "Indicação de insulina presente (HbA1c ≥ 10% ou glicemia de jejum ≥ 300 mg/dL, inclusive ao diagnóstico).",
      "Manter a metformina ao iniciar a insulina NPH.",
      "Manter a sulfonilureia ao iniciar a insulina NPH.",
      "Orientar aferição de glicemia capilar em jejum três vezes por semana, com registro, durante 15 dias.",
    ]),
  ],

  "models/insulina/regra-intensificacao.ts": [
    ...autorais([
      "café da manhã",
      "Meta de HbA1c atingida sob esquema intensificado: ajustar a Regular da refeição correspondente e avaliar encaminhamento ao endocrinologista.",
      "Meta de HbA1c atingida: manter a conduta e repetir HbA1c a cada 6 meses.",
      "HbA1c acima da meta: aferir glicemia capilar antes do almoço (AA), antes do jantar (AJ) e antes de deitar (AD) para dirigir a intensificação.",
      "HbA1c não informada: solicitar HbA1c para dirigir a intensificação do esquema (meta ≤ 7,0%).",
      "Repetir HbA1c em 3 meses para reavaliar o esquema intensificado.",
      "HbA1c acima da meta com pré-prandiais na meta: aferir glicemias pós-prandiais. O guia não parametriza esse ajuste, e a conduta é do prescritor.",
      "Aumentar a NPH antes do café (ajustar 2 UI a cada 3 dias)",
      "Iniciar insulina Regular 4 UI antes do almoço (ajustar 2 UI a cada 3 dias)",
    ]),
  ],

  "models/insulina/regra-titulacao-basal.ts": [
    ...autorais([
      "Glicemia em faixa de hipoglicemia (≤ 70 mg/dL) no período: reduzir a insulina basal; jamais aumentar.",
      "Alternativa do guia: ⅔ da dose antes do café e ⅓ antes da ceia",
      "Manter a metformina ao fracionar a NPH.",
    ]),
  ],

  "models/insulina/validacao.ts": [
    ...autorais([
      "Informe o esquema de insulina atual para calcular a titulação.",
      "Informe ao menos uma glicemia capilar para calcular a titulação.",
      "Glicemias pré-prandiais dirigem a intensificação, que depende da HbA1c (> 7,0% após 3 meses): informe a HbA1c.",
    ]),
    ...identificadores([]),
  ],
};
