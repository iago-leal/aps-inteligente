// Contrato RelatorDeErros (MD-0010; RF-09 do requirements, EC-07 da UI).
// Telemetria sem SDK na fase 1: a única implementação é nula. Telemetria real
// (ex.: Sentry com scrubbing) entra no futuro trocando apenas a implementação.
// O evento carrega SOMENTE o nome do erro — nenhum payload clínico cabe no tipo.

export interface EventoDeErro {
  /** Nome da classe do erro (ex.: "TypeError"). Nunca mensagem, pilha ou dados. */
  readonly nome: string;
}

export interface RelatorDeErros {
  reportar(evento: EventoDeErro): void;
}

/** Implementação nula (fase 1): reportar é um no-op consciente. */
export const relatorNulo: RelatorDeErros = {
  reportar() {
    // MD-0010: sem SDK, sem rede, sem log — o painel honesto (EC-07) cobre o usuário.
  },
};
