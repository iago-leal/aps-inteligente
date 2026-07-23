# User Story — Datar a gestação e estimar a DPP

> Re-extração 2 (2026-07-23). Fluxo da feature 007. Units: `models-gestacao`, `interface-gestacao`, `pages-next`.

## História

**Como** profissional da Atenção Primária,
**quero** calcular a idade gestacional, a data provável do parto e o trimestre a partir da DUM, do último ultrassom ou de ambos,
**para** conduzir o pré-natal com datação confiável, sabendo quando a fonte manda preferir o ultrassom.

## Contexto

- Fonte clínica única: *Guia Rápido Pré-Natal* — SMS-Rio, 4.ª ed., 2025 (pp. 31–32 e 113).
- Cálculo 100% no navegador: nada é salvo nem enviado. A data de referência vem do dispositivo; o motor não lê o relógio.
- Datar não prescreve: a tela não tem ritual de revisão.

## Cenários

```gherkin
Cenário: Datação pela DUM
  Dado que informo uma DUM válida
  Quando calculo na data de hoje
  Então vejo a IG em semanas e dias, a DPP por Naegele, o trimestre e as referências

Cenário: Datação pelo ultrassom
  Dado que informo a data do exame e a IG do laudo
  Quando calculo
  Então o sistema retroprojeta a DUM equivalente e apresenta IG e DPP coerentes

Cenário: Divergência DUM × ultrassom
  Dado que informo DUM e ultrassom
  Quando a divergência excede a margem do trimestre do exame
  Então o sistema informa que, pela fonte, a DUM deve ser desconsiderada em favor do ultrassom

Cenário: Ultrassom de 3.º trimestre
  Dado DUM e ultrassom com o exame no 3.º trimestre
  Quando calculo
  Então o sistema informa que a fonte não parametriza margem e a arbitragem é do julgamento clínico

Cenário: Entrada insuficiente
  Dado que não informo nem DUM nem ultrassom
  Quando tento calcular
  Então recebo a mensagem de que é preciso informar ao menos uma datação
```

## Critérios de aceite

- Toda saída de resultado carrega ao menos uma referência clínica.
- As notas ao prescritor (confiabilidade da DUM; caráter de estimativa) aparecem no resultado.
- Editar qualquer campo após um resultado marca o painel como desatualizado.

## Rastreabilidade

- Domínio: `models/gestacao/*` (`models-gestacao/`).
- Interface: `interface/gestacao/*` (`interface-gestacao/`).
- Rota: `pages/pre-natal/idade-gestacional.tsx`.
