# Investigação: Pooled Cohort Equations (PCE) — fundamento técnico da feature 014

> Identificador: `014-risco-cardiovascular-pce`
> Data: `2026-07-23`
> Papel: pesquisa de fundo que sustenta o `roadmap.md`; material de referência para `/reversa-coding`.

## 1. A fonte clínica

**2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk** (Goff DC et al., *Circulation* 2014;129(25 Suppl 2):S49–S73). As Pooled Cohort Equations derivam de coortes norte-americanas (ARIC, CHS, CARDIA, Framingham) e estimam o risco de **ASCVD "hard"** em 10 anos — primeiro evento de IAM não-fatal, morte por doença coronariana, ou AVC fatal/não-fatal — em adultos de 40 a 79 anos sem DCV prévia.

A escolha das PCE, e não da AHA PREVENT, foi decidida no `requirements.md` (§9): a recomendação de estatina em prevenção primária da **USPSTF (2022)** assenta-se nas PCE; adotar a PREVENT — que diverge sistematicamente, estimando risco menor — descasaria o risco estimado do limiar que fundamenta a conduta. A PREVENT fica candidata a uma calculadora futura, como fonte distinta.

## 2. A fórmula

Risco de ASCVD em 10 anos:

```
Risco_10 = 1 − S0^exp( Σ(β_x · X_x) − mean_grupo )
```

- `S0` — *baseline survival* em 10 anos, específico do grupo.
- `Σ(β_x · X_x)` — "Individual Sum"; variáveis contínuas entram como **logaritmo natural**.
- `mean_grupo` — "Mean (Coefficient × Value)" da coorte de derivação, a constante subtraída por grupo.

Modelos de Cox sexo- e raça-específicos, **quatro equações**: homens brancos/outros, homens negros, mulheres brancas/outras, mulheres negras. **"Outra raça" usa os coeficientes de brancos** (regra do guideline e do ASCVD Estimator oficial).

## 3. Estrutura de termos por grupo

Variáveis contínuas em `Ln`: idade, colesterol total, HDL, PAS. A PAS entra por **um** de dois coeficientes mutuamente exclusivos (tratada **ou** não-tratada; o outro fica zero). Tabagismo atual e diabetes são binários (0/1). A estrutura de termos **difere entre os quatro grupos** (coeficiente 0 ⟺ termo ausente):

- **Homens brancos/outros:** Ln idade, Ln TC, Ln idade×Ln TC, Ln HDL, Ln idade×Ln HDL, Ln PAS(trat/não), tabagismo, Ln idade×tabagismo, diabetes.
- **Homens negros:** modelo enxuto — Ln idade, Ln TC, Ln HDL, Ln PAS(trat/não), tabagismo, diabetes (sem interações com idade, sem Ln idade²).
- **Mulheres brancas/outras:** como os homens brancos **+ Ln idade²**.
- **Mulheres negras:** Ln idade, Ln TC, Ln HDL, Ln idade×Ln HDL, Ln PAS(trat/não) **com** interação Ln idade×Ln PAS, tabagismo, diabetes (sem Ln idade×TC, sem Ln idade×tabagismo, sem Ln idade²).

## 4. Coeficientes (Tabela A de Goff 2013) — a congelar em `fonte-clinica.ts`

Valores cruzados entre duas implementações independentes (pacotes R `CVrisk` e `PooledCohort`), que concordam integralmente e rastreiam à Tabela A. Para reproduzir o ASCVD Estimator Plus, use a **precisão estendida** (seção 4.1).

| Termo | Homens brancos/outros | Homens negros | Mulheres brancas/outras | Mulheres negras |
|---|---:|---:|---:|---:|
| Ln idade | 12.344 | 2.469 | −29.799 | 17.114 |
| Ln idade² | 0 | 0 | 4.884 | 0 |
| Ln colesterol total | 11.853 | 0.302 | 13.540 | 0.940 |
| Ln idade × Ln col. total | −2.664 | 0 | −3.114 | 0 |
| Ln HDL | −7.990 | −0.307 | −13.578 | −18.920 |
| Ln idade × Ln HDL | 1.769 | 0 | 3.149 | 4.475 |
| Ln PAS tratada | 1.797 | 1.916 | 2.019 | 29.291 |
| Ln idade × Ln PAS tratada | 0 | 0 | 0 | −6.432 |
| Ln PAS não-tratada | 1.764 | 1.809 | 1.957 | 27.820 |
| Ln idade × Ln PAS não-trat. | 0 | 0 | 0 | −6.087 |
| Tabagismo (0/1) | 7.837 | 0.549 | 7.574 | 0.691 |
| Ln idade × tabagismo | −1.795 | 0 | −1.665 | 0 |
| Diabetes (0/1) | 0.658 | 0.645 | 0.661 | 0.874 |
| **Mean (subtraendo)** | **61.18** | **19.54** | **−29.18** | **86.61** |
| **Baseline survival S₀** | **0.9144** | **0.8954** | **0.9665** | **0.9533** |

> **Correção material.** O `requirements.md` mencionou de memória os means como "−29.18 / 61.18 / −29.18 / 86.61". O terceiro está errado: o mean dos **homens negros é 19.54**; o −29.18 pertence às **mulheres brancas/outras**. Os `S₀` (0.9144 / 0.8954 / 0.9665 / 0.9533) estavam corretos.

### 4.1 Precisão estendida (fonte: `PooledCohort`)

- Means: `61.1816 / 19.5425 / −29.1817 / 86.6081`
- `S₀`: `0.91436 / 0.89536 / 0.96652 / 0.95334`
- Mulheres negras, coeficientes com mais casas: Ln TC 0.9396; Ln HDL −18.9196; Ln idade×Ln HDL 4.4748; Ln PAS trat 29.2907; Ln idade×PAS trat −6.4321; Ln PAS não-trat 27.8197; Ln idade×PAS não-trat −6.0873; tabagismo 0.6908; diabetes 0.8738.

## 5. Faixas de entrada válidas (ASCVD Estimator Plus, ACC)

| Campo | Faixa | Tratamento fora da faixa |
|---|---|---|
| Idade | **40–79 anos** | `ForaDoEscopoDaFonte` (D-06); **não** 40–80 do pacote `PooledCohort` |
| Colesterol total | **130–320 mg/dL** | *clamp* ao limite + alerta (D-07) |
| HDL | **20–100 mg/dL** | *clamp* ao limite + alerta (D-07) |
| PAS | **90–200 mmHg** | *clamp* ao limite + alerta (D-07) |

Resolve a marcação `[confirmar contra a fonte no plano]` da RN-03: **as quatro faixas propostas no requirements estão corretas**, confirmadas contra o estimador do ACC e implementações de referência. A divergência 40–79 (ACC clínico) × 40–80 (`PooledCohort`) é decidida a favor do instrumento oficial (D-06).

## 6. Casos de referência (golden cases) — para `equacao.test.ts`

Suíte oficial do `PooledCohort` (equação Goff 2013). Base comum, salvo indicação: **idade 55, colesterol total 213, HDL 50, PAS 120 mmHg**.

**Baseline** (PAS não-tratada, não-fumante, sem diabetes):

| Grupo | Risco |
|---|---|
| Homem branco | 5.4% |
| Homem negro | 6.1% |
| Mulher branca | 2.1% |
| Mulher negra | 3.0% |

**Com PAS tratada:** H. branco 6.3% · H. negro 9.9% · M. branca 2.8% · M. negra 4.6%
**Fumante atual:** H. branco 10.0% · H. negro 10.3% · M. branca 5.0% · M. negra 5.9%
**Com diabetes:** H. branco 10.1% · H. negro 11.2% · M. branca 3.9% · M. negra 7.0%

**Alto risco:** homem branco, idade 54, TC 170, HDL 50, **PAS 157 não-tratada, fumante, diabético → 20.8%**.

Sugestão mínima de regressão: homem branco baseline (5.4%), mulher negra baseline (3.0%) e o caso alto-risco (20.8%) — cobrem sexo, raça e as três faixas de categoria. Tolerância **±0,1 pp** (os valores da suíte são arredondados a 1 casa).

## 7. Categorias de risco (2019 ACC/AHA Primary Prevention)

| Categoria | Faixa |
|---|---|
| Baixo | < 5% |
| Limítrofe | 5 a < 7,5% |
| Intermediário | ≥ 7,5 a < 20% |
| Alto | ≥ 20% |

## 8. Alternativas avaliadas

| Alternativa | Por que descartada |
|---|---|
| AHA PREVENT (2023) | Diverge sistematicamente das PCE (risco menor); descasaria do limiar de estatina da USPSTF que fundamenta a conduta (requirements §9). Candidata a feature futura, fonte distinta |
| Framingham Risk Score | Estima DCV total, não ASCVD hard; não é a base da recomendação da USPSTF |
| Reaproveitar `models/cardiopatia-isquemica` | Mescla de fontes clínicas, proibida por ADR 0011 (uma fonte por unit) |
| Coeficientes truncados da tabela publicada | Divergem do ASCVD Estimator Plus nos *golden cases*; usar precisão estendida (§4.1) |
| Faixa 40–80 (`PooledCohort`) | Diverge do instrumento clínico oficial (40–79) e da validade das PCE |

## 9. Padrões aplicáveis (do legado)

- **Erro como valor** (ADR 0004): união discriminada por `tipo`; `ErroDeInvariante` só para bug.
- **Coleta total de ofensores** (domain.md regra 15): a validação nunca para no primeiro erro.
- **Constantes congeladas** (`Object.freeze`) comentadas com a origem clínica (domain.md §6, invariante 5).
- **`ForaDoEscopoDaFonte`** (ADR 0009): recusa honesta fora da cobertura da fonte, sem extrapolar.
- **O motor informa, não escolhe** (ADR 0005): só risco % + categoria, nenhuma conduta.
- **Privacidade por construção** (ADR 0002): sem `fetch`/`storage` de dado clínico.

## 10. Fontes

- Goff DC et al. 2013 ACC/AHA Guideline. *Circulation* 2014;129(25 Suppl 2):S49–S73 — https://www.ahajournals.org/doi/10.1161/01.cir.0000437741.48606.98
- Pacote R `CVrisk` (V. Castro), `data-raw/score_coef.R` — https://github.com/vcastro/CVrisk/blob/master/data-raw/score_coef.R
- Pacote R `PooledCohort` (B. Jaeger), `R/predict_risk.R` e `tests/testthat/test-predict_10yr_ascvd_risk.R` — https://github.com/bcjaeger/PooledCohort
- ACC ASCVD Risk Estimator Plus — https://tools.acc.org/ascvd-risk-estimator-plus/
- 2019 ACC/AHA Primary Prevention Guideline — https://www.ahajournals.org/doi/10.1161/cir.0000000000000678

## 11. Ressalvas de verificação

1. A Tabela A não foi lida diretamente do PDF do *Circulation* (paywall); os coeficientes vêm de duas implementações independentes que a reproduzem e concordam entre si — verificação forte, não leitura da fonte primária. Conferir contra o "Full Work Group Report Supplement" quando o PDF estiver disponível (MD-0008: fonte editorial fora do git).
2. Faixa etária 40–79 (ACC) × 40–80 (`PooledCohort`): divergência real; decidida na spec a favor de 40–79 (D-06).
3. HDL 20–100 e as demais faixas foram confirmadas por busca convergente sobre o estimador do ACC (SPA que o fetch não renderiza), não por leitura direta do formulário.
