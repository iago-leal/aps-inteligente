<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-fix em 2026-07-28T22:30:00Z a partir de 2 bugs -->

# Índice de bugs — contexto `consulta-puericultura`

Source of truth: `../bugs/*/bug.md`. Inconsistências encontradas: **0**.

Contexto aberto em 2026-07-28 pelo relato `../intake/relato-20260728-2145.md`, sobre a rota
`/puericultura/consulta` (feature 020, com a coluna da 021).

## Resumo por status e phase

| Status | Phase | Quantidade |
|---|---|---|
| open | triaging | 1 |
| active | — | 0 |
| resolved | resolved | 1 |

## Bugs abertos / ativos

Nenhum `is_blocked`: a lista `blocking` está vazia.

| # | ID | Título | Sev/Pri | area/module/feature | Caminho |
|---|----|--------|---------|---------------------|---------|
| 2 | BUG-20260728-C6LN | Comando "Avaliar crescimento" fica fora do quadro "1. Medidas", que é o que ele consome | medium · P2 | interface / unclassified / unclassified | `../bugs/BUG-20260728-C6LN-avaliar-crescimento-fora-do-quadro-medidas/` |

## Resolvidos

| # | ID | Título | `resolution_kind` | Veredito de spec | Caminho |
|---|----|--------|-------------------|------------------|---------|
| 3 | BUG-20260728-ZAHV | Notas de proveniência e linha da fonte atravessam para o texto copiado do registro | `fixed` | `spec-desatualizada` → `_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md` | `../bugs/BUG-20260728-ZAHV-notas-de-proveniencia-no-texto-copiado/` |

## Travados (DONE.md)

| # | ID | Encerrado em | Motivo da trava |
|---|----|--------------|-----------------|
| 3 | BUG-20260728-ZAHV | 2026-07-28 | Closure policy `local-software` satisfeita: regressão passando (821/821 na suíte, 9/9 no e2e) + veredito de spec com adendo versionado. Pasta somente leitura. |

## Restritos

Nenhum bug com `visibility: restricted`.

## Pendências de taxonomia

Os dois bugs estão em `module: unclassified` e `feature: unclassified` porque `taxonomy.yaml` não
tem termo para esta área. Propostas registradas em Agent Notes de ambos, não aplicadas:
`module: interface-puericultura-consulta`, `module: models-puericultura-consulta`,
`feature: consulta-puericultura-soap`.

A pendência **sobreviveu ao fechamento do ZAHV**: o bug foi encerrado com a classificação vazia, e a
pasta travada é somente leitura. Se a taxonomia ganhar os termos, o ZAHV permanecerá
`unclassified` — é o custo de fechar antes de decidir, e fica declarado aqui em vez de virar
surpresa de auditoria.
