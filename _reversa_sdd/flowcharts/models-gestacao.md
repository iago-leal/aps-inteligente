# Fluxograma — `models/gestacao` (feature 007)

> Gerado pelo Archaeologist em 2026-07-23. Fachada `CalculadoraIdadeGestacional.calcular`.

```mermaid
flowchart TD
  A[EntradaDatacao<br/>dataReferencia + dum? + ultrassom?] --> B[validarEntrada<br/>coleta TODOS os ofensores]
  B --> C{ofensores > 0?}
  C -->|sim| E[erro-validacao<br/>lista de ofensores]
  C -->|não| F{dum informada?}

  F -->|sim| G[igEntre dum→ref<br/>dppPorNaegele +7d+9m<br/>trimestreDaIg]
  G --> H[porDum: DatacaoCalculada<br/>+ nota CONFIABILIDADE_DUM]
  F -->|não| I

  H --> I{ultrassom informado?}
  I -->|sim| J[dumEquivalente<br/>= dataExame − semanas×7+dias]
  J --> K[igEntre dumEq→ref<br/>dppPorNaegele<br/>porUltrassom]
  I -->|não| L
  K --> L{dum E ultrassom<br/>ambos presentes?}

  L -->|sim| M[comparar]
  L -->|não| N

  M --> M1[diferencaDias = |dum − dumEq|<br/>trimestreDaUsg no dia do exame]
  M1 --> M2{margem do trimestre?}
  M2 -->|3.º: sem parâmetro| M3[veredito<br/>sem-parametro-na-fonte]
  M2 -->|diferença > margem| M4[veredito<br/>dum-fora-da-margem<br/>USG passa a referência]
  M2 -->|diferença ≤ margem| M5[veredito<br/>dum-confirmada]

  M3 --> N
  M4 --> N
  M5 --> N[nota ESTIMATIVA_NA_DATA_DE_REFERENCIA<br/>semDuplicatas referências]
  N --> O{referências vazias?}
  O -->|sim → bug| P[[ErroDeInvariante]]
  O -->|não| Q[ResultadoDatacao<br/>porDum? porUltrassom? comparacao? notas referencias]
```

**Invariantes:** motor não lê o relógio (data de referência é entrada); aritmética em dias epoch UTC; erro esperado é valor; toda saída com referência (property-based).
