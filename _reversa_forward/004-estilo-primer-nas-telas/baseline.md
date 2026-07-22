# Linha de base — feature 004-estilo-primer-nas-telas

> Capturada em 2026-07-21, sobre a tela **antes** de qualquer mudança visual (T003).
> Juízes da não-regressão: D-07 (acessibilidade) e D-08 (bundle, limiar de reabertura 100 kB gzip).

## Bundle (build de produção, Next 16.2.10 / Turbopack)

Medição: HTML da página `/` + todos os assets JS/CSS referenciados, comprimidos com gzip nível 6 (script registrado no progress da feature).

| Métrica | Valor |
|---|---|
| First load JS+CSS+HTML (gzip) | **126,3 kB** (10 assets + HTML; 414,5 kB brutos) |
| Maior chunk | 90,3 kB gz (framework React/Next) |
| CSS | 3,6 kB gz (`globais.css` compilado) |
| Fontes woff2 efetivamente baixadas (IBM Plex Sans/Mono, subsets latin) | 3 arquivos, **64 kB** (fora do first load JS/CSS; somem com a D-04) |

## Acessibilidade (axe via `@axe-core/playwright`, chromium)

| Estado da tela | Violações | Detalhe |
|---|---|---|
| Inicial (formulário vazio) | **1** | `color-contrast` (serious), 1 nó: `.disclaimer` |
| Com resultado (caso início, 80 kg) | **1** | `color-contrast` (serious), mesmo nó `.disclaimer` |

Valores fixados em `e2e/axe-baseline.json`; o teste e2e falha se qualquer estado exceder a contagem. A migração para o Primer deve zerar ou manter — o `.disclaimer` re-estilizado com tokens Primer tende a resolver a violação de contraste.

## Comportamento (referência)

Suíte e2e `e2e/calculadora.spec.ts` na captura: fluxo de cálculo com ritual de revisão ✅ · tema persiste após recarga ✅ · nenhuma requisição externa ✅ · axe = linha de base ✅ (após fixação dos valores).

## Comparação pós-migração (T013, 2026-07-21)

| Métrica | Antes | Depois | Delta |
|---|---|---|---|
| First load JS+CSS+HTML (gzip) | 126,3 kB | **279,1 kB** (JS 227,0 · CSS 49,5 · HTML 2,7) | **+152,8 kB** 🔴 acima do limiar de 100 kB |
| Fontes woff2 baixadas | 3 arquivos, 64 kB | **0** | −64 kB (IBM Plex removida; pilha do sistema) |
| Violações axe (tela inicial) | 1 (`color-contrast`, serious) | **0** | −1 ✅ |
| Violações axe (tela com resultado) | 1 (`color-contrast`, serious) | **0** | −1 ✅ |
| `globais.css` | 699 linhas | **397 linhas** | dívida nº 4 quitada ✅ |

Composição do acréscimo: ~+106 kB gz de JS (`@primer/react` e dependências transitivas: behaviors, octicons, live-region, polyfill de popover) e ~+46 kB gz de CSS (tokens do `@primer/primitives` — dois temas + funcionais — e CSS Modules dos componentes). Mitigação tentada sem efeito: `experimental.optimizePackageImports` (o Turbopack já poda o barrel; o que resta é código efetivamente usado).

**Gate do D-08 disparado e resolvido:** o delta excede os 100 kB gzip fixados no esclarecimento 4; o usuário decidiu **aceitar o delta** em 2026-07-21 (D-10 do roadmap) — custo de primeiro acesso amortizado pelo cache do CDN em app de tela única de uso repetido.
