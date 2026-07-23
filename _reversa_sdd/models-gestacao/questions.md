# models/gestacao — Perguntas de Validação

> `questions.md` · Lacunas e premissas que dependem de validação humana (o prescritor). Re-extração 2.
> Nenhuma é 🔴 (bloqueante); são premissas 🟡 embutidas no código, herdadas do watch da feature 007 (W-gestação) e das observações O-01..O-04.

## Q-01 — Cortes de trimestre (RN-04) 🟡

O motor classifica o trimestre pelos cortes **13+6** (fim do 1.º) e **27+6** (fim do 2.º), codificados como `inicioSegundoDias = 14×7` e `inicioTerceiroDias = 28×7` em `fonte-clinica.ts:43-46`. São convenção obstétrica corrente, mas o *Guia Rápido Pré-Natal* usa os trimestres sem defini-los numericamente.

**Pergunta:** confirma os cortes 13+6 / 27+6 como definição operacional de trimestre para esta calculadora?

- [ ] Confirmado como está
- [ ] Ajustar para: _______________

## Q-02 — Limite retroativo da DUM (RN-05) 🟡

A validação rejeita DUM com mais de **44 semanas** antes da data de referência (`DUM_ALEM_DE_44_SEMANAS`, `fonte-clinica.ts:55`). O número é arbitragem de plausibilidade (gestação em curso), não citado na fonte.

**Pergunta:** 44 semanas é o teto adequado, ou prefere outro limite (p. ex. 42 semanas)?

- [ ] Confirmado (44 semanas)
- [ ] Ajustar para: _______________

## Q-03 — Faixa plausível da IG do laudo (RN-05) 🟡

O laudo de ultrassom é aceito entre **0–42 semanas** e **0–6 dias** (`IG_LAUDO_FORA_DE_FAIXA`, `fonte-clinica.ts:56-57`). Faixa arbitrada.

**Pergunta:** a faixa 0–42 semanas cobre os laudos esperados na APS, ou deve ser mais estreita/ampla?

- [ ] Confirmado (0–42 semanas)
- [ ] Ajustar para: _______________

## Q-04 — Margens de erro da USG e ausência no 3.º trimestre (RN-11) 🟢→confirmar aplicação

As margens **7 dias (1.º trimestre)** e **14 dias (2.º trimestre)** vêm da p. 32; o 3.º trimestre não é parametrizado pela fonte, e o motor devolve `sem-parametro-na-fonte`, delegando ao julgamento clínico (D-05).

**Pergunta:** confirma que, no 3.º trimestre, a calculadora deve apenas informar a divergência sem arbitrar (comportamento atual), em vez de aplicar uma margem-padrão?

- [ ] Confirmado (só informar, sem arbitrar)
- [ ] Prefiro margem-padrão de: _____ dias

---

> **Status:** as fórmulas centrais (IG, Naegele, retroprojeção, aplicação das margens) já são 🟢 CONFIRMADO no código, verificadas por property-based. As perguntas acima tratam apenas dos **parâmetros numéricos de convenção/plausibilidade**, que o prescritor deve chancelar antes do uso clínico.
