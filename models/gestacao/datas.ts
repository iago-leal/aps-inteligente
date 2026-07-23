// Aritmética de datas civis em dias epoch UTC (D-02 do roadmap; RN-01..RN-03).
// Sem `Date` em fuso local: fusos e horário de verão tornam "diferença de dias"
// ambígua; aqui toda conta é inteira sobre Date.UTC. Data inválida é valor (null),
// nunca exceção (ADR 0004). Feature 007-idade-gestacional-e-home.
import type { DataIso } from "./tipos";

const MS_POR_DIA = 86_400_000;
const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Converte `AAAA-MM-DD` em dias desde 1970-01-01 UTC; null se formato ou calendário inválido. */
export function paraDiasEpoch(data: DataIso): number | null {
  const m = FORMATO_ISO.exec(data);
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  const ms = Date.UTC(ano, mes - 1, dia);
  const confere = new Date(ms);
  if (
    confere.getUTCFullYear() !== ano ||
    confere.getUTCMonth() !== mes - 1 ||
    confere.getUTCDate() !== dia
  ) {
    return null; // calendário impossível (ex.: 30 de fevereiro) normalizaria silenciosamente
  }
  return ms / MS_POR_DIA;
}

export function deDiasEpoch(dias: number): DataIso {
  const d = new Date(dias * MS_POR_DIA);
  const ano = String(d.getUTCFullYear()).padStart(4, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/** Soma (ou subtrai) dias corridos a uma data já validada. */
export function somarDias(data: DataIso, delta: number): DataIso {
  const dias = paraDiasEpoch(data);
  if (dias === null) {
    throw new Error(`Data inválida em somarDias: ${data}`);
  }
  return deDiasEpoch(dias + delta);
}

/**
 * Soma calendárica de meses (regra de Naegele, RN-02). Dia inexistente no mês
 * destino transborda para os primeiros dias do mês seguinte (comportamento do
 * Date.UTC com dia excedente) — normalização documentada em investigation.md §4.
 */
export function somarMeses(data: DataIso, meses: number): DataIso {
  const m = FORMATO_ISO.exec(data);
  if (m === null) {
    throw new Error(`Data inválida em somarMeses: ${data}`);
  }
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1 + meses, Number(m[3]));
  return deDiasEpoch(ms / MS_POR_DIA);
}
