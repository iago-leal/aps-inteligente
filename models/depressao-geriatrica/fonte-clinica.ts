// Constantes e catálogo de referências da fonte clínica da Escala de Depressão Geriátrica.
// Fonte única desta unit (ADR 0001; uma fonte por unit, ADR 0011): Escala de Depressão
// Geriátrica (GDS), Linhas de Cuidado, Ministério da Saúde,
// `https://linhasdecuidado.saude.gov.br/portal/tabagismo/escala-depressao-geriatrica/`.
// Cópia datada em `referencias/saude-do-idoso/`, fora do versionamento (`MD-0008`), lida em
// 30/07/2026. Feature 023: RF-02, RF-04b, RF-06, RF-07; RN-01, RN-04b, RN-05, RN-07.
//
// A FONTE É PÁGINA, E NÃO IMPRESSO. Não há número de edição a citar, e por isso
// `VERSAO_EDICAO` se apoia na DATA DE ACESSO. A reconferência depende da cópia congelada com
// `sha256`, e é MANUAL por decisão registrada em `MD-0039`: nenhum teste relê a URL. O que a
// suíte confere é outra coisa, e convém não confundir as duas — o oráculo de
// `scripts/congelar-fonte-gds.mts` compara o PRODUTO contra a CÓPIA; ninguém compara a cópia
// contra a página publicada.
import type { Providencia, ReferenciaClinica } from "./tipos";

export const FONTE_ID = "gds-linhas-de-cuidado-ms";
export const VERSAO_EDICAO = "Ministério da Saúde, acesso em 30/07/2026";

/** Nome publicado da fonte; oráculo da exceção do travessão (`docs/redacao.md` §3.2, MD-0020). */
export const NOME_PUBLICADO = "Escala de Depressão Geriátrica (GDS)";

export function referencia(localizacao: string): ReferenciaClinica {
  return Object.freeze({
    fonteId: FONTE_ID,
    versaoEdicao: VERSAO_EDICAO,
    localizacao,
  });
}

export const REFERENCIAS = Object.freeze({
  itens: referencia(
    "Tabela da escala, quinze itens (a resposta que pontua vem marcada na célula)",
  ),
  pontuacao: referencia(
    "Nota de pontuação sob a tabela (um ponto por item marcado)",
  ),
  faixas: referencia("Avaliações dos resultados (três faixas de escore)"),
  providencia: referencia("Providências com os achados/resultados"),
});

// ─── O que é DA FONTE ────────────────────────────────────────────────────────────────────
//
// Transcrição byte a byte, classe citação. A separação por comentário, e não por arquivo,
// é o molde do `NOTA_PROVENIENCIA` do risco cardiovascular: dois arquivos criariam a
// pergunta "em qual deles isto mora?" sem responder nenhuma outra (D-05).

/**
 * RN-04b: a recomendação da fonte, sem limiar. A fonte diz "escores elevados" e NÃO
 * quantifica; quantificar por ela seria o produto emitindo regra própria com aparência de
 * citação. O período termina com ponto porque é assim que a página o imprime.
 */
export const TEXTO_PROVIDENCIA =
  "escores elevados sugerem encaminhamento para avaliação neuropsicológica específica.";

/** A instrução de pontuação, que é a prosa por trás da marcação de célula (`MD-0038`). */
export const INSTRUCAO_DE_PONTUACAO =
  "Considerar 1 ponto quando os itens em cinza (sim ou não) estiverem marcados.";

/**
 * A referência bibliográfica que a PRÓPRIA FONTE cita, sob a tabela. Não é fonte do produto,
 * e por isso a unit continua com uma fonte só (ADR 0011): entra como parte da citação, para
 * que o prescritor veja de onde a página tirou o instrumento.
 */
export const REFERENCIA_BIBLIOGRAFICA_DA_FONTE =
  "Fonte: J Psychiatr Res. 1982-1983; 17(1): 37-49 e Arq Neuropsiquiatr. 1999; 57(2-B): 421-426";

export const PROVIDENCIA: Providencia = Object.freeze({
  texto: TEXTO_PROVIDENCIA,
  referencia: REFERENCIAS.providencia,
});

// ─── O que é DO PRODUTO ──────────────────────────────────────────────────────────────────
//
// Prosa autoral, sob `docs/redacao.md`. Mora no domínio, e não na tela, porque afirma coisa
// clínica: tela que a escrevesse por conta própria estaria dizendo, em nome do produto, o
// que só o domínio pode dizer (D-05).

/** RN-05: a escala rastreia, não diagnostica. O motor informa e não escolhe (ADR 0005). */
export const TEXTO_ADVERTENCIA = Object.freeze({
  rastreamentoNaoDiagnostico:
    "A escala rastreia sintomas depressivos e não estabelece diagnóstico. A avaliação e a conduta são do profissional que a aplica.",
});

/**
 * RN-07/RF-06: o público a que o instrumento se dirige, dito em prosa.
 *
 * ESTE LITERAL CARREGA SOZINHO O QUE NOUTRAS TELAS É UMA REGRA DE RECUSA. Como a fonte não
 * publica faixa etária, não há ofensor nem variante de escopo que barre a aplicação fora do
 * público previsto: o que existe entre o produto e esse uso é esta frase. Ela merece cuidado
 * de redação maior que o de um subtítulo, e é por isso que vive aqui, no domínio, e não
 * entre os textos de apresentação da tela.
 */
export const TEXTO_PUBLICO_DO_INSTRUMENTO =
  "O instrumento se dirige à pessoa idosa. A fonte não publica faixa etária de aplicação, de modo que a indicação de aplicá-lo permanece do profissional.";
