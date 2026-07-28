// Fachada do BR Code do PIX estático (feature 019-contribuicao-voluntaria-pix:
// RF-01/RF-04; RN-04/RN-05). Lógica pura fora do framework, na disciplina do
// ADR 0003: nenhum import de React, de Next ou de rede, e nenhuma leitura de
// relógio ou de aleatoriedade. Mesmos parâmetros, mesma cadeia, byte a byte.
//
// ─────────────────────────────────────────────────────────────────────────────
// ISENÇÃO DECLARADA (MD-0022; RN-06). Este é o primeiro unit de domínio NÃO
// CLÍNICO do projeto, e a tabela de invariantes da família `models/*` em
// `architecture.md#1` NÃO se aplica a ele:
//
//   · não tem fonte clínica única (ADR 0001/0011) — a especificação que ele
//     obedece é do Banco Central, e não de guia clínico;
//   · não emite `ReferenciaClinica` em nenhuma saída;
//   · não participa do catálogo congelado de referências nem da linha de base de
//     citação, e por isso `tests/apoio/citacao-linha-de-base.json` permanece
//     intocado por esta feature.
//
// A isenção está escrita porque a re-extração confere aquela tabela linha a
// linha, e ausência não declarada se lê como esquecimento, não como decisão.
// O contrato completo do formato está em
// `_reversa_forward/019-contribuicao-voluntaria-pix/interfaces/br-code.md`.
// ─────────────────────────────────────────────────────────────────────────────
import { campo, subtemplate } from "./campo";
import { crc16 } from "./crc16";
import { normalizarTexto, validarParametros } from "./validacao";
import type { ParametrosPix, SaidaBrCode } from "./tipos";

const GUI_PIX = "br.gov.bcb.pix";
const FORMATO = "01";
/** "não especificado": a contribuição não é venda de categoria alguma. */
const CATEGORIA_DO_ESTABELECIMENTO = "0000";
/** ISO 4217: real. */
const MOEDA = "986";
const PAIS = "BR";
/** O padrão usa `***` para "sem identificação de transação". */
const SEM_IDENTIFICACAO = "***";
const ID_VERIFICACAO = "63";
const COMPRIMENTO_DA_VERIFICACAO = "04";

/**
 * Monta o payload do PIX estático. Erro é valor (ADR 0004): nunca lança, e o ramo
 * de erro traz todos os ofensores de uma vez.
 */
export function montarBrCode(parametros: ParametrosPix): SaidaBrCode {
  const ofensores = validarParametros(parametros);
  if (ofensores.length > 0) {
    return { tipo: "ParametroInvalido", ofensores };
  }

  const chave = normalizarTexto(parametros.chave);
  const identificacao =
    parametros.identificacao === undefined
      ? SEM_IDENTIFICACAO
      : normalizarTexto(parametros.identificacao);

  const campos = [
    campo("00", FORMATO),
    subtemplate("26", [campo("00", GUI_PIX), campo("01", chave)]),
    campo("52", CATEGORIA_DO_ESTABELECIMENTO),
    campo("53", MOEDA),
    ...(parametros.valorSugerido === undefined
      ? []
      : [campo("54", parametros.valorSugerido.toFixed(2))]),
    campo("58", PAIS),
    campo("59", normalizarTexto(parametros.nomeBeneficiario)),
    campo("60", normalizarTexto(parametros.cidade)),
    subtemplate("62", [campo("05", identificacao)]),
  ].join("");

  // A verificação se calcula sobre a cadeia que JÁ contém `6304`: só os quatro
  // dígitos do valor ficam de fora (`interfaces/br-code.md` §3).
  const ateAVerificacao = `${campos}${ID_VERIFICACAO}${COMPRIMENTO_DA_VERIFICACAO}`;
  return { tipo: "ok", payload: `${ateAVerificacao}${crc16(ateAVerificacao)}` };
}
