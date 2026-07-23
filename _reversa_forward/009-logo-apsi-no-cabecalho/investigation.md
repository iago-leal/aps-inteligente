# Investigação — Logo APSi no cabeçalho e como ícone do app

> Feature `009-logo-apsi-no-cabecalho` · 2026-07-23

## Contexto herdado (extração + adendos)

- A `Moldura` (`interface/comum/moldura.tsx`) é o cabeçalho único das três telas (home, insulina, idade gestacional). Já lê o tema por `useSyncExternalStore` (`interface/calculadora/preferencia-de-tema.ts`) e o expõe como `data-tema`. O SSR nasce claro (`lerTemaNoServidor` → `"claro"`) e o cliente ajusta — o alternador de tema já vive com esse "ajuste de um frame" hoje.
- Só a home passa `titulo="APS Inteligente"` (o wordmark). As calculadoras passam o nome da calculadora como `<h1>` e trazem "APS Inteligente" no prefixo do subtítulo.
- CSP de produção (`next.config.ts`): `img-src 'self' data:` cobre as imagens; não há `manifest-src`, que recai em `default-src 'self'` — o manifesto same-origin não exige alteração. Preserva ADR 0002 (privacidade por arquitetura) e 0007 (telemetria nula).
- Gate D-08 (adendo 004): first load JS < 100 kB gzip. Ativos em `public/` são recursos separados, fora do bundle JS.
- Brief de integração do usuário (`ativos-origem/brief-integracao.dc.html`) fixa peça→uso e cores.

## Alternativas avaliadas

### Como servir os ativos
1. **`public/` (escolhida).** Same-origin, cacheável, fora do bundle JS, zero config no Next. Referência por caminho absoluto (`/apsi-light.png`).
2. Import por componente (`import logo from "..."`). Entra no grafo do bundler; infla o first load e conflita com o gate D-08. Descartada.
3. Data URI inline no JSX/CSS. Infla HTML/JS e perde cache entre páginas. Descartada.
4. CDN/host externo. Viola CSP e ADR 0002/0007. Descartada.

### Como trocar a variante por tema
1. **`<img src={tema === "escuro" ? "/apsi-dark.png" : "/apsi-light.png"}>` (escolhida).** Um só elemento; reaproveita o `tema` que a Moldura já computa; herda exatamente o comportamento de hidratação atual (sem flash novo além do que o alternador já tem).
2. Dois `<img>` alternados por CSS em `[data-tema]`. Ambos no DOM; risco de o leitor de tela expor dois `alt="APS Inteligente"` (a menos que `display:none` remova do a11y tree — funciona, mas é mais frágil que um só elemento). Descartada por simplicidade.
3. `<picture>` com `prefers-color-scheme`. Segue a preferência do **sistema operacional**, não a preferência persistida em `localStorage` que o app respeita. Divergiria do alternador. Descartada.

### `next/image` vs `<img>` simples
- `<img>` simples (escolhida): PNG pequeno e estático, sem necessidade de otimização/resize dinâmico; consistente com o uso de componentes Primer sem pipeline de imagem; não adiciona loader nem rota `/​_next/image`.
- `next/image`: traria otimização e `srcset`, mas exige configuração e uma rota de otimização — custo desproporcional ao ativo. Descartada por proporcionalidade (Princípio VIII).

### Papel da logo na Moldura (home vs calculadoras)
- **Prop explícita `logoComoTitulo` (escolhida).** Contrato claro; a home decide que a logo é o `<h1>`, as calculadoras mantêm o h1 textual e recebem a logo como marca decorativa. Não sobrecarrega `apresentacao` (que é só CSS — O-08-03 do adendo 008).
- Inferir de `apresentacao` ou de `titulo`: acoplamento estilo↔semântica ou mágica frágil. Descartadas.

## Padrões aplicáveis

- **PWA mínimo (Pages Router):** `<link rel="manifest">` + `apple-touch-icon` + `theme-color` no `_document`; `manifest.webmanifest` com `name`, `short_name`, `theme_color`, `background_color`, `display: "standalone"`, `icons` (192 + 512). MIME `application/manifest+json` é servido automaticamente pelo Next para arquivos em `public/`.
- **Acessibilidade de logotipo em heading:** imagem dentro do `<h1>` com `alt` igual ao texto que substitui preserva o nome acessível do heading; logo puramente estética recebe `alt=""` + `aria-hidden="true"`.

## Fontes

- Código: `interface/comum/moldura.tsx`, `interface/inicio/tela.tsx`, `interface/calculadora/tela.tsx`, `interface/gestacao/tela.tsx`, `interface/calculadora/preferencia-de-tema.ts`, `pages/_document.tsx`, `next.config.ts`, `interface/estilos/globais.css`.
- Extração: `_reversa_sdd/addenda/008`, `_reversa_sdd/addenda/004`, `_reversa_sdd/addenda/002`, `_reversa_sdd/code-analysis.md#módulo-3`, ADR 0002/0007.
- Brief do usuário: `ativos-origem/brief-integracao.dc.html`.
