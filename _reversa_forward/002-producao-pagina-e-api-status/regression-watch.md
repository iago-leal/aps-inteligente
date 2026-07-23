# Regression Watch: Publicação em produção da primeira página e API de saúde (status)

> Identificador: `002-producao-pagina-e-api-status`
> Data: `2026-07-19`
> Fonte: `legacy-impact.md` §4 (Modificadas) + decisões 🟢 do roadmap

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| W001 | `architecture.md` §2 (container fantasma); roadmap 002 D-01 | `pages/api/v1/status.ts` existe e é a única rota da API v1: GET → 200 com corpo fixo; qualquer outro método → 405 com `Allow: GET` | presença | Re-extração não encontra a rota, encontra rotas extras sem spec, ou o handler não discrimina método |
| W002 | `architecture.md` §2; `domain.md` §7 (vestígio); D-01 | Os placeholders `pages/api/v1/index.js` e `tests/integration/api/v1/index.js` não existem e não reaparecem | ausência | Qualquer arquivo vazio ressurgindo sob `pages/api/` ou `tests/integration/api/` |
| W003 | ADR 0002 (privacidade por arquitetura); `architecture.md` §6 dívida 8; D-06 | `next.config.ts` mantém `headers()` com CSP sem terceiros (só produção), `Referrer-Policy: no-referrer` e `X-Content-Type-Options: nosniff` | presença | Bloco removido, CSP com origem externa, ou cabeçalhos ausentes na resposta de produção |
| W004 | `package.json` (contrato do script `test:api`); `architecture.md` §6 dívida 3; D-05 | `vitest.api.config.ts` existe com include `tests/contract/**` e `npm run test:api` roda verde contra o build de produção | presença | Script voltando a apontar para config inexistente, ou suíte de contrato fora do nível `contract` |
| W005 | roadmap 002 D-07 (RF-06); `architecture.md` §6 dívida 1 | `.github/workflows/ci.yml` mantém os três jobs — verificação (todo push), contrato contra `next start`, deploy só em `main` condicionado aos dois primeiros | presença | Deploy sem `needs` dos jobs de qualidade, contrato rodando contra dev server, ou workflow removido |
| W006 | `interfaces/http-get-api-v1-status.md`; D-02/D-03/D-04 | O contrato do status é **fixo**: corpo `{atualizado_em, versao, commit}`, `Cache-Control: no-store`, sem `Set-Cookie`, denylist de privacidade; mudança incompatível exige `/api/v2` | redação | Campo removido/renomeado dentro de `/api/v1`, cache habilitado, ou corpo voltando a ser "evolutivo" |

## Observações (sem peso de regressão — origem 🟡 ou premissa)

- O-01 (D-08 🟡): `vercel.json` mantém `git.deploymentEnabled: false`; se o arquivo sumir, o auto-deploy por push volta e anula o gate. Verificar também no painel do provedor.
- O-02 (premissa 2 do roadmap §4): `commit: "local"` **em produção** indica variável `VERCEL_GIT_COMMIT_SHA` não exposta ao runtime — degradação, não bug do handler.
- O-03 (risco 5 do roadmap §9): a parte e2e da dívida 3 (`test:e2e` sem config) permanece aberta, para feature própria.
- O-04 (desvio registrado do T011): ~~o `VERCEL_TOKEN` gravado como secret é o token da sessão da CLI local do mantenedor (decisão do usuário em 2026-07-19)~~ **Resolvido em 2026-07-21**: secret substituído por token dedicado `aps-inteligente-ci` (escopo restrito a "iago-leal's projects", expira em 2027-07-22 — renovar antes disso); a sessão antiga da CLI foi revogada, e o deploy do CI voltou verde na re-execução do run 29875523030.

## Histórico de re-extrações


### Re-extração 2026-07-23 21:40 (nº 3 — absorve features 011–014)

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W002 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W003 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W004 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W005 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W006 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
### Re-extração 2026-07-23 14:10

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | `pages/api/v1/status.ts` é a única rota da v1: GET → 200, outros → 405 com `Allow: GET` (unit `pages-api-v1-status/contracts.md`; verificado no código) |
| W002 | 🟢 verde | `pages/api/v1/index.js` e `tests/integration/api/v1/index.js` ausentes (verificado no `ls`) |
| W003 | 🟢 verde | `next.config` mantém CSP só em produção, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff` |
| W004 | 🟢 verde | `vitest.api.config.ts` presente; `npm run test:api` aponta para ela |
| W005 | 🟢 verde | `.github/workflows/ci.yml` com três jobs (verificacao/contrato/deploy); `deploy` tem `needs: [verificacao, contrato]` |
| W006 | 🟢 verde | contrato fixo `{atualizado_em, versao, commit}`, `Cache-Control: no-store`, sem `Set-Cookie` (`contracts.md`) |

## Arquivadas

_(vazio)_
