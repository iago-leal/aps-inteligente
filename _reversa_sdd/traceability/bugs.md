<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-fix em 2026-07-28T22:30:00Z a partir de 3 bugs em 2 contextos -->

# Rastreabilidade BUG↔SPEC — espelho global

Source of truth: `_reversa_bugs/<contexto>/bugs/*/bug.md`. Bugs `restricted` ficam fora deste espelho (nenhum no momento). Mudança de conteúdo de spec é assunto dos adendos em `_reversa_sdd/addenda/`.

## `models-insulina/requirements.md` § 3 Regras de Negócio (RN-H)

- BUG-20260719-RHZ5 (resolved/fixed, P2): Motor silencioso com HbA1c ausente nos ramos residuais da intensificação — `_reversa_bugs/motor-insulina/bugs/BUG-20260719-RHZ5-hba1c-ausente-silencioso/`
  - Leitura efetiva da RN-H regida pelo adendo `_reversa_sdd/addenda/bug-BUG-20260719-RHZ5-v001.md` (veredito `spec-desatualizada`, vigente desde 2026-07-19).

## `domain.md` § 3.3 Intensificação (regra 9)

- BUG-20260719-RHZ5 (resolved/fixed, P2): mesmo defeito, refletido na regra 9 do gate — `_reversa_bugs/motor-insulina/bugs/BUG-20260719-RHZ5-hba1c-ausente-silencioso/`

## `models-puericultura-consulta/contracts.md` § Forma do texto emitido e § Regras da forma (regras 5, 7 e 8)

- BUG-20260728-ZAHV (resolved/fixed, P0): Notas de proveniência e linha da fonte atravessam para o texto copiado do registro — `_reversa_bugs/consulta-puericultura/bugs/BUG-20260728-ZAHV-notas-de-proveniencia-no-texto-copiado/`
  - **A spec descrevia o comportamento reclamado**, e é por isso que o veredito foi `spec-desatualizada` e não uma emenda de código: a regra 7 determinava que as notas fechassem o texto e a linha da fonte fechasse as notas, que era exatamente o que a tela fazia. A decisão `MD-0035`, de 2026-07-28, revogou a regra para o texto emitido e manteve a declaração no bloco de proveniência da tela.
  - Leitura efetiva regida pelo adendo `_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md` (vigente desde 2026-07-28), que alcança o § Forma do texto emitido, revoga as regras 7 e 8 e emenda a regra 5.
  - ⚠️ **Numeração divergente entre as duas specs.** A regra 8 revogada é a de `contracts.md` (composição da linha da fonte). A regra 8 de `_reversa_forward/020-.../interfaces/registro-soap.md` § 2 é outra coisa — "nenhum identificador da criança" (RN-12) — e **permanece integralmente vigente**, com teste próprio em `tests/unit/interface/formatar-registro.test.ts`.

## `interface-puericultura-consulta/requirements.md` § Requisitos Funcionais

- BUG-20260728-ZAHV (resolved/fixed, P0): por RF-08, que exige identidade byte a byte entre o texto exibido e o copiado. **RF-08 não mudou**: a identidade continua exigida e cumprida, agora sobre a cadeia já cortada — a propriedade é estrutural (uma função, uma variável, dois consumidores) e o corte não a tocou.
- BUG-20260728-C6LN (open/triaging, P2): Comando "Avaliar crescimento" fica fora do quadro "1. Medidas" — `_reversa_bugs/consulta-puericultura/bugs/BUG-20260728-C6LN-avaliar-crescimento-fora-do-quadro-medidas/`
  - RF-01 enumera as partes a compor sem fixar onde o gatilho do painel se ancora.

## `interface-puericultura-consulta/requirements.md` § Requisitos Não Funcionais

- BUG-20260728-C6LN (open/triaging, P2): a linha de acessibilidade que promete foco preso no painel e retorno ao gatilho é a restrição que a mudança de posição precisa preservar.

## Bugs em `spec-gap`

| Bug | Comportamento sem spec |
|---|---|
| BUG-20260728-C6LN | A posição do comando que abre o painel de crescimento nunca foi especificada, em nenhuma das duas pontas: nem na unit `interface-puericultura-consulta`, nem nos requisitos da feature 020. Nenhum teste vigente o localiza por posição, o que confirma a lacuna. |

## Adendos de bug vigentes

| Adendo | Spec regida | Bug de origem | Vigência |
|---|---|---|---|
| `bug-BUG-20260719-RHZ5-v001.md` | `models-insulina/requirements.md` RN-H; reflexo em `domain.md` § 3.3 | BUG-20260719-RHZ5 | Desde 2026-07-19 |
| `bug-BUG-20260728-ZAHV-v001.md` | `models-puericultura-consulta/contracts.md` § Forma do texto emitido e regras 5, 7 e 8 | BUG-20260728-ZAHV | Desde 2026-07-28 |

Ambos são imutáveis, e as specs originais permanecem intocadas: quem quiser a leitura efetiva
precisa lê-las com os adendos sobrepostos.

## Demais artefatos de spec

`interface-calculadora/*`, `pages-next/*`, demais seções de `models-insulina`,
`models-puericultura/*`, `models-gestacao/*`, `models-risco-cardiovascular/*`,
`models-cardiopatia-isquemica/*`, `models-contribuicao/*`, `scripts/*` e artefatos globais:
nenhum bug registrado.
