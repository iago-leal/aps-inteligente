# Adendo 016 — Estrutura do cabeçalho da home unificada com a das calculadoras

> Identificador: `016-estrutura-cabecalho-home` · Data: 2026-07-23 · Cenário: legado

## Vigência

Vigente desde 2026-07-23.

## Resumo da entrega

Fechamento da divergência de **altura** do cabeçalho que a feature 015 deixou explícita (home 200,5px × calculadoras 209,0px). A causa era estrutural — a home fundia `logo = h1` (dois blocos) enquanto a calculadora empilha `marca + h1 + subtítulo` (três blocos). A home passou a adotar a **mesma composição de três blocos**, tornando a altura igual **por construção** (medida em 209px em todas as rotas, viewport 1280px), sem `min-height` nem px chumbado. No caminho, desfez-se um acoplamento na `Moldura`: a prop `logoComoTitulo`, que governava duas preocupações ortogonais (a logo é o `h1`? o comando de início aparece?), foi **removida**; a presença do ⌂ passou à prop dedicada `comInicio` (default ausente). A variante `destaque` encolheu à coluna de 720px e à borda `muted` — a tipografia de hero (feature 008) foi aposentada. Só apresentação e contrato de componente de UI: `models/` (quatro domínios), catálogo e `/api/v1/status` intocados, sem delta de dados nem de contrato externo. 11 de 11 ações concluídas.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/interface-comum/requirements.md` | Responsabilidades / Regras de Negócio | delta-de-contrato-externo | O contrato da `Moldura` perde `logoComoTitulo` e ganha `comInicio` (default `false`); a identidade é unificada — logo sempre marca decorativa (`.cabecalho-marca`, `aria-hidden`) acima de um `h1` **sempre textual**, em toda tela. Ler o contrato por este adendo e pelo `legacy-impact.md` da feature |
| `_reversa_sdd/interface-comum/requirements.md` | RN-03/RN-05 (feature 009) | regra-removida | "com `logoComoTitulo`, a logo é `<img>` dentro do `h1`" deixa de valer: a logo nunca mais ocupa o `h1`; a regra `.cabecalho-logo` foi removida do CSS |
| `_reversa_sdd/domain.md` | §7.2, regra 11 | regra-alterada (mecanismo; comportamento preservado) | O comando de início segue **só nas calculadoras, nunca na home**; muda apenas o mecanismo — derivado de `comInicio`, não mais de `!logoComoTitulo` |
| `_reversa_sdd/interface-inicio/requirements.md` | Responsabilidades | regra-alterada | A home monta a `Moldura` sem `logoComoTitulo` e sem `comInicio`; o `h1` da home passa a ser o texto "APS Inteligente" (nome acessível preservado, era o `alt` da logo) |
| `_reversa_sdd/interface-estilos/requirements.md` | Responsabilidades / Regras de Negócio | regra-removida | `inicio.css`: aposentada a tipografia de hero da variante `destaque` (h1 28/24px, subtítulo 14px + `max-width:60ch`, `gap` 6px); resta a coluna de 720px e a borda `muted`. `cabecalho.css`: removida a regra órfã `.cabecalho-identidade h1 .cabecalho-logo` |
| `_reversa_sdd/interface-calculadora/requirements.md` (e cardiologia/gestacao/risco-cardiovascular) | Composição da tela | regra-alterada | As quatro calculadoras declaram `comInicio` na `Moldura`, preservando o ⌂ antes derivado de `!logoComoTitulo` |
| `_reversa_sdd/addenda/015-cabecalho-unificado.md` | divergência de altura | regra-resolvida (dependência) | A divergência de altura que a 015 explicitou como pendente **fica resolvida** aqui: 209px em todas as rotas, por construção |
| `e2e/cabecalho.spec.ts`; `tests/unit/interface/cabecalho-sem-altura-fixa.test.ts` | harness de testes | componente-novo (teste) | Guarda de altura nas cinco rotas (±2px, barulhenta) e guarda negativa (sem `height`/`min-height` no container `.cabecalho`) |

Nenhum impacto em regra clínica de `_reversa_sdd/domain.md` além do mecanismo da regra 11: a feature é apresentação (CSS + contrato de UI) e testes. `models/` e catálogo intocados; sem delta de dados nem de contrato externo.

## Regras sob vigilância

W001–W005 (+ observação O-016-01, premissa 🟡 do subtítulo) — ver `_reversa_forward/016-estrutura-cabecalho-home/regression-watch.md`.

## Fontes

- `_reversa_forward/016-estrutura-cabecalho-home/requirements.md`
- `_reversa_forward/016-estrutura-cabecalho-home/roadmap.md`
- `_reversa_forward/016-estrutura-cabecalho-home/investigation.md`
- `_reversa_forward/016-estrutura-cabecalho-home/data-delta.md`
- `_reversa_forward/016-estrutura-cabecalho-home/legacy-impact.md`
- `_reversa_forward/016-estrutura-cabecalho-home/regression-watch.md`
- `_reversa_forward/016-estrutura-cabecalho-home/progress.jsonl`
