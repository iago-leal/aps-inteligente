# User Story — Estratificar a dor torácica e orientar a investigação

> Re-extração 2 (2026-07-23). Fluxo da feature 010. Units: `models-cardiopatia-isquemica`, `interface-cardiologia`, `pages-next`.

## História

**Como** profissional da Atenção Primária,
**quero** classificar a dor torácica, estimar a probabilidade pré-teste de doença arterial coronariana e receber a conduta de investigação,
**para** decidir com segurança entre não investigar, pedir exame não invasivo ou encaminhar, sabendo quando o caso é emergencial.

## Contexto

- Fonte clínica única: *TeleCondutas — Cardiopatia Isquêmica* (TelessaúdeRS-UFRGS, 2017), pp. 4–6.
- Estratificar não é prescrever dose: a tela não tem ritual de revisão.
- Idade fora de 30–69 é recusada honestamente, sem extrapolar a tabela.

## Cenários

```gherkin
Cenário: Dor típica de alto risco
  Dado um homem de 55 anos com dor retroesternal, provocada por esforço e aliviada por nitrato
  Quando avalio
  Então vejo classificação típica, probabilidade alta e conduta de estratificação e encaminhamento

Cenário: Dor não anginosa sem fatores
  Dada uma mulher de 35 anos com uma só característica e sem fatores de risco
  Quando avalio
  Então vejo estrato baixa, exame não indicado e a lista de causas não cardíacas a investigar

Cenário: Impedimento de ergometria
  Dado um caso de probabilidade intermediária com ECG basal que impede a interpretação
  Quando avalio
  Então a conduta recomenda método não invasivo alternativo, não a ergometria

Cenário: Idade fora do escopo
  Dado um paciente de 72 anos
  Quando avalio
  Então recebo a informação de que a fonte não estima a probabilidade para esta idade, sem número inventado

Cenário: Sinais de instabilidade
  Dado um caso com sinais de angina instável
  Quando avalio
  Então recebo a advertência de encaminhamento emergencial, fora do fluxo eletivo
```

## Critérios de aceite

- Toda saída de resultado carrega ao menos uma referência clínica.
- Com fatores de risco, a probabilidade vira faixa (base×2–base×3), capada em 99%.
- Os blocos de referência complementar (CCS, tratamento, seguimento, manejo agudo) ficam consultáveis fora do cálculo.

## Rastreabilidade

- Domínio: `models/cardiopatia-isquemica/*` (`models-cardiopatia-isquemica/`).
- Interface: `interface/cardiologia/*` (`interface-cardiologia/`).
- Rota: `pages/cardiologia/dor-toracica.tsx`.
