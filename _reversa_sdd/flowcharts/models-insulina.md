# Flowchart — módulo `models/insulina`

> Gerado pelo Reversa Archaeologist em 2026-07-19.

## Pipeline da fachada `CalculadoraInsulinaDM2.calcular`

```mermaid
flowchart TD
    A[EntradaCalculo] --> B{validarEntrada:\nofensores?}
    B -- "≥ 1 ofensor" --> C[ErroValidacao\ncom TODOS os ofensores]
    B -- nenhum --> D{motivoForaDoEscopo:\ninsulina fora de NPH/Regular?}
    D -- sim --> E[ForaDoEscopoDaFonte\nmotivo + orientação]
    D -- não --> F[new Peso - invariante]
    F --> G{modo?}
    G -- inicio --> H[RegraInicio.calcular]
    G -- titulacao --> I[RegraTitulacaoBasal.aplicar]
    I --> J[RegraTitulacaoBasal.fracionarSeIndicado]
    J --> K[RegraIntensificacao.aplicar]
    K --> L{dose total/kg > 1,0?}
    L -- sim --> M[Alerta DOSE_ACIMA_FAIXA_PLENA +\nrec. compartilhar cuidado]
    L -- não --> N
    M --> N{houve ajuste?}
    N -- sim --> O[Rec. REAVALIAR_EM_3_DIAS]
    N -- não --> P
    O --> P[Invariante DoseUi\npor aplicação]
    P --> Q[Ordenar alertas por severidade\nDeduplicar recomendações e referências]
    Q --> R[ResultadoTitulacao]
    H --> S[ResultadoInicio\nfaixa 10-15 UI + faixa por peso\nNPH ao deitar]
```

## Titulação basal pela glicemia de jejum (R-05..R-07)

```mermaid
flowchart TD
    A[Glicemias de jejum] -->|nenhuma| Z[Sem titulação basal]
    A --> B[média + detecção de hipo ≤ 70]
    B --> C{hipo OU média ≤ 70?}
    C -- sim --> D[delta = -4 UI\nAlerta HIPOGLICEMIA]
    C -- não --> E{média ≥ 180?}
    E -- sim --> F[delta = +4 UI]
    E -- não --> G{média ≥ 130?}
    G -- sim --> H[delta = +2 UI]
    G -- não --> I[delta = 0\nnaMeta = true - 71-129]
    D & F & H --> J{NPH noturna existe?\nordem: deitar → jantar → almoço → café}
    J -- não --> Z2[Nada a titular]
    J -- sim --> K[Aplicar delta com clamp 1-60 UI\nAlerta TETO_POR_APLICACAO se conteve]
```

## Fracionamento da NPH (R-08..R-10, AMB-10)

```mermaid
flowchart TD
    A{Exatamente 1 aplicação NPH?} -- não --> Z[Não se aplica]
    A -- sim --> B{"dose > 30 UI OU dose > 0,4 UI/kg/dia?"}
    B -- não --> Z
    B -- sim --> C["Principal: ceil(total/2) antes do café\n+ restante ao deitar"]
    C --> D["Alternativa rotulada: round(2/3) café + 1/3 ceia"]
    D --> E{Sulfonilureia em uso explícito?}
    E -- sim --> F[Rec. SUSPENDER_SULFONILUREIA]
    E -- não --> G
    F --> G[Rec. MANTER_METFORMINA\nAlerta FRACIONAR_DOSE]
```

## Intensificação — gate de HbA1c e braços (R-13..R-19)

```mermaid
flowchart TD
    A[Entrada + AjusteEmCurso] --> B{HbA1c informada?}
    B -- "≤ 7%" --> C{Esquema tem Regular?}
    C -- sim --> D[Rec. AVALIAR_ENCAMINHAMENTO_ENDOCRINO\nsegue para os braços]
    C -- não --> E["Rec. REPETIR_HBA1C_6_MESES\n(se nada ajustado) e PARA"]
    B -- "> 7%" --> F{Pré-prandiais aferidas?}
    F -- não --> G[Rec. AFERIR_PRE_PRANDIAIS e PARA]
    F -- sim --> H[podeIniciarRegular = true]
    B -- ausente --> I{Tem Regular E pré-prandiais?}
    I -- não --> Z[Retorna sem agir]
    I -- sim --> J[Rec. REPETIR_HBA1C_3_MESES\nsegue para os braços]
    D & H & J --> K["Para cada braço:\nAA: aferição antes do almoço → Regular antes do café\nAJ: antes do jantar → Regular antes do almoço\nAD: ao deitar → Regular antes do jantar"]
    K --> L{Braço: hipo ≤ 70?}
    L -- sim --> M[Alerta HIPOGLICEMIA\nRegular existente: -2 UI]
    L -- não --> N{média ≥ 130?}
    N -- não --> O[Manter - 71-129]
    N -- sim --> P{Regular no momento-alvo?}
    P -- sim --> Q[+2 UI com clamp]
    P -- não --> R{podeIniciarRegular?}
    R -- não --> O
    R -- sim --> S{"Braço AJ com NPH antes do café?"}
    S -- sim --> T[AMB-03: devolve DUAS condutas\nalternativas, motor não escolhe]
    S -- não --> U[Inicia Regular 4 UI\nno momento do braço]
    K --> V{Intensificado, acima da meta\ne nada ajustado?}
    V -- sim --> W[Rec. AFERIR_POS_PRANDIAL - NG-07]
```
