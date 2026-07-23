# Regression Watch: Cabeçalho unificado entre home e calculadoras

> Feature `015-cabecalho-unificado` · 2026-07-23
> O que precisa continuar verdadeiro nas próximas extrações `/reversa`. Só regras 🟢
> alteradas ou removidas entram no watch principal; premissas 🟡/🔴 vão para Observações.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-------------------------------|---------------------|-------------------|
| W001 | `interface/estilos/cabecalho.css` `.cabecalho` (l. 38) | O alinhamento vertical da barra de ações é regra-única `align-items: flex-start` no `.cabecalho`, válida para as variantes `padrao` e `destaque` — os controles ancoram ao topo, à altura da logo (34px), coincidindo entre home e calculadora | `redação` (grep do valor) + geométrica (e2e) | `align-items` do `.cabecalho` volta a `center`/`flex-end`, ou reaparece um override por variante; a guarda "alternador de tema coincide verticalmente entre home e calculadora" passa a divergir > 2px |
| W002 | `interface/estilos/inicio.css` `.pagina[data-apresentacao="destaque"] .cabecalho` (l. 12-15) | A regra do hero **não** contém `align-items`: o alinhamento migrou por completo para `cabecalho.css`; `inicio.css` guarda só o peso tipográfico do hero (padding, `borderColor-muted`, h1 28px, subtítulo 14px, `gap` 6px, coluna de 328px) | `ausência` (grep) | Reaparece `align-items` na regra `.pagina[data-apresentacao="destaque"] .cabecalho`, reintroduzindo a bifurcação que a feature eliminou |

## Observações (sem peso de regressão)

Itens de confiança 🟡 no plano ou verificáveis apenas por inspeção humana — registrados sem peso de regressão até uma futura extração `/reversa` confirmá-los.

- **O-015-01 (guarda geométrica, D-04, 🟡):** a coincidência do alternador de tema depende de a logo manter altura fixa e igual (34px) nas duas telas — invariante da feature 013. Se a 013 for revertida, W001 pode passar no grep mas falhar na geometria. Encadeada à guarda "logo do cabeçalho tem o mesmo tamanho na calculadora e na home" (`plataforma.spec.ts`).
- **O-015-02 (breakpoints, T004, 🟡):** as media queries (`cabecalho.css` @900px; `inicio.css` @544px) herdam o `flex-start` sem regra própria de alinhamento. Conferido sem degradação (e2e móvel 375px sem transbordo, axe base zero); nenhum ajuste foi necessário. Vigiar se um breakpoint futuro reintroduzir `align-items`.
- **O-015-03 (aprovação estética):** a mudança visual esperada na home — ícones no topo (antes na base) — foi capturada (largo/estreito, claro/escuro) e conferida; pende a aprovação estética do mantenedor antes do commit (roadmap §10).

## Histórico de re-extrações

_(vazio — a ser preenchido pelo agente reverso quando rodar `/reversa` de novo)_

## Arquivadas

_(vazio)_
