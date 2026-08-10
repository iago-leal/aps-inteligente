<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-fix em 2026-08-09T19:00:00Z a partir de 2 bugs -->

# Matriz BUG↔SPEC — contexto `consulta-puericultura`

Vínculos pela `traceability.specs` de cada bug. Espelho global em `_reversa_sdd/traceability/bugs.md`.

| Seção de spec | open | active | resolved |
|---|---|---|---|
| `_reversa_sdd/models-puericultura-consulta/contracts.md#forma-do-texto-emitido` | — | — | BUG-20260728-ZAHV |
| `_reversa_sdd/models-puericultura-consulta/contracts.md#regras-da-forma` (regras 5, 7 e 8) | — | — | BUG-20260728-ZAHV |
| `_reversa_forward/020-consulta-puericultura-soap/interfaces/registro-soap.md#2-forma` (regra 7) | — | — | BUG-20260728-ZAHV |
| `_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-funcionais` (RF-08) | — | — | BUG-20260728-ZAHV |
| `_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-funcionais` (RF-01) | — | — | BUG-20260728-C6LN |
| `_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-não-funcionais` | — | — | BUG-20260728-C6LN |
| `spec-gap` (comportamento sem spec) | — | — | BUG-20260728-C6LN |

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

BUG-20260728-C6LN aparecia nas duas pontas: citava as seções de RF-01 e dos requisitos não
funcionais por serem as que governam a composição da tela, e ao mesmo tempo constava em `spec-gap`
porque nenhuma delas fixava a posição do gatilho do painel. **A lacuna fechou em 2026-08-09**, e a
linha `spec-gap` permanece na tabela como registro do que ele foi, não do que ainda é: a leitura
efetiva de `interface-puericultura-consulta/requirements.md` passa a incluir RN-13 e RN-14, pelo
adendo aditivo.

Vale a distinção entre os dois adendos deste contexto, porque eles fazem coisas opostas: o do ZAHV
**revoga** regras que existiam, e o do C6LN **cria** regras onde não havia nenhuma. Um corrige a
spec, o outro a completa.

## Adendos de bug vigentes em `addenda/`

| Adendo | Seção regida | Origem | Vigência |
|---|---|---|---|
| `bug-BUG-20260728-ZAHV-v001.md` | `models-puericultura-consulta/contracts.md` § Forma do texto emitido e regras 5, 7 e 8 | BUG-20260728-ZAHV | Desde 2026-07-28, **vigente** |
| `bug-BUG-20260728-C6LN-v001.md` | `interface-puericultura-consulta/requirements.md` § Regras de Negócio (RN-13 e RN-14, novas) e leitura de RF-01 | BUG-20260728-C6LN | Desde 2026-08-09, **vigente** |

Dois adendos de bug neste contexto, e as specs originais permanecem intocadas, como sempre: quem
quiser a leitura efetiva de `contracts.md` ou de `interface-puericultura-consulta/requirements.md`
precisa lê-las com o adendo respectivo sobreposto.
