<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-fix em 2026-07-28T22:30:00Z a partir de 2 bugs -->

# Matriz BUG↔SPEC — contexto `consulta-puericultura`

Vínculos pela `traceability.specs` de cada bug. Espelho global em `_reversa_sdd/traceability/bugs.md`.

| Seção de spec | open | active | resolved |
|---|---|---|---|
| `_reversa_sdd/models-puericultura-consulta/contracts.md#forma-do-texto-emitido` | — | — | BUG-20260728-ZAHV |
| `_reversa_sdd/models-puericultura-consulta/contracts.md#regras-da-forma` (regras 5, 7 e 8) | — | — | BUG-20260728-ZAHV |
| `_reversa_forward/020-consulta-puericultura-soap/interfaces/registro-soap.md#2-forma` (regra 7) | — | — | BUG-20260728-ZAHV |
| `_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-funcionais` (RF-08) | — | — | BUG-20260728-ZAHV |
| `_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-funcionais` (RF-01) | BUG-20260728-C6LN | — | — |
| `_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-não-funcionais` | BUG-20260728-C6LN | — | — |
| `spec-gap` (comportamento sem spec) | BUG-20260728-C6LN | — | — |

## Leitura da tabela

As quatro linhas de BUG-20260728-ZAHV registram uma situação diferente da usual, e é a razão de ele
ter fechado com adendo: **a spec descrevia o comportamento observado**. A regra 7 do contrato
afirmava que as notas fecham o texto e a linha da fonte fecha as notas, que era exatamente o que a
tela fazia. O bug existiu porque a decisão do usuário de 28/07 revogou a regra, não porque o código
a desobedecesse — e o veredito `spec-desatualizada` foi a consequência, não a suposição.

O alcance final ficou maior que o previsto no registro: além da regra 7, o adendo reescreve o
§ Forma do texto emitido e revoga a regra 8 de `contracts.md` (composição da linha da fonte),
emendando ainda a regra 5. **Atenção à numeração**: a regra 8 de `registro-soap.md` é outra coisa —
"nenhum identificador da criança" — e permanece integralmente vigente.

RF-08 aparece como resolvida sem ter mudado: a identidade byte a byte entre o exibido e o copiado
continua exigida e continua cumprida, agora sobre a cadeia já cortada. Entra na linha porque o bug a
citava como spec efetiva, e sair dela sem nota faria parecer que a exigência caiu junto.

BUG-20260728-C6LN aparece nas duas pontas: cita as seções de RF-01 e dos requisitos não funcionais
por serem as que governam a composição da tela, e ao mesmo tempo consta em `spec-gap` porque
nenhuma delas fixa a posição do gatilho do painel.

## Adendos de bug vigentes em `addenda/`

| Adendo | Seção regida | Origem | Vigência |
|---|---|---|---|
| `bug-BUG-20260728-ZAHV-v001.md` | `models-puericultura-consulta/contracts.md` § Forma do texto emitido e regras 5, 7 e 8 | BUG-20260728-ZAHV | Desde 2026-07-28, **vigente** |

Primeiro adendo de bug deste contexto. A spec original permanece intocada, como sempre: quem quiser
a leitura efetiva de `contracts.md` precisa lê-la com este adendo sobreposto.
