# ADR 0007 — Telemetria sem SDK na fase 1: contrato `RelatorDeErros` com implementação nula

> Retroativo, reconstruído pelo Reversa Detective (2026-07-19) a partir de MD-0010 (bundle) e `relator-de-erros.ts`. Confiança: 🟢

## Contexto
O RNF de observabilidade previa eventos anônimos de erro de runtime, mas um SDK de error tracking (ex.: Sentry) adicionaria dependência com rede em runtime e vigilância contínua de scrubbing — desproporcional numa fase sem usuários externos e conflitante com a privacidade por arquitetura (ADR 0002).

## Decisão
O código reporta falhas inesperadas ao contrato `RelatorDeErros` (porta de saída na camada de interface), cuja única implementação é **nula** (no-op). O usuário fica coberto pelo painel honesto (EC-07). O tipo `EventoDeErro` transporta somente o nome da classe do erro. Adotar telemetria real no futuro é trocar a implementação, sem tocar UI nem motor.

## Status
Ativa. Gatilhos: usuários externos regulares, ou o primeiro bug de produção que o painel honesto não baste para diagnosticar.
