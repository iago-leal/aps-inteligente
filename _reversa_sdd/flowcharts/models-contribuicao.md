# Fluxograma — `models/contribuicao` (feature 019)

> Gerado pelo Reversa Archaeologist na re-extração nº 4 (2026-07-28).
> Fachada: `montarBrCode(parametros) → SaidaBrCode`. **Primeiro unit de domínio não clínico** da plataforma (`MD-0022`).

## Montagem do payload

```mermaid
flowchart TD
    A[montarBrCode parametros] --> B{validarParametros<br/>coleta TOTAL de ofensores}
    B -->|ofensores > 0| B1[["ParametroInvalido<br/>RECUSA, jamais truncamento"]]
    B -->|sem ofensores| C[normalizarTexto<br/>remove diacríticos → ASCII]

    C --> D[monta os campos EMV na ordem do padrão]
    D --> D1["00 — formato (01)"]
    D --> D2["26 — subtemplate PIX<br/>00: br.gov.bcb.pix · 01: chave"]
    D --> D3["52 — categoria (0000, não especificado)"]
    D --> D4["53 — moeda (986, real)"]
    D --> D5["54 — valor (SÓ se sugerido)"]
    D --> D6["58 — país (BR)"]
    D --> D7["59 — nome do beneficiário"]
    D --> D8["60 — cidade"]
    D --> D9["62 — subtemplate<br/>05: identificação ou ***"]

    D9 --> E["concatena e acrescenta 6304<br/>— a verificação se calcula SOBRE ele"]
    E --> F["crc16: polinômio 0x1021 · inicial 0xFFFF<br/>sem reflexão · sem xor final"]
    F --> G[["ok — payload<br/>cadeia + 4 dígitos hex maiúsculos"]]

    style B1 fill:#ffe6e6
    style G fill:#e6ffe6
```

> **A armadilha do CRC:** meia dúzia de variantes compartilham o polinômio `0x1021` e diferem só nos demais parâmetros, e **todas produzem quatro dígitos plausíveis**. O vetor conhecido (`"123456789"` → `29B1`) é o que distingue esta das outras.
> **A entrada inclui `6304`:** apenas os quatro dígitos do valor ficam de fora. Calcular sem esse sufixo produz código que nenhum aplicativo aceita.

## Onde a validação recusa

```mermaid
flowchart LR
    A[chave vazia] --> R[recusa]
    B[nome > 25 caracteres<br/>já normalizado] --> R
    C[cidade > 15 caracteres<br/>já normalizada] --> R
    D[identificação > 25] --> R
    E[valor não positivo] --> R
    R --> S["ofensor com limite e observado:<br/>a mensagem diz O QUE FAZER,<br/>não apenas que algo está errado"]
```

> Recusar em vez de truncar tem consequência concreta: nome acima do limite faz o painel **exibir erro em desenvolvimento**, e não um beneficiário errado na câmera de quem contribui.

## O contrato que a plataforma emite sem canal de erro

```mermaid
flowchart LR
    A[models/contribuicao] -->|payload| B[interface/contribuicao]
    B --> C[QR na tela · copia e cola]
    C --> D[aplicativo do banco<br/>— software de TERCEIROS]
    D -.->|nenhum retorno para nós| A

    style D fill:#fff4e6
```

> Payload malformado falha **na mão de quem contribui**, sem retorno para a plataforma. Daí a verificação em duas pontas: uma automatizada contra decodificador independente, outra humana, com o consumidor real do contrato.

## Isenção declarada (`MD-0022`)

```mermaid
flowchart TD
    A["invariantes da família models/*"] --> B[1 · domínio puro]
    A --> C[2 · erro como valor]
    A --> D[3 · toda saída carrega ReferenciaClinica]
    A --> E[4 · coleta total de ofensores]
    A --> F[5 · constantes clínicas congeladas]
    A --> G[6 · o motor informa, não escolhe]

    B --> S1[vale ✔]
    C --> S1
    E --> S1
    G --> S1
    D --> S2["NÃO se aplica — isento por escrito"]
    F --> S2

    style S2 fill:#fff4e6
```

> A isenção está escrita no cabeçalho da fachada porque a re-extração confere aquela tabela linha a linha, e **ausência não declarada se lê como esquecimento, não como decisão**.
