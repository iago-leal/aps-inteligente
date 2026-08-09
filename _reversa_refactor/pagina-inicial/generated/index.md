# `pagina-inicial` — índice de oportunidades

> GENERATED por `/reversa-refactor` em 2026-07-30, atualizado por `/reversa-modularize` e `/reversa-restructure`.
> Não editar à mão. Fonte: `../opportunities/*.md` e `../transformations/*/transformation.md`.

## Oportunidades

| # | id | verbo | conf. | custo | alvo | estado |
|---|----|-------|-------|-------|------|--------|
| 4 | OPP-20260730-R8FJ | modularize | 🟢 | baixo | `scripts/textos/classes/interface.mts` | **applied** |
| 3 | OPP-20260730-P2WH | restructure | 🟢 | baixo | `interface/inicio/tela.tsx` | **applied** |
| 1 | OPP-20260730-K3QA | modularize | 🟢 | baixo | `interface/inicio/icones.tsx`, `catalogo.ts` | proposed |
| 2 | OPP-20260730-M7TD | restructure | 🟢 | médio | `interface/inicio/catalogo.ts` | proposed |
| 5 | OPP-20260730-T5NC | standardize | 🟡 | baixo | `interface/estilos/inicio.css`, `cabecalho.css` | proposed |
| 6 | OPP-20260730-V4XB | modularize | 🟡 | baixo | `e2e/plataforma.spec.ts` | proposed |

Ordenado pela ordem de ataque, e não pelo número: o apelido humano é global e não se
renumera.

## Transformações

| id | verbo | estado | preservação | evidência |
|----|-------|--------|-------------|-----------|
| OPP-20260730-R8FJ | modularize | applied | equivalence-proof | `transformations/OPP-20260730-R8FJ-partir-classes-de-interface/` |
| OPP-20260730-P2WH | restructure | applied | equivalence-proof | `transformations/OPP-20260730-P2WH-extrair-secao-e-cartao/` |

**Medição da P2WH.** Antes: 1 função com 3 responsabilidades, 2 `map` aninhados, JSX de 7
níveis. Depois: 3 funções nomeadas, 1 responsabilidade cada, `TelaInicio` com 1 `map` e JSX
de 3 níveis. DOM emitido idêntico byte a byte (14712 bytes de cada lado).

**Medição da R8FJ.** Antes: 1 módulo, 689 linhas, 9 units, coesão coincidente. Depois: 9
módulos, de 23 a 159 linhas, um por unit, coesão funcional. Inventário textual byte a byte
idêntico (md5 `0f133e2c…`, 1245 literais); `vitest` 920/920; `tsc` e `eslint` em zero.

## Ordem de encadeamento restante

`1 → 2`, e `5` e `6` a qualquer tempo, por serem independentes das demais.

A 1 fecha o vínculo entre catálogo e ícone antes que a 2 mexa no formato do catálogo; a 2 é
a última porque é a que decide o contrato que a feature vai consumir, e decidir por último é
decidir com mais informação.

## Fronteira declarada

O pedido que abriu este contexto trazia três partes. Duas delas **não são refatoração** e
saem daqui para `/reversa-requirements`:

| Parte do pedido | Natureza | Destino |
|---|---|---|
| "refatorar a página inicial" | estrutura interna, comportamento preservado | este registro |
| "adicionar uma barra de busca" | comportamento observável novo | ciclo forward |
| "organizar o que virá no futuro" | decisão de produto sobre navegação | ciclo forward, informado pela oportunidade 2 |

O critério que sustenta o corte está em `.harness/decisoes/MD-0042.md`: campo declarado e não
consumido é preparação; campo lido por componente é a feature começando pela porta dos fundos.
