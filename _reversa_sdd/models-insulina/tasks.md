# models-insulina — Tarefas de Implementação

> Gerado pelo Reversa Writer em 2026-07-19. Sequência para reimplementar a unit a partir do legado.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Pré-requisitos

- [ ] TypeScript strict, sem dependências externas na unit (ADR 0003)
- [ ] Vitest + fast-check disponíveis para a suíte (threshold 90% em `models/**`)
- [ ] Tabela de constantes clínicas validada contra a fonte (`fonte-clinica.ts` ↔ Guia, ADR 0001)

## Tarefas

- [ ] T-01, Contratos e value objects: unions de entrada/saída, `Ofensor`, `ReferenciaClinica`, `Peso`/`Glicemia`/`DoseUi` congelados com `ErroDeInvariante`
  - Origem no legado: `models/insulina/tipos.ts`
  - Critério de pronto: contratos readonly compilam; construtores rejeitam valores fora de faixa
  - Confiança: 🟢

- [ ] T-02, Catálogo `REFERENCIAS` (20 entradas com página/figura) e `CONSTANTES` (todas as faixas e limiares), ambos `Object.freeze`, comentados com R-xx/AMB-xx
  - Origem no legado: `models/insulina/fonte-clinica.ts`
  - Critério de pronto: valores idênticos aos de `../data-dictionary.md` §Constantes
  - Confiança: 🟢

- [ ] T-03, Validação coletora: plausibilidade (peso/glicemia/HbA1c), regras do modo titulação, EC-10, path notation nos campos; `motivoForaDoEscopo`
  - Origem no legado: `models/insulina/validacao.ts`
  - Critério de pronto: cenários de RF-01/RF-02 do `requirements.md` passam
  - Confiança: 🟢

- [ ] T-04, `RegraInicio`: faixas absoluta e por peso (`Math.round`), NPH ao deitar, alerta de indicação, recomendações de comedicação e monitorização
  - Origem no legado: `models/insulina/regra-inicio.ts`
  - Critério de pronto: RF-03; `usoSulfonilureia === undefined` conta como "manter"
  - Confiança: 🟢

- [ ] T-05, `RegraTitulacaoBasal`: agregação média-com-hipo-prevalecendo, tabela −4/+2/+4, NPH mais noturna, clamp 1–60 com alerta, `naMeta`
  - Origem no legado: `models/insulina/regra-titulacao-basal.ts`
  - Critério de pronto: cenário Gherkin "hipoglicemia prevalece" e bordas 129/130/179/180 exatas (AMB-09)
  - Confiança: 🟢

- [ ] T-06, Fracionamento: gatilhos (>30 UI, >0,4 UI/kg/dia), ½ `ceil` + ½ principal, ⅔ `round` + ⅓ alternativa rotulada, condutas de comedicação
  - Origem no legado: `models/insulina/regra-titulacao-basal.ts` (fracionarSeIndicado)
  - Critério de pronto: cenário Gherkin do fracionamento; alternativa nunca aplicada ao principal
  - Confiança: 🟢

- [ ] T-07, `RegraIntensificacao`: gate de HbA1c (4 ramos), braços deslocados AA/AJ/AD, caso especial AJ (duas condutas), titulação da Regular ±2, NG-07
  - Origem no legado: `models/insulina/regra-intensificacao.ts`
  - Critério de pronto: cenários Gherkin AJ + gate; HbA1c ausente segue a tabela de RN-H
  - Confiança: 🟢

- [ ] T-08, Fachada `CalculadoraInsulinaDM2`: pipeline dos 6 passos do `design.md`, pós-processamento (faixa plena, cadência, sort de severidade, dedupes)
  - Origem no legado: `models/insulina/calculadora.ts`
  - Critério de pronto: RF-04/RF-05; ordem do pipeline preservada
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Validação: todos os códigos de erro, coleta múltipla, EC-10 (`tests/unit/dominio/`)
- [ ] TT-02, Início: faixas, indicação, comedicação (inclui `usoSulfonilureia` indefinido)
- [ ] TT-03, Titulação basal: tabela completa + bordas exatas + NPH noturna + clamp
- [ ] TT-04, Fracionamento: gatilhos, proporções, condutas alternativas
- [ ] TT-05, Intensificação: gate, três braços, caso AJ, titulação da Regular
- [ ] TT-06, Invariantes property-based (fast-check): toda saída referenciada; doses inteiras 1–60; determinismo; `ErroDeInvariante` nunca em fluxo válido
- [ ] TT-07, Referências: catálogo íntegro, dedupe por `localizacao`

## Tarefas de Migração de Dados

n/a — sem persistência (ADR 0002).

## Ordem Sugerida

1. T-01 → T-02 (contratos e constantes são a base de tudo).
2. T-03 (validação) — destrava os cenários de erro.
3. T-04, T-05→T-06, T-07 podem seguir em paralelo após T-02; T-06 depende de T-05.
4. T-08 por último (integra tudo); TT-xx nascem junto de cada T-xx (red → green, Princípio VII).

## Lacunas Pendentes (🔴)

Ver `questions.md`: validação do PDF da fonte e as quatro divergências clínicas aprovadas sem spec — nenhuma bloqueia a reimplementação fiel do estado atual, todas bloqueiam evolução.
