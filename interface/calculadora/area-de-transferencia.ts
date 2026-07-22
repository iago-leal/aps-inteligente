// Adaptador da área de transferência — feature 006 (RF-03; RN-05; D-02).
// Isola a API de clipboard do navegador atrás de um contrato mínimo com erro
// como valor (ADR 0004), no molde de preferencia-de-tema.ts: indisponibilidade
// (contexto não seguro, permissão negada, API ausente) vira {ok: false} para o
// painel exibir a falha honesta — jamais exceção ao chamador.
export type ResultadoCopia = { readonly ok: true } | { readonly ok: false };

export async function copiarParaAreaDeTransferencia(
  texto: string,
): Promise<ResultadoCopia> {
  try {
    await navigator.clipboard.writeText(texto);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
