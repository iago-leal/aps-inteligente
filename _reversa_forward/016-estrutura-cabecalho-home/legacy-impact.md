# Legacy-impact: estrutura do cabeçalho da home unificada

> Feature `016-estrutura-cabecalho-home` · 2026-07-23 · Cenário: **legado**
> Âncora: `_reversa_sdd/architecture.md` + `_reversa_sdd/domain.md`

## Arquivos afetados

| Arquivo afetado | Componente (`_reversa_sdd/`) | Tipo | Severidade | Justificativa |
|-----------------|------------------------------|------|------------|---------------|
| `interface/comum/moldura.tsx` | `interface/comum` (Moldura) | delta-de-contrato-externo (props do componente) | MEDIUM | Remove `logoComoTitulo`; adiciona `comInicio` (default `false`); identidade unificada (marca decorativa + `h1` textual sempre) |
| `interface/inicio/tela.tsx` | `interface/inicio` (home) | regra-alterada | LOW | Monta a `Moldura` sem `logoComoTitulo`/`comInicio`; `h1` da home passa a texto "APS Inteligente" |
| `interface/calculadora/tela.tsx` | `interface/calculadora` | regra-alterada | LOW | Declara `comInicio` (⌂ antes derivado de `!logoComoTitulo`) |
| `interface/cardiologia/tela.tsx` | `interface/cardiologia` | regra-alterada | LOW | Declara `comInicio` |
| `interface/gestacao/tela.tsx` | `interface/gestacao` | regra-alterada | LOW | Declara `comInicio` |
| `interface/risco-cardiovascular/tela.tsx` | `interface/risco-cardiovascular` | regra-alterada | LOW | Declara `comInicio` |
| `interface/estilos/inicio.css` | `interface/estilos` | regra-removida | LOW | Remove a tipografia de hero da variante `destaque`; mantém padding da coluna e borda `muted` |
| `interface/estilos/cabecalho.css` | `interface/estilos` | regra-removida | LOW | Remove a regra órfã `.cabecalho-identidade h1 .cabecalho-logo` |
| `tests/integration/interface/moldura.test.tsx` | `interface/comum` (testes) | regra-alterada (teste) | LOW | Casos adaptados ao contrato `comInicio` e à identidade unificada |
| `e2e/cabecalho.spec.ts` | harness e2e | componente-novo (teste) | LOW | Guarda de altura nas cinco rotas (±2px), barulhenta |
| `tests/unit/interface/cabecalho-sem-altura-fixa.test.ts` | harness unit | componente-novo (teste) | LOW | Guarda negativa: sem `height`/`min-height` no container `.cabecalho` |
| `e2e/plataforma.spec.ts` | harness e2e | regra-alterada (teste) | LOW | Dois casos da home adaptados à identidade unificada; robustez de medição |
| `README.md` | documentação | regra-alterada (doc) | LOW | Descreve a identidade unificada e `comInicio`; remove a menção a `logoComoTitulo` |

Nenhum arquivo de `models/` (quatro domínios), do catálogo (`interface/inicio/catalogo.ts`) ou de `/api/v1/status` foi tocado — `git diff` vazio nessas áreas.

## Diff conceitual por componente

**`interface/comum` (Moldura).** O acoplamento apontado em `_reversa_sdd/interface-comum/requirements.md#responsabilidades` — uma única flag governando "a logo é o `h1`?" **e** "o comando de início aparece?" — é desfeito. `logoComoTitulo` some (a logo vira decorativa em toda tela, então seu ramo verdadeiro não existe mais); a presença do ⌂ passa à prop dedicada `comInicio` (default ausente). A identidade fica única: `img.cabecalho-marca` (aria-hidden) acima de `<h1>{titulo}</h1>`, subtítulo e selo. Semântica preservada: um `h1` por tela, nome acessível "APS Inteligente" na home (era o `alt` da logo).

**`interface/inicio` + `interface/estilos`.** A home deixa de ser caso especial: herda a estrutura de três blocos e a tipografia base das calculadoras. A variante `destaque` encolhe à coluna de 720px (padding lateral) e à borda `muted`; a tipografia de hero (feature 008) é aposentada. Com o mesmo conteúdo e o mesmo respiro vertical (44/36, já unificado na 015), a altura do cabeçalho coincide **por construção** — medida em 209px na home e nas quatro calculadoras (viewport 1280px), sem que nenhum CSS a fixe.

**Calculadoras.** Edição mecânica idêntica: `comInicio` na `Moldura`. O comando de início, antes emergente de `!logoComoTitulo`, agora é explícito — comportamento inalterado.

## Preservadas (regras 🟢 de `_reversa_sdd/domain.md` intactas)

- **Regra 11 (§7.2) — comportamento:** o comando de início aparece só nas calculadoras, nunca na home. Preservado; mudou apenas o **mecanismo** (`comInicio` em vez de `!logoComoTitulo`). Guardas 011 verdes.
- **Um `h1` por tela** e nome acessível preservado ("APS Inteligente" na home). `axe-baseline` 0/0 por rota.
- **Selo "Nada é salvo nem enviado" sempre visível**; nenhuma tela desativa.
- **Logo decorativa, não-link, por tema** (`data-tema` observável; `/apsi-light.png` ↔ `/apsi-dark.png`). Agora vale para todas as telas, inclusive a home.
- **Quatro domínios clínicos, cálculo 100% no navegador, tokens Primer sem cor literal, teto de 400 linhas por folha.**

## Modificadas (regras 🟢 alteradas ou removidas)

- **`interface/comum/requirements.md` (RN-03/RN-05, feature 009):** "com `logoComoTitulo`, a logo é `<img>` dentro do `h1`" — **removida**. A logo nunca mais ocupa o `h1`; a prop não existe.
- **Responsabilidade da Moldura:** "oferecer o comando de início apenas nas calculadoras (`!logoComoTitulo`)" — **alterada** para "quando `comInicio` é verdadeira".
- **`interface/estilos` / `interface/inicio` (variante `destaque`):** tipografia de hero (h1 28/24px, subtítulo 14px + `max-width:60ch`, `gap` 6px) — **removida**; a variante reduz-se à coluna de 720px e à borda `muted`.
- **Divergência de altura home×calculadoras** (200,5px × 209,0px), deixada pela 015 — **resolvida**: 209px em todas as rotas, por construção.
