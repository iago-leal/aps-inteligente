<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-graph em 2026-07-28T21:50:00Z a partir de 3 bugs em 2 contextos -->

# Rastreabilidade BUG↔SPEC — espelho global

Source of truth: `_reversa_bugs/<contexto>/bugs/*/bug.md`. Bugs `restricted` ficam fora deste espelho (nenhum no momento). Mudança de conteúdo de spec é assunto dos adendos em `_reversa_sdd/addenda/`.

## `models-insulina/requirements.md` § 3 Regras de Negócio (RN-H)

- BUG-20260719-RHZ5 (resolved/fixed, P2): Motor silencioso com HbA1c ausente nos ramos residuais da intensificação — `_reversa_bugs/motor-insulina/bugs/BUG-20260719-RHZ5-hba1c-ausente-silencioso/`
  - Leitura efetiva da RN-H regida pelo adendo `_reversa_sdd/addenda/bug-BUG-20260719-RHZ5-v001.md` (veredito `spec-desatualizada`, vigente desde 2026-07-19).

## `domain.md` § 3.3 Intensificação (regra 9)

- BUG-20260719-RHZ5 (resolved/fixed, P2): mesmo defeito, refletido na regra 9 do gate — `_reversa_bugs/motor-insulina/bugs/BUG-20260719-RHZ5-hba1c-ausente-silencioso/`

## `models-puericultura-consulta/contracts.md` § Forma do texto emitido e § Regras da forma (regra 7)

- BUG-20260728-ZAHV (open/triaging, P0): Notas de proveniência e linha da fonte atravessam para o texto copiado do registro — `_reversa_bugs/consulta-puericultura/bugs/BUG-20260728-ZAHV-notas-de-proveniencia-no-texto-copiado/`
  - **A spec descreve o comportamento reclamado.** A regra 7 determina que as notas fechem o texto e a linha da fonte feche as notas, que é o que a tela faz; a decisão do usuário de 2026-07-28 revoga a regra para o texto emitido, mantendo a declaração no bloco de proveniência da tela. Fechamento condicionado a adendo versionado sobre este contrato; nenhum adendo escrito ainda.

## `interface-puericultura-consulta/requirements.md` § Requisitos Funcionais

- BUG-20260728-ZAHV (open/triaging, P0): por RF-08, que exige identidade byte a byte entre o texto exibido e o copiado — o corte precisa alcançar os dois, e não só a área de transferência.
- BUG-20260728-C6LN (open/triaging, P2): Comando "Avaliar crescimento" fica fora do quadro "1. Medidas" — `_reversa_bugs/consulta-puericultura/bugs/BUG-20260728-C6LN-avaliar-crescimento-fora-do-quadro-medidas/`
  - RF-01 enumera as partes a compor sem fixar onde o gatilho do painel se ancora.

## `interface-puericultura-consulta/requirements.md` § Requisitos Não Funcionais

- BUG-20260728-C6LN (open/triaging, P2): a linha de acessibilidade que promete foco preso no painel e retorno ao gatilho é a restrição que a mudança de posição precisa preservar.

## Bugs em `spec-gap`

| Bug | Comportamento sem spec |
|---|---|
| BUG-20260728-C6LN | A posição do comando que abre o painel de crescimento nunca foi especificada, em nenhuma das duas pontas: nem na unit `interface-puericultura-consulta`, nem nos requisitos da feature 020. Nenhum teste vigente o localiza por posição, o que confirma a lacuna. |

## Demais artefatos de spec

`interface-calculadora/*`, `pages-next/*`, demais seções de `models-insulina`,
`models-puericultura/*`, `models-gestacao/*`, `models-risco-cardiovascular/*`,
`models-cardiopatia-isquemica/*`, `models-contribuicao/*`, `scripts/*` e artefatos globais:
nenhum bug registrado.
