// Aritmética de datas civis em dias epoch UTC (RF-05, RN-10; D-07 do roadmap).
// Sem `Date` em fuso local: fusos e horário de verão tornam "diferença de dias"
// ambígua; aqui toda conta é inteira sobre Date.UTC. Data inválida é valor (null),
// nunca exceção (ADR 0004). Feature 017-puericultura-crescimento.
//
// GÊMEO DECLARADO (D-07). Este módulo é cópia deliberada de `models/gestacao/datas.ts`
// na parte que os dois domínios compartilham — `paraDiasEpoch` e a constante do dia.
// Importar de lá acoplaria dois domínios que `architecture.md` §1 descreve como
// independentes, e extrair já para um `models/comum/` tocaria motor existente, contra
// a promessa de feature aditiva do `requirements.md` §1. A convergência dos dois fica
// registrada como DÍVIDA: quando um terceiro domínio precisar da mesma aritmética, o
// preço da cópia passa a ser maior que o do acoplamento, e é aí que ela se paga.
//
// O que NÃO foi copiado, por não ter uso aqui: `somarDias` e `somarMeses`, que servem
// à regra de Naegele da datação gestacional. Copiar código morto é o modo de a dívida
// crescer sem ninguém decidir que ela deve crescer.
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

/**
 * Diferença em dias inteiros entre duas datas civis; `null` quando qualquer uma
 * delas é inválida. Negativa quando a medição precede o nascimento — a recusa dessa
 * ordem é da validação (RN-11), não daqui: este módulo informa a distância, e quem
 * decide que ela é ofensora é quem conhece a regra clínica.
 */
export function diferencaEmDias(de: DataIso, ate: DataIso): number | null {
  const inicio = paraDiasEpoch(de);
  const fim = paraDiasEpoch(ate);
  if (inicio === null || fim === null) return null;
  return fim - inicio;
}
