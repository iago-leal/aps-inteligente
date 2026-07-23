# ADR 0014 — Pooled Cohort Equations como fonte do risco cardiovascular (e não a AHA PREVENT)

> Retroativo, reconstruído pelo Reversa Detective (2026-07-23, re-extração nº 3) a partir da feature 014 (`models/risco-cardiovascular/`, `interface/risco-cardiovascular/proveniencia.tsx`) e da decisão D-10 do roadmap. Confiança: 🟢

## Contexto
A calculadora de risco cardiovascular estima a probabilidade de doença cardiovascular aterosclerótica (ASCVD) em 10 anos. Há mais de uma equação disponível e validada: as **Pooled Cohort Equations** (PCE, 2013 ACC/AHA, Goff et al.) e a mais recente **AHA PREVENT** (2023) — esta sexo-específica, sem variável de raça, derivada de mais de 6,5 milhões de adultos e capaz de incorporar função renal e determinantes sociais. A PREVENT é, em vários sentidos, tecnicamente superior e mais moderna.

O propósito da ferramenta, porém, não é estimar um número em abstrato, mas apoiar a **decisão de prevenção primária na APS** — sobretudo o limiar de indicação de estatina.

## Decisão
A unit usa as **Pooled Cohort Equations** como fonte única, com os cortes de categoria do 2019 ACC/AHA Primary Prevention (5% / 7,5% / 20%). O motivo é clínico, não de sofisticação estatística: a recomendação de estatina em prevenção primária da **USPSTF (2022)** — o limiar que dá sentido clínico ao número estimado — **foi calibrada sobre as PCE**. Usar a PREVENT produziria um número cujo limiar de ação não corresponde à recomendação vigente que o prescritor aplica.

A limitação de transportabilidade das PCE (coorte dos EUA, categorias raciais norte-americanas, sem calibração para o Brasil) é **declarada honestamente** na `NOTA_PROVENIENCIA` — texto único congelado no domínio — em vez de silenciada ou "corrigida" no cálculo. Um bloco consultável (`ContextoDaFonte`, D-10, adicionado pós-coding) explica ao prescritor **por que PCE e não PREVENT**, com link `<a>` nativo ao estimador oficial da PREVENT (navegação do usuário, não requisição de rede — ADR 0002 preservado).

## Alternativas consideradas
- **AHA PREVENT (2023)** — descartada como motor **por ora**: mais moderna, mas o limiar de estatina da USPSTF não está calibrado sobre ela; adotá-la desalinharia número e conduta. Registrada como material consultável, não como cálculo.
- **Oferecer as duas e deixar o médico escolher** — descartado nesta fase: multiplicaria a superfície clínica e o risco de o usuário comparar números de escalas incalibráveis entre si. Uma fonte por unit (ADR 0011).
- **Recalibrar as PCE para o Brasil** — fora de escopo e sem base validada disponível; seria pesquisa, não implementação. A limitação fica declarada (RN-09).

## Consequências
- O número estimado é coerente com o limiar de ação que o prescritor de fato usa (USPSTF/PCE).
- A escolha de `raca="outra"` adota os coeficientes de branco, como o ASCVD Risk Estimator Plus oficial (RN-05) — premissa 🟡 herdada da ferramenta de referência, a validar.
- A ferramenta assume publicamente sua limitação de transportabilidade, coerente com a preferência do mantenedor por falha/limitação explícita.
- Migrar para a PREVENT no futuro é uma troca de fonte localizada na unit, com adendo próprio, sem tocar nas outras calculadoras.

## Status
Ativa. Fonte única do domínio `models/risco-cardiovascular`. Reavaliar se a USPSTF recalibrar sua recomendação de estatina sobre a PREVENT.
