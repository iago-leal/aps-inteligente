# Actions: Proporções do cabeçalho da calculadora (padrão) alinhadas à home

> Identificador: `013-cabecalho-proporcoes`
> Data: `2026-07-23`
> Roadmap: `_reversa_forward/013-cabecalho-proporcoes/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 8 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 3 (T003 → T004 → T005) |

## Fase 1, Preparação

<!-- Baseline visual para comparar "antes/depois". -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Capturar as screenshots "antes": home (`/`) e as três calculadoras (`/dm2/insulina`, `/pre-natal/idade-gestacional`, cardiologia), nos temas claro e escuro, salvando em `screenshots/antes-*` | - | `[//]` | `_reversa_forward/013-cabecalho-proporcoes/screenshots/` | 🟢 | `[X]` |

## Fase 2, Testes

<!-- Guarda de regressão geométrica escrita antes do núcleo (falha antes, passa depois). -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Adicionar cenário e2e que, numa calculadora e em viewport ≥ 1180px, meça `getBoundingClientRect` de `.cabecalho-identidade` e de `.calc-regioes` e afirme que a borda esquerda da identidade coincide com a esquerda do conteúdo do corpo (`corpo.left + 32`) com tolerância ≤ 2px — deve falhar contra o CSS atual e passar após T003 | - | `[//]` | `e2e/plataforma.spec.ts` | 🟡 | `[X]` |

## Fase 3, Núcleo

<!-- A correção de apresentação em si. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Em `cabecalho.css`, ajustar o `padding` da regra base `.cabecalho`: lateral por `max(32px, calc(50% - 558px))` (encaixe na coluna de 1180px do corpo, D-01/D-02) e vertical restaurado ao ritmo da home (44px topo / 36px base, D-03); atualizar o comentário-cabeçalho da folha documentando a feature 013 | - | - | `interface/estilos/cabecalho.css` | 🟢 | `[X]` |
| T004 | Em `cabecalho.css`, reconciliar o `@media (max-width: 900px)` do `.cabecalho` para respiro reduzido coerente, mantendo gutter móvel de 20px e sem transbordo horizontal (D-05) | T003 | - | `interface/estilos/cabecalho.css` | 🟡 | `[X]` |
| T008 | Em `cabecalho.css`, igualar a altura de `.cabecalho-marca` à da logo da home: `height: 34px` (de 24px), largura automática preservada; atualizar o comentário da camada da logo (D-07, RF-07) | T003 | - | `interface/estilos/cabecalho.css` | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Verificação objetiva (nenhum contrato externo tocado). -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Medir com `getBoundingClientRect` o alinhamento das bordas do cabeçalho `padrao` contra a coluna do corpo em três viewports (≥1180px, 900px, 375px); confirmar tolerância ≤ 2px onde aplicável e ausência de transbordo horizontal | T003, T004 | - | `interface/estilos/cabecalho.css` | 🟢 | `[X]` |
| T006 | Rodar `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run typecheck`; confirmar verde sem alterar asserção de conteúdo do cabeçalho e a home (`destaque`) pixel-idêntica ao baseline de T001 | T002, T003, T004, T008 | - | `(suíte)` | 🟢 | `[X]` |

## Fase 5, Polimento

<!-- Registro visual do resultado. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Capturar as screenshots "depois": home e as três calculadoras nos dois temas, salvando em `screenshots/depois-*`, para o registro do adendo | T003, T004, T008 | - | `_reversa_forward/013-cabecalho-proporcoes/screenshots/` | 🟢 | `[X]` |

## Notas de execução

- **T002 (guarda geométrica):** a primeira versão media `.getBoundingClientRect` via `page.evaluate` logo após `goto`, e falhava no contexto `devices["Desktop Chrome"]` (rects zerados, `padding` com `max()` ainda não resolvido — layout não pintado). Corrigido para esperar o `h1` visível e medir por `locator.boundingBox()` (auto-wait, best practice do Playwright). Passa de forma estável.
- **Verificação (T005):** alinhamento Δ=0px em 1280 e 1600; branch `≤900px` com gutter 20px e sem transbordo; `.cabecalho-marca` a 34px; home (`destaque`) intocada (`padding: 44px 312px 36px`, `align-items: flex-end`, logo 34px). As três calculadoras compartilham a coluna `.calc-regioes` (1180px) e alinham.
- **Suíte:** lint + typecheck verdes; vitest 378/378; e2e 25/25 (2 guardas novas). `git diff` em `models/` e `catalogo.ts` vazio. `next-env.d.ts` (autogerado pelo dev server) foi restaurado ao HEAD para não poluir o commit.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
