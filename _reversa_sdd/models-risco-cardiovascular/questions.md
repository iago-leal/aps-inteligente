# models/risco-cardiovascular — Perguntas para validação clínica

> `questions.md` · Re-extração 3 (2026-07-23). Premissas 🟡 do domínio de risco cardiovascular (feature 014).
> **Decisão do usuário (2026-07-23):** manter como premissas 🟡 documentadas e seguir para a regressão. Nenhuma é 🔴 bloqueante.

| # | Pergunta | Valor atual no código | Origem | Status |
|---|----------|-----------------------|--------|--------|
| Q-R1 | As faixas fisiológicas de clamp estão adequadas? | colesterol 130–320, HDL 20–100, PAS 90–200 (fora → clamp + aviso, não trava) | Faixas do ASCVD Risk Estimator Plus | 🟡 mantida |
| Q-R2 | Os cortes de categoria de risco batem com a conduta que você aplica? | baixo <5% · limítrofe 5–<7,5% · intermediário 7,5–<20% · alto ≥20% | 2019 ACC/AHA Primary Prevention Guideline | 🟡 mantida |
| Q-R3 | `raca="outra"` deve mesmo adotar os coeficientes de branco? | modelo de branco correspondente ao sexo | Convenção do ASCVD Risk Estimator Plus oficial (RN-05) | 🟡 mantida |
| Q-R4 | A limitação de transportabilidade ao Brasil está bem comunicada? | declarada na `NOTA_PROVENIENCIA`, não corrigida no cálculo | Coorte dos EUA (ARIC, CHS, CARDIA, Framingham); sem calibração validada para o Brasil | 🟡 mantida |

## Nota de precisão numérica (mitigada, não aberta)

Os coeficientes das PCE, o `BASELINE_SURVIVAL` e os `MEANS` foram validados contra os pacotes R `CVrisk` e `PooledCohort` (concordância cruzada), reproduzindo o ASCVD Risk Estimator Plus. Isso mitiga — sem substituir — a conferência página a página do guideline original (dependência editorial fora do git, MD-0008). O valor de exemplo do caso-base (homem-branco, 5,4%) tem oráculo em `tests/unit/dominio-risco-cardiovascular/equacao.test.ts`.
