---
schema_version: 1
id: BUG-20260719-RHZ5
display_number: 1
title: Motor silencioso com HbA1c ausente nos ramos residuais da intensificação
status: open
phase: triaging
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
  rate: "não executada ainda (análise estática do fluxo; determinístico por construção)"
  suspected_triggers: []

blocking: []

relationships: []

traceability:
  specs:
    - "_reversa_sdd/models-insulina/requirements.md#3-regras-de-negócio (RN-H, com nota de divergência)"
    - "_reversa_sdd/domain.md#33-intensificação-regra-intensificacaots (regra 9)"
  affected_code:
    - "models/insulina/regra-intensificacao.ts:98-99"
  root_cause: null
  reproduction_tests: []
  regression_tests: []

spec_verdict: null

change_set: []

closure:
  policy: local-software
  satisfied: false
resolution_kind: null
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
| Causa raiz | pendente (fase de diagnóstico do fix) |

## Resolution

Pendente. Preenchida pelo `/reversa-debugger-fix`.

## Agent Notes

- A severidade/prioridade (medium/P2) foi proposta pelo agente e aceita tacitamente; o usuário
  pode ajustá-la.
- A recomendação nova provavelmente exige decidir a **redação clínica** e a **referência do
  guia** (página do gate de intensificação, Figura 4 p. 62-63) — decisão do usuário médico no
  adendo de spec, não do agente.
- Atenção ao invariante property-based "toda saída referenciada": a recomendação nova precisa
  de `ReferenciaClinica` válida ou a suíte de invariantes quebra.
- Proposta de taxonomia: nenhuma (termos existentes serviram).
