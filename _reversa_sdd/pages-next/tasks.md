# pages-next — Tarefas de Implementação

> Gerado pelo Reversa Writer em 2026-07-19.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Pré-requisitos

- [ ] Unit `interface-calculadora` implementada (exporta `TelaCalculadora` e o CSS global)
- [ ] Next.js 16 + aliases `models/*`, `interface/*` configurados (tsconfig, next.config, vitest.config)

## Tarefas

- [ ] T-01, `_document.tsx` com `<Html lang="pt-BR">`
  - Origem no legado: `pages/_document.tsx`
  - Critério de pronto: HTML servido com o atributo
  - Confiança: 🟢

- [ ] T-02, `_app.tsx`: IBM Plex Sans + IBM Plex Mono via `next/font` (var `--fonte-dados`), import do CSS global, wrapper `.app-raiz`
  - Origem no legado: `pages/_app.tsx`
  - Critério de pronto: fontes servidas do próprio domínio; tipografia de dados aplicada aos números clínicos
  - Confiança: 🟢

- [ ] T-03, `index.tsx`: metadados de privacidade + montagem de `TelaCalculadora`
  - Origem no legado: `pages/index.tsx`
  - Critério de pronto: `/` renderiza a calculadora com title/description corretos
  - Confiança: 🟢

- [X] T-04, ~~Resolver `/api/v1`~~ — **decisão do usuário (2026-07-19): manter o placeholder como lembrete** da API futura; implementação (`GET /api/v1/status`, padrão ADR 0008, referência no bundle `e5e52a8`) fica para a etapa do banco
  - Origem no legado: `pages/api/v1/index.js` (vazio); feature 002 no bundle
  - Critério de pronto: decisão registrada ✅; nada a implementar nesta fase
  - Confiança: 🟢 decidido

- [X] T-05 (recuperação), ~~Avaliar reconstituir~~ — **decisão do usuário (2026-07-19): nada por enquanto**; 404 própria, CSP e registro de módulos permanecem no backlog de dívidas (`../architecture.md` §6)
  - Origem no legado: commit `ebad6a5` (bundle)
  - Critério de pronto: decisão registrada ✅; reavaliar na próxima feature de infraestrutura
  - Confiança: 🟢 decidido

## Tarefas de Teste

- [ ] TT-01, Smoke: `/` renderiza a calculadora (integração leve ou e2e)
- [ ] TT-02 (com T-04), Teste de contrato do status + guarda de privacidade de API (sem leitura de corpo, sem `Set-Cookie`)

## Tarefas de Migração de Dados

n/a.

## Ordem Sugerida

1. T-01 → T-02 → T-03 (dependência natural do shell).
2. T-04/T-05 aguardam decisão do usuário (ver Lacunas).

## Lacunas Pendentes (🔴)

- T-04: API v1 renasce ou o placeholder sai? (impacta `package.json`, `infra/compose.yaml` e a matriz).
- T-05: quais itens da plataforma antiga (404, CSP, registro de módulos) voltam nesta fase?
