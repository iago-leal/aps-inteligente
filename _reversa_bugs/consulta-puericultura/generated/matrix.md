<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-fix em 2026-08-09T19:00:00Z a partir de 2 bugs -->

# Matriz de relações BUG↔BUG — contexto `consulta-puericultura`

Lista esparsa de arestas (`origem | tipo | destino | state | evidência`).

| Origem | Tipo | Destino | State | Evidência |
|---|---|---|---|---|
| BUG-20260728-ZAHV | related-to | BUG-20260728-C6LN | proposed | — |

A aresta **permanece `proposed`** depois do fechamento das DUAS pontas — o ZAHV em 28/07, o C6LN em
09/08. Nenhuma das correções produziu evidência a favor ou contra ela, e promover uma relação por
ter corrigido ambas as pontas seria confundir vizinhança com causa. A investigação do C6LN, aliás,
deu à aresta o seu argumento mais forte de permanecer fraca: os dois nasceram do mesmo print e da
mesma tela, mas o ZAHV nascia da **spec** (a regra 7 do contrato do registro) e o C6LN, da
**composição** (uma prop que não existia). Causas de naturezas diferentes.

As duas pastas estão travadas por `DONE.md`, e a aresta segue legível pelas duas leituras.

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
alcançados são disjuntos — `app.tsx`, `ficha.tsx` e `consulta-puericultura.css` num,
`formatar-registro.ts` e `registro.ts` no outro. A previsão de que as correções podiam correr em
paralelo sem conflito de edição **se confirmou na prática**, com onze dias entre uma e outra.

## Cruzamento com outros contextos

Nenhuma aresta para `motor-insulina`. Domínio clínico distinto, código distinto, sintoma distinto.
