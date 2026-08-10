---
schema_version: 1
id: BUG-20260728-C6LN
display_number: 2
title: Comando "Avaliar crescimento" fica fora do quadro "1. Medidas", que é o que ele consome
status: resolved
phase: resolved
severity: medium
priority: P2
created: 2026-07-28
updated: 2026-08-09

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
  rate: "1/1 observado em produção (apsinteligente.app/puericultura/consulta, print de 28/07); 1/1 na cápsula isolada (evidence/reproduction.md, commit base c3db432)"
  suspected_triggers: []

change_risk:
  level: baixa
  reasons:
    - "blast radius de um consumidor: FichaPreenchivel só é usada por app.tsx"
    - "sem contrato externo: a prop nova é opcional e a ausência dela reproduz o comportamento atual"
    - "sem dados: a tela não persiste (ADR 0002), não há estado histórico a reparar"
    - "sem concorrência; reversível por completo, três arquivos e nenhuma migração"

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
  root_cause:
    state: confirmed
    where: "interface/puericultura/consulta/ficha.tsx:202-207 (PropsFichaPreenchivel) e :220-227 (o corpo do fieldset). A consequência aparece em interface/puericultura/consulta/app.tsx:186-192."
    born: "feature 020, na composição original da tela. Não é regressão: o comando nasceu irmão da ficha e nunca esteve dentro dela. Bisect inaplicável — não existe commit bom conhecido."
    summary: >-
      Não é defeito de lógica: é uma fronteira de composição que nunca teve porta.
      `FichaPreenchivel` projeta as seções a partir do dado da ficha e não aceita conteúdo de
      fora — seu contrato de props tem quatro entradas, todas de dado, e o corpo de cada
      `fieldset` é um único `map` sobre `camposAplicaveis`. Como não há por onde inserir nada
      dentro de um quadro, quem montou a tela pôs o comando onde cabia: irmão da ficha, depois
      dela na ordem do JSX. A impossibilidade é do tipo, não do uso.
    evidence:
      - "evidence/reproduction.md — cápsula determinística 1/1 sobre o commit c3db432; o diagnóstico impresso dá o pai real do nó, `div.consulta-regioes`, e mostra que não há fieldset algum acima do comando"
      - "ficha.tsx:202-207 — PropsFichaPreenchivel declara ficha, sexo, preenchimento e onResposta; nenhuma aceita ReactNode"
      - "ficha.tsx:220-227 — o corpo do fieldset é um único map sobre camposAplicaveis, sem ponto de inserção"
      - "os três testes vigentes que tocam o comando o alcançam por papel e nome acessível, nunca por posição, o que prova que a posição nunca foi contratada"
  reproduction_tests:
    - "tests/integration/interface/consulta-puericultura.test.tsx — describe 'O comando de crescimento mora no quadro das medidas (BUG-20260728-C6LN)', caso 'é filho do fieldset que contém os campos de medida' (vermelho em c3db432; Gate 1 aprovado 2026-08-09)"
  regression_tests:
    - "tests/integration/interface/consulta-puericultura.test.tsx — mesmo describe: ordem no documento, ficha de quatro medidas com comando único, e o painel que continua abrindo de onde o comando está"
    - "tests/unit/dominio-puericultura/consulta-selecao.test.ts — describe 'Exatamente um quadro de medidas por ficha (BUG-20260728-C6LN)': a invariante que torna o predicado bem definido, verificada nas dez fichas, mais a ausência de medida restrita por sexo"
    - "e2e/consulta-puericultura.spec.ts — 'teclado: o foco volta ao gatilho mesmo depois de trocar a ficha': guarda o modo de falha que a correção CRIA, o ref caindo no vazio depois da remontagem do quadro"
    - "Vizinhança intacta: os três testes vigentes que tocam o comando permaneceram verdes sem emenda, porque o alcançam por papel e nome acessível"

spec_verdict:
  verdict: spec-gap
  addendum: "_reversa_sdd/addenda/bug-BUG-20260728-C6LN-v001.md"
  decided_by: iago
  decided_at: 2026-08-09

change_set:
  - id: CHG-001
    kind: code
    artifact: "interface/puericultura/consulta/ficha.tsx"
    diff: "fix/CHG-001.diff"
  - id: CHG-002
    kind: code
    artifact: "interface/puericultura/consulta/app.tsx"
    diff: "fix/CHG-002.diff"
  - id: CHG-003
    kind: code
    artifact: "interface/estilos/consulta-puericultura.css"
    diff: "fix/CHG-003.diff"
  - id: CHG-004
    kind: specification
    artifact: "_reversa_sdd/addenda/bug-BUG-20260728-C6LN-v001.md"
    diff: null
  - id: CHG-005
    kind: test
    artifact: "tests/integration/interface/consulta-puericultura.test.tsx"
    diff: "fix/CHG-005.diff"
  - id: CHG-006
    kind: test
    artifact: "tests/unit/dominio-puericultura/consulta-selecao.test.ts"
    diff: "fix/CHG-006.diff"
  - id: CHG-007
    kind: test
    artifact: "e2e/consulta-puericultura.spec.ts"
    diff: "fix/CHG-007.diff"

closure:
  policy: local-software
  satisfied: true
resolution_kind: fixed
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

## Resolution

> Encerrado em 2026-08-09 por `/reversa-debugger-fix`, closure policy `local-software`
> satisfeita: regressão passando e veredito de spec decidido.

### Causa raiz, estado final `confirmed`

Uma fronteira de composição sem porta. `FichaPreenchivel` projetava as seções a partir do dado da
ficha e não aceitava conteúdo de fora: quatro props, todas de dado, e o corpo de cada `fieldset`
reduzido a um `map` sobre `camposAplicaveis`. A impossibilidade era do **tipo**, não do uso, e por
isso quem montou a tela pôs o comando onde cabia — irmão da ficha, depois dela na ordem do JSX.

A cápsula determinística mostrou que o defeito era pior que o relato: o comando não estava no quadro
errado, estava fora de **qualquer** quadro, pendurado em `div.consulta-regioes`.

### Veredito de spec

`spec-gap`, decidido pelo usuário em 2026-08-09. A spec não descrevia posição alguma para o gatilho,
e a prova é que os três testes vigentes que tocam o comando o alcançam por papel e nome acessível:
se a posição estivesse contratada, algum deles teria caído. Nenhum caiu. O adendo aditivo está em
`_reversa_sdd/addenda/bug-BUG-20260728-C6LN-v001.md`, e cria RN-13 (a ancoragem, por predicado) e
RN-14 (a invariante de que existe uma e uma só seção com medidas por ficha).

### Correction Change Set

| CHG | Tipo | Artefato | O que mudou |
|---|---|---|---|
| `CHG-001` | `code` | `interface/puericultura/consulta/ficha.tsx` | Prop opcional `rodapeDaSecao?: (secao: SecaoDaFicha) => ReactNode`, renderizada ao fim do `fieldset`. Ponto de extensão **cego**: a ficha não sabe o que recebe. Sem a prop, desenha o que desenhava. |
| `CHG-002` | `code` | `interface/puericultura/consulta/app.tsx` | O `<Button>` deixa de ser irmão da ficha e chega pelo rodapé, filtrado por `temMedida(secao)`. `ref`, rótulo e `onClick` inalterados. |
| `CHG-003` | `code` | `interface/estilos/consulta-puericultura.css` | Regra `.consulta-comando-da-secao` com `margin-block-start`. Condicionada no plano a inspeção visual, e a inspeção a confirmou necessária. |
| `CHG-004` | `specification` | `_reversa_sdd/addenda/bug-BUG-20260728-C6LN-v001.md` | Adendo aditivo do veredito `spec-gap`. |
| `CHG-005` | `test` | `tests/integration/interface/consulta-puericultura.test.tsx` | Reprodução e três regressões de interface. |
| `CHG-006` | `test` | `tests/unit/dominio-puericultura/consulta-selecao.test.ts` | A invariante que torna o predicado bem definido, nas dez fichas. |
| `CHG-007` | `test` | `e2e/consulta-puericultura.spec.ts` | Foco de volta ao gatilho depois de trocar a ficha. |

Diffs em `fix/CHG-00N.diff`. **Nada além disso foi tocado**: motor de crescimento, catálogo das dez
fichas, projeção em texto e contrato do registro em SOAP permanecem como estavam.

### Prova vermelho → verde

Antes do change set, com os testes já aplicados sobre `c3db432`:

```
FAIL … > é filho do fieldset que contém os campos de medida
  AssertionError: expected null not to be null
FAIL … > vem depois dos campos de medida, e não antes deles
  TypeError: Expected container to be an Element … but got null
FAIL … > acompanha as medidas na ficha de quatro campos, e continua único na tela
  AssertionError: expected null not to be null

Test Files  1 failed | 1 passed (2)
     Tests  3 failed | 42 passed (45)
```

Depois:

| Portão | Resultado |
|---|---|
| `eslint` | limpo |
| `tsc --noEmit` | exit 0 |
| vitest | **935/935** em 73 arquivos (eram 920 antes das 15 novas) |
| e2e da rota | **10/10**, `axe` em zero violação |
| inventário textual | 1 245 literais; o diff do congelado só desloca números de linha |
| inspeção visual | comando dentro de "1. Medidas", depois de Comprimento, com respiro; grade das seis seções intacta |

### A dívida que a correção não criou

A ancoragem por predicado tem um modo de falha silencioso próprio: numa ficha nova com medidas em
dois quadros nasceriam **dois** comandos, e numa sem medidas, **nenhum** — sem que teste algum de
interface reprovasse, porque a tela renderizaria sem erro. `CHG-006` fecha exatamente essa porta, e
fala a quem edita uma ficha, que é quem pode quebrá-la.

### O que ficou de fora, e por quê

A taxonomia proposta nos Agent Notes — `module: interface-puericultura-consulta` e
`feature: consulta-puericultura-soap` — continua ausente de `taxonomy.yaml`. Editar o vocabulário
controlado é decisão de registro, não de correção, e pertence ao `/reversa-debugger-graph`.
