# Legacy Mapping — unit `pages-next`

> Arquivos do legado que compõem este módulo. **Regenerado na re-extração 2 (2026-07-23)** pelo Reviewer: o mapa da extração 1 (IBM Plex, raiz montando a calculadora, `/api/v1/index.js` vazio) foi superado pelas features 002/004/007 e removido.

| Arquivo | LOC | Conteúdo relevante |
|---|---|---|
| `pages/_app.tsx` | 37 | Primitivos Primer + folhas de estilo na ordem (globais→cabecalho→inicio→cardiologia) + `ProvedorTemaPrimer` em `.app-raiz`; tipografia = pilha do sistema do Primer, sem fontes baixadas (feature 004) |
| `pages/_document.tsx` | 22 | `<Html lang="pt-BR">` + identidade PWA (favicon, apple-touch, manifest, theme-color) — feature 009 |
| `pages/index.tsx` | 20 | `<Head>` de privacidade; monta `TelaInicio` (home por seções) — raiz sem redirecionamento (feature 007) |
| `pages/dm2/insulina.tsx` | 20 | Rota `/dm2/insulina`; monta `TelaCalculadora` |
| `pages/pre-natal/idade-gestacional.tsx` | 19 | Rota `/pre-natal/idade-gestacional`; monta `TelaIdadeGestacional` (feature 007) |
| `pages/cardiologia/dor-toracica.tsx` | 22 | Rota `/cardiologia/dor-toracica`; monta `TelaCardiologia` (feature 010) |
| `pages/api/v1/status.ts` | 24 | 🟢 Endpoint realizado (feature 002) — coberto pela unit dedicada `pages-api-v1-status/`, não mais um placeholder vazio |

**Configuração associada:** `next.config.ts` (Turbopack `root` fixado), `tsconfig.json` (aliases `models/*`, `interface/*`).

**Testes associados:** `e2e/plataforma.spec.ts` (smoke das rotas, PWA, tema) + suíte de contrato de `/api/v1/status` (16/16).

> Nota de reconciliação: a extração 1 registrava `pages/api/v1/index.js` como 🔴 VAZIO e a tipografia como IBM Plex. Ambas as premissas foram superadas — a API está realizada em `status.ts` e a tipografia migrou para os tokens do Primer (feature 004).
