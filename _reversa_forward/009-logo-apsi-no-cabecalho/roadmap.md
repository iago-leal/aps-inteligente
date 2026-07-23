# Roadmap: Logo APSi no cabeçalho e como ícone do app

> Identificador: `009-logo-apsi-no-cabecalho`
> Data: 2026-07-23
> Requirements: `_reversa_forward/009-logo-apsi-no-cabecalho/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Entrega puramente de apresentação, expressa como delta sobre três pontos do legado. Os ativos entram numa pasta `public/` nova (Next serve estáticos same-origin da raiz), o que mantém a CSP byte a byte (`img-src 'self' data:` já cobre; `manifest-src` recai em `default-src 'self'`) e deixa as imagens **fora do bundle JS** — o gate D-08 (feature 004) fica praticamente intocado. A `Moldura` (`interface/comum/moldura.tsx`, extraída na feature 007, refinada na 008) ganha a logo no cabeçalho: na **home** a logo é o próprio `<h1>` (imagem com texto alternativo "APS Inteligente", preservando o nome acessível já asserido); nas **calculadoras** a logo é marca de brand decorativa (`aria-hidden`) acima do `<h1>` textual do nome da calculadora, sem criar segundo heading nem novo link. A variante clara/escura da logo reaproveita o `tema` que a Moldura já lê via `useSyncExternalStore` (mesmo comportamento de ajuste no cliente do alternador atual — nenhum flash novo). O `pages/_document.tsx` ganha `<Head>` com favicon, `apple-touch-icon`, `theme-color` e `<link rel="manifest">`, e nasce `public/manifest.webmanifest` para tornar o app instalável (PWA). Domínio, catálogo, rotas e textos permanecem byte a byte.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. A spec é a fonte de verdade | Todo delta deriva de RF-01..RF-06 do requirements travado; nenhuma decisão nasce do código | respeita |
| II. Cadeia de derivação | Cada decisão técnica cita o RF/RN que a motiva | respeita |
| VI. Rastreabilidade bidirecional | Ações do `actions.md` (próximo passo) apontarão RF-NN ↔ arquivo ↔ teste | respeita |
| VII. Testes como fonte de verdade | Casos de validação aditivos (logo no h1 da home preserva nome acessível; marca decorativa nas calculadoras; favicon/manifest presentes) e regressão byte a byte da suíte 008 | respeita |
| VIII. Proporcionalidade | Categoria **Aplicação**: delta em camada de apresentação, sem domínio nem migração de dados; pirâmide leve (integração + e2e), sem unidade de domínio nova | respeita |

Nenhum princípio em conflito.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Ativos em `public/` nova, servidos same-origin | Next serve `public/` na raiz sem config; mantém CSP e mantém imagens fora do bundle JS (gate D-08) | (a) import por componente → entra no bundle; (b) data URI inline → infla JS e HTML; (c) CDN externa → viola ADR 0002/0007 e CSP | 🟢 |
| D-02 | Logo servida por `<img>` simples, com `src` trocado por `tema` na `Moldura` | Reaproveita o `tema` já lido via `useSyncExternalStore`; SSR nasce claro e o cliente ajusta — idêntico ao alternador atual, sem flash novo; um só `<img>` evita duplicar o nome acessível | (a) `next/image` → pipeline de otimização desnecessário para PNG pequeno; (b) dois `<img>` alternados por CSS `[data-tema]` → risco de alt duplicado no a11y tree; (c) `<picture>` com media prefers-color-scheme → não segue a preferência em localStorage, só a do SO | 🟢 |
| D-03 | `Moldura` ganha prop opcional `logoComoTitulo?: boolean` (default `false`) | Contrato explícito para o papel da logo: `true` (home) → logo é o `<h1>`; `false` (calculadoras) → logo decorativa acima do `<h1>` textual. Não sobrecarrega `apresentacao` (O-08-03: variante é só CSS) | (a) inferir papel de `apresentacao="destaque"` → acopla semântica a estilo; (b) inferir de `titulo === "APS Inteligente"` → mágica frágil | 🟢 |
| D-04 | Marca das calculadoras **decorativa** (`aria-hidden="true"`, `alt=""`), sem link | Default da lacuna do requirements: não altera nome acessível do h1 nem a contagem de links asserida na suíte 008; menor superfície de regressão | (a) link para a home → adiciona um `<a>` por página, quebra contagem de links dos testes e exigiria atualização deliberada | 🟡 |
| D-05 | `pages/_document.tsx` declara favicon, `apple-touch-icon`, `theme-color` e `<link rel="manifest">`; nasce `public/manifest.webmanifest` | Ponto canônico de `<Head>` do Pages Router; manifesto same-origin torna o app instalável (RF-03) | (a) só `<link>` no `_app` → `_document` é o lugar correto para `<Head>` estático; (b) sem manifesto → não instalável, contraria decisão de esclarecimento | 🟢 |
| D-06 | Ícone 192×192 derivado do tile 512 no coding via `sips` (Lanczos), commitado | Manifesto pede ao menos 192 e 512; derivar do original mantém build reprodutível e sob controle de versão | (a) só 512 → alguns instaladores exigem 192; (b) gerar em build step → dependência de toolchain no CI | 🟡 |
| D-07 | Refino de `.cabecalho-identidade` em `globais.css` para dimensionar a logo (altura fixa ~32 px, `width:auto`) e a marca decorativa (~24 px) | Sobre tokens Primer, sem cor própria; arquivo permanece < 400 linhas | (a) estilos inline no JSX → foge do padrão de CSS do projeto | 🟢 |

## 4. Premissas

Nenhuma. Todos os `[DÚVIDA]` do requirements foram resolvidos em `/reversa-clarify` (sessão 2026-07-23). As duas lacunas 🟡 remanescentes são decisões técnicas resolvidas aqui: marca decorativa (D-04) e local dos ativos (D-01).

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Ativos estáticos | (inexistente) | componente-novo | Nasce `public/` com `apsi-light.png`, `apsi-dark.png`, `apsi-tile.png`, `apsi-tile-192.png`, favicon, `manifest.webmanifest`; `apsi-white.png`/`apsi-navy.png` versionadas sem referência web |
| `Moldura` | `_reversa_sdd/addenda/008#moldura` (`interface/comum/moldura.tsx`) | regra-alterada | Prop `logoComoTitulo`; logo no cabeçalho com `src` por tema; home → logo no `<h1>` (alt "APS Inteligente"), calculadoras → marca decorativa acima do h1 textual |
| Home | `_reversa_sdd/addenda/008#tela-inicio` (`interface/inicio/tela.tsx`) | regra-alterada | Passa `logoComoTitulo` à Moldura; `titulo="APS Inteligente"` permanece como texto alternativo/nome acessível |
| Shell do documento | `_reversa_sdd/code-analysis.md#módulo-3` (`pages/_document.tsx`) | regra-alterada | `<Head>` com favicon, `apple-touch-icon`, `theme-color`, `<link rel="manifest">` |
| Estilos globais | `_reversa_sdd/addenda/004` (`interface/estilos/globais.css`) | regra-alterada | Regras de dimensão da logo e da marca decorativa em `.cabecalho-identidade`; sobre tokens, < 400 linhas |
| Contrato PWA | (inexistente) | contrato-novo | `manifest.webmanifest` servido em `/manifest.webmanifest` — ver `interfaces/pwa-manifest.md` |

## 6. Delta no modelo de dados

- Resumo das mudanças: **n/a.** A feature não toca o domínio (`models/**` intocado), não há banco nem persistência nova; a única "gravação" é a preferência de tema já existente (`aps-inteligente:tema`), inalterada.
- Detalhe completo em: `_reversa_forward/009-logo-apsi-no-cabecalho/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `manifest.webmanifest` | arquivo (HTTP GET estático) | `_reversa_forward/009-logo-apsi-no-cabecalho/interfaces/pwa-manifest.md` |

O contrato `/api/v1/status` (feature 002) permanece byte a byte.

## 8. Plano de migração

n/a — sem migração de dados. Sequência de implementação (detalhada no `actions.md`):

1. Medir linha de base do bundle (gate D-08) e copiar ativos de `ativos-origem/` para `public/`, derivando o 192.
2. Testes aditivos (vermelhos): logo no h1 da home preserva nome acessível; marca decorativa nas calculadoras não muda h1 nem contagem de links; favicon/manifest presentes.
3. `Moldura` + `tela.tsx` + `_document.tsx` + `manifest.webmanifest` + CSS → verde.
4. Verificação integrada, medição de bundle e evidência visual nos dois temas.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| `alt` da logo diverge e altera o nome acessível do h1 da home | alto | baixo | `alt="APS Inteligente"` exato; teste de integração assere o nome acessível byte a byte |
| Marca decorativa nas calculadoras dispara achado axe (img sem rótulo) | médio | baixo | `aria-hidden="true"` + `alt=""`; e2e confere axe ≤ linha de base |
| Contagem de links da suíte 008 muda | médio | baixo | Marca é `<img>`, não `<a>` (D-04); nenhum link novo |
| Flash da variante clara antes de ajustar para escuro | baixo | médio | Comportamento já existente do alternador; aceito; CSS-toggle é fallback se incomodar |
| Delta de bundle estoura gate D-08 | alto | muito baixo | Imagens fora do bundle JS; medir em T-final e comparar com a base |
| 192 derivado do tile sai borrado a 16 px | baixo | baixo | `sips` Lanczos; conferência visual no `relatorio.md` |
| `display: standalone` / `theme-color` altera status bar iOS de forma inesperada | baixo | baixo | Valores convencionais; conferir no onboarding |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `lint` + `typecheck` + unidade/integração + contrato 16/16 + e2e verdes; asserções da suíte 008 byte a byte
- [ ] `axe-baseline` não aumenta nos dois viewports; `git diff models/` e `catalogo.ts` vazios
- [ ] Delta de bundle medido e abaixo do gate D-08
- [ ] `regression-watch.md` gerado
- [ ] Evidência visual das três telas nos dois temas + favicon/instalação no `relatorio.md`

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-plan` | reversa |
