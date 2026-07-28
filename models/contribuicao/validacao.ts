// Validação da configuração do beneficiário (feature 019: RF-03; roadmap D-02;
// `interfaces/br-code.md` §4).
//
// COLETA TOTAL: nunca para no primeiro ofensor, como manda a regra 15 de
// `domain.md`. Aqui a regra pesa mais do que nos domínios clínicos, porque quem
// lê o erro é o mantenedor sozinho, meses depois, e trocar de campo em campo a
// cada execução é o tipo de atrito que faz abandonar a tarefa pela metade.
//
// TRUNCAMENTO É PROIBIDO. Um nome cortado no meio geraria código válido
// apresentando beneficiário errado, que é o pior desfecho possível: o aplicativo
// aceita, a pessoa transfere, e ninguém percebe. Por isso comprimento excedido
// RECUSA, com o limite e o observado na mensagem.
import { LIMITES } from "./tipos";
import type { CodigoOfensorPix, OfensorPix, ParametrosPix } from "./tipos";

/**
 * Reduz o texto ao conjunto que o padrão admite: remove diacríticos por
 * decomposição canônica, descarta o que sobra fora do ASCII imprimível e colapsa
 * espaços. O limite de comprimento se mede DEPOIS disto, porque é este texto que
 * chega ao payload.
 */
export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ofensor(
  campo: string,
  codigo: CodigoOfensorPix,
  mensagem: string,
  medidas?: { limite: number; observado: number },
): OfensorPix {
  return medidas
    ? { campo, codigo, mensagem, ...medidas }
    : { campo, codigo, mensagem };
}

/**
 * Cada mensagem é um literal COMPLETO, e não uma frase montada por interpolação.
 * A razão é de auditoria, não de estilo: o extrator de `scripts/inventariar-textos.mts`
 * enxerga `StringLiteral` e crase sem substituição, e é cego a template com
 * interpolação (MD-0021). Prosa montada por template escaparia ao inventário e à
 * norma de `docs/redacao.md`, que é a dívida que MD-0020 registrou. O limite e o
 * comprimento observado viajam no DADO estruturado do ofensor, onde quem trata o
 * erro os lê sem depender da frase.
 */
function verificarTexto(
  campo: "nomeBeneficiario" | "cidade" | "identificacao",
  valor: string,
  limite: number,
  codigoAusente: CodigoOfensorPix | null,
  codigoExcedido: CodigoOfensorPix,
  mensagemAusente: string,
  mensagemExcedido: string,
): OfensorPix | null {
  const normalizado = normalizarTexto(valor);

  if (normalizado.length === 0) {
    return codigoAusente === null
      ? null
      : ofensor(campo, codigoAusente, mensagemAusente);
  }

  if (normalizado.length > limite) {
    return ofensor(campo, codigoExcedido, mensagemExcedido, {
      limite,
      observado: normalizado.length,
    });
  }

  return null;
}

/** Devolve TODOS os ofensores de uma vez; lista vazia significa configuração válida. */
export function validarParametros(
  parametros: ParametrosPix,
): readonly OfensorPix[] {
  const ofensores: OfensorPix[] = [];

  if (normalizarTexto(parametros.chave).length === 0) {
    ofensores.push(
      ofensor(
        "chave",
        "CHAVE_AUSENTE",
        "Chave PIX ausente: informe a chave de recebimento em interface/contribuicao/beneficiario.ts.",
      ),
    );
  }

  const nome = verificarTexto(
    "nomeBeneficiario",
    parametros.nomeBeneficiario,
    LIMITES.nomeBeneficiario,
    "NOME_AUSENTE",
    "NOME_ACIMA_DO_LIMITE",
    "Nome do beneficiário ausente: informe o nome em interface/contribuicao/beneficiario.ts.",
    "Nome do beneficiário acima do limite do padrão, que é de 25 caracteres: use uma forma mais curta. O código recusa em vez de truncar, porque nome cortado gera código válido com beneficiário errado.",
  );
  if (nome) ofensores.push(nome);

  const cidade = verificarTexto(
    "cidade",
    parametros.cidade,
    LIMITES.cidade,
    "CIDADE_AUSENTE",
    "CIDADE_ACIMA_DO_LIMITE",
    "Cidade do beneficiário ausente: informe a cidade em interface/contribuicao/beneficiario.ts.",
    "Cidade do beneficiário acima do limite do padrão, que é de 15 caracteres: use uma forma mais curta. O código recusa em vez de truncar.",
  );
  if (cidade) ofensores.push(cidade);

  if (parametros.identificacao !== undefined) {
    const identificacao = verificarTexto(
      "identificacao",
      parametros.identificacao,
      LIMITES.identificacao,
      null,
      "IDENTIFICACAO_ACIMA_DO_LIMITE",
      "",
      "Identificação da contribuição acima do limite do padrão, que é de 25 caracteres: use uma forma mais curta ou omita o campo.",
    );
    if (identificacao) ofensores.push(identificacao);
  }

  if (
    parametros.valorSugerido !== undefined &&
    !(Number.isFinite(parametros.valorSugerido) && parametros.valorSugerido > 0)
  ) {
    ofensores.push(
      ofensor(
        "valorSugerido",
        "VALOR_INVALIDO",
        "Valor sugerido inválido: informe um número positivo e finito, ou omita o campo para deixar o valor à escolha de quem contribui.",
      ),
    );
  }

  return ofensores;
}
