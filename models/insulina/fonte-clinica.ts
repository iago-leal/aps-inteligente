// Constantes clínicas e catálogo de referências da fonte única (MD-0008).
// Origem: RF-03 do motor e tabela canônica R-01..R-20 da spec (§6.1), extraída do
// Guia Rápido DM — SMS-Rio, 2.ª ed. atualizada, 2023 (páginas impressas).
// Decisões de ambiguidade AMB-01..10: `_reversa_forward/001-calculadora-insulina-dm2/requirements.md` §9.
// Feature 001-integrar-design-claude (RF-01/RF-02/RF-03/RF-05): grupos metformina/TFG,
// referências p. 28/58/59 e redação única da sulfonilureia (D-02/D-05/D-09).
import type { ReferenciaClinica } from "./tipos";

export const FONTE_ID = "guia-rapido-dm-sms-rio";
export const VERSAO_EDICAO = "2.ª ed. atualizada, 2023";

export function referencia(localizacao: string): ReferenciaClinica {
  return Object.freeze({
    fonteId: FONTE_ID,
    versaoEdicao: VERSAO_EDICAO,
    localizacao,
  });
}

export const REFERENCIAS = Object.freeze({
  inicio: referencia("p. 60; Figura 4, p. 62 (faixa exibida — decisão AMB-01)"),
  monitorizacaoInicial: referencia(
    "p. 60 (aferição de jejum 3×/semana por 15 dias)",
  ),
  indicacaoInsulina: referencia(
    "p. 60; quadro da Figura 4, p. 62 (HbA1c ≥ 10% — decisão AMB-08)",
  ),
  tabelaTitulacao: referencia("Figura 4, p. 62 (180 → +4 — decisão AMB-09)"),
  metaJejum: referencia(
    "Figura 4, p. 62 (faixa-alvo 71–129 — decisões AMB-02 e AMB-05)",
  ),
  agregacaoGlicemias: referencia(
    "p. 60 (média com hipoglicemia prevalecendo — decisão AMB-06)",
  ),
  hipoglicemia: referencia("Figura 4, p. 62 (jejum ≤ 70 mg/dL → reduzir 4 UI)"),
  fracionamento: referencia(
    "p. 61; Figura 4, p. 62 (½+½ preferencial, ⅔+⅓ alternativa — decisão AMB-10)",
  ),
  suspenderSulfonilureia: referencia(
    "p. 61; Figura 4, p. 62 (ao fracionar: suspender sulfonilureia, manter metformina)",
  ),
  sulfonilureiaComTfg: referencia(
    "p. 59 (sulfonilureias utilizáveis com TFG > 30 mL/min/1,73 m² — apoio à redação condicional)",
  ),
  metforminaOtimizada: referencia(
    "p. 28 (otimizar metformina, máx. 2000–2550 mg/dia); p. 58 (posologia 1000–2550 mg/dia)",
  ),
  tfgReducaoMetformina: referencia(
    "p. 58 (TFG 30–45 mL/min/1,73 m²: reduzir a dose de metformina em 50%)",
  ),
  tfgSuspensaoMetformina: referencia(
    "p. 28; p. 58 (TFG < 30 mL/min/1,73 m²: interromper metformina — risco de acidose lática)",
  ),
  faixaPlena: referencia(
    "p. 61 (insulinização plena 0,5–1,0 UI/kg/dia; conduta acima da faixa — decisão AMB-04)",
  ),
  gateIntensificacao: referencia(
    "Figura 4, p. 62–63 (repetir HbA1c após 3 meses; > 7,0% → aferir AA/AJ/AD)",
  ),
  manterConduta6Meses: referencia(
    "Figura 4, p. 63 (HbA1c ≤ 7,0% → manter conduta, HbA1c a cada 6 meses)",
  ),
  bracoAA: referencia(
    "Figura 4, p. 63 (AA ≥ 130 → Regular 4 UI antes do café)",
  ),
  bracoAJ: referencia(
    "Figura 4, p. 63 (AJ ≥ 130 — duas condutas equivalentes, decisão AMB-03)",
  ),
  bracoAD: referencia(
    "Figura 4, p. 63 (AD ≥ 130 → Regular 4 UI antes do jantar)",
  ),
  titulacaoRegular: referencia(
    "Figura 4, p. 63; p. 64 (inferência espelhada — decisão AMB-07)",
  ),
  encaminhamentoEndocrino: referencia(
    "Figura 4, p. 63 (ajustar Regular da refeição correspondente; avaliar encaminhamento)",
  ),
  posPrandial: referencia(
    "Figura 4, p. 63 (aferição pós-prandial sem parâmetro numérico no guia — NG-07)",
  ),
  cadencia: referencia("Figura 4, p. 62–63 (ajustar a cada 3 dias)"),
  limitePorAplicacao: referencia(
    "p. 68–70 (caneta: 1–60 UI por aplicação, graduação de 1 UI)",
  ),
});

export const CONSTANTES = Object.freeze({
  // R-02 (AMB-01): faixa exibida ao médico, sem número único.
  inicioFaixaAbsolutaUi: Object.freeze({ minUi: 10, maxUi: 15 }),
  inicioPorPesoUiPorKg: Object.freeze({ min: 0.1, max: 0.2 }),
  // R-04 (AMB-08): indicação de insulina.
  limiarIndicacaoHba1cPercent: 10,
  limiarIndicacaoJejumMgDl: 300,
  // R-05..R-07 (AMB-02/05/06/09): titulação basal pela glicemia de jejum.
  limiarHipoglicemiaMgDl: 70,
  metaJejumMgDl: Object.freeze({ min: 71, max: 129 }),
  limiarAumentoMenorMgDl: 130,
  limiarAumentoMaiorMgDl: 180,
  ajusteBasalUi: Object.freeze({
    aumentoMaior: 4,
    aumentoMenor: 2,
    reducao: 4,
  }),
  // R-08 (fracionamento) e R-11/R-12 (faixa plena, AMB-04).
  gatilhoFracionamentoUi: 30,
  gatilhoFracionamentoUiPorKgDia: 0.4,
  faixaPlenaUiPorKgDia: Object.freeze({ min: 0.5, max: 1.0 }),
  // R-13..R-19 (intensificação; AMB-03/07).
  metaHba1cPercent: 7.0,
  limiarPrePrandialMgDl: 130,
  doseInicialRegularUi: 4,
  ajusteRegularUi: 2,
  // R-20 (D-08): realizabilidade nos dispositivos do SUS.
  dosePorAplicacaoUi: Object.freeze({ min: 1, max: 60 }),
  cadenciaDias: 3,
  // RN-01 (feature 001-integrar-design-claude): dose de metformina — valores clínicos do guia.
  metformina: Object.freeze({
    doseMinMgDia: 1000, // posologia mínima (p. 58)
    doseOtimizadaMinMgDia: 2000, // piso da dose otimizada (p. 28)
    doseMaxMgDia: 2550, // teto posológico (p. 28, 58)
  }),
  // RN-02: limiares de TFG para ajuste/contraindicação da metformina (mL/min/1,73 m²).
  tfg: Object.freeze({
    limiarReducao50: 45, // 30–45: reduzir a dose em 50% (p. 58)
    limiarSuspensao: 30, // < 30: interromper (p. 28, 58)
  }),
  // RF-05: faixas de plausibilidade de entrada (peso/glicemia da spec 1.0; HbA1c técnica;
  // metformina/TFG são decisão técnica D-09, não conteúdo do guia — faixas largas que
  // rejeitam apenas o fisiologicamente implausível).
  plausibilidade: Object.freeze({
    pesoKg: Object.freeze({ maxExclusivo0: 0, max: 350 }),
    glicemiaMgDl: Object.freeze({ min: 10, max: 1000 }),
    hba1cPercent: Object.freeze({ min: 3, max: 20 }),
    metforminaMgDia: Object.freeze({ min: 100, max: 3000 }),
    tfg: Object.freeze({ min: 1, max: 200 }),
  }),
});

// RN-03 (D-05): redação única da recomendação de suspender sulfonilureia, com
// variante por contexto (ao fracionar / esquema já fracionado) e por estado do
// uso (explícito → direta; não informado → condicional, fiel à p. 62: "se estiver em uso").
export const TEXTO_SUSPENDER_SULFONILUREIA = Object.freeze({
  diretaAoFracionar: "Ao fracionar a NPH, suspender a sulfonilureia.",
  diretaEsquemaFracionado:
    "Esquema com NPH já fracionada: suspender a sulfonilureia.",
  condicionalAoFracionar:
    "Uso de sulfonilureia não informado: se estiver em uso, suspender ao fracionar a NPH.",
  condicionalEsquemaFracionado:
    "Uso de sulfonilureia não informado: se estiver em uso, suspender — a NPH já está fracionada.",
});
