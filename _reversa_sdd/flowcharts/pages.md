# Fluxograma — módulo `pages`

> Regenerado pelo Reversa Archaeologist na re-extração nº 4 (2026-07-28).
> Substitui a versão de 2026-07-19, que descrevia a tipografia IBM Plex (aposentada na feature 004, em favor da pilha de fontes do próprio Primer) e uma rota `pages/api/v1/index.js` vazia que **não existe mais**.

## Composição do shell

```mermaid
flowchart TD
    A["_document.tsx<br/>Html lang=pt-BR · favicon · apple-touch-icon<br/>manifest.webmanifest (PWA) · theme-color"] --> B["_app.tsx<br/>fundação Primer (primitives + temas)<br/>+ as NOVE folhas próprias, na ordem<br/>dentro de ProvedorTemaPrimer"]

    B --> H["index.tsx → TelaInicio"]
    B --> R1["dm2/insulina.tsx"]
    B --> R2["pre-natal/idade-gestacional.tsx"]
    B --> R3["cardiologia/dor-toracica.tsx"]
    B --> R4["cardiologia/risco-cardiovascular.tsx"]
    B --> R5["puericultura/crescimento.tsx"]
    B --> R6["puericultura/consulta.tsx"]

    H --> HC["CATALOGO — 4 seções, 6 fichas<br/>+ BlocoDeApoio FORA do map"]
    R1 --> M1["models/insulina"]
    R2 --> M2["models/gestacao"]
    R3 --> M3["models/cardiopatia-isquemica"]
    R4 --> M4["models/risco-cardiovascular"]
    R5 --> M5["models/puericultura"]
    R6 --> M6["models/puericultura/consulta"]
    HC --> M7["models/contribuicao"]

    style R5 fill:#e6ffe6
    style R6 fill:#e6ffe6
```

> Cada rota é uma casca `<Head>` + tela. **Toda calculadora nova entra primeiro no `CATALOGO`** — que desde a feature 018 é também oráculo da descrição da plataforma, e desde a 021 determina quais rotas a guarda geométrica percorre.

## `GET /api/v1/status` — o handler depois da feature 022

```mermaid
flowchart TD
    A[requisição] --> B{método é GET?}
    B -->|não| B1[["405 + Allow: GET<br/>ANTES de qualquer I/O:<br/>método errado não desperta o banco"]]
    B -->|sim| C["verificarBanco()<br/>infra/saude.ts"]

    C --> D["saude() → infra/database.ts<br/>SELECT $1::int AS ok<br/>sob teto de 3.000 ms no SERVIDOR"]
    D -->|resolve| E["banco: integro"]
    D -->|ErroDeBanco| F["banco: degradado + causa"]
    D -->|exceção fora do contrato| G["log de erro + degradado/consulta<br/>— não escapa: derrubar o healthcheck<br/>trocaria degradação por indisponibilidade"]

    E --> H
    F --> H
    G --> H["200 · Cache-Control: no-store<br/>{atualizado_em, versao, commit,<br/>publicado_em, ambiente, banco}"]

    style B1 fill:#fff4e6
    style H fill:#e6ffe6
```

> **200 em todo estado do banco (`MD-0031`).** O código responde se a rota funcionou; o corpo responde o que ela apurou. As seis calculadoras são integralmente cliente e seguem servindo com o banco fora — um 503 afirmaria queda que não houve.

## As quatro causas de `ErroDeBanco`

```mermaid
flowchart TD
    A[falha na consulta] --> B{ehEstouroDeTempo?}
    B -->|código 57014 ou ETIMEDOUT<br/>ou frase de timeout do driver| B1["tempo_esgotado 🆕"]
    B -->|não| C{ehErroDeConexao?}
    C -->|sim| C1[conexao]
    C -->|não| D[consulta]

    E[URL ausente ou malformada] --> F[configuracao]

    style B1 fill:#e6ffe6
```

> 🔴 **A ordem importa e é frágil:** `ehEstouroDeTempo` precisa vir **antes** de `ehErroDeConexao`, que casaria com o `"connection terminated"` de uma queda — outra coisa. O reconhecimento se apoia numa **frase** que o driver emite, de modo que atualização de `pg` é gatilho de revisão (watch W007 da feature 022).
> A quarta causa **retira casos** das duas existentes: instância suspensa que demora a despertar deixa de ser lida como banco fora.
