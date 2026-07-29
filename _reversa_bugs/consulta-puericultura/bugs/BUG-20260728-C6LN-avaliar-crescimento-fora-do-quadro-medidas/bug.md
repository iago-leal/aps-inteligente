---
schema_version: 1
id: BUG-20260728-C6LN
display_number: 2
title: Comando "Avaliar crescimento" fica fora do quadro "1. Medidas", que é o que ele consome
status: open
phase: triaging
severity: medium
priority: P2
created: 2026-07-28
updated: 2026-07-28

origin:
  type: manual-report
  external_ref: null

area: interface
module: unclassified
feature: unclassified
labels: [spec-gap, apresentacao]

visibility: normal
security_suspected: false

reproduction:
  classification: deterministic
  rate: "1/1 observado em produção (apsinteligente.app/puericultura/consulta, print de 28/07)"
  suspected_triggers: []

blocking: []

relationships: []

traceability:
  specs:
    - "_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-funcionais (RF-01: compor a tela com moldura, aviso, identificação, seletor, ficha, painel e registro — sem regra de posição do gatilho)"
    - "_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-não-funcionais (acessibilidade: foco preso no painel e retorno ao gatilho)"
    - "_reversa_forward/020-consulta-puericultura-soap/requirements.md#RF-09 (abrir a calculadora em painel sobre a mesma tela, já com as medidas da ficha)"
  affected_code:
    - "interface/puericultura/consulta/app.tsx:186-192 — o gatilho nasce irmão da ficha, depois dela na ordem de composição"
    - "interface/puericultura/consulta/ficha.tsx:216-230 — cada seção é um fieldset com legend, e a ficha não recebe conteúdo de fora"
    - "interface/estilos/consulta-puericultura.css — grade das seções e largura do comando"
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

# Comando "Avaliar crescimento" fica fora do quadro "1. Medidas", que é o que ele consome

## Summary

O comando que abre o painel de crescimento aparece isolado, em largura total, abaixo de todos os
quadros da ficha e imediatamente acima do bloco "Registro em SOAP". As três medidas que ele consome
— perímetro cefálico, peso e comprimento — estão no primeiro quadro da ficha, "1. Medidas". Quem
preenche as medidas percorre a ficha inteira até encontrar o comando que as avalia, e nada na tela
liga um ao outro.

O usuário pediu que o comando fique **dentro do quadro "1. Medidas"**.

## Expected Behavior

**Não há spec que fixe a posição do gatilho**, e por isso este bug leva o rótulo `spec-gap`.
`_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-funcionais` enumera as
partes a compor em RF-01 — moldura, aviso, identificação, seletor, ficha, painel e registro — sem
dizer onde o gatilho do painel se ancora. RF-09 da feature 020 exige que o painel abra "sobre a
mesma tela, já com sexo, datas e medidas preenchidos a partir da ficha", o que trata do que o painel
recebe, não de onde o comando mora.

O comportamento esperado passa a ser o que o usuário fixou em 28/07: o comando renderizado dentro do
quadro "1. Medidas", junto dos campos que alimenta.

Apuração do registrador, não relatada pelo usuário e verificada no código: **as dez fichas têm seção
número 1 com o título "Medidas"** (`models/puericultura/consulta/fichas/*.ts`, todas com
`secao(1, "Medidas", [...])`). A colocação vale uniformemente, sem caso especial de ficha sem
medidas.

## Actual Behavior

Em `app.tsx`, o `<Button>` é irmão de `<FichaPreenchivel>` e vem depois dela no JSX, dentro do
fragmento que só existe quando há ficha aberta. O resultado em tela é um comando de largura total
separado da ficha, depois do último quadro — no print, depois de "4. Vacinas" e
"5. Desenvolvimento e laços de afeto".

## Steps to Reproduce

1. Abrir https://apsinteligente.app/puericultura/consulta
2. Informar sexo, data de nascimento e data da consulta, de modo que a ficha seja sugerida
3. Rolar a tela até o fim da ficha

Observado em 1/1 tentativa. É determinístico: a posição vem da ordem do JSX, sem condição.

## Evidence

- `evidence/quadro-medidas-e-comando-solto.png` — o quadro "1. Medidas" com PC, Peso e Comprimento,
  na ficha "Consulta da 1ª Semana".
- `evidence/comando-abaixo-de-todos-os-quadros.png` — o comando em largura total, abaixo de
  "4. Vacinas" e "5. Desenvolvimento e laços de afeto", acima do bloco do registro.

## Suspected Area

A composição está em `interface/puericultura/consulta/app.tsx:186-192`. Mover o comando para dentro
do quadro esbarra numa fronteira de responsabilidade que quem corrigir precisa resolver: hoje
`FichaPreenchivel` projeta as seções a partir do dado da ficha e **não aceita conteúdo de fora**
(`ficha.tsx:216-230`). Colocar o comando dentro do primeiro `fieldset` exige que a ficha receba um
ponto de extensão, ou que a ficha conheça o gatilho — e a segunda alternativa acopla a projeção da
fonte clínica a um comando de aplicação.

Três implicações a considerar no fix, nenhuma resolvida aqui:

1. **O `fieldset` da seção é a fronteira semântica.** Um `<button>` dentro de um `fieldset` com
   `legend` "1. Medidas" é válido, e reforça a ligação que falta hoje.
2. **O retorno de foco continua valendo.** `refDoPainel` recebe o foco ao fechar o painel; o
   elemento muda de lugar, não de papel, e o e2e de teclado deve continuar verde.
3. **A ficha se remonta a cada troca de ficha.** O `ref` precisa sobreviver à remontagem, ou o
   retorno de foco cai no vazio depois de trocar a ficha com o painel aberto.

## Acceptance Criteria

1. Aberta qualquer uma das dez fichas, o comando "Avaliar crescimento" é renderizado dentro do
   quadro "1. Medidas", depois dos três campos de medida.
2. O comando continua acessível por nome (`getByRole("button", { name: /avaliar crescimento/i })`),
   sem mudança de rótulo — o literal permanece o mesmo do inventário textual.
3. Fechado o painel, o foco retorna ao comando, inclusive depois de trocar a ficha pelo seletor.
4. A varredura axe da rota continua em zero violação.
5. A coluna do corpo e a geometria da ficha, guardadas pelas provas e2e da feature 021, permanecem
   inalteradas.

## Traceability

| Eixo | Conteúdo |
|---|---|
| Spec efetiva | `interface-puericultura-consulta/requirements.md#requisitos-funcionais` (RF-01) e `#requisitos-não-funcionais`; nenhuma regra fixa a posição do gatilho → `spec-gap` |
| Código afetado | `app.tsx:186-192`; `ficha.tsx:216-230`; `interface/estilos/consulta-puericultura.css` |
| Testes que tocam o comando | `tests/integration/interface/consulta-puericultura.test.tsx:119` (abre o painel, RF-09); `e2e/consulta-puericultura.spec.ts:89` (foco volta ao gatilho, RF-17); `e2e/consulta-puericultura.spec.ts:144` |
| Testes de reprodução | a criar no `/reversa-debugger-fix` |
| Testes de regressão | a criar no `/reversa-debugger-fix` |

## Agent Notes

- **Nenhum teste vigente localiza o comando por posição**: os três o alcançam por papel e nome
  acessível. A mudança de lugar não os derruba, e é sinal de que a posição nunca foi contratada —
  o que confirma o `spec-gap`.
- **Veredito de spec provável:** `spec-gap`, com a spec da unit `interface-puericultura-consulta`
  ganhando a regra que hoje falta. Cabe ao `/reversa-debugger-fix` decidir se a regra nomeia a seção
  "Medidas" ou a seção que contém os campos de medida — a segunda formulação sobrevive a uma edição
  da caderneta que renomeie a seção.
- **Correção só de apresentação.** Motor, catálogo de fichas e projeção em texto ficam intocados;
  nenhum literal novo nasce daqui.
- **Proposta de taxonomia** (não aplicada): `module: interface-puericultura-consulta` e
  `feature: consulta-puericultura-soap`, hoje ausentes de `taxonomy.yaml`.
