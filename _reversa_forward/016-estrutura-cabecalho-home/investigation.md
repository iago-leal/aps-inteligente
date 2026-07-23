# Investigação: estrutura do cabeçalho da home

> Feature `016-estrutura-cabecalho-home` · 2026-07-23

## 1. Pergunta de fundo

Como igualar a altura do cabeçalho entre a home (200,5px) e as calculadoras (209,0px) **sem** fixar um valor de altura, dado que a diferença é estrutural — a home funde `logo = h1` (dois blocos) e a calculadora empilha `marca + h1 + subtítulo` (três blocos)?

## 2. Alternativas avaliadas

### A. Igualar por estrutura (escolhida)

Dar à home a mesma identidade de três blocos. A altura passa a ser função do conteúdo, que se torna idêntico; o padding vertical já coincide (44/36 nas duas variantes, adendo 015). Nada a manter em sincronia.

- **Prós:** sem número mágico; a home deixa de ser caso especial; reduz o acoplamento da `Moldura` de brinde (a flag que fundia h1 e ⌂ some).
- **Contras:** toca cinco pontos de uso da `Moldura` (home + quatro calculadoras) e os testes que assumiam a logo-no-`h1`.

### B. `min-height` no `.cabecalho`

Fixar `min-height: 209px` (ou o maior medido) para nivelar por baixo.

- **Descartada:** viola o Princípio nº 5 (mínima dívida) e o RF-01 explícito ("sem `min-height` nem px chumbado"); a constante desatualiza a cada mudança de tipografia, fonte ou breakpoint. Falha silenciosa quando o conteúdo cresce.

### C. Igualar a altura em JavaScript

Medir a maior identidade e aplicar via efeito.

- **Descartada:** introduz layout thrash e dependência de runtime numa casca que hoje é CSS puro (sem JS de layout); contraria a simplicidade e a observabilidade (o valor vira invisível ao CSS).

## 3. Contrato da `Moldura`: `logoComoTitulo` × `comInicio`

O acoplamento atual está documentado em `_reversa_sdd/interface-comum/requirements.md#responsabilidades`: a mesma flag governa duas preocupações ortogonais (a logo é o `h1`? o ⌂ aparece?). Regra 11 de `_reversa_sdd/domain.md#7.2` fixa o **comportamento** — ⌂ só nas calculadoras —, mas amarra-o ao **mecanismo** `!logoComoTitulo`.

Com a alternativa A, a logo vira decorativa em toda tela, então `logoComoTitulo` perde qualquer ramo verdadeiro e fica órfã. A leitura limpa é removê-la (uma prop por responsabilidade) e expor `comInicio` (default `false`): a home não declara, as quatro calculadoras declaram. O comportamento da regra 11 é preservado; o mecanismo, desacoplado da variante visual.

Padrão aplicável: **Single Responsibility** no contrato de props — cada prop mapeia uma decisão de renderização, não um agregado de decisões correlacionadas por acaso histórico (coesão coincidente → funcional).

## 4. Subtítulo e a coluna estreita

A home renderiza numa coluna de 720px (`.inicio-secoes`), mais estreita que a das calculadoras (1180px). Hoje o subtítulo quebra em duas linhas porque a variante `destaque` o põe a 14px **e** impõe `max-width: 60ch` (força a quebra antes da borda). Aposentado o hero (D-04), o subtítulo cai a 12px e perde o `max-width`; a estimativa (~85 caracteres a ~6px/char ≈ 510px de texto numa coluna de ~656px a 1280px) indica **uma linha**. A política D-06 mantém a medição como gate: só se a estimativa falhar entra a versão enxuta.

## 5. Guardas de regressão

- **Altura (RF-01/RF-06):** no molde geométrico já usado em `e2e/cabecalho.spec.ts` (T001 da 015, `boundingBox`, ±2px), estendido de dois pontos para as cinco rotas, medindo `.cabecalho` height. Falha barulhenta ao primeiro desvio.
- **Sem número mágico (RF-01, caso negativo):** teste que lê `cabecalho.css`/`inicio.css` e falha se encontrar `height`/`min-height` no bloco do seletor `.cabecalho` — trava a invariante contra reintrodução do valor chumbado.

## 6. Fontes

- `_reversa_sdd/addenda/015-cabecalho-unificado.md` (alinhamento unificado; altura deixada para esta feature)
- `_reversa_sdd/interface-comum/requirements.md` (acoplamento da `Moldura`)
- `_reversa_sdd/domain.md#7.2` (regra 11 — ⌂ só nas calculadoras)
- `_reversa_sdd/interface-estilos/requirements.md` (folhas `cabecalho.css`/`inicio.css`, teto 400 linhas)
- Legado: `interface/comum/moldura.tsx`, `interface/estilos/{cabecalho,inicio}.css`, `e2e/cabecalho.spec.ts`
- Sem fontes externas: a decisão é interna à arquitetura de apresentação; nenhuma biblioteca nova.
