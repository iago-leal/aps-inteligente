---
schema_version: 1
id: BUG-20260728-ZAHV
display_number: 3
title: Notas de proveniência e linha da fonte atravessam para o texto copiado do registro
status: resolved
phase: resolved
severity: critical
priority: P0
created: 2026-07-28
updated: 2026-07-28

origin:
  type: manual-report
  external_ref: null

area: interface
module: unclassified
feature: unclassified
labels: [spec-update-required]

visibility: normal
security_suspected: false

reproduction:
  classification: deterministic
  rate: "1/1 observado em produção (print de 28/07); 2/2 na cápsula isolada (evidence/reproduction.md, commit base 3642ba6)"
  suspected_triggers: []

blocking: []

relationships:
  - bug: BUG-20260728-C6LN
    type: related-to
    state: proposed
    evidence: []

traceability:
  specs:
    - "_reversa_sdd/models-puericultura-consulta/contracts.md#forma-do-texto-emitido"
    - "_reversa_sdd/models-puericultura-consulta/contracts.md#regras-da-forma (regra 7: as notas fecham o texto, e a linha da fonte fecha as notas)"
    - "_reversa_forward/020-consulta-puericultura-soap/interfaces/registro-soap.md#2-forma (regra 7)"
    - "_reversa_sdd/interface-puericultura-consulta/requirements.md#requisitos-funcionais (RF-08: o texto exibido e o copiado são a mesma cadeia)"
  affected_code:
    - "interface/puericultura/consulta/formatar-registro.ts:25-47 — parteDaFonte e a montagem da cadeia final"
    - "models/puericultura/consulta/registro.ts:205-229 — notasDe, origem das três notas no registro"
    - "models/puericultura/consulta/registro.ts:231-249 — referenciasDe, origem da linha da fonte"
  root_cause:
    state: confirmed
    where: "_reversa_sdd/models-puericultura-consulta/contracts.md § Regras da forma, regra 7 — a SPEC, não o código. Materializada em interface/puericultura/consulta/formatar-registro.ts:40,46."
    born: "feature 020 (contrato de origem `_reversa_forward/020-.../interfaces/registro-soap.md` § 2, regra 7). Não é regressão: o comportamento nunca foi outro. Bisect inaplicável — não existe commit bom conhecido."
    summary: >-
      Não há defeito de implementação. `formatarRegistro` soma as notas e a linha da fonte à
      cadeia porque a regra 7 do contrato manda, e a regra remonta a RN-03, RN-08 e RN-09 da
      feature 020, que exigem declarar ao leitor a autoria do arranjo em SOAP, as três fichas
      fora da entrega e a supressão de campo na ficha feminina. O erro está na premissa da
      regra, não no seu cumprimento: ela supôs que a declaração obrigatória devia acompanhar o
      artefato emitido, quando o destinatário dela é quem opera a plataforma. Depois de colada
      num prontuário, a mesma informação não instrui ninguém e vira ruído num documento cuja
      função é outra.
    evidence:
      - "evidence/reproduction.md — cápsula determinística 2/2 sobre o domínio real, sem navegador; proveniência mede 1 015 de 1 095 caracteres (93%) num registro de um campo"
      - "leitura do fluxo: formatar-registro.ts:40 e :46 são as ÚNICAS origens das quatro partes observadas; nenhuma outra função contribui para a cadeia"
      - "tests/unit/interface/formatar-registro.test.ts:82 (as-is) afirmava o comportamento COMO CONTRATO, o que prova intenção e não acidente"
      - "prova de que a declaração nunca dependeu do texto copiado: a regressão do bloco de proveniência da tela já passava ANTES do corte"
  reproduction_tests:
    - "tests/unit/interface/formatar-registro.test.ts — 'não carrega nota de proveniência nem linha da fonte (regra 7, adendo ZAHV)' e 'fecha no último item da última seção preenchida' (vermelhos em 3642ba6; Gate 1 aprovado 2026-07-28)"
    - "tests/integration/interface/consulta-puericultura.test.tsx — describe 'O que sai para a área de transferência', dois casos: ficha masculina e ficha feminina do 2.º Mês, esta com a nota condicional de supressão (vermelhos em 3642ba6)"
  regression_tests:
    - "tests/unit/interface/formatar-registro.test.ts — describe 'Forma exata da cadeia (regressão de BUG-20260728-ZAHV)': fixa a cadeia INTEIRA, de modo que qualquer bloco novo depois da última seção reprove, que é o modo de falha por onde a proveniência entrou"
    - "tests/integration/interface/consulta-puericultura.test.tsx — 'é o único lugar que declara a proveniência, e declara as quatro coisas': guarda a declaração que RN-03, RN-08 e RN-09 exigem, agora que a tela é o único lugar onde ela se cumpre"
    - "Vizinhança intacta: os oito casos remanescentes do contrato §2, o describe de RF-08 (identidade byte a byte) e os 9 testes e2e da rota, incluindo axe e a guarda geométrica do registro longo"

spec_verdict:
  verdict: spec-desatualizada
  addendum: "_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md"
  decided_by: iago
  decided_at: 2026-07-28

change_set:
  - id: CHG-001
    kind: code
    artifact: "interface/puericultura/consulta/formatar-registro.ts"
    diff: "fix/CHG-001.diff"
  - id: CHG-002
    kind: specification
    artifact: "_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md"
    diff: null
  - id: CHG-003
    kind: test
    artifact: "tests/unit/interface/formatar-registro.test.ts"
    diff: "fix/CHG-003.diff"
  - id: CHG-004
    kind: test
    artifact: "tests/integration/interface/consulta-puericultura.test.tsx"
    diff: "fix/CHG-004.diff"

closure:
  policy: local-software
  satisfied: true
resolution_kind: fixed
---

# Notas de proveniência e linha da fonte atravessam para o texto copiado do registro

## Summary

O texto que a tela exibe no bloco "Registro em SOAP" — e que o comando de cópia entrega à área de
transferência, byte a byte — fecha com três parágrafos de proveniência editorial e uma linha de
fonte bibliográfica. Nada disso é registro clínico: é a declaração de como o produto foi feito. Como
esse texto existe para ser colado num prontuário eletrônico de terceiros, a proveniência viaja junto
e polui o registro do paciente.

O usuário decidiu em 28/07 que **as notas e a linha da fonte saem do texto copiado**, permanecendo
visíveis na tela, no bloco de proveniência que já as exibe em separado.

## Expected Behavior

O comportamento **está especificado**, e a spec vigente descreve exatamente o que hoje se observa: a
regra 7 de `_reversa_sdd/models-puericultura-consulta/contracts.md#regras-da-forma` determina que
"as notas fecham o texto, e a linha da fonte fecha as notas", e o bloco de forma do §
`#forma-do-texto-emitido` desenha os quatro blocos finais. A regra remonta a RN-09, RN-03 e RN-08 da
feature 020, que exigem declarar ao leitor que a organização em SOAP é autoral, que três fichas
ficaram fora da entrega e que um campo é suprimido na ficha feminina.

Este bug, portanto, **não acusa desvio da spec: acusa a spec**. O comportamento esperado passa a ser
o que o usuário fixou em 28/07:

```
<Título da ficha> — idade cronológica: <idade em prosa>

S
- <rótulo>: <valor>

O
- <rótulo>: <valor>

A
- <rótulo>: <valor>

P
- <rótulo>: <valor>
```

Sem notas, sem linha de fonte, e com o cabeçalho da ficha preservado — o registro precisa dizer de
que consulta se trata.

A obrigação de declarar proveniência **permanece satisfeita**, e por caminho já existente: RF-12 da
feature 020 exige o bloco de proveniência na tela, e `interface/puericultura/consulta/proveniencia.tsx`
o renderiza importando as mesmas constantes de `models/puericultura/consulta/fonte-clinica.ts` que o
registro usa. A declaração ao leitor não depende do texto copiado; hoje ela é redundante entre os
dois lugares.

## Actual Behavior

Depois da última seção do SOAP, o texto exibido e copiado acrescenta, separados por linha em branco
dupla:

1. **Nota da organização em SOAP** — "A matéria desta ficha vem da Caderneta da Criança; a
   organização do texto em subjetivo, objetivo, avaliação e plano é do produto. A fonte imprime os
   itens em seções numeradas e não menciona o registro clínico orientado por problemas. [...]"
2. **Nota das fichas ausentes** — "Esta tela cobre as dez consultas datadas, da 1.ª Semana ao 36.º
   Mês. Três registros das mesmas páginas ficaram fora desta entrega e serão acrescentados depois:
   Pré-Natal, Parto, Nascimento, Internação Neonatal e Alta (p. 67), Triagens Neonatais (p. 68) e
   Outras Medidas e Consultas Necessárias (p. 75) [...]"
3. **Nota de supressão de campo**, quando a ficha aberta tiver campo suprimido pelo sexo.
4. **Linha da fonte** — "Fonte: Caderneta da Criança (Ministério da Saúde, 2.ª ed., Brasília, 2020):
   pp. 66–75 [...]"

No print, com um único campo preenchido na seção S, o texto de proveniência ocupa mais de quatro
quintos do registro.

## Steps to Reproduce

1. Abrir https://apsinteligente.app/puericultura/consulta
2. Informar sexo, data de nascimento e data da consulta, de modo que a ficha seja sugerida
3. Marcar um único campo qualquer da ficha (no print: "Parou de amamentar?: Não")
4. Ler o bloco "Registro em SOAP" na tela, ou acionar "Copiar registro" e colar em qualquer editor

Observado em 1/1 tentativa. É determinístico por construção: as duas primeiras notas são
incondicionais em `notasDe`, e a linha da fonte é montada sempre que há ao menos uma seção.

## Evidence

- `evidence/registro-com-notas-e-linha-de-fonte.png` — o bloco "Registro em SOAP" em produção, com
  as duas notas incondicionais e a linha da fonte depois de uma seção S de uma linha.

## Suspected Area

A cadeia se monta em `interface/puericultura/consulta/formatar-registro.ts:42-47`, onde `notas` e
`parteDaFonte(registro)` entram no `join`. O dado que alimenta essas duas partes nasce no domínio,
em `notasDe` e `referenciasDe` de `models/puericultura/consulta/registro.ts`.

A fronteira importa para quem for corrigir: **a projeção em texto é da interface, e a estrutura é do
domínio**. Cortar no formatador deixa `RegistroDaConsulta.notas` e `.referencias` sem consumidor na
projeção textual, mas não sem consumidor no produto — a tela lê as constantes de proveniência
diretamente de `fonte-clinica.ts`. Decidir se os campos permanecem na estrutura é parte do veredito
de spec, não deste registro.

## Acceptance Criteria

1. Copiado o registro com qualquer preenchimento, a cadeia entregue à área de transferência **não
   contém** nenhuma das três notas de proveniência nem linha começada por `Fonte:`.
2. A cadeia preserva o cabeçalho com título da ficha e idade declarada, e as seções S, O, A, P nas
   regras 1 a 6 e 8 do contrato, que permanecem vigentes.
3. O texto exibido na tela e o copiado continuam idênticos byte a byte (RF-08).
4. O bloco de proveniência da tela continua exibindo as notas e a fonte, sem alteração de conteúdo.
5. A regra 7 do contrato `contracts.md` é reescrita por adendo versionado, e não contornada em
   silêncio: a spec passa a dizer que a proveniência se declara na tela e fica fora do texto emitido.

## Traceability

| Eixo | Conteúdo |
|---|---|
| Spec efetiva | `contracts.md#regras-da-forma` regra 7 e `#forma-do-texto-emitido`; contrato de origem em `_reversa_forward/020-.../interfaces/registro-soap.md#2-forma` |
| Código afetado | `formatar-registro.ts:25-47`; `models/puericultura/consulta/registro.ts:205-249` |
| Testes que travavam o comportamento | `tests/unit/interface/formatar-registro.test.ts:82` — reescrito no lugar pelo `CHG-003`. `consulta-registro.test.ts:174` **não** travava: afirma a estrutura do domínio, que permaneceu; seguiu verde sem ser tocado |
| Testes de reprodução | `formatar-registro.test.ts` (2 casos) e `consulta-puericultura.test.tsx` (2 casos, um deles com a nota condicional da ficha feminina) |
| Testes de regressão | `formatar-registro.test.ts` describe "Forma exata da cadeia"; `consulta-puericultura.test.tsx` "é o único lugar que declara a proveniência" |
| Spec efetiva **após** o fix | `_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md` (vigente desde 28/07) sobre `contracts.md` |

## Agent Notes

- **A decisão que este bug executa está registrada em `.harness/decisoes/MD-0035.md`**, com as cinco
  alternativas descartadas e o alcance geral da regra: artefato que o produto emite para fora declara
  a proveniência no ponto de emissão, não no artefato emitido. Ler a ficha antes de propor variação.
- **Este bug não se corrige sem veredito de spec.** O comportamento observado é o especificado; o
  ciclo `/reversa-debugger-fix` deve produzir `spec-desatualizada` com adendo versionado sobre
  `_reversa_sdd/models-puericultura-consulta/contracts.md`, e não emendar o código deixando a regra 7
  a afirmar o contrário do que o produto faz.
- **Um teste vigente reprova a correção**, e isso é esperado:
  `tests/unit/interface/formatar-registro.test.ts:82` afirma a regra 7. Ele muda de sentido junto com
  a spec, no mesmo change set — não se apaga por conveniência.
- **A norma de redação continua valendo** sobre o texto do bloco de proveniência da tela, que
  permanece intocado. Nenhum literal novo deve nascer desta correção; o corte é subtrativo.
- **Fronteira a decidir no fix, não aqui:** se `RegistroDaConsulta` continua carregando `notas` e
  `referencias` na estrutura. Há argumento dos dois lados — a estrutura documenta o que o registro
  declara, e a projeção decide o que emite. O `contracts.md` é contrato de saída emitida, e é dele
  que a regra 7 sai.
- **Proposta de taxonomia** (não aplicada, `taxonomy.yaml` é somente leitura aqui): acrescentar
  `module: models-puericultura-consulta` e `module: interface-puericultura-consulta`, e
  `feature: consulta-puericultura-soap`. Enquanto não houver decisão, ambos os bugs deste contexto
  ficam com `module: unclassified` e `feature: unclassified`.

---

## Resolution

> Fechado em 2026-07-28 pelo `/reversa-debugger-fix`, com os dois gates aprovados e veredito de
> spec decidido pelo usuário. `resolution_kind: fixed`.

### Causa raiz · estado `confirmed`

**Não era defeito de implementação: o código era fiel à spec.** A cadeia carregava a proveniência
porque a regra 7 de `contracts.md` mandava, e a regra remontava a RN-03, RN-08 e RN-09 da feature
020. O erro estava na premissa da regra — que a declaração obrigatória devia acompanhar o artefato
emitido —, não no seu cumprimento. Por isso a correção começou pela spec, e o adendo é
pré-requisito do fechamento, não consequência dele.

Três achados da investigação corrigiram o que o registro previa, todos a favor de um change set
menor:

1. **A spec afetada era maior que a regra 7.** O corte revoga também a regra 8 de `contracts.md`
   (composição da linha da fonte), emenda a regra 5 e reescreve o § Forma do texto emitido.
2. **Só um teste vigente mudou de sentido, não dois.** `consulta-registro.test.ts:174` afirma a
   estrutura do domínio, que permaneceu intacta; seguiu verde sem ser tocado.
3. **A superfície textual não se moveu.** O `Fonte:` do formatador não constava do inventário —
   fica abaixo do corte de duas palavras e fora de posição de exibição. Conferido antes e depois:
   1 187 literais nas duas vezes, `inventario-textual.json` sem diff.

### Veredito de spec

`spec-desatualizada`, decidido por iago em 2026-07-28. Adendo versionado e imutável em
`_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md`, alcançando o § Forma do texto emitido e as
regras 5, 7 e 8 de `contracts.md`. A spec original não foi editada.

O adendo abre com uma **advertência de numeração**, porque as duas specs numeram diferente: em
`registro-soap.md` a regra 8 é "nenhum identificador da criança" (RN-12), que **permanece vigente**
e tem teste próprio. Sem a advertência, o leitor futuro concluiria que suprimimos uma proteção de
privacidade.

### Correction Change Set

| CHG | Tipo | Artefato | O que fez |
|---|---|---|---|
| `CHG-001` | `code` | `interface/puericultura/consulta/formatar-registro.ts` | Removeu `parteDaFonte` e a montagem de `notas`; a cadeia passou a ser cabeçalho + seções. −13 linhas de código, +14 de comentário. Diff em `fix/CHG-001.diff` |
| `CHG-002` | `specification` | `_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md` | O adendo acima |
| `CHG-003` | `test` | `tests/unit/interface/formatar-registro.test.ts` | Reescreveu no lugar o teste da regra 7 e acrescentou a guarda de forma exata. Diff em `fix/CHG-003.diff` |
| `CHG-004` | `test` | `tests/integration/interface/consulta-puericultura.test.tsx` | Reprodução no nível do clipboard (dois cenários) e a regressão da declaração na tela. Diff em `fix/CHG-004.diff` |

`CHG-003` e `CHG-004` receberam ID depois do plano, que os tratava só como "testes do Gate 1": todo
arquivo tocado entra no change set, ou o registro descreve menos do que o commit contém.

**Nenhum reparo de dados.** O produto não persiste registro algum (ADR 0002, 100% client-side). O
que já foi colado em prontuário está fora do alcance de qualquer correção nossa, e é a assimetria
que o próprio contrato declara como risco.

### Prova vermelho → verde

| Momento | Suíte | e2e |
|---|---|---|
| Linha de base (`3642ba6`) | 816/816 em 67 arquivos | — |
| Após o Gate 1 | **5 falham** / 816 passam (821) | — |
| Após o `CHG-001` | **821/821** em 67 arquivos, 8,1 s | **9/9**, axe zero violação |

As cinco que falharam foram as três de reprodução mais a guarda de forma exata; a sexta asserção
nova — a regressão do bloco de proveniência da tela — **já passava antes do corte**, e é a prova
empírica do argumento de `MD-0035`: a declaração nunca dependeu do texto copiado, apenas estava
duplicada nele.

Guardrails reconferidos contra a linha de base: `tsc --noEmit` limpo, `eslint` limpo,
`inventariar-textos.mts --gerar` sem diff.

### Perda declarada e aceita

A linha da fonte trazia a localização exata da ficha aberta (`p. 68, Consulta da 1ª Semana`), e o
bloco da tela exibe apenas a cobertura `pp. 66–75`. A página específica deixou de ser exibida em
qualquer superfície. Apresentada no plano e **aceita pelo usuário em 28/07**: a cobertura contém a
página, o nome publicado da fonte permanece na tela por `MD-0021`, e nenhuma norma exige precisão
maior que o intervalo.

### Fronteira decidida

`RegistroDaConsulta` continua carregando `notas` e `referencias`. O contrato reescrito é de saída
emitida; a estrutura documenta o que o registro declara, e a projeção decide o que emite. Os dois
campos ficam sem consumidor de produção — o único era o formatador —, o que está dito em voz alta
no adendo para que ninguém conclua, daqui a doze meses, que sobraram por descuido.

### Closure policy

`local-software` satisfeita: testes de regressão passando **e** veredito de spec com adendo
versionado. Sem `delivery` e sem `post_fix_observation`, que a política não exige.
