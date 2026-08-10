<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-fix em 2026-08-09T19:00:00Z a partir de 2 bugs -->

# Índice de bugs — contexto `consulta-puericultura`

Source of truth: `../bugs/*/bug.md`. Inconsistências encontradas: **0**.

Contexto aberto em 2026-07-28 pelo relato `../intake/relato-20260728-2145.md`, sobre a rota
`/puericultura/consulta` (feature 020, com a coluna da 021).

## Resumo por status e phase

| Status | Phase | Quantidade |
|---|---|---|
| open | triaging | 0 |
| active | — | 0 |
| resolved | resolved | 2 |

## Bugs abertos / ativos

**Nenhum.** O contexto ficou sem bug aberto em 2026-08-09, com o fechamento do C6LN.

## Resolvidos

| # | ID | Título | `resolution_kind` | Veredito de spec | Caminho |
|---|----|--------|-------------------|------------------|---------|
| 3 | BUG-20260728-ZAHV | Notas de proveniência e linha da fonte atravessam para o texto copiado do registro | `fixed` | `spec-desatualizada` → `_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md` | `../bugs/BUG-20260728-ZAHV-notas-de-proveniencia-no-texto-copiado/` |
| 2 | BUG-20260728-C6LN | Comando "Avaliar crescimento" fica fora do quadro "1. Medidas", que é o que ele consome | `fixed` | `spec-gap` → `_reversa_sdd/addenda/bug-BUG-20260728-C6LN-v001.md` | `../bugs/BUG-20260728-C6LN-avaliar-crescimento-fora-do-quadro-medidas/` |

## Travados (DONE.md)

| # | ID | Encerrado em | Motivo da trava |
|---|----|--------------|-----------------|
| 3 | BUG-20260728-ZAHV | 2026-07-28 | Closure policy `local-software` satisfeita: regressão passando (821/821 na suíte, 9/9 no e2e) + veredito de spec com adendo versionado. Pasta somente leitura. |
| 2 | BUG-20260728-C6LN | 2026-08-09 | Closure policy `local-software` satisfeita: regressão passando (935/935 na suíte, 10/10 no e2e com `axe` em zero) + veredito `spec-gap` com adendo aditivo. Pasta somente leitura. |

## Restritos

Nenhum bug com `visibility: restricted`.

## Pendências de taxonomia

Os dois bugs estão em `module: unclassified` e `feature: unclassified` porque `taxonomy.yaml` não
tem termo para esta área. Propostas registradas em Agent Notes de ambos, não aplicadas:
`module: interface-puericultura-consulta`, `module: models-puericultura-consulta`,
`feature: consulta-puericultura-soap`.

A pendência **sobreviveu ao fechamento dos dois**: ambos foram encerrados com a classificação
vazia, e as duas pastas travadas são somente leitura. Se a taxonomia ganhar os termos, ZAHV e C6LN
permanecerão `unclassified` — é o custo de fechar antes de decidir, e fica declarado aqui em vez de
virar surpresa de auditoria. Com o contexto sem bug aberto, não há mais ocasião natural de aplicá-la
por arrasto: quem quiser a taxonomia terá de abrir trabalho próprio para ela.
