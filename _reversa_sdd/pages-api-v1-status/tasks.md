# pages/api/v1/status — Tarefas de Implementação

> `tasks.md` · Re-extração 2.

## Pré-requisitos

- [ ] Next.js Pages Router configurado
- [ ] `package.json` acessível para import do manifesto
- [ ] `VERCEL_GIT_COMMIT_SHA` injetada no build de produção (fallback local)

## Tarefas

- [ ] **T-01** Discriminar o método e rejeitar não-GET
  - Origem no legado: `pages/api/v1/status.ts:11-15`
  - Critério de pronto: não-GET → `405` + `Allow: GET` + `{ erro }`
  - Confiança: 🟢

- [ ] **T-02** Responder GET com o corpo de status sem cache
  - Origem no legado: `pages/api/v1/status.ts:18-23`
  - Critério de pronto: `Cache-Control: no-store`; `200` com `atualizado_em`/`versao`/`commit`
  - Confiança: 🟢

- [ ] **T-03** Ler versão do manifesto e SHA do ambiente
  - Origem no legado: `pages/api/v1/status.ts:2,22`
  - Critério de pronto: `versao` do `package.json`; `commit` de `VERCEL_GIT_COMMIT_SHA` ?? `"local"`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** GET → 200 com corpo bem formado e `no-store`
- [ ] **TT-02** POST/PUT/DELETE → 405 com `Allow: GET`
- [ ] **TT-03** Contrato byte a byte (parte da suíte de contrato 16/16)

## Ordem Sugerida

1. T-01 (guarda de método), T-02 (resposta), T-03 (fontes) — arquivo único, ordem trivial.

## Lacunas Pendentes (🔴)

Nenhuma.
