# Fluxograma — `models/puericultura` (feature 017)

> Gerado pelo Reversa Archaeologist na re-extração nº 4 (2026-07-28).
> Fachada: `CalculadoraCrescimentoInfantil.avaliar(entrada) → SaidaAvaliacao`.

## Fluxo da fachada

```mermaid
flowchart TD
    A[avaliar entrada] --> B{validarEntrada<br/>coleta TOTAL de ofensores}
    B -->|ofensores > 0| B1[["erro-validacao"]]
    B -->|sem ofensores| C[derivarIdades<br/>cronológica · corrigida · pós-menstrual]

    C --> D{foraDoEscopo<br/>recusa GLOBAL}
    D -->|pós-menstrual < 27 sem| D1[["fora-do-escopo<br/>ABAIXO_DA_CURVA_DE_PRETERMO"]]
    D -->|diasCorrigidos > 3682| D2[["fora-do-escopo<br/>IDADE_FORA_DA_COBERTURA"]]
    D -->|dentro| E[derivarMedidas<br/>converte posição · calcula IMC]

    E --> F{escolherPadrao<br/>ponto ÚNICO de fronteira}
    F -->|27 ≤ pós-menstrual ≤ 64| G[INTERGROWTH-21st]
    F -->|demais casos| H[OMS<br/>chave = diasCorrigidos]

    G --> I[para cada um dos 4 índices]
    H --> I
    I --> J[["resultado<br/>idades · indices · notas<br/>notaProveniencia · referencias"]]

    style B1 fill:#ffe6e6
    style D1 fill:#fff4e6
    style D2 fill:#fff4e6
    style J fill:#e6ffe6
```

## Avaliação de cada índice

> A ordem dos testes não é arbitrária: **o escopo da fonte vem antes do preenchimento**. Dizer "medida não informada" numa criança de 3 anos sugeriria que o perímetro cefálico deveria ter sido informado, quando a caderneta simplesmente não o classifica nessa idade.

```mermaid
flowchart TD
    A[avaliarIndice] --> B{é perímetro cefálico<br/>acima de 730 dias?}
    B -->|sim| B1[["estado: fora-do-escopo<br/>PC_ACIMA_DE_2_ANOS<br/>(PARCIAL — não derruba os demais)"]]
    B -->|não| C{medida informada?}

    C -->|não, e é IMC no pré-termo| C1[["estado: ausente<br/>IMC_INEXISTENTE_NO_PRETERMO"]]
    C -->|não| C2[["estado: ausente<br/>MEDIDA_NAO_INFORMADA"]]
    C -->|sim| D{qual régua?}

    D -->|INTERGROWTH-21st| E{índice existe<br/>nestas curvas?}
    E -->|IMC| C1
    E -->|peso · comprimento · PC| F["z = (observado − μ) / σ<br/>escala log no peso e no comprimento"]

    D -->|OMS| G[lerLms<br/>dia até 1856 · mês depois]
    G --> H["escoreLms<br/>z = ((X/M)^L − 1)/(L·S)"]
    H --> I{aplicaCauda<br/>E abs de z > 3?}
    I -->|sim — só peso e IMC| J["escoreNaCauda<br/>extrapolação linear no passo SD3 − SD2"]
    I -->|não| K[z permanece]

    F --> L[classificar<br/>rótulo literal da caderneta]
    J --> L
    K --> L
    L --> M[["estado: calculado<br/>escoreZ · classificacao<br/>padrao · idadeUsada · avisos · referencia"]]

    style B1 fill:#fff4e6
    style C1 fill:#f4f4f4
    style C2 fill:#f4f4f4
    style M fill:#e6ffe6
```

## As duas fronteiras dos 5 anos

> De propósito **não** coincidem. Alinhá-las produziria ora rótulo trocado, ora buraco de cobertura de 30 dias.

```mermaid
flowchart LR
    A["1826 dias<br/>fronteira de RÓTULO<br/>(classificacao.ts)"] --> B["entre 1826 e 1856:<br/>tabela de 0–5 anos<br/>com rótulos de 5–10"]
    B --> C["1856 dias<br/>fronteira de TABELA<br/>(oms/leitura.ts)"]
```

## Escolha da idade que governa cada coisa

```mermaid
flowchart TD
    A[IdadesDerivadas] --> B[cronológica<br/>diasDeVida]
    A --> C[corrigida<br/>diasCorrigidos]
    A --> D[pós-menstrual<br/>semanasPosMenstruais]

    B --> B1[escopo da fonte]
    B --> B2[posição esperada da medida<br/>— propriedade do CORPO, não da curva]
    B --> B3[até quando a correção vale]

    C --> C1[indexa a tabela da OMS]
    C --> C2[faixa de rótulo]

    D --> D1[indexa as curvas INTERGROWTH-21st]
    D --> D2[decide se elas ainda valem]
```
