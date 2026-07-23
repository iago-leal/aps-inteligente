# Adendo 009 — Logo APSi no cabeçalho e como ícone do app

> Feature: `009-logo-apsi-no-cabecalho`
> Data: 2026-07-23
> Cenário: legado

## Vigência

Vigente desde 2026-07-23.

Superado pela re-extração de 2026-07-23.

## Resumo da entrega

A plataforma ganhou identidade de marca: a logo **APSi** (wordmark manuscrito) substitui o texto do wordmark no cabeçalho e passa a ser o ícone do app. Na **home**, a logo é o próprio `<h1>` — uma imagem com texto alternativo "APS Inteligente", que preserva o nome acessível do heading já asserido pela suíte. Nas **calculadoras** (insulina, idade gestacional), cujo `<h1>` é o nome da calculadora, a logo entra como marca de brand decorativa (`aria-hidden`, `alt=""`) acima do heading, sem criar segundo `<h1>` nem link novo. A variante clara/escura (`apsi-light` `#0969da` / `apsi-dark` `#4493f8`) é trocada pelo `tema` que a `Moldura` já lê via `useSyncExternalStore`, sem flash novo. O app tornou-se instalável (PWA): favicon, `apple-touch-icon`, `theme-color` e `manifest.webmanifest` a partir do tile (ícones 192/512), tudo servido same-origin sob a CSP vigente. Entrega inteiramente de apresentação/identidade: motor (`models/**`), catálogo (`catalogo.ts`), rotas, textos e nomes acessíveis permanecem byte a byte (`git diff models/` e `catalogo.ts` vazios).

Ações concluídas: **13/13** (T001–T013), incluindo TDD dos casos aditivos (3 vermelhos que passam a verde em `moldura.test.tsx`, mais 3 e2e novos), suíte 284 unidade/integração, contrato 16/16, e2e 15/15, lint+typecheck verdes; delta de first load de ~0,15 kB gzip por rota, três ordens de grandeza abaixo do gate D-08 (100 kB).

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | `#1-estilo-arquitetural` (camada interface) | componente-novo | Nasce `public/` com os ativos da marca (`apsi-light/dark/tile/tile-192/white/navy.png`); ativos estáticos same-origin, fora do bundle JS, sob a CSP |
| `_reversa_sdd/architecture.md` | `#1-estilo-arquitetural` (camada interface) | componente-novo | Nasce `interface/estilos/cabecalho.css`: camada de logo do cabeçalho (dimensão da logo-wordmark e da marca decorativa), sobre tokens Primer; importada em `_app.tsx` após `globais.css`; mantém `globais.css` no teto de 400 linhas |
| `_reversa_sdd/architecture.md` | contrato externo (PWA) | delta-de-contrato-externo | Nasce `public/manifest.webmanifest` servido em `/manifest.webmanifest` (`application/manifest+json`); contrato estático aditivo, ver `_reversa_forward/009-logo-apsi-no-cabecalho/interfaces/pwa-manifest.md` |
| `_reversa_sdd/addenda/008-design-mais-bonito-da-home.md` | módulo `interface/comum` (`moldura.tsx`) | regra-alterada | `Moldura` ganha prop opcional `logoComoTitulo` (default `false`); logo por tema; home → logo no `<h1>` (alt = título, nome acessível preservado), calculadoras → marca decorativa fora do heading. Selo, alternador e `data-apresentacao` intactos |
| `_reversa_sdd/addenda/008-design-mais-bonito-da-home.md` | módulo `interface/inicio` (`tela.tsx`) | regra-alterada | A home passa `logoComoTitulo`; `titulo="APS Inteligente"` inalterado (vira o `alt` da logo) |
| `_reversa_sdd/code-analysis.md` | `#módulo-3` (shell `pages/_document.tsx`) | regra-alterada | `<Head>` com `<link rel="icon">`, `apple-touch-icon`, `<meta name="theme-color">` e `<link rel="manifest">` |
| `_reversa_sdd/code-analysis.md` | `#módulo-3` (shell `pages/_app.tsx`) | regra-alterada | Um import de CSS a mais (`cabecalho.css`) após `globais.css`; sem outra mudança de shell |
| `_reversa_sdd/architecture.md` | `#5` (testes) | regra-alterada | 3 casos aditivos em `tests/integration/interface/moldura.test.tsx` e 3 testes aditivos em `e2e/plataforma.spec.ts`; asserções existentes e `axe-baseline` byte a byte |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | diretriz de telas (README) | regra-alterada | README documenta a identidade da marca (`public/`, variantes por tema, favicon/manifesto) e a nota de `logoComoTitulo` na `Moldura` |

Contratos externos preexistentes: nenhum delta — CSP e cabeçalhos byte a byte (`img-src 'self' data:` e `manifest-src`←`default-src 'self'` cobrem os novos recursos; contrato 16/16), zero requisição de rede nova, zero recurso externo. Regras 🟢 do `domain.md` preservadas: privacidade por arquitetura (§3.1, ADR 0002/0007), determinismo e domínio puro (`models/**` intocado, ADR 0003/0004/0005), catálogo como fonte única de navegação (RN-08 da feature 007), nomes acessíveis dos headings e contagem de links (O-08-01 da feature 008).

## Regras sob vigilância

Watch principal **vazio**: nenhuma regra 🟢 de domínio foi alterada ou removida — a mudança é inteiramente de apresentação/identidade (ver `legacy-impact.md` → "Modificadas").

Observações sem peso de regressão: O-09-01, O-09-02, O-09-03, O-09-04 — ver `_reversa_forward/009-logo-apsi-no-cabecalho/regression-watch.md` (flash da variante clara antes do ajuste ao tema; marca decorativa vs. futura decisão de link para a home; `background_color`/`display` do manifesto em iOS/Android reais; CSS do cabeçalho dividido entre `globais.css` e `cabecalho.css`, candidato a consolidação).

## Fontes

- `_reversa_forward/009-logo-apsi-no-cabecalho/legacy-impact.md`
- `_reversa_forward/009-logo-apsi-no-cabecalho/regression-watch.md`
- `_reversa_forward/009-logo-apsi-no-cabecalho/requirements.md`
- `_reversa_forward/009-logo-apsi-no-cabecalho/interfaces/pwa-manifest.md`
- `_reversa_forward/009-logo-apsi-no-cabecalho/progress.jsonl`
