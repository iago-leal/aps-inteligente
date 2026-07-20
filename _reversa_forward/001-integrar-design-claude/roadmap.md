# Roadmap: Integração do design aprovado da calculadora — divergências clínicas e entrada por momento

> Identificador: `001-integrar-design-claude`
> Data: `2026-07-19`
> Requirements: `_reversa_forward/001-integrar-design-claude/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA
> Categoria (Princípio nº 4 global): **Produto** — responsabilidade clínica; rigor pleno.

## 1. Resumo da abordagem

A feature é um delta em três frentes sobre a arquitetura de três camadas existente (`_reversa_sdd/architecture.md#1`), sem componente novo de infraestrutura, sem contrato externo e sem persistência. No domínio, nasce uma regra transversal de antidiabéticos orais (metformina/TFG) chamada pela fachada `CalculadoraInsulinaDM2` nos dois modos, e a regra de titulação basal ganha os dois gatilhos ampliados da sulfonilureia; os limiares extraídos do guia (investigation.md §1) entram como grupos novos no catálogo congelado `CONSTANTES`/`REFERENCIAS`. Na interface, o formulário é reestruturado: a entrada de glicemias passa a quatro campos por momento com parsing na própria UI, convertendo para o contrato `GlicemiaAferida[]` que o domínio já aceita, e dois campos opcionais novos (dose de metformina, TFG) são adicionados; a reestruturação extrai subcomponentes para não agravar a dívida de tamanho do arquivo. Nos testes, as regras novas nascem com testes de validação (spec antes do código), os testes de integração do formulário são reescritos para a nova entrada e a regressão `BUG-20260719-RHZ5` permanece intocada como sentinela.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | O `requirements.md` clarificado é a spec; a extração citada do guia (investigation.md §1) precede o código; conflito código × spec resolve-se pelo requirements | respeita |
| II. Cadeia de derivação | Cada mudança rastreia RF-01..06, que derivam das divergências aprovadas no design; achados adjacentes do guia ficaram registrados fora do escopo (investigation.md §3), sem entrar sem RF próprio | respeita |
| III. Clarificação precede solução | Sessão de 2026-07-19 resolveu escopo, parsing e redação clínica antes deste plano; `EXAME_DO_REAL` feito sobre código extraído e PDF do guia | respeita |
| IV. Portão G1 | Requirements sem `[DÚVIDA]` após o clarify = seed travado; este roadmap nasce de requirements travados | respeita |
| V. Fase 2 proporcional | Categoria Produto: trio requirements/roadmap/actions completo; sem molde de API (nenhuma superfície externa) | respeita |
| VI. Rastreabilidade bidirecional | Arquivos novos/alterados citarão RF-NN desta feature no cabeçalho; a matriz da extração será reconciliada via `/reversa-sync` ao final | respeita |
| VII. Testes como metade da fonte | Regras clínicas novas nascem com teste de validação; a quebra declarada do teste do formulário vira reescrita planejada; regressão de bug preservada | respeita |
| VIII. Proporcionalidade | Rigor pleno justificado pela categoria Produto (conduta clínica) | respeita |

Nenhum conflito com princípio ativo.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Regra de metformina/TFG em módulo novo `models/insulina/regra-metformina.ts`, invocada pela fachada nos modos início e titulação, no pós-processamento (antes da ordenação de alertas/deduplicação) | RN-01/RN-02 valem "antes de iniciar ou titular" — regra transversal; módulo próprio preserva SRP e o pipeline documentado (`_reversa_sdd/code-analysis.md#módulo-1`) | Duplicar em `regra-inicio.ts` e `regra-titulacao-basal.ts`; embutir na validação | 🟢 |
| D-02 | Limiares novos como grupos `METFORMINA` e `TFG` em `CONSTANTES` + entradas novas em `REFERENCIAS` (p. 28, 58, 59), congelados | Catálogo único é invariante (ADR 0001); valores extraídos e citados em investigation.md §1 | Literais nas regras; arquivo de config | 🟢 |
| D-03 | `doseMetforminaMgDia` e `tfg` como campos **opcionais** de `EntradaCalculo`; ausentes → nenhuma saída nova (critérios RF-01/RF-02) | Design aprovado os trata como opcionais; obrigatoriedade barraria o uso corrente da calculadora | Campos obrigatórios; modo separado | 🟢 |
| D-04 | Gatilho "esquema já chega fracionado" da RN-03 detectado por **duas ou mais aplicações de NPH** na entrada da titulação | O fracionamento do guia produz exatamente NPH em 2 aplicações; a entrada já modela aplicações por momento | Flag explícita "esquema fracionado" na UI (campo novo sem origem no design) | 🟡 |
| D-05 | Redação condicional da sulfonilureia definida uma única vez junto às constantes, com variante de contexto (ao fracionar / esquema já fracionado) | Decisão 3b/4a da sessão de esclarecimentos; o guia usa a mesma forma condicional na p. 62 (investigation.md §1.3) — sem segunda fonte de texto clínico | Texto montado ad hoc em cada ponto de emissão | 🟢 |
| D-06 | Parsing da entrada por momento na UI: tokenização por espaço + `interpretaDecimal` existente por token; conversão para `GlicemiaAferida[]`; domínio intocado nesse aspecto | Spec Impact Matrix §4 (divergência 4: "nenhum impacto no domínio"); mantém regra clínica livre de formato de tela (ADR 0003) | Parser de string no domínio; mudar o contrato de entrada | 🟢 |
| D-07 | Reestruturação do formulário por extração de subcomponentes (campo de glicemias por momento; bloco de antidiabéticos orais), mantendo validação no blur espelhada via `CONSTANTES` | `formulario.tsx` está em 532 linhas (dívida 4); a feature não pode agravá-la (RNF de manutenibilidade) | Edição in-place do arquivo monolítico | 🟢 |
| D-08 | Tipagem das saídas novas: **alerta** `METFORMINA_NAO_OTIMIZADA` (posição de severidade abaixo de `INDICACAO_INSULINA`) e **recomendações** `REDUZIR_METFORMINA_TFG` / `SUSPENDER_METFORMINA_TFG` | RF-01 pede alerta; ajuste/contraindicação por TFG são condutas (recomendações dedupadas por tipo, `_reversa_sdd/domain.md#3.4` regra 19) | Tudo como recomendação; tudo como alerta | 🟡 |
| D-09 | Faixas de validação de entrada: dose de metformina 100–3000 mg/dia; TFG 1–200 mL/min/1,73 m² (plausibilidade fisiológica; coleta de todos os ofensores mantida) | O guia define posologia, não faixa de digitação; limites largos rejeitam apenas o implausível, coerentes com a validação existente (peso, glicemias) | Restringir à faixa posológica 1000–2550 (rejeitaria doses reais subterapêuticas, que são justamente o caso do alerta) | 🟡 |
| D-10 | Nenhuma dependência nova; nenhuma mudança em `pages/` além do que o formulário arrastar | Stack pinada suficiente (`_reversa_sdd/dependencies.md`); escopo não toca shell nem API fantasma (ADR 0008) | — | 🟢 |

## 4. Premissas

Sem premissas herdadas de `[DÚVIDA]`: o requirements foi travado com zero marcadores. As decisões 🟡 acima (D-04, D-08, D-09) são inferências técnicas com origem citada, a validar nos testes de validação e no gate de revisão do coding.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `tipos.ts` (epicentro da matriz) | `_reversa_sdd/traceability/spec-impact-matrix.md#3` | contrato-alterado | Campos opcionais `doseMetforminaMgDia`/`tfg` em `EntradaCalculo`; tipos novos de alerta e recomendação |
| `fonte-clinica.ts` | `_reversa_sdd/domain.md#4` | regra-alterada | Grupos `METFORMINA` e `TFG` em `CONSTANTES`; referências p. 28/58/59 em `REFERENCIAS` |
| `regra-metformina.ts` | — (novo) | componente-novo | Regra transversal RN-01/RN-02, chamada pela fachada nos dois modos |
| `calculadora.ts` (fachada) | `_reversa_sdd/code-analysis.md#módulo-1` | regra-alterada | Pipeline ganha a etapa de antidiabéticos orais antes do pós-processamento |
| `regra-titulacao-basal.ts` | `_reversa_sdd/domain.md#3.2` (regra 8) | regra-alterada | Gatilhos ampliados da sulfonilureia (não informado condicional; esquema já fracionado) |
| `validacao.ts` | `_reversa_sdd/domain.md#3.4` (regra 15) | regra-alterada | Ofensores para dose de metformina e TFG fora de plausibilidade (D-09) |
| `formulario.tsx` | `_reversa_sdd/code-analysis.md#módulo-2` | componente-alterado | Entrada por momento (4 campos) + campos de metformina/TFG; extração de subcomponentes (D-07) |
| `resultado.tsx` | `_reversa_sdd/code-analysis.md#módulo-2` | componente-alterado | Renderizar alerta e recomendações novos (possivelmente sem mudança se a renderização por lista for genérica — verificar no coding) 🟡 |
| `tests/**` | `_reversa_sdd/architecture.md#5` | regra-alterada | Suítes novas (regra-metformina), atualização da titulação, reescrita de `formulario.test.tsx`, builders estendidos |

Máquinas de estado (`_reversa_sdd/state-machines.md`): nenhuma transição nova — `EstadoResultado` e a progressão clínica permanecem; a invalidação por edição (RN-06/EC-03) passa a cobrir também os campos novos, sem mudança estrutural.

## 6. Delta no modelo de dados

- Resumo das mudanças: dois campos opcionais na entidade em memória `EntradaCalculo`, três tipos novos de saída (1 alerta, 2 recomendações), dois grupos novos de constantes congeladas e três referências clínicas novas. Sem persistência (ausência por design, ADR 0002), logo sem migração de dados.
- Detalhe completo em: `_reversa_forward/001-integrar-design-claude/data-delta.md`

## 7. Delta de contratos externos

Nenhum. A feature não toca HTTP, fila ou arquivo externo; a API v1 fantasma (ADR 0008) permanece intocada. Diretório `interfaces/` omitido por isso.

## 8. Plano de migração

n/a — não há dado persistido nem contrato externo. A única "migração" é de experiência de uso (entrada linha a linha → por momento) e está coberta pelo critério de equivalência do RF-04.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Limiar clínico extraído errado do guia | alto | baixo | Extração citada com trecho literal e página (investigation.md §1); validação do usuário médico no gate de revisão antes do coding |
| Reescrita do formulário altera resultado clínico para a mesma entrada | alto | médio | Critério de equivalência do RF-04 vira teste; suíte de integração reescrita cobre os quatro campos |
| Regressão na intensificação recém-corrigida (RHZ5) | alto | baixo | `tests/regression/BUG-20260719-RHZ5.test.ts` como sentinela obrigatória no critério de pronto |
| Detecção de "esquema já fracionado" (D-04) divergir da intenção clínica | médio | baixo | Teste de validação com os dois cenários Gherkin da RN-03; decisão 🟡 revisitável no clarify se o teste revelar ambiguidade |
| Formulário continuar acima de 400 linhas após extração | baixo | médio | D-07 é critério de aceite do RNF de manutenibilidade; medir LOC no fim do coding |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] RF-01..06 com testes de validação verdes; suíte completa verde, incluindo `tests/regression/BUG-20260719-RHZ5.test.ts` e property tests de invariantes
- [ ] Cobertura ≥ 90% mantida em `models/**`
- [ ] Toda saída nova carrega `ReferenciaClinica` com página do guia (invariante do property test)
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] `/reversa-sync` executado ao final para o adendo da extração (recomendado)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-19 | Versão inicial gerada por `/reversa-plan`, após extração citada do guia registrada em `investigation.md` | reversa |
