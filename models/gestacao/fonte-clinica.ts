// Constantes e catálogo de referências da fonte clínica da datação gestacional.
// Fonte única desta unit (padrão do ADR 0001; uma fonte por unit, coerente com NG-04):
// Guia Rápido Pré-Natal — SMS-Rio, 4.ª edição, 2025 (páginas impressas;
// PDF em `referencias/guia-rapido-pre-natal-sms-rio-4ed-2025.pdf`, fora do versionamento).
// Feature 007-idade-gestacional-e-home: RF-04, RN-01..RN-04, RN-06, RN-11.
import type { ReferenciaClinica } from "./tipos";

export const FONTE_ID = "guia-rapido-pre-natal-sms-rio";
export const VERSAO_EDICAO = "4.ª ed., 2025";

export function referencia(localizacao: string): ReferenciaClinica {
  return Object.freeze({
    fonteId: FONTE_ID,
    versaoEdicao: VERSAO_EDICAO,
    localizacao,
  });
}

export const REFERENCIAS = Object.freeze({
  datacaoPelaDum: referencia(
    "p. 31 (dias decorridos desde a DUM ÷ 7, em semanas e dias)",
  ),
  confiabilidadeDum: referencia(
    "p. 31 (confiável se o 1.º dia da última menstruação é conhecido e os ciclos eram regulares)",
  ),
  regraDeNaegele: referencia(
    "p. 32 (DPP: acrescentar 7 dias à DUM e somar 9 meses — regra de Naegele)",
  ),
  margensUsg: referencia(
    "p. 32 (desconsiderar a DUM fora da margem de erro da USG: 1 semana no 1.º trimestre, 2 no 2.º)",
  ),
  indicacoesUsg: referencia(
    "p. 113 (USG para datação quando a DUM é incerta ou a IG não pode ser calculada por ela)",
  ),
});

export const CONSTANTES = Object.freeze({
  diasPorSemana: 7,
  // RN-02 (p. 32): regra calendárica de Naegele.
  naegele: Object.freeze({ somarDias: 7, somarMeses: 9 }),
  // RN-04 (premissa 🟡 do roadmap §4): cortes convencionais 13+6 / 27+6 —
  // o guia usa os trimestres sem defini-los numericamente.
  trimestre: Object.freeze({
    inicioSegundoDias: 14 * 7,
    inicioTerceiroDias: 28 * 7,
  }),
  // RN-11 (p. 32): margens de erro da USG por trimestre do exame; o 3.º não
  // tem parâmetro na fonte (D-05 do roadmap).
  margemUsgDias: Object.freeze({
    primeiroTrimestre: 7,
    segundoTrimestre: 14,
  }),
  // RN-05 (premissa 🟡): limites de plausibilidade da entrada.
  plausibilidade: Object.freeze({
    dumRetroativaMaxSemanas: 44,
    igLaudoSemanas: Object.freeze({ min: 0, max: 42 }),
    igLaudoDias: Object.freeze({ min: 0, max: 6 }),
  }),
});

// RF-07: textos fixos das ressalvas ao prescritor (fonte única anti-drift,
// molde do TEXTO_SUSPENDER_SULFONILUREIA da unit de insulina).
export const TEXTO_NOTAS = Object.freeze({
  confiabilidadeDum:
    "Datação a partir da última menstruação: confiável quando o primeiro dia é conhecido e os ciclos eram regulares.",
  estimativaNaDataDeReferencia:
    "Idade gestacional calculada na data de referência informada; a datação é estimativa e não substitui a avaliação clínica.",
});
