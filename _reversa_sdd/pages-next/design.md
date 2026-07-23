# pages/ — Design Técnico

> `design.md` · Re-extração 2 (2026-07-23), regenerado. Fluxograma em `../flowcharts/pages.md`.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA.

## Interface

| Arquivo | Papel | Observação |
|---------|-------|------------|
| `pages/_document.tsx` | Documento HTML base | `<Html lang="pt-BR">` + favicon/apple-touch/manifest/theme-color (PWA, feature 009) |
| `pages/_app.tsx` | Composição raiz | Primitivos Primer + estilos (globais→cabecalho→inicio→cardiologia) + `ProvedorTemaPrimer` em `.app-raiz` |
| `pages/index.tsx` | Rota `/` | `<Head>` de privacidade; monta `TelaInicio` (home) |
| `pages/dm2/insulina.tsx` | Rota `/dm2/insulina` | Monta `TelaCalculadora` |
| `pages/pre-natal/idade-gestacional.tsx` | Rota `/pre-natal/idade-gestacional` | Monta `TelaIdadeGestacional` |
| `pages/cardiologia/dor-toracica.tsx` | Rota `/cardiologia/dor-toracica` | Monta `TelaCardiologia` |
| `pages/api/v1/status.ts` | Rota `/api/v1/status` | Endpoint realizado (ver unit `pages-api-v1-status`) |

Configuração: `next.config.ts` (Turbopack `root` fixado), aliases `models/*`/`interface/*` no `tsconfig.json`. 🟢

## Fluxo Principal

1. Build gera páginas estáticas (sem data fetching nas rotas de tela). 🟢
2. `_document` define o idioma e a identidade instalável (ícones/manifest same-origin). `_document.tsx:8-15` 🟢
3. `_app` importa os primitivos Primer e as folhas de estilo na ordem, e envolve o app no `ProvedorTemaPrimer`; a tipografia é a pilha do sistema do Primer, sem baixar fontes (feature 004). `_app.tsx:7-36` 🟢
4. Cada rota monta sua tela via `interface/`; a interação subsequente é client-side. 🟢

## Fluxos Alternativos

- **Raiz sem redirecionamento:** `/` serve a home diretamente (feature 007). 🟢
- **API não-GET:** `/api/v1/status` responde `405` (ver contrato da unit dedicada). 🟢

## Dependências

- `interface/{inicio,calculadora,gestacao,cardiologia}` (telas) e `interface/comum/moldura`. 🟢
- `@primer/primitives`, `@primer/react`; `interface/calculadora/provedor-tema`. 🟢
- Next.js (Pages Router), React 19. 🟢
- Deploy: Vercel (`VERCEL_GIT_COMMIT_SHA` no status). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Pages Router (não App Router) na refundação | estrutura `pages/` | 🟢 fato; 🟡 racional |
| Tipografia = pilha do sistema do Primer, sem fontes baixadas (feature 004, D-04) | `_app.tsx:4-6` | 🟢 |
| Raiz serve a home, sem redirecionamento (feature 007) | `index.tsx:1-2` | 🟢 |
| Identidade PWA a partir de tiles same-origin (feature 009) | `_document.tsx:3-14` | 🟢 |
| Ordem de import de estilos fixada em `_app.tsx` | `_app.tsx:22-25` | 🟢 |

## Estado Interno

Nenhum. 🟢

## Observabilidade

Nenhuma no shell de páginas; o endpoint `/api/v1/status` é o ponto de observabilidade de deploy. 🟢

## Riscos e Lacunas

- 🟢 As lacunas 🔴 da extração 1 estão resolvidas: `/api/v1` realizada (feature 002), CSP e cabeçalhos verificados por suíte de contrato (16/16), tipografia migrada para o Primer.
- 🟡 404 própria: segue o default do Next; reavaliar se merece página dedicada (não bloqueia).
