# Perguntas para Validação — aps-inteligente

> Regenerado pelo Reversa Reviewer na **re-extração 2 (2026-07-23)**. `answer_mode = chat`.
> Consolida, no nível global, as premissas clínicas 🟡 dos três domínios (detalhe por unit em `models-*/questions.md`).
> **Decisão do usuário (2026-07-23):** manter todas como premissas 🟡 documentadas e seguir para a verificação de regressão. Nenhuma é 🔴 (bloqueante); nenhuma foi promovida a 🟢 nesta sessão.

---

## Gestação — `models/gestacao`

| # | Premissa | Valor atual no código | Fonte da premissa | Status |
|---|----------|-----------------------|-------------------|--------|
| Q-G1 | Cortes de trimestre | 13+6 (1.º→2.º) e 27+6 (2.º→3.º) | Convenção obstétrica; guia não define numericamente | 🟡 mantida |
| Q-G2 | Limite retroativo da DUM | 44 semanas | Plausibilidade arbitrada, não citada na fonte | 🟡 mantida |
| Q-G3 | Faixa do laudo de USG | 0–42 semanas, 0–6 dias | Plausibilidade arbitrada | 🟡 mantida |
| Q-G4 | 3.º trimestre sem margem | só informa a divergência (`sem-parametro-na-fonte`) | Fonte não parametriza margem (p. 32) | 🟡 mantida |

## Cardiologia — `models/cardiopatia-isquemica`

| # | Premissa | Valor atual no código | Fonte da premissa | Status |
|---|----------|-----------------------|-------------------|--------|
| Q-C1 | Transcrição das 24 células do Quadro 2 | matriz `PROBABILIDADE_PRE_TESTE` congelada | p. 5 (DUNCAN et al., 2013); oráculo replica a matriz, não confere contra o PDF | 🟡 mantida |
| Q-C2 | Estrato "baixa" | leitura descritiva (não anginosa E sem fatores) | Nota ** do Quadro 2; decisão 2026-07-23 | 🟡 mantida |
| Q-C3 | Ajuste por fatores de risco | faixa base×2–base×3, cap 99%, sinal ">90%" | Nota * do Quadro 2 | 🟡 mantida |
| Q-C4 | Ausência de ritual de revisão | sem gate de confirmação | ADR 0012 (estratificar ≠ prescrever) | 🟡 mantida |
| Q-C5 | Fidelidade dos blocos complementares | CCS, tratamento+Tabela 1, seguimento, agudo | pp. 4–6 da fonte; conferência clínica | 🟡 mantida |

## Insulina — `models/insulina` (herdada da extração 1)

| # | Premissa | Estado | Status |
|---|----------|--------|--------|
| Q-I1 (G-01) | Caminho do PDF do *Guia Rápido DM* para conferência página a página das 20 referências | Usuário confirmou que fornecerá; caminho ainda não chegou | 🟡 pendente de insumo |

---

> **Encaminhamento:** as premissas seguem chanceláveis a qualquer momento pelo prescritor. Ao serem confirmadas, promovem-se a 🟢 (validação humana); ao serem ajustadas, geram bug ou feature do ciclo forward, pois o código atual reflete os valores acima. Enquanto isso, permanecem 🟡 e não bloqueiam a reimplementação a partir da extração.
