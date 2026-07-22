# Actions: Leitura coerente das recomendações de metformina sob ajuste renal

> Identificador: `005-redacao-metformina-tfg`
> Data: `2026-07-22`
> Roadmap: `_reversa_forward/005-redacao-metformina-tfg/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 6 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 5 (T001 → T003 → T004 → T005 → T006) |

## Fase 1, Preparação

Omitida (Princípio VIII, proporcionalidade): a feature não exige setup, scaffolding, migração nem configuração — o ambiente da feature 004 (suíte, Playwright + axe, build) já cobre tudo.

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| `[//]` T001 | Criar o teste de unidade do agrupador (nasce falhando): par `MANTER_METFORMINA` + `REDUZIR_METFORMINA_TFG` vira grupo com subitem; `REDUZIR` órfã permanece item de topo (fallback D-02); lista sem coexistência sai idêntica e na mesma ordem; objetos `Recomendacao` preservados por referência, sem mutação (RF-01, RF-03; D-02) | - | `[//]` | `tests/unit/interface/agrupar-recomendacoes.test.ts` | 🟢 | `[X]` |
| `[//]` T002 | Estender o teste de integração do painel (nasce falhando) com os cenários Gherkin do requirements §7: TFG 40 no início → item de redução aninhado imediatamente sob o de manutenção; TFG 60 e TFG ausente → lista plana byte a byte; TFG 25 → supressão da feature 001 preservada; nenhuma asserção de texto de mensagem alterada (RF-01, RF-03) | - | `[//]` | `tests/integration/interface/resultado.test.tsx` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Implementar `agrupar-recomendacoes.ts`: função pura `Recomendacao[] → GrupoDeRecomendacoes[]` com mapa declarativo de pares (`REDUZIR_METFORMINA_TFG` subordinada a `MANTER_METFORMINA`) e fallback de subitem órfão; cabeçalho citando RF-01/RF-02; T001 verde (D-01, D-02) | T001 | - | `interface/calculadora/agrupar-recomendacoes.ts` | 🟢 | `[X]` |
| T004 | Alterar o componente `Recomendacoes` de `resultado.tsx` para renderizar os grupos como lista aninhada semântica (`<ul>` dentro do `<li>` pai); se o recuo default for imperceptível com o reset atual, acrescentar regra local mínima em `globais.css` mantendo-o abaixo de 400 linhas; T002 verde (D-03; risco 3 do roadmap) | T002, T003 | - | `interface/calculadora/resultado.tsx` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Verificação integrada: `npm test` (unidade + integração, incluindo a sentinela `metformina.test.ts` intocada), `test:api` e `test:e2e` com axe ≤ linha de base da feature 004 (0 violações); confirmar por diff que nenhuma string de mensagem clínica mudou (RF-02, RF-03; critério de pronto do roadmap) — cobre também a premissa 🟡 da titulação (D-04) | T004 | - | `e2e/calculadora.spec.ts` | 🟡 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Consolidar `relatorio.md` da feature: estrutura da lista antes/depois nos quatro cenários do requirements §7, resultado da varredura axe e registro de que a premissa da titulação (🟡, roadmap §4) fica aguardando validação do prescritor em uso real | T005 | - | `_reversa_forward/005-redacao-metformina-tfg/relatorio.md` | 🟢 | `[X]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

- T004: nenhuma regra de CSS foi necessária — o seletor descendente `.bloco-recomendacoes ul` (globais.css) já aplica `padding-left: 18px` à sublista, produzindo o recuo; `globais.css` permanece com 397 linhas.
- T005: contrato exigiu ambiente local de pé (banco 5433 via `npm run db:up` + `next start`); ao final, servidor e contêiner foram parados (`docker stop`, volume preservado). Screenshot do cenário TFG 40 confirma o subitem recuado, no formato que o prescritor esboçou.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-22 | Versão inicial gerada por `/reversa-to-do` | reversa |
