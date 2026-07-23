# Adendo — Primer como base de estilo das telas da plataforma

> Feature: `004-estilo-primer-nas-telas`
> Data: 2026-07-21
> Cenário: legado

## Vigência

Vigente desde 2026-07-21.

Superado pela re-extração de 2026-07-23.

## Resumo da entrega

A feature adota o Primer (design system do GitHub) como base de estilo integral da plataforma: a identidade visual anterior, portada do projeto Claude Design, é superada; tokens, tipografia e componentes passam a vir de `@primer/react` + `@primer/primitives`, pinados e servidos pelo bundle próprio, dentro da CSP sem terceiros. A migração cobriu a calculadora inteira sem alterar uma única asserção comportamental de teste, quitou a dívida técnica nº 4 (`globais.css` 699 → 397 linhas) e a parte e2e da dívida nº 3 (Playwright + axe funcionais, violações 1 → 0). O gate de bundle disparou (+152,8 kB gzip no first load, limiar 100) e foi resolvido por decisão do usuário (delta aceito, D-10 do roadmap).

Ações executadas: **15 de 15** (T001–T015), incluindo a resolução do gate D-08 em T013.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/dependencies.md` | Runtime | componente-novo | O runtime deixa de ser só Next/React/pg: entram `@primer/react@38.33.0` e `@primer/primitives@11.9.0`, pinados; `@primer/css` e `@primer/view-components` seguem vetados (RN-03) — ver legacy-impact.md da feature |
| `_reversa_sdd/code-analysis.md` | Módulo 3 — pages (shell Next.js) | regra-alterada | O shell agora importa os CSS de temas do primitives e envolve a aplicação em `ProvedorTemaPrimer`; IBM Plex (`next/font`) e as variáveis `--fonte-*` foram removidas — a tipografia é a pilha do sistema do Primer |
| `_reversa_sdd/architecture.md` | §1 (componentes da camada de interface) | componente-novo | Nasce `interface/calculadora/provedor-tema.tsx`, adaptador entre `preferencia-de-tema.ts` (fonte de verdade inalterada) e o `ThemeProvider`/`BaseStyles` do Primer (RN-04) |
| `_reversa_sdd/code-analysis.md` | Módulo 2 — interface/calculadora | regra-alterada | `tela.tsx`, `resultado.tsx`, `formulario.tsx` e os subcomponentes da feature 001 foram recompostos com componentes `@primer/react`; `EstadoResultado`, validação espelhada via `CONSTANTES`, ritual de revisão e textos clínicos permanecem byte a byte |
| `_reversa_sdd/code-analysis.md` | Módulo 2 — interface/calculadora | componente-novo | `interface/calculadora/erro-de-campo.tsx` (`ErroDeCampo`, `role="alert"`) extraído para evitar import circular entre o formulário e seus subcomponentes |
| `_reversa_sdd/architecture.md` | §6 — dívidas técnicas (dívida 4) | componente-extinto | `globais.css` deixou de ser identidade visual: 699 → 397 linhas, zero cor própria, resíduo de layout 100% sobre `var(--*)` do Primer; a dívida nº 4 está quitada |
| `_reversa_sdd/addenda/001-integrar-design-claude.md` | Fonte visual (tokens, tipografia) | regra-removida | O projeto Claude Design perde a autoridade de estilo (RN-05): paleta verde-clínica e IBM Plex não existem mais no repo; o adendo 001 permanece válido apenas nas regras clínicas e na estrutura de componentes |
| `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | Cabeçalhos vigiados | regra-alterada | `next.config.ts` ganhou apenas `transpilePackages: ["@primer/react"]`; a CSP e os demais cabeçalhos permanecem byte a byte idênticos, confirmados pelo teste de contrato (D-09) |
| `_reversa_sdd/architecture.md` | §5 — testes (e2e 🔴 ausente; dívida 3) | componente-novo | Nasce o nível e2e da pirâmide: `playwright.config.ts` + `e2e/` cobrem fluxo de cálculo, tema, privacidade de rede e axe contra linha de base versionada (`e2e/axe-baseline.json`); `test:e2e` funcional |
| `_reversa_sdd/architecture.md` | §5 — testes (integração) | componente-novo | `tests/integration/interface/provedor-tema.test.tsx`: 5 casos do adaptador de tema, incluindo a chave invariante `aps-inteligente:tema` e a degradação com storage bloqueado |
| `_reversa_sdd/architecture.md` | §5 — testes (infra) | regra-alterada | `vitest.config.ts` com `server.deps.inline` para os `.css` internos do Primer; acomodação de runner, não contrato do produto |

Intocados: `models/insulina/**` (RN-01, ADR 0003) e os contratos externos (`GET /api/v1/status`, cabeçalhos de segurança — contrato 16/16 verde).

## Regras sob vigilância

W001, W002, W003, W004, W005, W006, W007, W008 — ver `_reversa_forward/004-estilo-primer-nas-telas/regression-watch.md` (inclui as observações O-01 a O-04, entre elas o delta de bundle aceito por decisão D-10).

## Fontes

- `_reversa_forward/004-estilo-primer-nas-telas/legacy-impact.md`
- `_reversa_forward/004-estilo-primer-nas-telas/regression-watch.md`
- `_reversa_forward/004-estilo-primer-nas-telas/requirements.md`
- `_reversa_forward/004-estilo-primer-nas-telas/actions.md`
- `_reversa_forward/004-estilo-primer-nas-telas/progress.jsonl`
