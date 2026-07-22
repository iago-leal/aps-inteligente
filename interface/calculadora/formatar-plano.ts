// Formatador do plano copiável — feature 006 (RF-02; RN-03; D-01/D-04/D-05).
// Projeta em texto simples o que o painel exibe, nas quatro partes do RF-02:
// esquema/dose → recomendações (hierarquia da 005) → fonte → linha de contexto.
// Alertas e condutas alternativas ficam fora (D-04): o Plano registra a conduta
// sugerida; a escolha entre equivalentes é do prescritor (ADR 0005).
import { agruparRecomendacoes } from "./agrupar-recomendacoes";
import { ROTULO_MOMENTO, textoDoDelta } from "./rotulos";
import type {
  ResultadoCalculo,
  ResultadoInicio,
  ResultadoTitulacao,
} from "models/insulina/tipos";

const LINHA_DE_CONTEXTO =
  "Plano elaborado com apoio de ferramenta de decisão clínica; a prescrição é responsabilidade do médico.";

function parteEsquemaInicio(resultado: ResultadoInicio): string {
  const { aplicacaoSugerida, faixaDoseUi, faixaPorPesoUi } = resultado;
  return [
    `Insulina ${aplicacaoSugerida.insulina} ${ROTULO_MOMENTO[aplicacaoSugerida.momento]} — dose inicial pela fonte: ${faixaDoseUi.minUi} a ${faixaDoseUi.maxUi} UI/dia.`,
    `Equivalente por peso (0,1 a 0,2 UI/kg/dia): ${faixaPorPesoUi.minUi} a ${faixaPorPesoUi.maxUi} UI/dia.`,
    "A dose exata é fixada pelo prescritor.",
  ].join("\n");
}

function parteEsquemaTitulacao(resultado: ResultadoTitulacao): string {
  const linhas = resultado.esquemaSugerido.map(
    (a) => `- ${a.insulina} ${a.doseUi} UI ${ROTULO_MOMENTO[a.momento]}`,
  );
  return [
    `Conduta: ${textoDoDelta(resultado.deltaTotalUi)}. Dose total: ${resultado.doseTotalDiaUi} UI/dia.`,
    "Esquema:",
    ...linhas,
  ].join("\n");
}

function parteRecomendacoes(resultado: ResultadoCalculo): string | null {
  if (resultado.recomendacoesAoPrescritor.length === 0) return null;
  const linhas = agruparRecomendacoes(
    resultado.recomendacoesAoPrescritor,
  ).flatMap((grupo) => [
    `- ${grupo.principal.mensagem}`,
    ...grupo.subitens.map((sub) => `  - ${sub.mensagem}`),
  ]);
  return ["Recomendações ao prescritor:", ...linhas].join("\n");
}

function parteFonte(resultado: ResultadoCalculo): string {
  const linhas = resultado.referencias.map(
    (ref) =>
      `- Guia Rápido Diabetes Mellitus — SMS-Rio, ${ref.versaoEdicao}: ${ref.localizacao}`,
  );
  return ["Fonte clínica:", ...linhas].join("\n");
}

export function formatarPlano(resultado: ResultadoCalculo): string {
  const esquema =
    resultado.modo === "inicio"
      ? parteEsquemaInicio(resultado)
      : parteEsquemaTitulacao(resultado);

  return [
    esquema,
    parteRecomendacoes(resultado),
    parteFonte(resultado),
    LINHA_DE_CONTEXTO,
  ]
    .filter((parte): parte is string => parte !== null)
    .join("\n\n");
}
