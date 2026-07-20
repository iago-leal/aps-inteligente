# Adendo: Integração do design aprovado da calculadora — divergências clínicas e entrada por momento

> Feature: `001-integrar-design-claude`
> Data: `2026-07-19`
> Cenário: `legado`

## Vigência

Vigente desde 2026-07-19.

## Resumo da entrega

A feature integrou ao repositório as quatro mudanças aprovadas no design da tela da calculadora de insulina: duas regras clínicas novas (dose de metformina com alerta de otimização; TFG para ajustar ou contraindicar a metformina), a ampliação da recomendação de suspender sulfonilureia para dois gatilhos adicionais e a reestruturação da entrada de glicemias em quatro campos por momento de aferição. Beneficiário: o médico prescritor da APS. **20 de 20 ações concluídas** (T001–T020), suíte de 188 testes verde, cobertura de domínio ≥ 90% mantida.

Decisão de execução registrada no coding (Notas de execução do `actions.md` da feature, pendente de validação clínica do usuário): precedência entre saídas — TFG ≤ 45 suprime o alerta `METFORMINA_NAO_OTIMIZADA`, e `SUSPENDER_METFORMINA_TFG` suprime `MANTER_METFORMINA` na mesma saída.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/domain.md` | §3.4 (regras transversais) | regra-nova | Regra transversal de antidiabéticos orais (RN-01/RN-02): alerta de metformina não otimizada (< 2000 mg/dia, p. 28/58) e recomendações por faixa de TFG (30–45 → reduzir 50%; < 30 → suspender, p. 28/58), ativa nos dois modos via `regra-metformina.ts` |
| `_reversa_sdd/domain.md` | §3.2 (regra 8) | regra-alterada | A suspensão de sulfonilureia passou de um gatilho (fracionar + uso explícito) para três: também uso não informado (redação condicional) e esquema que já chega com ≥ 2 aplicações de NPH; redação única em `TEXTO_SUSPENDER_SULFONILUREIA` |
| `_reversa_sdd/domain.md` | §3.1 (regra 3) | regra-alterada | `MANTER_METFORMINA` deixa de ser incondicional: suprimida quando `SUSPENDER_METFORMINA_TFG` está presente (precedência clínica) |
| `_reversa_sdd/domain.md` | §3.4 (regra 15) | regra-alterada | Validação ganhou os ofensores `METFORMINA_FORA_DE_FAIXA` (100–3000 mg/dia) e `TFG_FORA_DE_FAIXA` (1–200); campos ausentes seguem sem ofensor; coleta total preservada |
| `_reversa_sdd/domain.md` | §3.4 (regra 19) | regra-alterada | Severidade de alertas ganhou `METFORMINA_NAO_OTIMIZADA` na última posição (abaixo de `INDICACAO_INSULINA`); supressões de precedência entram no pós-processamento da fachada |
| `_reversa_sdd/domain.md` | §3.5 (regra 23) | regra-alterada | O espelhamento de faixas na UI cobre também metformina/TFG e a validação por campo de momento |
| `_reversa_sdd/domain.md` | §4 (constantes) e §7 (intenções não realizadas) | regra-alterada | Catálogo ganhou grupos `metformina`/`tfg` e referências p. 28/58/59; as quatro divergências do §7 foram realizadas — ler §7 como entregue por esta feature |
| `_reversa_sdd/erd-complete.md` | Entidade `EntradaCalculo` | delta-de-dados | Campos opcionais `doseMetforminaMgDia` e `tfg`; três tipos novos de saída (1 alerta, 2 recomendações); sem persistência, sem migração |
| `_reversa_sdd/code-analysis.md` | §módulo-1 (fachada) | regra-alterada | Pipeline ganhou a etapa de antidiabéticos orais (pós-processamento, antes de ordenação/deduplicação) e o gatilho do esquema já fracionado |
| `_reversa_sdd/code-analysis.md` | §módulo-2 (interface) | regra-alterada | Entrada de glicemias por momento (parsing 100% na UI, contrato `GlicemiaAferida[]` intocado); `formulario.tsx` decomposto em quatro subcomponentes |
| `_reversa_sdd/architecture.md` | §5 (testes) | regra-alterada | Suíte nova `metformina.test.ts`; titulação/validação/invariantes/referências estendidas; `formulario.test.tsx` reescrito para a entrada por momento |
| `_reversa_sdd/architecture.md` | §6 (dívidas 4 e 7) | componente-novo | Dívida 4 reduzida (`formulario.tsx` 532 → 313 linhas) com os componentes novos `glicemias-por-momento.tsx`, `antidiabeticos-orais.tsx`, `esquema-atual.tsx` e `validacao-campos.ts`; dívida 7 (divergências pendentes) quitada |
| `_reversa_sdd/traceability/spec-impact-matrix.md` | §4 (impacto das mudanças pendentes) | regra-alterada | As divergências 1–4 saíram de "pendentes" para "implementadas"; o impacto previsto por camada confirmou-se, com os acréscimos de precedência descritos acima |

## Regras sob vigilância

Watch items desta entrega: **W001–W007** — ver `_reversa_forward/001-integrar-design-claude/regression-watch.md`.

## Fontes

- `_reversa_forward/001-integrar-design-claude/legacy-impact.md`
- `_reversa_forward/001-integrar-design-claude/regression-watch.md`
- `_reversa_forward/001-integrar-design-claude/requirements.md`
- `_reversa_forward/001-integrar-design-claude/actions.md` (Notas de execução)
- `_reversa_forward/001-integrar-design-claude/progress.jsonl`
