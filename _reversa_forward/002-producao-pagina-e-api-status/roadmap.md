# Roadmap: Publicação em produção da primeira página e API de saúde (status)

> Identificador: `002-producao-pagina-e-api-status`
> Data: `2026-07-19`
> Requirements: `_reversa_forward/002-producao-pagina-e-api-status/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature é, em essência, uma **reconstituição reconciliada**: quase tudo o que ela pede já existiu no repo pré-refundação e está recuperável no bundle (`~/dev/aps-inteligente-backup.bundle`) — o endpoint de status (commit `e5e52a8`), a CSP e os cabeçalhos de segurança (`ebad6a5`), o CI (`ad231bd`) e a config de testes de API. A abordagem é recuperar esses artefatos como ponto de partida e reconciliá-los com as decisões novas do esclarecimento de 2026-07-19, que os endurecem em quatro pontos: o corpo do status deixa de ser evolutivo e ganha contrato fixo (carimbo de tempo + versão/commit), o cache passa a ser proibido (`no-store`), métodos não-GET recebem 405 e — a maior mudança em relação ao histórico — os testes de contrato **entram no CI** rodando contra o build de produção, com o deploy condicionado ao CI verde. O domínio (`models/insulina/`) e a interface (`interface/calculadora/`) não são tocados: o delta vive inteiro no shell (`pages/`, `next.config.ts`), na pirâmide de testes (nível `contract` novo) e na infraestrutura de publicação.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | O contrato do status vive em `interfaces/http-get-api-v1-status.md` e o código o projeta; o contrato histórico "evolutivo" do bundle é substituído por contrato fixo antes de qualquer código | respeita |
| II. Cadeia de derivação | O endpoint nasce de demanda validada (pedido do usuário) e de decisão histórica ativa (ADR 0008/MD-0011); cada artefato do plano cita o RF que o origina | respeita |
| III. Clarificação precede | As 5 dúvidas foram resolvidas em sessão registrada antes deste plano | respeita |
| IV. Portão G1 | Requirements travado (lacunas zeradas) antes de qualquer desenho de solução | respeita |
| V. Fase 2 proporcional | Categoria Produto: roadmap + contrato de interface + data-delta; sem moldes sem superfície correspondente | respeita |
| VI. Rastreabilidade bidirecional | Arquivos novos nascem com cabeçalho RF-NN; a matriz será alimentada pelo `actions.md` | respeita |
| VII. Testes como metade da fonte | O teste de contrato nasce junto com o endpoint (ADR 0008 exige); a pirâmide ganha o nível `contract` previsto em `tdd.md` | respeita |
| VIII. Proporcionalidade | Rigor pleno justificado: é a primeira exposição pública do Produto | respeita |

Nenhum conflito de princípio identificado.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Endpoint em `pages/api/v1/status.ts` (TypeScript, Pages Router na raiz), substituindo o placeholder vazio `pages/api/v1/index.js`, que é removido junto com `tests/integration/api/v1/index.js` | Os placeholders vazios são vestígio declarado (`inventory.md`); mantê-los deixaria `/api/v1` respondendo falha não-deliberada | (a) manter os placeholders ao lado do endpoint novo; (b) implementar handler 404 em `/api/v1` — sem RF que o origine (Princípio II) | 🟢 |
| D-02 | Corpo do status: `{ atualizado_em, versao, commit }` — carimbo ISO 8601 gerado na resposta, versão do manifesto e SHA do commit publicado via variável de ambiente do provedor, com fallback `"local"` fora dele | RN-01/RF-02 (esclarecimento Q4); nomes em português seguem o idioma do código legado | contrato "evolutivo" do histórico (campos livres) — contradiz o contrato fixo decidido | 🟢 |
| D-03 | Resposta com `Cache-Control: no-store` emitido pelo handler e verificado pelo teste de contrato | RN-05/RF-03 (esclarecimento Q5): status cacheado mente | cache curto com `max-age` — descartado pelo usuário na Q5 | 🟢 |
| D-04 | Handler discrimina método: `GET` → 200; qualquer outro → 405 com header `Allow: GET` | RN-04/RF-05; o Pages Router entrega qualquer método ao handler, a discriminação é responsabilidade nossa (nota do contrato histórico) | comportamento do stub histórico (responde igual a tudo) | 🟢 |
| D-05 | Testes de contrato em `tests/contract/api/v1/status.test.ts` e `tests/contract/plataforma/cabecalhos.test.ts`, executados por `vitest.api.config.ts` reconstituído (include `tests/contract/**`); o script `test:api` existente passa a funcionar sem alteração no manifesto | Doutrina da pirâmide (`tdd.md`, Princípio VII) nomeia o nível `contract`; o script `test:api` já aponta para essa config (RF-04) | localização histórica `tests/integration/api/**` — misturaria níveis da pirâmide | 🟢 |
| D-06 | Reconstituir o bloco `headers()` do `next.config.ts` histórico (`ebad6a5`): CSP sem terceiros aplicada só em produção, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`; teste de contrato cobre os cabeçalhos | RN-06/RF-07 (esclarecimento Q3); a CSP histórica já convivia com `next/font` self-hosted e estilos inline | escrever CSP nova do zero — desperdiça artefato validado no repo antigo | 🟢 |
| D-07 | CI no GitHub Actions reconstituído de `ad231bd` e ampliado: job 1 lint+typecheck+testes (todo push); job 2 contrato — `next build`, `next start`, aguarda o status responder e roda `test:api` contra o build de produção (CSP ativa); job 3 deploy de produção via CLI do provedor, condicionado aos jobs 1–2 verdes, apenas em `main` | RN-03/RF-06 (esclarecimento Q2): gate de ponta a ponta; rodar o contrato contra `next start` verifica RF-03 e RF-07 no mesmo alvo que vai ao ar | (a) auto-deploy do provedor por push, sem gate — viola RF-06; (b) "ignored build step" do provedor — não consulta o CI; (c) job e2e do CI histórico — sem config Playwright no repo, fora do escopo (registrado em §9) | 🟢 |
| D-08 | Desligar o auto-deploy por push do provedor via `vercel.json` (`git.deploymentEnabled: false`), deixando o CI como único caminho para produção | Sem isso o push publicaria em paralelo ao gate, anulando D-07 | manter auto-deploy e aceitar gate consultivo — viola RF-06 (Must) | 🟡 |
| D-09 | O deploy usa a URL padrão do provedor; nenhuma configuração de domínio próprio | Esclarecimento Q1 (escopo negativo explícito) | — | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| O usuário fornecerá um token do provedor de hospedagem para o secret do CI (`VERCEL_TOKEN`), pedido no momento da execução | §5 RF-06 (deploy pelo CI) | Sem o token, o job de deploy não roda; fallback temporário: deploy manual via CLI local após CI verde, registrado como desvio |
| A variável de ambiente do provedor com o SHA do commit está disponível no runtime das funções | §4 RN-01 (campo `commit`) | Campo `commit` degradaria para o fallback; corrige-se expondo a variável no build |

Nenhuma premissa deriva de `[DÚVIDA]` — todas foram resolvidas no clarify.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| API v1 (container fantasma) | `_reversa_sdd/architecture.md#2-containers-e-componentes` | contrato-novo | `pages/api/v1/status.ts` materializa a rota de saúde prevista pela ADR 0008 |
| Placeholder `pages/api/v1/index.js` | `_reversa_sdd/code-analysis.md#módulo-3--pages-shell-nextjs` | componente-extinto | Removido junto com `tests/integration/api/v1/index.js`; substituídos pelos artefatos reais |
| Shell (`next.config.ts`) | `_reversa_sdd/architecture.md#6-dívidas-técnicas` (dívida 8) | regra-alterada | Bloco `headers()` reconstituído: CSP de produção + cabeçalhos de segurança |
| Pirâmide de testes | `_reversa_sdd/architecture.md#5-qualidade-e-testes` | componente-novo | Nível `contract` (2 suítes) + `vitest.api.config.ts`; script `test:api` volta a funcionar (dívida 3, parte API) |
| CI/CD | `_reversa_sdd/inventory.md#cicd-docker-e-configuração` | componente-novo | `.github/workflows/ci.yml` com verificação, contrato contra build de produção e deploy gateado (dívida 1) |
| Publicação | `_reversa_sdd/c4-context.md` | contrato-alterado | O provedor deixa de ser deploy implícito por push e passa a receber deploy do CI (`vercel.json`) |

`models/insulina/`, `interface/calculadora/` e as máquinas de estado da UI (`state-machines.md`) **não são tocados**.

## 6. Delta no modelo de dados

- Resumo das mudanças: não há banco (ausência por design, `architecture.md#3`) e nada muda nisso. O único dado novo é o corpo público do status — metadados de build, sem dado clínico ou pessoal, em conformidade com a fronteira MD-0011.
- Detalhe completo em: `_reversa_forward/002-producao-pagina-e-api-status/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `GET /api/v1/status` | HTTP | `_reversa_forward/002-producao-pagina-e-api-status/interfaces/http-get-api-v1-status.md` |

## 8. Plano de migração

Não há dados a migrar; o "plano de migração" aqui é a sequência da primeira publicação gateada:

1. Implementar endpoint, cabeçalhos, testes de contrato e config (`D-01`..`D-06`) e validar localmente (`build` + `start` + `test:api`).
2. Criar `vercel.json` desligando o auto-deploy (`D-08`) e o workflow de CI (`D-07`).
3. Obter do usuário o token do provedor e gravá-lo como secret do repositório no GitHub.
4. Push para `main` → CI executa verificação, contrato e deploy.
5. Verificação pós-deploy na URL pública: `GET /` e `GET /api/v1/status` (critérios do RF-01/RF-02).

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| CSP reconstituída quebrar recurso da página atual (a UI mudou desde `ebad6a5`) | médio | baixo | Teste de contrato de cabeçalhos + smoke manual no build local (`next start`) antes do push; CSP só ativa em produção, dev segue livre |
| Token do provedor indisponível no momento do deploy | médio | médio | Premissa registrada; fallback: deploy manual via CLI local após CI verde, sem quebrar o gate lógico |
| Auto-deploy do provedor continuar ativo e publicar sem gate | alto | baixo | `vercel.json` com `git.deploymentEnabled: false` entra no mesmo commit do workflow; verificação pós-push de que só o CI publicou |
| Job de contrato flakear por corrida entre `next start` e o primeiro fetch | baixo | médio | Passo de espera ativa (poll no status com timeout) antes da suíte |
| Scripts `test:e2e` permanecem quebrados (fora do escopo desta feature) | baixo | certo | Registrado: a parte e2e da dívida 3 fica para feature própria; o CI não referencia e2e |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] Suíte completa local verde (unit + integration + contract via `test:api` contra build de produção)
- [ ] CI verde no remoto com os três jobs (verificação, contrato, deploy)
- [ ] Produção respondendo: `GET /` 200 com a calculadora; `GET /api/v1/status` 200 com `atualizado_em`/`versao`/`commit`, `no-store`, sem `Set-Cookie`
- [ ] Cabeçalhos de segurança e CSP presentes nas respostas de produção
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-19 | Versão inicial gerada por `/reversa-plan` | reversa |
