# Actions: Integração do design aprovado da calculadora — divergências clínicas e entrada por momento

> Identificador: `001-integrar-design-claude`
> Data: `2026-07-19`
> Roadmap: `_reversa_forward/001-integrar-design-claude/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 20 |
| Paralelizáveis (`[//]`) | 16 |
| Maior cadeia de dependência | 7 (T002 → T003 → T004 → T009 → T010 → T017 → T020) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Adicionar a `CONSTANTES` os grupos `METFORMINA` (DOSE_MIN 1000, DOSE_OTIMIZADA_MIN 2000, DOSE_MAX 2550) e `TFG` (LIMIAR_REDUCAO_50 45, LIMIAR_SUSPENSAO 30), a extensão de `VALIDACAO` (metformina 100–3000 mg/dia; TFG 1–200), as entradas novas de `REFERENCIAS` (p. 28, 58, 59) e a redação condicional da sulfonilureia com variante de contexto (D-05), tudo congelado; comentário distingue origem clínica (guia) de plausibilidade (D-09) | - | `[//]` | `models/insulina/fonte-clinica.ts` | 🟢 | `[X]` |
| T002 | Estender `EntradaCalculo` com os campos opcionais `doseMetforminaMgDia` e `tfg` (D-03) e criar os tipos de saída `METFORMINA_NAO_OTIMIZADA` (alerta, severidade abaixo de `INDICACAO_INSULINA`), `REDUZIR_METFORMINA_TFG` e `SUSPENDER_METFORMINA_TFG` (recomendações) (D-08) | - | `[//]` | `models/insulina/tipos.ts` | 🟡 | `[X]` |
| T003 | Estender os builders de teste com os campos novos, default ausente, preservando os testes existentes (data-delta §5) | T002 | - | `tests/apoio/construtores.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Criar a suíte de validação da regra de antidiabéticos orais (RF-01/RF-02): dose informada < 2000 → alerta com referência; TFG 30–45 → reduzir 50%; TFG < 30 → suspender; campos ausentes → nenhuma saída nova; regra ativa nos modos início e titulação | T001, T002, T003 | `[//]` | `tests/unit/dominio/metformina.test.ts` (novo) | 🟢 | `[X]` |
| T005 | Estender a suíte da titulação com os cenários Gherkin da RN-03 (RF-03): uso não informado ao fracionar (redação condicional); esquema já fracionado (≥ 2 aplicações de NPH) com uso explícito e com uso não informado; gatilho atual inalterado | T001, T002, T003 | `[//]` | `tests/unit/dominio/titulacao-basal.test.ts` | 🟡 | `[X]` |
| T006 | Estender a suíte de validação de entrada (RF-05): ofensor próprio para dose de metformina e para TFG fora da faixa de plausibilidade; ausência sem ofensor; coleta de todos os ofensores mantida | T001, T002, T003 | `[//]` | `tests/unit/dominio/validacao.test.ts` | 🟡 | `[X]` |
| T007 | Estender os property tests de invariantes para as saídas novas (toda saída carrega `ReferenciaClinica` com página do guia) e ajustar `tipos.test.ts` aos tipos novos | T001, T002, T003 | `[//]` | `tests/unit/dominio/invariantes.test.ts` | 🟢 | `[X]` |
| T008 | Estender a suíte de referências para as entradas novas do catálogo (p. 28, 58, 59) | T001 | `[//]` | `tests/unit/dominio/referencias.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T009 | Criar a regra transversal de antidiabéticos orais (RN-01/RN-02, D-01): alerta de dose de metformina não otimizada e recomendações por faixa de TFG, com referências do catálogo | T001, T002, T004 | `[//]` | `models/insulina/regra-metformina.ts` (novo) | 🟢 | `[X]` |
| T010 | Invocar a regra de antidiabéticos orais na fachada, nos modos início e titulação, antes da ordenação de alertas e da deduplicação de recomendações | T009 | - | `models/insulina/calculadora.ts` | 🟢 | `[X]` |
| T011 | Ampliar os gatilhos da sulfonilureia (RN-03): uso não informado com redação condicional (D-05) e esquema já fracionado detectado por ≥ 2 aplicações de NPH (D-04), preservando o gatilho atual | T001, T002, T005 | `[//]` | `models/insulina/regra-titulacao-basal.ts` | 🟡 | `[X]` |
| T012 | Estender a validação de entrada com os ofensores de dose de metformina e TFG (D-09), espelhando `CONSTANTES.VALIDACAO` e mantendo a coleta de todos os ofensores | T001, T002, T006 | `[//]` | `models/insulina/validacao.ts` | 🟡 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T013 | Criar o subcomponente de entrada de glicemias por momento (RF-04, D-06): quatro campos (jejum, antes do almoço, antes do jantar, ao deitar), tokenização por espaço + `interpretaDecimal` por token, conversão para `GlicemiaAferida[]`, campo vazio = momento não aferido, sem máximo de aferições | T002 | `[//]` | `interface/calculadora/glicemias-por-momento.tsx` (novo) | 🟢 | `[X]` |
| T014 | Criar o subcomponente do bloco de antidiabéticos orais (dose de metformina e TFG, opcionais), com validação no blur espelhada via `CONSTANTES` (D-07) | T001, T002 | `[//]` | `interface/calculadora/antidiabeticos-orais.tsx` (novo) | 🟢 | `[X]` |
| T015 | Reestruturar o formulário para compor os dois subcomponentes e montar `EntradaCalculo` com os campos novos, mantendo a validação espelhada e reduzindo o arquivo a ≤ 400 linhas (D-07) | T013, T014 | - | `interface/calculadora/formulario.tsx` | 🟢 | `[X]` |
| T016 | Verificar a renderização do alerta e das recomendações novos na tela de resultado; ajustar apenas se a renderização por lista não for genérica | T002, T010 | `[//]` | `interface/calculadora/resultado.tsx` | 🟡 | `[X]` |
| T017 | Reescrever os testes de integração do formulário para a entrada por momento (RF-06), incluindo o critério de equivalência do RF-04 (mesmo conjunto de aferições → mesmo resultado do cálculo) e o cenário de ofensores conjuntos (glicemia fora de faixa + peso ausente exibidos juntos) | T010, T015 | `[//]` | `tests/integration/interface/formulario.test.tsx` | 🟢 | `[X]` |
| T018 | Estender os testes de integração do resultado para cobrir o alerta e as recomendações novos | T016 | `[//]` | `tests/integration/interface/resultado.test.tsx` | 🟡 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T019 | Adicionar os cabeçalhos de rastreabilidade RF-01..06 nos arquivos novos e alterados da feature (Princípio VI) | T010, T011, T012, T015, T016 | `[//]` | arquivos da feature (cabeçalhos) | 🟢 | `[X]` |
| T020 | Verificar o critério de pronto mensurável: suíte completa verde (incluindo `tests/regression/BUG-20260719-RHZ5.test.ts` e property tests), cobertura ≥ 90% em `models/**`, `formulario.tsx` ≤ 400 linhas | T007, T008, T017, T018, T019 | - | `tests/**` (verificação) | 🟢 | `[X]` |

## Notas de execução

- **Precedência clínica (decisão de execução, a validar pelo usuário e reconciliar no `/reversa-sync`):** o data-delta §2 define os gatilhos de RN-01 e RN-02 de forma independente, sem tratar a interação. Emitir simultaneamente "otimizar (aumentar) a dose de metformina" e "reduzir 50% / suspender" seria clinicamente contraditório. Implementado: (a) TFG ≤ 45 suprime o alerta `METFORMINA_NAO_OTIMIZADA`; (b) `SUSPENDER_METFORMINA_TFG` suprime `MANTER_METFORMINA` na mesma saída (isso altera também a regra 3 do `domain.md` §3.1). Testes em `tests/unit/dominio/metformina.test.ts` codificam as duas supressões.
- **T015:** além dos dois subcomponentes planejados, foram extraídos `validacao-campos.ts` (validadores de campo) e `esquema-atual.tsx` (fieldset da titulação) para cumprir o teto de 400 linhas (D-07). `formulario.tsx`: 532 → 313 linhas.
- **T016:** confirmado sem mudança — a renderização de alertas/recomendações em `resultado.tsx` é genérica por lista; cobertura pelos testes do T018.
- **T007:** `tipos.test.ts` não precisou de ajuste (os tipos novos não criam value object).
- **Formato:** `tests/regression/BUG-20260719-RHZ5.test.ts` já estava fora do padrão do Prettier antes desta feature e não foi tocado (sentinela intacta por design).

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-19 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-07-19 | Execução completa T001–T020 por `/reversa-coding`; notas de execução registradas | reversa-coding |
