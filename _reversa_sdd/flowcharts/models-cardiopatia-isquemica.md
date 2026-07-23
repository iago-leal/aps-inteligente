# Fluxograma — `models/cardiopatia-isquemica` (feature 010)

> Gerado pelo Archaeologist em 2026-07-23. Fachada `CalculadoraCardiopatiaIsquemica.avaliar`.

```mermaid
flowchart TD
  A[EntradaAvaliacao<br/>idade, sexo, 3 características,<br/>fatores, impedimento?, instabilidade?] --> B[validarEntrada<br/>coleta TODOS os ofensores]
  B --> C{ofensores > 0?}
  C -->|sim| E[erro-validacao]
  C -->|não| F[faixaEtariaDe idade]

  F --> G{idade em 30–69?}
  G -->|não| H[fora-do-escopo<br/>IDADE_FORA_DA_TABELA<br/>sem número estimado]
  G -->|sim| I[classificarDor<br/>conta 3 características]

  I --> I1{contagem}
  I1 -->|3| Ia[típica]
  I1 -->|2| Ib[atípica]
  I1 -->|0–1| Ic[não anginosa]

  Ia --> J[probabilidadeBasePct<br/>lookup Quadro 2 24 células]
  Ib --> J
  Ic --> J

  J --> K{≥ 1 fator de risco?}
  K -->|sim| L[ajustarPorFatoresDeRisco<br/>base×2–base×3, cap 99%<br/>excedeAlta se extremo>90%]
  K -->|não| M[sem ajuste]

  L --> N[estratoDe]
  M --> N
  N --> N1{não anginosa E sem fatores?}
  N1 -->|sim| Nb[estrato: baixa]
  N1 -->|não| N2{prob. efetiva > 90%?}
  N2 -->|sim| Na[estrato: alta]
  N2 -->|não| Ni[estrato: intermediária]

  Nb --> O[condutaPara]
  Na --> O
  Ni --> O
  O --> O1{estrato}
  O1 -->|baixa| Ob[exame não indicado<br/>+ causas não cardíacas]
  O1 -->|intermediária| Oi[exame não invasivo]
  O1 -->|alta| Oa[estratificação + encaminhamento]
  Oi --> Oe{impedimentoErgometria?}
  Oa --> Oe
  Oe -->|não| Oerg[exame: ergometria]
  Oe -->|sim| Oalt[exame: método não invasivo alternativo]

  Ob --> P[advertenciasPara]
  Oerg --> P
  Oalt --> P
  P --> P1{sinaisInstabilidade?}
  P1 -->|sim| Padv[Advertência ANGINA_INSTAVEL<br/>encaminhamento emergencial]
  P1 -->|não| Q
  Padv --> Q[semDuplicatas referências]
  Q --> R{referências vazias?}
  R -->|sim → bug| S[[ErroDeInvariante]]
  R -->|não| T[ResultadoAvaliacao<br/>classificação, faixa, base, ajustada?,<br/>estrato, conduta, advertências, referencias]
```

**Invariantes:** recusa honesta fora de 30–69 (sem extrapolar); estrato "baixa" pela descrição clínica, não pelo corte numérico; qualquer fator impede "baixa"; toda saída com referência.
