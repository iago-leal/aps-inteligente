---
schema_version: 1
id: BUG-20260728-ZAHV
display_number: 3
title: Notas de proveniência e linha da fonte atravessam para o texto copiado do registro
status: open
phase: triaging
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
  rate: "1/1 observado em produção (apsinteligente.app/puericultura/consulta, print de 28/07)"
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
| Testes que travam o comportamento atual | `tests/unit/interface/formatar-registro.test.ts:82` — "fecha com as notas de proveniência e a linha da fonte (regra 7)"; `tests/unit/dominio-puericultura/consulta-registro.test.ts:174` — a nota da organização em SOAP no registro estruturado |
| Testes de reprodução | a criar no `/reversa-debugger-fix` |
| Testes de regressão | a criar no `/reversa-debugger-fix` |

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
