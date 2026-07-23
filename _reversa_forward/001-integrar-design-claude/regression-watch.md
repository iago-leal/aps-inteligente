# Regression Watch: Integração do design aprovado da calculadora

> Identificador: `001-integrar-design-claude`
> Data: `2026-07-19`
> Papel: o que precisa continuar verdadeiro nas próximas re-extrações (`/reversa`).
> Origem dos itens: seção "Modificadas" do `legacy-impact.md` desta feature.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| W001 | `domain.md` §3.2 (regra 8); `models/insulina/regra-titulacao-basal.ts` | Suspensão de sulfonilureia emitida em três gatilhos: fracionar + uso explícito (redação direta); fracionar + uso não informado (redação condicional); esquema com ≥ 2 aplicações de NPH na entrada (variantes de contexto). `usoSulfonilureia === false` nunca emite. Redação única no catálogo `TEXTO_SUSPENDER_SULFONILUREIA` | redação | Re-extração encontrar só o gatilho antigo, redação montada fora do catálogo, ou emissão com uso negado |
| W002 | `domain.md` §3.1 (regra 3); `models/insulina/calculadora.ts` | `MANTER_METFORMINA` suprimida quando `SUSPENDER_METFORMINA_TFG` está presente na mesma saída (nos dois modos) | presença | As duas recomendações coexistirem numa mesma saída |
| W003 | `domain.md` §3.4 (regra 15); `models/insulina/validacao.ts` | Ofensores `METFORMINA_FORA_DE_FAIXA` (100–3000 mg/dia) e `TFG_FORA_DE_FAIXA` (1–200 mL/min/1,73 m²); campos ausentes sem ofensor; coleta de todos os ofensores mantida | presença | Ofensor ausente, faixa divergente do catálogo, ou validação parando no primeiro erro |
| W004 | `domain.md` §3.4 (regra 19); `models/insulina/calculadora.ts` | Ordem de severidade com `METFORMINA_NAO_OTIMIZADA` na última posição (abaixo de `INDICACAO_INSULINA`); deduplicação por `tipo`/`localizacao` inalterada | presença | Alerta novo ordenando acima de `INDICACAO_INSULINA` ou duplicatas na saída |
| W005 | `code-analysis.md` §módulo-1 (pipeline da fachada); `models/insulina/regra-metformina.ts` | Regra de antidiabéticos orais ativa nos DOIS modos, no pós-processamento; TFG ≤ 45 suprime o alerta de otimização | presença | Regra ausente em um dos modos, ou `METFORMINA_NAO_OTIMIZADA` coexistindo com `REDUZIR_METFORMINA_TFG`/`SUSPENDER_METFORMINA_TFG` |
| W006 | `domain.md` §3.5 (regra 23); `traceability/spec-impact-matrix.md` §4 (divergência 4) | A entrada por momento é conversão exclusiva da UI: `models/**` sem parser de string; contrato `GlicemiaAferida[]` intocado; UI espelha todas as faixas (inclusive metformina/TFG) importando `CONSTANTES` | ausência | Parser de string dentro de `models/**`, ou faixa numérica duplicada fora do catálogo único |
| W007 | `domain.md` §3.4 (regra 20); `models/insulina/fonte-clinica.ts` | Grupos `metformina`/`tfg` congelados no catálogo único, com referências p. 28, 58 e 59; toda saída nova carrega `ReferenciaClinica` com página (property test) | presença | Literal clínico fora do catálogo, referência nova ausente, ou saída sem página do guia |

## Histórico de re-extrações


### Re-extração 2026-07-23 21:40 (nº 3 — absorve features 011–014)

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W002 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W003 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W004 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W005 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W006 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W007 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
### Re-extração 2026-07-23 14:10

> `models/insulina` intocado byte a byte desde a feature 001 (`git log -1 -- models/insulina`), logo todas as regras deste domínio seguem estruturalmente preservadas no código; verificação cruzada com `_reversa_sdd/domain.md` §3 regenerado.

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | 3 gatilhos de suspensão e "uso negado nunca emite" preservados em `domain.md` §3.1 (regra 3) / §3.2 (regra 8); redação única no catálogo; motor intocado |
| W002 | 🟢 verde | `domain.md` §3.4 (regra 15): a fachada remove `MANTER_METFORMINA` quando há `SUSPENDER_METFORMINA_TFG` |
| W003 | 🟢 verde | ofensores de faixa (metformina/TFG) e coleta total em `domain.md` §3.5 (regra 16); faixas no código intocado |
| W004 | 🟢 verde | `domain.md` §3.5 (regra 20): `METFORMINA_NAO_OTIMIZADA` na severidade 5 (última), abaixo de `INDICACAO_INSULINA` |
| W005 | 🟢 verde | `models/insulina/regra-metformina.ts` presente; supressão do alerta em faixa de ajuste renal (TFG ≤ 45) em `domain.md` §3.4 |
| W006 | 🟢 verde | sem parser de string em `models/**` para glicemia; contrato `GlicemiaAferida[]` intocado; UI espelha `CONSTANTES` (`domain.md` §6.1 regra 9). O `Number()` em `models/gestacao/datas.ts` é aritmética de data ISO de outro domínio, fora do escopo deste watch |
| W007 | 🟢 verde | grupos metformina/tfg congelados; `Object.freeze` no catálogo único (`domain.md` §6 invariante 5); referências com página |

## Arquivadas

_(vazio)_

## Observações (sem peso de regressão — origem 🟡 ou decisão de execução)

- **D-04 (🟡):** "esquema já chega fracionado" detectado por ≥ 2 aplicações de NPH na entrada — proxy técnico, revisitável se a intenção clínica divergir.
- **D-08 (🟡):** tipagem das saídas novas (1 alerta + 2 recomendações) e posição de severidade do alerta são inferência técnica do design.
- **D-09 (🟡):** faixas de plausibilidade (metformina 100–3000; TFG 1–200) são decisão técnica, não conteúdo do guia — o comentário no código distingue as origens.
- **Precedência clínica (decisão de execução do coding, pendente de validação do usuário):** supressões descritas em W002 e W005 não constavam do data-delta §2; reconciliar a spec via `/reversa-sync` (adendo) ou reverter se o usuário discordar.
- `tests/regression/BUG-20260719-RHZ5.test.ts` permanece fora do padrão do Prettier desde antes da feature (drift de formatação pré-existente, sem impacto funcional).
