# models/risco-cardiovascular — Motor de risco cardiovascular (Pooled Cohort Equations)

> `requirements.md` · Foca no QUE a unit faz. Re-extração 3 (2026-07-23), absorvendo a feature `014-risco-cardiovascular-pce`.
> Fonte clínica única: *2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk* — Pooled Cohort Equations (Goff DC et al., Circulation 2014;129(25 Suppl 2):S49–S73), com os cortes de categoria do 2019 ACC/AHA Primary Prevention Guideline.

## Visão Geral

Quarta unit de domínio da plataforma, no molde de `models/insulina`, `models/gestacao` e `models/cardiopatia-isquemica`: estima o risco de doença cardiovascular aterosclerótica (ASCVD) "hard" em 10 anos pelas Pooled Cohort Equations (modelos de Cox sexo- e raça-específicos), classifica o risco em categoria (baixo/limítrofe/intermediário/alto) e declara a limitação de transportabilidade das PCE ao contexto brasileiro. Estimar risco não é prescrever: o motor informa o número e a categoria, sem emitir conduta (ADR 0005) e sem ritual de revisão. Domínio puro e determinista; erro esperado é valor (ADR 0004). 🟢

## Responsabilidades

- Validar a entrada com coleta total de ofensores (sexo, raça, idade, colesterol, HDL, PAS). 🟢
- Recusar honestamente idade fora de 40–79 ou DCV prévia com `ForaDoEscopoDaFonte`, sem estimar. 🟢
- Clampar valores fora da faixa fisiológica ao limite e sinalizar por `Aviso`, sem travar. 🟢
- Selecionar o modelo de Cox pelo grupo sexo×raça (`raca="outra"` → coeficientes de branco). 🟢
- Calcular o risco de ASCVD em 10 anos pela equação log-linear das PCE. 🟢
- Classificar o risco em categoria pelos cortes 5 / 7,5 / 20%. 🟢
- Anexar a nota de proveniência (limitação de transportabilidade) a todo resultado. 🟢
- Garantir referência clínica em toda saída de resultado (invariante). 🟢

## Regras de Negócio

- **RN-01** Coleta total de ofensores na validação: sexo/raça fora do enum, idade não-inteira ou fora de 0–120, colesterol/HDL/PAS não positivos — nunca para no primeiro erro. 🟢
- **RN-02** Idade fora de 40–79 (plausível, mas fora da validação das PCE) ou DCV prévia → `ForaDoEscopoDaFonte` com motivo distinto (`IDADE_FORA_DA_FAIXA` / `DCV_PREVIA`), sem número. 🟢
- **RN-03** Equação PCE: `Risco₁₀ = 1 − S₀^exp(Σ(β·X) − mean_grupo)`, variáveis contínuas em logaritmo natural, PAS por um de dois coeficientes (tratada × não-tratada). 🟢
- **RN-05** `raca="outra"` adota os coeficientes de branco, como o ASCVD Risk Estimator Plus oficial. 🟡 (premissa a validar)
- **RN-07** Valor fora da faixa fisiológica (colesterol 130–320, HDL 20–100, PAS 90–200) é clampado ao limite mais próximo e sinalizado por `Aviso` com a direção do viés; não é ofensor. 🟡 (faixas a validar)
- **RN-08** Coeficientes, baseline survival e means congelados em precisão estendida, validados contra os pacotes R `CVrisk` e `PooledCohort`. 🟢
- **RN-09** Nota de proveniência única (coorte dos EUA, categorias raciais norte-americanas, sem calibração para o Brasil) presente em todo resultado. 🟢
- **RN-06** Categoria por cortes 5 / 7,5 / 20% (2019 ACC/AHA Primary Prevention). 🟡 (cortes a validar)
- **RN-04** Nenhuma saída de resultado sem ao menos uma referência clínica; violação é bug interno (`ErroDeInvariante`). 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Estimar risco de ASCVD em 10 anos | Must | Homem branco 55a, CT 213, HDL 50, PAS 120 não tratada, não fumante, não diabético → **5,4%** (oráculo `equacao.test.ts`, tolerância ±pp) |
| RF-05 | Recusar idade fora de 40–79 ou DCV prévia | Must | idade 82 → `fora-do-escopo`/`IDADE_FORA_DA_FAIXA`; `dcvPrevia=true` → `DCV_PREVIA` |
| RF-06 | Aplicar a equação de Cox por grupo sexo×raça | Must | Grupos distintos → coeficientes distintos; `raca="outra"`→ modelo de branco |
| RF-07 | Classificar em categoria de risco | Must | 4,9% → baixo; 6% → limítrofe; 12% → intermediário; 21% → alto |
| RF-03 | Clampar valores fora da faixa fisiológica | Must | HDL 15 → clampa a 20 + `Aviso` HDL_FORA_DA_FAIXA (pode subestimar) |
| RF-08 | Referência clínica em toda saída | Must | `referencias.length ≥ 1` (equações + categorias) |
| RF-10 | Nota de proveniência em todo resultado | Must | `notaProveniencia` não vazia, texto único do domínio |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Determinismo | Coeficientes congelados, funções puras | `fonte-clinica.ts`, `equacao.ts` | 🟢 |
| Precisão numérica | Coeficientes em precisão estendida validados contra `CVrisk`/`PooledCohort` | `fonte-clinica.ts:46-134` | 🟢 |
| Robustez | Clamp fisiológico com aviso do viés, sem travar | `validacao.ts:100-121` | 🟢 |
| Honestidade da fonte | Idade fora de 40–79 e DCV prévia não extrapolam: fora-do-escopo | `elegibilidade.ts` | 🟢 |
| Falha explícita | `ErroDeInvariante` para saída sem referência | `calculadora.ts:39-42` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado homem branco de 55 anos, CT 213, HDL 50, PAS 120 não tratada, não fumante, não diabético, sem DCV prévia
Quando estimar
Então retorna risco ≈ 5,4%, categoria limítrofe, com referências e nota de proveniência

Dado idade de 82 anos (demais campos válidos)
Quando estimar
Então retorna fora-do-escopo com IDADE_FORA_DA_FAIXA, sem estimar número

Dado dcvPrevia verdadeiro
Quando estimar
Então retorna fora-do-escopo com DCV_PREVIA, sem estimar número

Dado HDL de 15 mg/dL (fora da faixa fisiológica)
Quando estimar
Então calcula com HDL clampado a 20 e inclui Aviso HDL_FORA_DA_FAIXA sinalizando possível subestimativa

Dado sexo inválido e colesterol total negativo
Quando estimar
Então retorna erro-validacao com SEXO_INVALIDO e COLESTEROL_INVALIDO (coleta total)

Dado raça "outra"
Quando estimar
Então usa os coeficientes do grupo branco correspondente ao sexo
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Equação PCE + estimativa (RF-01/RF-06) | Must | Núcleo do cálculo |
| Recusa fora do escopo (RF-05) | Must | Honestidade da fonte, sem fallback |
| Categoria de risco (RF-07) | Must | Saída que dá sentido clínico ao número |
| Referência + proveniência (RF-08/RF-10) | Must | Invariante de domínio + limitação declarada |
| Clamp fisiológico (RF-03) | Should | Refina robustez; a maioria das entradas está na faixa |

> Prioridade inferida por posição na cadeia (validação → escopo → clamp → equação → categoria).

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `models/risco-cardiovascular/calculadora.ts` | `CalculadoraRiscoCardiovascular.estimar` | 🟢 |
| `models/risco-cardiovascular/equacao.ts` | `grupoDe` `riscoAscvdPct` | 🟢 |
| `models/risco-cardiovascular/categoria.ts` | `categoriaDe` | 🟢 |
| `models/risco-cardiovascular/elegibilidade.ts` | `foraDoEscopo` | 🟢 |
| `models/risco-cardiovascular/validacao.ts` | `validarEntrada` `clamparEntrada` | 🟢 |
| `models/risco-cardiovascular/fonte-clinica.ts` | `COEFICIENTES` `BASELINE_SURVIVAL` `MEANS` `FAIXAS` `CATEGORIAS` `REFERENCIAS` `NOTA_PROVENIENCIA` | 🟢 |
| `models/risco-cardiovascular/tipos.ts` | contratos, `ForaDoEscopoDaFonte`, `Aviso`, `ErroDeInvariante` | 🟢 |
