# Investigação — Proporções do cabeçalho da calculadora

> Feature `013-cabecalho-proporcoes` · 2026-07-23

## Diagnóstico observado (ao vivo, viewport 1280px)

Medição via `getBoundingClientRect` sobre `localhost:3000`:

| Elemento | Esquerda | Direita | Padding | Altura |
|----------|---------:|--------:|---------|-------:|
| `.cabecalho` (calculadora) | 0 | 1280 | `20px 32px` | 159px |
| conteúdo da identidade | 32 | — | — | — |
| zona de ações (borda dir.) | — | 1248 | — | — |
| `.calc-regioes` (corpo) | 50 | 1230 | `28px 32px 56px`, `max-width:1180`, `margin:0 auto` | — |
| conteúdo do corpo (dentro do gutter) | 82 | 1198 | — | — |

Conclusão: o conteúdo do cabeçalho (32 … 1248) extravasa a coluna do corpo (82 … 1198) em ~50px de cada lado, e a faixa é comprimida (20px). Na home, o cabeçalho `destaque` já encaixa na coluna do corpo (`padding: 44px max(32px, calc(50% - 328px)) 36px`) e respira. A regressão é a ausência, no `padrao`, do tratamento que a home ganhou.

## Alternativas avaliadas

1. **Padding lateral com `max()` na folha (escolhida — D-01/D-02).** Replica a técnica do hero de `inicio.css`. Sem tocar DOM. Um só ponto de mudança. Fórmula derivada da geometria do corpo: `max(32px, calc(50% - 558px))`, pois o conteúdo do corpo começa em `50% - 590px + 32px`.
2. **Wrapper de largura máxima no JSX (`<div class="cabecalho-conteudo">`) em `moldura.tsx`.** Descartada: mexeria no DOM/semântica (RN-02 de `interface-comum` pede semântica idêntica), e exigiria realinhar as asserções de integração. Ganho nulo sobre a opção CSS.
3. **`margin: 0 auto` no bloco de conteúdo.** Descartada: o cabeçalho usa `display:flex; justify-content:space-between` para separar identidade (esquerda) e ações (direita); centralizar por margin quebraria essa distribuição.
4. **Copiar literalmente o `calc(50% - 328px)` da home (coluna de 720px).** Descartada (premissa RN-04): o corpo da calculadora é 1180px; alinhar o cabeçalho a 720px o desalinharia do próprio corpo. A fidelidade pedida é ao *princípio* da home (cabeçalho compartilha a coluna do corpo + respira), não à largura absoluta.

## Padrões aplicáveis

- **Reuso de técnica interna comprovada:** o `max(gutter, calc(50% - metade-da-coluna))` já vive em `inicio.css:13`. Adotá-lo no `padrao` mantém uma só doutrina de encaixe de coluna na plataforma.
- **Cascata por especificidade em vez de flag:** alterar a base `.cabecalho` e deixar o override `destaque` vencer evita um seletor `padrao` redundante (D-04).
- **Verificação geométrica objetiva:** `getBoundingClientRect` com tolerância dá um critério de aceite reprodutível para alinhamento, superior à inspeção a olho.

## Fontes

- `interface/estilos/cabecalho.css` (estado atual, 98 linhas) e `interface/estilos/inicio.css:10-31` (hero `destaque`, técnica de referência).
- `interface/estilos/globais.css` (`.calc-regioes`: coluna de 1180px do corpo).
- `_reversa_sdd/interface-estilos/requirements.md`, `_reversa_sdd/interface-comum/requirements.md`, `_reversa_sdd/interface-inicio/requirements.md`.
- `_reversa_sdd/addenda/008-design-mais-bonito-da-home.md`, `_reversa_sdd/addenda/011-refatora-cabecalho.md`.
- Medições próprias na sessão (Chrome DevTools MCP, viewport 1280px).
