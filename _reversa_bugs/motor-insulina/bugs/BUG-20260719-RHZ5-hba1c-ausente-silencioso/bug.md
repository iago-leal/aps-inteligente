---
schema_version: 1
id: BUG-20260719-RHZ5
display_number: 1
title: Motor silencioso com HbA1c ausente nos ramos residuais da intensificação
status: resolved
phase: resolved
severity: medium
priority: P2
created: 2026-07-19
updated: 2026-07-19

origin:
  type: manual-report
  external_ref: null

area: dominio
module: models-insulina
feature: calculadora-insulina-dm2
labels: [spec-update-required, validado-pelo-usuario]

visibility: normal
security_suspected: false

reproduction:
  classification: deterministic
  rate: "2/2 cenários na primeira tentativa (evidence/reproduction.md, commit dc1d9fd)"
  suspected_triggers: []

blocking: []

relationships: []

traceability:
  specs:
    - "_reversa_sdd/models-insulina/requirements.md#3-regras-de-negócio (RN-H, com nota de divergência)"
    - "_reversa_sdd/domain.md#33-intensificação-regra-intensificacaots (regra 9)"
  affected_code:
    - "models/insulina/regra-intensificacao.ts:98-99"
  root_cause:
    state: confirmed
    where: "models/insulina/regra-intensificacao.ts:99 — guard clause do gate de HbA1c (R-13)"
    born: "implementação original da feature 001 (anterior à refundação; o arquivo já chega pronto em 26f3bc9). Não é regressão deste repositório; bisect inaplicável (não existe commit bom conhecido)."
    summary: >-
      A guard clause confunde encerramento de fluxo com silêncio clínico: quando a HbA1c
      está ausente e não há pré-prandiais, o gate conclui corretamente que não pode dirigir
      a intensificação, mas retorna sem transferir ao prescritor a informação de que falta
      o exame. A Figura 4 (p. 62-63) só desenha os caminhos explícitos; os ramos residuais
      ficaram sem tratamento na implementação e a spec as-is documentou o silêncio (RN-H).
    evidence:
      - "evidence/reproduction.md — reprodução determinística 2/2 nos ramos (a) e (b); controles (c) e (d) íntegros"
      - "leitura do fluxo: nos ramos alcançáveis, nenhum ponto de emissão de recomendação é atingido após o return da linha 99 (únicas emissões do gate estão nos ramos com HbA1c presente ou com pré-prandiais)"
  reproduction_tests:
    - "tests/regression/BUG-20260719-RHZ5.test.ts — 'reprodução (ramo a)' e 'reprodução (ramo b)' (vermelhos em dc1d9fd: Gate 1 aprovado 2026-07-19)"
  regression_tests:
    - "tests/regression/BUG-20260719-RHZ5.test.ts — describe 'vizinhança do gate permanece intacta' (4 sentinelas) + os dois casos de reprodução como não-recorrência"

spec_verdict:
  verdict: spec-desatualizada
  addendum: "_reversa_sdd/addenda/bug-BUG-20260719-RHZ5-v001.md"
  decided_by: iago
  decided_at: 2026-07-19

change_set:
  - id: CHG-001
    kind: code
    artifact: "models/insulina/tipos.ts"
    diff: "fix/CHG-001.diff"
  - id: CHG-002
    kind: code
    artifact: "models/insulina/regra-intensificacao.ts"
    diff: "fix/CHG-002.diff"
  - id: CHG-003
    kind: test
    artifact: "tests/regression/BUG-20260719-RHZ5.test.ts"
    diff: "fix/CHG-003.diff"
  - id: CHG-004
    kind: configuration
    artifact: "vitest.config.ts"
    diff: "fix/CHG-004.diff"
  - id: CHG-005
    kind: specification
    artifact: "_reversa_sdd/addenda/bug-BUG-20260719-RHZ5-v001.md"
    diff: null

closure:
  policy: local-software
  satisfied: true
resolution_kind: fixed
---

# Motor silencioso com HbA1c ausente nos ramos residuais da intensificação

## Summary

Quando a HbA1c não é informada e o cálculo cai nos ramos residuais do gate de intensificação
(esquema sem Regular e sem pré-prandiais; ou com Regular e sem pré-prandiais), o motor retorna
sem emitir recomendação alguma. O usuário médico validou (2026-07-19) que o comportamento
desejado é **recomendar dosar HbA1c** nesses ramos. Não há dose incorreta emitida; é omissão
de orientação clínica.

## Expected Behavior

A spec efetiva (RN-H de `_reversa_sdd/models-insulina/requirements.md`) documenta o **as-is**
(silêncio) e carrega, desde a revisão de 2026-07-19, a nota de divergência validada: o
comportamento desejado é que o resultado inclua recomendação explícita de dosar HbA1c quando
ela estiver ausente nos ramos residuais. O to-be ainda não está especificado em detalhe
(redação, tipo de recomendação, referência do guia): a mudança de spec será adendo versionado
em `_reversa_sdd/addenda/` durante o fix (label `spec-update-required`).

## Actual Behavior

`RegraIntensificacao.aplicar` (`models/insulina/regra-intensificacao.ts:98-99`):

```ts
} else if (hba1c === undefined) {
  if (!temRegular || prePrandiais.length === 0) return;
```

O `return` é silencioso: nenhum alerta, nenhuma recomendação. O prescritor recebe apenas o
resultado da titulação basal, sem sinal de que falta o exame que dirige a intensificação.

## Steps to Reproduce

1. Modo `titulacao`, peso 80 kg, esquema basal: NPH 20 UI ao deitar.
2. Glicemias: apenas jejum (ex.: 100 mg/dL). HbA1c: **não informar**.
3. Calcular.
4. Observado: resultado "na meta", sem qualquer recomendação sobre HbA1c.
5. Esperado (validação do usuário): recomendação de dosar HbA1c.

Variante (b): mesmo cenário com Regular no esquema (basal-plus) e sem pré-prandiais — idem.

Nota: o terceiro ramo lógico (sem Regular **com** pré-prandiais) é inalcançável — a validação
EC-10 exige HbA1c nesse cenário antes do gate.

## Evidence

- `evidence/validacao-reviewer-20260719.md` — pergunta 4 do Reviewer e resposta do usuário.
- Relato de intake: `../../intake/relato-20260719-2140.md`.

## Suspected Area

`models/insulina/regra-intensificacao.ts`, gate de HbA1c (linhas 66-106). A correção provável
adiciona recomendação (tipo a definir; possivelmente novo `TipoRecomendacao` de dosagem de
HbA1c, o que tocaria também `tipos.ts`, `fonte-clinica.ts` e a exibição em
`interface/calculadora/resultado.tsx` — ver impacto em
`_reversa_sdd/traceability/spec-impact-matrix.md` §3).

## Acceptance Criteria

1. Nos dois ramos alcançáveis com HbA1c ausente, o resultado carrega recomendação explícita de
   dosar HbA1c, com `ReferenciaClinica` (invariante: nenhuma saída sem fonte).
2. Nenhuma mudança de conduta nos demais ramos do gate (HbA1c ≤ 7, > 7, EC-10).
3. Teste de reprodução escrito **antes** do fix, falhando no código atual; teste de regressão
   em `tests/regression/` (BUG_VIRA_TESTE, Princípio VII).
4. Adendo de spec versionado aprovado pelo usuário antes do `[X]` (Princípio I).

## Traceability

| Elo | Valor |
|---|---|
| Spec (as-is + divergência) | `_reversa_sdd/models-insulina/requirements.md` RN-H; `_reversa_sdd/domain.md` §3.3 regra 9 |
| Código onde aparece | `models/insulina/regra-intensificacao.ts:98-99` |
| Testes existentes relacionados | `tests/unit/dominio/` (suíte de intensificação; nenhum caso cobre os ramos silenciosos — a confirmar no fix) |
| Causa raiz | `regra-intensificacao.ts:99` — guard clause do gate R-13 encerra o fluxo sem emitir a orientação pendente (confirmed; ver front matter e `evidence/reproduction.md`) |

## Resolution

Resolvido em 2026-07-19 pelo `/reversa-debugger-fix`, closure policy `local-software` satisfeita
(testes de regressão passando + veredito de spec com decisão humana).

**Causa raiz (confirmed):** a guard clause de `models/insulina/regra-intensificacao.ts:99`
confundia encerramento de fluxo com silêncio clínico — nos ramos residuais com HbA1c ausente,
retornava sem transferir ao prescritor a informação de que faltava o exame. Nascida na
implementação original da feature 001 (anterior à refundação); não é regressão deste repositório.

**Veredito de spec:** `spec-desatualizada` (decisão do usuário, 2026-07-19). A RN-H documentava o
as-is; a leitura efetiva passa a ser regida pelo adendo
`_reversa_sdd/addenda/bug-BUG-20260719-RHZ5-v001.md` (imutável; spec original intocada).

**`resolution_kind: fixed`** — causa confirmada + regressão + veredito.

### Correction Change Set

| CHG | Tipo | Artefato | Diff |
|---|---|---|---|
| CHG-001 | code | `models/insulina/tipos.ts` — union ganha `"DOSAR_HBA1C"` | `fix/CHG-001.diff` |
| CHG-002 | code | `models/insulina/regra-intensificacao.ts` — emissão da recomendação nos ramos residuais antes do `return` | `fix/CHG-002.diff` |
| CHG-003 | test | `tests/regression/BUG-20260719-RHZ5.test.ts` — 2 reproduções + 4 sentinelas de vizinhança | `fix/CHG-003.diff` |
| CHG-004 | configuration | `vitest.config.ts` — `tests/regression/**` incluído no runner | `fix/CHG-004.diff` |
| CHG-005 | specification | `_reversa_sdd/addenda/bug-BUG-20260719-RHZ5-v001.md` — adendo do veredito | (arquivo novo, sem diff) |

Sem `data-repair`: motor puro e client-side, nenhum estado histórico corrompido. Sem mudança de
UI: `resultado.tsx` renderiza recomendações genericamente.

### Prova vermelho → verde

Antes do fix (commit `dc1d9fd`, Gate 1):

```text
FAIL  tests/regression/BUG-20260719-RHZ5.test.ts
  reprodução (ramo a) … AssertionError: expected undefined to be defined
  reprodução (ramo b) … AssertionError: expected [] to include 'DOSAR_HBA1C'
Tests  2 failed | 4 passed (6)
```

Depois do fix (Gate 2, suíte completa + typecheck + lint):

```text
Test Files  11 passed (11)
Tests  131 passed (131)
tsc --noEmit  ✓   eslint  ✓
```

## Agent Notes

- A severidade/prioridade (medium/P2) foi proposta pelo agente e aceita tacitamente; o usuário
  pode ajustá-la.
- A recomendação nova provavelmente exige decidir a **redação clínica** e a **referência do
  guia** (página do gate de intensificação, Figura 4 p. 62-63) — decisão do usuário médico no
  adendo de spec, não do agente.
- Atenção ao invariante property-based "toda saída referenciada": a recomendação nova precisa
  de `ReferenciaClinica` válida ou a suíte de invariantes quebra.
- Proposta de taxonomia: nenhuma (termos existentes serviram).
