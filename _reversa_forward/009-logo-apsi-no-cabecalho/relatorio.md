# Relatório da feature 009 — Logo APSi no cabeçalho e como ícone do app

> Data: 2026-07-23 · Cenário: legado · Ações: **13/13** (T001–T013)

## O que foi entregue

A logo APSi passou a identificar a plataforma em toda a superfície:

- **Home:** a logo (variante por tema) ocupa o wordmark do cabeçalho, no lugar do texto "APS Inteligente". Como é `<img alt="APS Inteligente">` dentro do `<h1>`, o nome acessível do heading não muda.
- **Calculadoras (insulina, idade gestacional):** a logo aparece como marca de brand decorativa (`aria-hidden`, `alt=""`) acima do `<h1>` textual do nome da calculadora — sem segundo heading, sem link novo.
- **Variante por tema:** `apsi-light` no claro, `apsi-dark` no escuro, trocada pelo `tema` que a `Moldura` já lê (sem flash além do já existente).
- **Identidade instalável (PWA):** favicon, `apple-touch-icon`, `theme-color` e `manifest.webmanifest` (ícones 192/512 derivados do tile), servidos same-origin.

## Evidência visual

`screenshots/` (cabeçalho, 1024 px, capturado por Playwright):

| Tela | Claro | Escuro |
|------|-------|--------|
| Home (logo como wordmark) | `home-claro-cabecalho.png` | `home-escuro-cabecalho.png` |
| Insulina (marca decorativa) | `insulina-claro-cabecalho.png` | `insulina-escuro-cabecalho.png` |
| Idade gestacional | `idade-gestacional-claro-cabecalho.png` | `idade-gestacional-escuro-cabecalho.png` |

Tamanhos verificados ao vivo: logo-wordmark 77×34 px; marca decorativa 55×24 px. Variante de tema confirmada (`data-tema` alterna e o `src` acompanha).

## Verificação

- `lint` + `typecheck` verdes.
- Unidade/integração: **284/284** (281 da 008 + 3 novos em `moldura.test.tsx`).
- Contrato: **16/16** (CSP byte a byte; manifesto servido como `application/manifest+json`).
- e2e: **15/15** (12 da 008 + 3 novos: logo no wordmark com troca de tema, marca decorativa sem link, favicon+manifesto no documento).
- `axe-baseline` sem aumento; `git diff models/` e `catalogo.ts` vazios; nenhum arquivo de código > 400 linhas.

## Bundle (gate D-08)

Delta de first load JS, medição determinística via `build-manifest.json` (ver `medicoes-bundle.md`):

| Rota | Delta |
|------|-------|
| `/` | +150 B (0,15 kB) |
| `/dm2/insulina` | +137 B |
| `/pre-natal/idade-gestacional` | +136 B |

Três ordens de grandeza abaixo do gate (100 kB). Sem decisão de exceção.

## Candidatos a watch / observações

- **O-09-01 (baixo):** flash da variante clara por um frame antes do ajuste ao tema escuro persistido — herdado do comportamento do alternador (feature 004); aceito. Vira problema só se incomodar em uso real.
- **O-09-02 (baixo):** a marca das calculadoras é decorativa por decisão (D-04). Se um dia virar link para a home, a contagem de links asserida na suíte muda — exigirá atualização deliberada dos testes.
- **O-09-03 (baixo):** `background_color`/`display: standalone` do manifesto são convencionais; conferir o comportamento de status bar/splash em iOS/Android reais.
- **O-09-04 (dívida):** os estilos do cabeçalho ficaram divididos entre `globais.css` (layout base, no teto de 400 linhas) e `cabecalho.css` (camada de logo). Uma futura consolidação poderia reunir a família `.cabecalho*` numa folha só.

## Premissas a validar pelo prescritor/mantenedor

Nenhuma de domínio — entrega inteiramente de apresentação/identidade. Aprovação **estética** da logo e do ícone fica a seu critério (screenshots acima).
