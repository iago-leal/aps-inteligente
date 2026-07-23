# User Story — Estimar o risco cardiovascular em 10 anos

> Re-extração 3 (2026-07-23). Fluxo da feature 014. Units: `models-risco-cardiovascular`, `interface-risco-cardiovascular`, `pages-next`.

## História

**Como** profissional da Atenção Primária,
**quero** estimar o risco de doença cardiovascular aterosclerótica (ASCVD) em 10 anos pelas Pooled Cohort Equations e ver sua categoria,
**para** apoiar a decisão de prevenção primária — sobretudo o limiar de indicação de estatina — ciente da limitação de transportabilidade da fonte ao Brasil.

## Contexto

- Fonte clínica única: *2013 ACC/AHA Guideline* — Pooled Cohort Equations (Goff et al., 2014), cortes de categoria do 2019 ACC/AHA Primary Prevention.
- A ferramenta usa as PCE, não a AHA PREVENT, porque a recomendação de estatina da USPSTF foi calibrada sobre as PCE (ADR 0014).
- Estimar risco não é prescrever dose: a tela não tem ritual de revisão.
- Idade fora de 40–79 e DCV prévia são recusadas honestamente, sem estimar.
- A limitação de transportabilidade (coorte dos EUA, sem calibração para o Brasil) é declarada na nota de proveniência.

## Cenários

```gherkin
Cenário: Estimativa em prevenção primária
  Dado um homem branco de 55 anos, CT 213, HDL 50, PAS 120 não tratada, não fumante, não diabético, sem DCV prévia
  Quando estimo
  Então vejo o risco em % (≈5,4%), a categoria limítrofe e a nota de proveniência

Cenário: Fora da faixa de validação
  Dado uma pessoa de 82 anos
  Quando estimo
  Então vejo a recusa de escopo por idade, sem número estimado

Cenário: Prevenção secundária
  Dado DCV prévia informada
  Quando estimo
  Então vejo a recusa de escopo por DCV prévia (a conduta segue a estratificação de risco secundário)

Cenário: Valor fora da faixa fisiológica
  Dado HDL de 15 mg/dL
  Quando estimo
  Então o cálculo usa o limite de 20 e vejo um aviso de que o risco pode ter sido subestimado

Cenário: Contexto metodológico
  Dado que quero entender a escolha da fonte
  Quando consulto o bloco "Por que Pooled Cohort Equations, e não a AHA PREVENT?"
  Então leio a justificativa e posso abrir o estimador oficial da PREVENT por um link
```

## Valor entregue

- Número calibrado com o limiar de conduta que o prescritor de fato aplica (USPSTF/PCE).
- Recusa honesta fora do escopo, sem extrapolar a fonte.
- Limitação de transportabilidade declarada, não silenciada — coerente com a privacidade e a honestidade da plataforma.
