<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-graph em 2026-07-28T21:50:00Z a partir de 2 bugs -->

# Matriz BUG↔SPEC — contexto `consulta-puericultura`

Vínculos pela `traceability.specs` de cada bug. Espelho global em `_reversa_sdd/traceability/bugs.md`.

| Seção de spec | open | active | resolved |
|---|---|---|---|
| `_reversa_sdd/models-puericultura-consulta/contracts.md#forma-do-texto-emitido` | BUG-20260728-ZAHV | — | — |
| `_reversa_sdd/models-puericultura-consulta/contracts.md#regras-da-forma` (regra 7) | BUG-20260728-ZAHV | — | — |
| `_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-funcionais` (RF-08) | BUG-20260728-ZAHV | — | — |
| `_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-funcionais` (RF-01) | BUG-20260728-C6LN | — | — |
| `_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-não-funcionais` | BUG-20260728-C6LN | — | — |
| `spec-gap` (comportamento sem spec) | BUG-20260728-C6LN | — | — |

## Leitura da tabela

As duas linhas ocupadas por BUG-20260728-ZAHV registram uma situação diferente da usual: **a spec
descreve o comportamento observado**. A regra 7 do contrato afirma que as notas fecham o texto e a
linha da fonte fecha as notas, que é exatamente o que a tela faz. O bug existe porque a decisão do
usuário de 28/07 revoga a regra, não porque o código a desobedeça. O `/reversa-debugger-fix` deve
chegar a `spec-desatualizada`, com adendo versionado.

BUG-20260728-C6LN aparece nas duas pontas: cita as seções de RF-01 e dos requisitos não funcionais
por serem as que governam a composição da tela, e ao mesmo tempo consta em `spec-gap` porque
nenhuma delas fixa a posição do gatilho do painel.

## Adendos de bug vigentes em `addenda/`

| Adendo | Seção regida | Origem | Vigência |
|---|---|---|---|
| — | — | — | Nenhum adendo de bug neste contexto ainda. |

O adendo de BUG-20260728-ZAHV nasce no ciclo de correção, sobre
`_reversa_sdd/models-puericultura-consulta/contracts.md`, e é pré-requisito do fechamento.
