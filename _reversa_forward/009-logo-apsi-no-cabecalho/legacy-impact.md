# Legacy Impact — feature 009-logo-apsi-no-cabecalho

> Data: 2026-07-23 · Cenário: legado · Âncora: `_reversa_sdd/architecture.md` + `domain.md`

Entrega inteiramente de **apresentação e ativos estáticos**. Nenhuma regra 🟢 de domínio foi
alterada ou removida; o motor (`models/**`) e o catálogo (`interface/inicio/catalogo.ts`)
permanecem byte a byte (`git diff` vazio em ambos).

## Arquivos afetados

| Arquivo afetado | Componente (`architecture.md`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `public/apsi-light.png`, `apsi-dark.png`, `apsi-tile.png`, `apsi-tile-192.png`, `apsi-white.png`, `apsi-navy.png` | (nova pasta `public/`) | componente-novo | LOW | Ativos estáticos same-origin; fora do bundle JS; sob a CSP vigente |
| `public/manifest.webmanifest` | contrato externo (PWA) | delta-de-contrato-externo (contrato-novo) | LOW | Manifesto estático aditivo; ver `interfaces/pwa-manifest.md`; ausência degrada graciosamente |
| `interface/comum/moldura.tsx` | camada interface — `Moldura` (D-09) | regra-alterada | LOW | Prop `logoComoTitulo`; logo por tema; home → logo no `<h1>` (alt = título), calculadoras → marca decorativa. Semântica preservada |
| `interface/inicio/tela.tsx` | camada interface — home | regra-alterada | LOW | Passa `logoComoTitulo`; `titulo` inalterado |
| `pages/_document.tsx` | shell (`code-analysis.md#módulo-3`) | regra-alterada | LOW | `<Head>` com favicon, `apple-touch-icon`, `theme-color`, `<link rel="manifest">` |
| `interface/estilos/cabecalho.css` | camada interface — estilos | componente-novo | LOW | Folha da camada de logo do cabeçalho; sobre tokens Primer; mantém `globais.css` ≤ 400 linhas |
| `pages/_app.tsx` | shell | regra-alterada | LOW | Um import de CSS (`cabecalho.css`) após `globais.css` |
| `tests/integration/interface/moldura.test.tsx` | testes (`architecture.md#5`) | regra-alterada | LOW | 3 casos aditivos; asserções anteriores byte a byte |
| `e2e/plataforma.spec.ts` | harness e2e | regra-alterada | LOW | 3 testes aditivos; asserções anteriores e `axe-baseline` intactos |
| `README.md` | documentação | regra-alterada | LOW | Identidade da marca e nota de `logoComoTitulo` |

## Diff conceitual por componente

- **`Moldura`.** Ganha uma dimensão de identidade visual sem mudar contrato semântico: continua expondo um `<h1>` com nome acessível igual ao `titulo`, o selo de privacidade e o alternador. Na home o `<h1>` passa a conter a logo (`alt` = título); nas demais telas o `<h1>` segue textual e a logo entra como `<img>` decorativa (`aria-hidden`, `alt=""`), fora do heading. A variante clara/escura reusa o `tema` já lido por `useSyncExternalStore`.
- **Shell (`_document`, `_app`).** `_document` declara favicon/apple-touch/manifest/theme-color; `_app` importa uma folha de estilo a mais. Nenhuma mudança de runtime de página.
- **Ativos/PWA.** Nova pasta `public/` e um contrato estático (`manifest.webmanifest`) servido same-origin. Sem rede a terceiros; CSP e cabeçalhos byte a byte (contrato 16/16).

## Preservadas (regras 🟢 do `domain.md` intactas)

- **Privacidade por arquitetura / telemetria nula** (`domain.md#3.1`, ADR 0002/0007): zero rede a terceiros; ativos same-origin; nenhuma requisição nova (e2e RN-09/RN-02 verdes).
- **Determinismo e domínio puro** (ADR 0003/0004/0005): `models/**` byte a byte; nenhuma lógica clínica tocada.
- **Catálogo como fonte única de navegação** (RN-08, feature 007): `catalogo.ts` byte a byte.
- **CSP sem terceiros** (feature 002, RN-06): `next.config.ts` inalterado; `img-src 'self' data:` e `manifest-src`←`default-src 'self'` cobrem os novos recursos.
- **Nome acessível dos headings e contagem de links** (feature 008, O-08-01): preservados — a logo no `<h1>` mantém o nome via `alt`; a marca decorativa não é link.

## Modificadas (regras 🟢 alteradas ou removidas)

Nenhuma. A mudança é de apresentação/identidade; nenhuma regra 🟢 de domínio foi alterada ou removida.
