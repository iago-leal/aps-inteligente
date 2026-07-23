# Actions: Logo APSi no cabeçalho e como ícone do app

> Identificador: `009-logo-apsi-no-cabecalho`
> Data: 2026-07-23
> Roadmap: `_reversa_forward/009-logo-apsi-no-cabecalho/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 13 |
| Paralelizáveis (`[//]`) | 8 |
| Maior cadeia de dependência | 6 (T002 → T003 → T008 → T010 → T011 → T012) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T001 | Medir a linha de base do bundle: `npm run build` no estado atual e registrar o first load gzip das três rotas (`/`, `/dm2/insulina`, `/pre-natal/idade-gestacional`) em nota da feature, para a comparação do gate D-08 (roadmap D-01; RNF de desempenho) | - | `[//]` | `_reversa_forward/009-logo-apsi-no-cabecalho/` | 🟢 | `[X]` |
| `[//]` T002 | Criar `public/` e copiar de `ativos-origem/assets/` os PNGs `apsi-light.png`, `apsi-dark.png`, `apsi-tile.png`, `apsi-white.png`, `apsi-navy.png`; derivar `apsi-tile-192.png` (192×192) do tile 512 via `sips` (Lanczos), commitável (roadmap D-01/D-06; RF-04; RN-01) | - | `[//]` | `public/` | 🟢 | `[X]` |
| T003 | Criar `public/manifest.webmanifest` conforme `interfaces/pwa-manifest.md` (`name` "APS Inteligente", `short_name` "APSi", `theme_color` `#0969da`, `display` standalone, ícones 192 e 512) (roadmap D-05; RF-03; RN-04) | T002 | - | `public/manifest.webmanifest` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T004 | Testes de integração aditivos (nascem falhando) em `tests/integration/interface/moldura.test.tsx`: com `logoComoTitulo` a `Moldura` renderiza `<img alt="APS Inteligente">` **dentro** do `<h1>` e o nome acessível do heading permanece "APS Inteligente"; sem a prop (default) o `<h1>` segue textual e a logo aparece como imagem decorativa (`aria-hidden`, `alt=""`) fora do heading; selo e alternador intactos; asserções existentes byte a byte (RF-01/RF-05; RN-02/RN-05) | - | `[//]` | `tests/integration/interface/moldura.test.tsx` | 🟢 | `[X]` |
| `[//]` T005 | Testes e2e aditivos (asserções antigas byte a byte) em `e2e/plataforma.spec.ts`: na home a logo (`img` no cabeçalho) preserva o nome acessível "APS Inteligente" do heading; nas calculadoras a logo decorativa não altera o `<h1>` nem a contagem de links; o documento traz `link[rel="manifest"]` e `link[rel="icon"]`; `axe` da home ≤ linha de base (RF-01/RF-03/RF-05/RF-06) | - | `[//]` | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | `interface/comum/moldura.tsx`: prop opcional `logoComoTitulo?: boolean` (default `false`); `src` da logo alternado por `tema` (`/apsi-dark.png` no escuro, `/apsi-light.png` no claro) reusando o `useSyncExternalStore` já presente; `true` → `<h1><img alt="APS Inteligente"></h1>`; `false` → marca `<img aria-hidden alt="">` na identidade + `<h1>{titulo}</h1>`; faz T004 verde (roadmap D-02/D-03/D-04; RF-01/RF-02/RF-05; RN-02/RN-03/RN-05) | T002, T004 | - | `interface/comum/moldura.tsx` | 🟢 | `[X]` |
| T007 | `interface/inicio/tela.tsx`: passar `logoComoTitulo` à `Moldura`, mantendo `titulo="APS Inteligente"` como texto alternativo/nome acessível; nenhuma outra mudança de props (roadmap D-03; RF-01) | T006 | - | `interface/inicio/tela.tsx` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T008 | `pages/_document.tsx`: `<Head>` com `<link rel="icon">` e `apple-touch-icon` apontando ao tile, `<meta name="theme-color" content="#0969da">` e `<link rel="manifest" href="/manifest.webmanifest">`; parte de T005 verde (roadmap D-05; RF-03) | T002, T003 | `[//]` | `pages/_document.tsx` | 🟢 | `[X]` |
| `[//]` T009 | `interface/estilos/globais.css`: regras em `.cabecalho-identidade` para dimensionar a logo (altura ~32 px, `width:auto`) e a marca decorativa das calculadoras (~24 px), sobre tokens Primer, sem cor própria; arquivo permanece < 400 linhas (roadmap D-07; RF-01/RF-05) | T006 | `[//]` | `interface/estilos/globais.css` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Verificação integrada: `lint` + `typecheck` + `npm test` + `test:api` 16/16 + `test:e2e` verdes; diff das suítes existentes só com adições (nenhuma asserção alterada); `axe` sem aumento sobre `e2e/axe-baseline.json`; `git diff models/` e `git diff interface/inicio/catalogo.ts` vazios; nenhum arquivo > 400 linhas (roadmap §10) | T005, T007, T008, T009 | - | `_reversa_forward/009-logo-apsi-no-cabecalho/` | 🟢 | `[X]` |
| T011 | Medir o bundle final (`npm run build`) e comparar com a base de T001 contra o gate D-08 (< 100 kB gzip no first load); se estourar, parar e registrar decisão explícita do usuário no molde da D-10 da feature 004 (RNF de desempenho) | T001, T010 | - | `_reversa_forward/009-logo-apsi-no-cabecalho/` | 🟢 | `[X]` |
| `[//]` T012 | Consolidar `relatorio.md`: screenshots das três telas nos dois temas, evidência de favicon na aba e de instalação PWA, medições de bundle (T001/T011) e candidatos a watch (flash da variante clara antes do ajuste; marca decorativa vs. futura decisão de link para a home; `background_color`/`display` do manifesto) | T011 | `[//]` | `_reversa_forward/009-logo-apsi-no-cabecalho/relatorio.md` | 🟡 | `[X]` |
| `[//]` T013 | Atualizar o README: identidade da marca (logo em `public/`, variantes por tema, favicon e manifesto PWA); diretriz "como adicionar tela" ganha a nota do papel de `logoComoTitulo` na `Moldura` (default sem substituir o h1) | T010 | `[//]` | `README.md` | 🟢 | `[X]` |

## Notas de execução

- T009: arquivo-alvo mudou de `interface/estilos/globais.css` para uma folha nova `interface/estilos/cabecalho.css` (importada em `_app.tsx` após `globais.css`). Motivo: `globais.css` estava no teto de 400 linhas (sinal de dívida do projeto, > 400) e o roadmap D-07 exigia mantê-lo < 400; a camada de logo ganhou folha própria, no precedente do `inicio.css` da feature 008. `globais.css` permanece em 400 linhas.
- T009 (correção pós-screenshot): `.cabecalho-marca` recebeu `align-self: flex-start` — sem isso o flex `align-items: stretch` do `.cabecalho-identidade` esticava a imagem `width:auto` à largura do container e distorcia o wordmark nas calculadoras.
- T011: proxy inicial de bundle (soma bruta de chunks) descartado por ruído de re-hash; medição final é determinística via `build-manifest.json` (ver `medicoes-bundle.md`). Delta de first load ~0,15 kB gzip/rota.
- T012: screenshots capturados por script Playwright efêmero; a captura do tema escuro exige clicar no alternador (o pré-set de localStorage não reidrata no headless).


## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
