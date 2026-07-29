<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-graph em 2026-07-28T21:50:00Z a partir de 2 bugs -->

# Grafo de bugs — contexto `consulta-puericultura`

```mermaid
graph LR
    subgraph interface["área: interface · rota /puericultura/consulta"]
        ZAHV["#3 BUG-20260728-ZAHV<br/>Proveniência no texto copiado<br/>critical · P0 · open/triaging"]
        C6LN["#2 BUG-20260728-C6LN<br/>Comando fora do quadro Medidas<br/>medium · P2 · open/triaging"]
    end
    ZAHV -. "related-to (proposed)" .- C6LN
```

## Clusters

Um cluster, por convergência de componente: `interface/puericultura/consulta/`. Dentro dele, os
arquivos afetados não se sobrepõem, de modo que as duas correções podem correr em paralelo sem
conflito de edição.

## Impact score

| Bug | Score | Decomposição |
|---|---|---|
| BUG-20260728-ZAHV | 0 | 0 causados, 0 bloqueados, 0 regressões, 1 relacionado **`proposed`** (não pontua) |
| BUG-20260728-C6LN | 0 | idem |

> Heurística de triagem (`causados*3 + bloqueados*2 + regressões*4 + relacionados*1`, só arestas
> `supported`/`confirmed`, `related-to` limitado a 3): não substitui priority/severity. Aqui os dois
> escores nulos não dizem nada sobre urgência — a ordem de tratamento vem de P0 antes de P2.

## Ordem sugerida de tratamento

1. **BUG-20260728-ZAHV** (P0): é o que atravessa para fora da plataforma, e exige veredito de spec
   com adendo sobre `contracts.md`.
2. **BUG-20260728-C6LN** (P2): correção de apresentação, com regra nova a escrever na spec da unit
   `interface-puericultura-consulta`, hoje omissa quanto à posição do gatilho.
