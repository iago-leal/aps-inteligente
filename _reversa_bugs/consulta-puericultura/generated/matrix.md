<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-fix em 2026-07-28T22:30:00Z a partir de 2 bugs -->

# Matriz de relações BUG↔BUG — contexto `consulta-puericultura`

Lista esparsa de arestas (`origem | tipo | destino | state | evidência`).

| Origem | Tipo | Destino | State | Evidência |
|---|---|---|---|---|
| BUG-20260728-ZAHV | related-to | BUG-20260728-C6LN | proposed | — |

A aresta **permanece `proposed`** depois do fechamento do ZAHV em 28/07: a correção não produziu
evidência a favor nem contra ela, e promover uma relação por ter corrigido uma das pontas seria
confundir vizinhança com causa. O ZAHV está travado por `DONE.md`, mas a aresta segue legível pelas
duas leituras — o registro do C6LN continua a incluí-la.

## Inversas derivadas

`related-to` é simétrica: a leitura de BUG-20260728-C6LN inclui a aresta acima sem que ela seja
gravada duas vezes.

## Como ler a aresta

Os dois bugs nasceram do mesmo relato, na mesma tela, e ambos são de apresentação da rota
`/puericultura/consulta`. **Não há dependência causal entre eles**: nem um causa o outro, nem um
bloqueia o outro, e corrigir um não corrige nem atrapalha o outro. A relação registra a
oportunidade de tratá-los na mesma passagem, e permanece `proposed` porque é conveniência de
entrega, não achado.

## Clusters

Um só, por convergência de componente: ambos tocam `interface/puericultura/consulta/`. Os arquivos
alcançados são disjuntos — `app.tsx` e `ficha.tsx` num, `formatar-registro.ts` no outro.

## Cruzamento com outros contextos

Nenhuma aresta para `motor-insulina`. Domínio clínico distinto, código distinto, sintoma distinto.
