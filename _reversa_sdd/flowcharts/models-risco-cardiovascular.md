# Fluxograma — `models/risco-cardiovascular` (feature 014)

> Gerado pelo Reversa Archaeologist na re-extração nº 3 (2026-07-23).
> Fonte: 2013 ACC/AHA Guideline — Pooled Cohort Equations (Goff et al., 2014).
> Fachada: `CalculadoraRiscoCardiovascular.estimar(entrada) → SaidaEstimativa`.

## Fluxo da fachada (`calculadora.ts`)

```mermaid
flowchart TD
    A[estimar EntradaEstimativa] --> B[validarEntrada]
    B --> C{ofensores > 0?}
    C -->|sim| D[EntradaInvalida\ncoleta total, RN-08]
    C -->|não| E[foraDoEscopo]
    E --> F{DCV prévia?}
    F -->|sim| G[ForaDoEscopoDaFonte\nmotivo DCV_PREVIA]
    F -->|não| H{idade fora de 40–79?}
    H -->|sim| I[ForaDoEscopoDaFonte\nmotivo IDADE_FORA_DA_FAIXA]
    H -->|não| J[clamparEntrada\nfaixa fisiológica → Aviso]
    J --> K[grupoDe sexo,raca\nhomem/mulher × branco/negro]
    K --> L[riscoAscvdPct grupo,variaveis\nCox log-linear]
    L --> M[categoriaDe riscoPct\ncortes 5 / 7,5 / 20%]
    M --> N{referências vazias?}
    N -->|sim| O[throw ErroDeInvariante\nRF-08, bug interno]
    N -->|não| P[ResultadoEstimativa\nriscoPct, categoria, avisos,\nnotaProveniencia, referências]
```

## Núcleo da equação (`equacao.ts`)

```mermaid
flowchart TD
    A[riscoAscvdPct grupo, v] --> B[c = COEFICIENTES grupo]
    B --> C[ln idade, ln colesterol, ln HDL, ln PAS]
    C --> D{em tratamento anti-HAS?}
    D -->|sim| E[termoPas = c.lnPasTratada·lnPas\n+ c.lnIdadeXlnPasTratada·lnIdade·lnPas]
    D -->|não| F[termoPas = c.lnPasNaoTratada·lnPas\n+ c.lnIdadeXlnPasNaoTratada·lnIdade·lnPas]
    E --> G[somaIndividual = Σ β·X\nidade, idade², colesterol, HDL,\ninterações ln idade×X, termoPas,\ntabagismo, diabetes]
    F --> G
    G --> H["risco = 1 − S₀^exp(soma − mean_grupo)"]
    H --> I[retorna risco × 100  →  pontos percentuais]
```

## Dois níveis de tratamento de entrada (D-07)

- **Ofensor** (`validarEntrada`): tipo/domínio inválido — sexo/raça fora do enum, idade não-inteira ou fora de 0–120, valor não positivo. **Trava** com `EntradaInvalida` (todos os ofensores de uma vez).
- **Aviso** (`clamparEntrada`): valor numérico válido mas fora da faixa fisiológica (colesterol 130–320, HDL 20–100, PAS 90–200). **Não trava** — clampa ao limite mais próximo e sinaliza o viés ("pode subestimar/superestimar o risco").
- **Fora de escopo** (`foraDoEscopo`): idade plausível mas fora de 40–79, ou DCV prévia. **Não é erro** — é recusa honesta (`ForaDoEscopoDaFonte`), sem número estimado.
