# Investigation: Cabeçalho unificado

> Feature `015-cabecalho-unificado` · 2026-07-23
> Pesquisa de fundo e alternativas por trás das decisões do `roadmap.md`.

## 1. Anatomia atual do cabeçalho (o real, não o idealizado)

A `Moldura` (`interface/comum/moldura.tsx`) monta um `<header class="cabecalho">` com dois filhos flex:

- `.cabecalho-identidade` — coluna: logo (como `h1` na home via `logoComoTitulo`, como `.cabecalho-marca` decorativa nas calculadoras), `h1` textual (só calculadoras), subtítulo `p`, e `.cabecalho-selo` (privacidade).
- `.cabecalho-acoes` — linha: comando de início (`IconButton as={Link}`, só quando `!logoComoTitulo`) e alternador de tema (`IconButton`).

O `.cabecalho` é `display:flex; justify-content:space-between; flex-wrap:wrap`. O eixo transversal (vertical) é governado por `align-items`, e é aí que as duas variantes divergem.

## 2. Medição da divergência (fonte: código)

| Propriedade | `padrao` (`cabecalho.css`) | `destaque` (`inicio.css`) | Efeito |
|-------------|----------------------------|----------------------------|--------|
| `align-items` | `center` (l. 27) | `flex-end` (l. 15) | **Causa direta** dos ícones em alturas diferentes |
| `h1` font-size | 20px (l. 41) | 28px (l. 24) | Identidade mais alta na home |
| identidade `gap` | 4px (l. 36) | 6px (l. 19) | Ritmo vertical distinto |
| subtítulo | 12px (l. 48) | 14px (l. 29) | Idem |
| coluna de encaixe | `50% − 558px` (l. 25) | `50% − 328px` (l. 13) | Padding lateral distinto (1180px × 720px) |
| breakpoint | 900px (l. 109) | 544px (l. 162) | Altura salta em larguras diferentes |

A logo, por outro lado, **já é coerente**: `.cabecalho-marca` e a `.cabecalho-logo` do `h1` têm ambas `height: 34px` (feature 013), e há guarda e2e que o exige (`plataforma.spec.ts:393-407`, tolerância 1px). Essa invariante é o que sustenta a decisão D-01.

## 3. Por que ancorar ao topo (`flex-start`)

O objetivo (requirements RF-02) é: ícones no mesmo lugar **mantendo** o hero da home (identidade mais alta). Com uma identidade de altura variável entre telas, qualquer alinhamento relativo à **altura total** (`center`, `flex-end`) move os ícones quando a altura muda — exatamente o defeito atual. Só o alinhamento ao **topo** (`flex-start`) é invariante à altura da identidade: os ícones assentam junto à primeira linha (logo, 34px fixos em ambas), na mesma posição relativa, independentemente de a home ter subtítulo maior ou o hero crescer.

É também o padrão idiomático de cabeçalhos com identidade multi-linha à esquerda e controles à direita: controles no topo, à altura do logotipo.

## 4. Alternativas avaliadas

1. **`flex-start` unificado (escolhida, D-01).** Invariante à altura da identidade; resolve mantendo o hero. Custo: a home passa a exibir os ícones no topo (hoje na base) — mudança visual esperada e desejada.
2. **`center` unificado.** Simples, mas o centro da identidade da home (mais alta) fica mais baixo que o da calculadora → os ícones continuariam em alturas diferentes. Não satisfaz RF-02 sem também igualar a altura da identidade (o que exigiria desfazer o hero — vetado pela decisão de escopo).
3. **`flex-end` unificado.** Espelho do anterior: a base varia com a altura. Mesmo defeito.
4. **Unificar via `grid` com linhas nomeadas.** Poderia fixar a linha dos controles independentemente do fluxo, mas troca o modelo de layout do cabeçalho inteiro por ganho marginal sobre `flex-start` — desproporcional (Princípio VIII) e mais arriscado para o wrapping responsivo.
5. **Mexer no JSX da `Moldura` (mover ações para dentro de uma faixa de topo).** Alteraria o DOM/contrato sem necessidade (D-03 veta); a solução é puramente CSS.

## 5. Padrões aplicáveis

- **Cola de layout sobre tokens Primer** (feature 004, RN-01): toda regra em `var(--*)`; a mudança não introduz cor, fonte ou sombra literal.
- **Uma folha por preocupação, teto de 400 linhas** (feature 004/011/013): o alinhamento pertence à folha do cabeçalho; o hero, à folha da home. A mudança reforça essa separação em vez de erodi-la.
- **Guarda geométrica com `boundingBox` e tolerância** (feature 013): molde reusado para a nova asserção de coincidência dos ícones (D-04).

## 6. Fontes

- Código: `interface/comum/moldura.tsx`, `interface/estilos/cabecalho.css`, `interface/estilos/inicio.css`, `e2e/plataforma.spec.ts:366-407`, `e2e/cabecalho.spec.ts`.
- Extração: `_reversa_sdd/interface-comum/requirements.md`, `_reversa_sdd/interface-estilos/requirements.md`, `_reversa_sdd/code-analysis.md#interface-comum`, `_reversa_sdd/domain.md#7.2`.
- Histórico: adendos `_reversa_sdd/addenda/{008,011,013}` (vigência superada pela re-extração 3, mas úteis como registro da intenção original do hero e das proporções).
