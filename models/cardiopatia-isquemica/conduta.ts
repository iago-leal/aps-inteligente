// Conduta de investigação por estrato (RN-04/RN-05) e advertência de angina
// instável (RN-07). Mapa declarativo estrato → conduta; o exame recomendado é a
// ergometria, salvo impedimento (ECG basal altera a interpretação ou o paciente
// não pode exercitar), quando passa a método não invasivo. Funções puras.
// Feature 010-dor-toracica-pre-teste.
import {
  CAUSAS_NAO_CARDIACAS,
  REFERENCIAS,
  TEXTO_ADVERTENCIA,
  TEXTO_CONDUTA,
} from "./fonte-clinica";
import type {
  Advertencia,
  Conduta,
  Estrato,
  ExameRecomendado,
} from "./tipos";

export function exameRecomendado(
  estrato: Estrato,
  impedimentoErgometria: boolean,
): ExameRecomendado {
  if (estrato === "baixa") return "nenhum";
  return impedimentoErgometria
    ? "metodo-nao-invasivo-alternativo"
    : "ergometria";
}

function textoDoExame(exame: ExameRecomendado): string {
  if (exame === "ergometria") return TEXTO_CONDUTA.ergometria;
  if (exame === "metodo-nao-invasivo-alternativo") {
    return TEXTO_CONDUTA.metodoNaoInvasivoAlternativo;
  }
  return "";
}

export function condutaPara(
  estrato: Estrato,
  impedimentoErgometria: boolean,
): Conduta {
  const exame = exameRecomendado(estrato, impedimentoErgometria);

  if (estrato === "baixa") {
    return {
      tipo: "exame-nao-indicado",
      texto: TEXTO_CONDUTA.exameNaoIndicado,
      exame,
      causasNaoCardiacas: CAUSAS_NAO_CARDIACAS,
      referencia: REFERENCIAS.estratosEConduta,
    };
  }

  const base =
    estrato === "alta"
      ? TEXTO_CONDUTA.estratificacaoEEncaminhamento
      : TEXTO_CONDUTA.exameNaoInvasivo;

  return {
    tipo:
      estrato === "alta"
        ? "estratificacao-e-encaminhamento"
        : "exame-nao-invasivo",
    texto: `${base} ${textoDoExame(exame)}`.trim(),
    exame,
    referencia: REFERENCIAS.exameFuncional,
  };
}

export function advertenciasPara(sinaisInstabilidade: boolean): Advertencia[] {
  if (!sinaisInstabilidade) return [];
  return [
    {
      tipo: "ANGINA_INSTAVEL",
      mensagem: TEXTO_ADVERTENCIA.anginaInstavel,
      referencia: REFERENCIAS.anginaInstavel,
    },
  ];
}
