<!--
Template de corpo do actions.md
Carregado por /reversa-to-do e atualizado por /reversa-coding.

REGRAS DE PREENCHIMENTO:
- IDs estáveis: T001, T002, ..., zero-padded três dígitos. Nunca recicle.
- Marcador de paralelismo é [//] no início da linha de ID. Tarefas [//] não compartilham arquivo alvo.
- Coluna "Dependências" lista IDs separados por vírgula. Ações sem dependência usam "-".
- Status inicial é [ ]. /reversa-coding muda para [X] ao concluir.
- Toda ação precisa ser ATÔMICA: cabe num turno do agente, sem precisar de feedback humano no meio.
-->

# Actions: Publicação em produção da primeira página e API de saúde (status)

> Identificador: `002-producao-pagina-e-api-status`
> Data: `2026-07-19`
> Roadmap: `_reversa_forward/002-producao-pagina-e-api-status/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 14 |
| Paralelizáveis (`[//]`) | 8 |
| Maior cadeia de dependência | 8 (T001 → T003 → T004 → T008 → T010 → T012 → T013 → T014) |

## Fase 1, Preparação

<!-- Setup, scaffolding, migrações iniciais, configuração de infraestrutura local. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Extrair do bundle (`~/dev/aps-inteligente-backup.bundle`) os artefatos históricos de referência — endpoint de status (`e5e52a8`), bloco `headers()` do `next.config.ts` (`ebad6a5`), workflow de CI (`ad231bd`) e `vitest.api.config.ts` — para pasta de trabalho fora do repo (scratchpad), sem tocar em arquivos do projeto | - | `[//]` | scratchpad (consulta) | 🟢 | `[X]` |
| T002 | Remover os placeholders vazios `pages/api/v1/index.js` e `tests/integration/api/v1/index.js` (vestígio declarado no `inventory.md`; D-01) | - | `[//]` | `pages/api/v1/index.js` | 🟢 | `[X]` |
| T003 | Reconstituir `vitest.api.config.ts` na raiz, reconciliado com a decisão nova: `include` apontando para `tests/contract/**`, de modo que o script `test:api` existente funcione sem alteração no manifesto (D-05) | T001 | - | `vitest.api.config.ts` | 🟢 | `[X]` |

## Fase 2, Testes

<!-- Testes de contrato nascem antes do núcleo (Princípio VII: teste como metade da fonte). -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Escrever o teste de contrato do status conforme `interfaces/http-get-api-v1-status.md`: 200 com corpo fixo `{atualizado_em, versao, commit}` (ISO 8601, versão do manifesto, SHA ou `"local"`), `Content-Type` JSON, `Cache-Control: no-store`, ausência de `Set-Cookie`, denylist de privacidade (segredos, env, dado clínico/pessoal) e 405 + `Allow: GET` para métodos não-GET (D-02, D-03, D-04) | T003 | `[//]` | `tests/contract/api/v1/status.test.ts` | 🟢 | `[X]` |
| T005 | Escrever o teste de contrato dos cabeçalhos de segurança da página: presença de CSP sem terceiros, `Referrer-Policy: no-referrer` e `X-Content-Type-Options: nosniff` no `GET /` do build de produção (D-06) | T003 | `[//]` | `tests/contract/plataforma/cabecalhos.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

<!-- Lógica central da feature. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Implementar `pages/api/v1/status.ts`: GET → 200 com `{atualizado_em: new Date().toISOString(), versao: <manifesto>, commit: <env do provedor \|\| "local">}` e `Cache-Control: no-store`; método ≠ GET → 405 com `Allow: GET` e JSON de erro simples; sem leitura de corpo/query, sem I/O, sem cookie (D-01..D-04) | T001, T002 | `[//]` | `pages/api/v1/status.ts` | 🟢 | `[X]` |
| T007 | Reconstituir o bloco `headers()` do `next.config.ts` a partir de `ebad6a5`, reconciliado com a UI atual: CSP sem terceiros aplicada apenas em produção (dev livre para HMR), `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff` (D-06) | T001 | `[//]` | `next.config.ts` | 🟢 | `[X]` |
| T008 | Validar localmente o conjunto: `npm run build` + `npm start` + `npm run test:api` verdes contra o build de produção, mais smoke manual dos curls do `onboarding.md` §4 (calculadora renderiza com CSP ativa; mitigação do risco 1 do roadmap §9) | T004, T005, T006, T007 | - | build local (verificação) | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Cola com outras partes do sistema, contratos externos, ganchos. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T009 | Criar `vercel.json` com `git.deploymentEnabled: false`, desligando o auto-deploy por push e deixando o CI como único caminho para produção (D-08); deve entrar no mesmo commit do workflow (risco 3 do roadmap §9) | T008 | `[//]` | `vercel.json` | 🟡 | `[X]` |
| T010 | Criar `.github/workflows/ci.yml` reconstituído de `ad231bd` e ampliado: job 1 lint+typecheck+testes (todo push); job 2 contrato — `next build`, `next start`, espera ativa com poll no status e timeout (risco 4), depois `test:api`; job 3 deploy de produção via CLI do provedor com `VERCEL_TOKEN`, condicionado aos jobs 1–2 verdes e apenas em `main`; sem job e2e (D-07) | T008 | `[//]` | `.github/workflows/ci.yml` | 🟢 | `[X]` |
| T011 | Solicitar ao usuário o token do provedor e gravá-lo como secret `VERCEL_TOKEN` do repositório GitHub via `gh secret set`; se indisponível, registrar o desvio e ativar o fallback de deploy manual via CLI local após CI verde (premissa 1 do roadmap §4) | - | - | secret GitHub (infra) | 🟡 | `[X]` |
| T012 | Publicar: commit e push para `main` e acompanhar os três jobs do CI até a conclusão (verificação, contrato, deploy), confirmando que só o CI publicou — nenhum deploy paralelo do provedor (D-07, D-08, D-09) | T009, T010, T011 | - | CI remoto (execução) | 🟢 | `[ ]` |
| T013 | Verificação pós-deploy na URL padrão do provedor: `GET /` 200 renderizando a calculadora; `GET /api/v1/status` 200 com `atualizado_em`/`versao`/`commit` igual ao SHA de `main`, `no-store`, sem `Set-Cookie`; cabeçalhos de segurança presentes (critério de pronto do roadmap §10) | T012 | - | produção (verificação) | 🟢 | `[X]` |

## Fase 5, Polimento

<!-- Logs, telemetria, mensagens de erro, documentação curta. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T014 | Registrar no `README.md` a URL de produção e o procedimento curto de verificação de saúde (curl no status + abertura da raiz), apontando para o roteiro completo do `onboarding.md` (README MVP: "como verificar saúde") | T013 | - | `README.md` | 🟡 | `[X]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

- 2026-07-19 · T011 (desvio autorizado): a Vercel não emite tokens via CLI/API; com aprovação do usuário, o `VERCEL_TOKEN` gravado é o token da sessão da CLI local. Substituir por token dedicado quando conveniente (ver O-04 do `regression-watch.md`).
- 2026-07-19 · T012 (aberta): push de `e719b61` feito, mas o GitHub Actions passou a noite degradado (503s; run 29710854799 preso em `queued`). O critério "três jobs verdes" fica pendente de o run concluir.
- 2026-07-19 · T013 (desvio autorizado): com o CI indisponível e a produção servindo build antigo, o usuário autorizou o fallback do roadmap §4 — deploy manual via CLI do mesmo commit validado localmente (lint+typecheck+188 testes+build+contrato 12/12). Produção conferida: contrato fixo, `commit == e719b61`, CSP e cabeçalhos presentes. O gate do CI permanece como caminho canônico para os próximos pushes.
- 2026-07-19 · T014 executada antes de T013 (README não existia; criado como MVP): URL de produção confirmada depois, `aps-inteligente.vercel.app`, sem ajuste necessário.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-19 | Versão inicial gerada por `/reversa-to-do` | reversa |
