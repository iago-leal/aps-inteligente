# models/cardiopatia-isquemica — Perguntas de Validação

> `questions.md` · Lacunas e premissas que dependem de validação humana (o prescritor). Re-extração 2.
> Nenhuma é 🔴 (bloqueante); são premissas 🟡, herdadas das observações O-10-01..05 do watch da feature 010.

## Q-01 — Transcrição das 24 células do Quadro 2 (RN-02) 🟡

A matriz `PROBABILIDADE_PRE_TESTE` (`fonte-clinica.ts:48-63`) transcreve célula a célula as 24 probabilidades pré-teste do Quadro 2 (p. 5; DUNCAN et al., 2013). O oráculo de teste replica a mesma matriz, logo não é conferência independente contra o impresso.

**Pergunta:** confirma a transcrição das 24 células contra o PDF da fonte (valores por classe × sexo × faixa etária)?

- [ ] Confere com o Quadro 2
- [ ] Corrigir célula(s): _______________

## Q-02 — Leitura do estrato "baixa" (RN-04) 🟡

O guia define a conduta "baixa" (não investigar) pela **descrição clínica** — dor não anginosa E sem fatores de risco —, não pelo corte numérico isolado (uma dor não anginosa pode tabelar até 27%). O código adota exatamente isso: "baixa" ⟺ não anginosa e sem fator; qualquer fator de risco impede "baixa" (`probabilidade.ts:59-80`). Decisão de 2026-07-23 (nota ** do Quadro 2).

**Pergunta:** confirma a leitura descritiva do estrato "baixa" (em vez de um corte < 10% puro)?

- [ ] Confirmado (leitura descritiva)
- [ ] Prefiro corte numérico: _______________

## Q-03 — Cap da faixa por fatores de risco e redação ">90%" (RN-03) 🟡

Com ≥ 1 fator, a estimativa vira faixa base×2 a base×3 (nota * do Quadro 2), capada em **99%** para não exibir > 100%; quando o extremo superior ultrapassa 90%, `excedeAlta` sinaliza a redação ">90%" (`probabilidade.ts:43-57`).

**Pergunta:** confirma o cap em 99% e a sinalização ">90%" como apresentação adequada da incerteza?

- [ ] Confirmado
- [ ] Ajustar para: _______________

## Q-04 — Ausência de ritual de revisão (RN — apresentação) 🟡

Diferente da calculadora de insulina, a de cardiologia não tem o ritual "Pronto para prescrever": estratificar não é prescrever dose (ADR 0012). A conduta é orientação de investigação, não prescrição.

**Pergunta:** confirma que a tela de dor torácica deve permanecer sem ritual de revisão?

- [ ] Confirmado (sem ritual)
- [ ] Prefiro um gate de confirmação

## Q-05 — Escopo textual do RF-10 (blocos complementares) 🟡

Os blocos de referência complementar (CCS I–IV, tratamento + Tabela 1, seguimento na APS, manejo agudo) são expostos como material consultável fora do cálculo, na camada de interface (`interface-cardiologia`).

**Pergunta:** o conteúdo desses blocos está fiel à fonte e no nível de detalhe desejado para consulta?

- [ ] Confere
- [ ] Ajustar: _______________

---

> **Status:** as fórmulas e mapeamentos centrais (classificação, lookup, ajuste, estrato, conduta) já são 🟢 CONFIRMADO, verificados por property-based e pelo oráculo das 24 células. As perguntas tratam de **conferência clínica** e **decisões de apresentação/semântica**, que o prescritor deve chancelar antes do uso clínico.
