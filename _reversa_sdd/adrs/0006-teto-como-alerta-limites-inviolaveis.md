# ADR 0006 — Teto de dose como alerta; invioláveis apenas o incremento por ajuste e 1–60 UI por aplicação

> Retroativo, reconstruído pelo Reversa Detective (2026-07-19) a partir da decisão AMB-04 e de R-20/D-08 (bundle). Confiança: 🟢

## Contexto
O guia menciona a faixa de insulinização plena (0,5–1,0 UI/kg/dia, p. 61), mas pacientes reais podem precisar de mais; um teto rígido negaria cálculo exatamente a quem mais precisa de apoio.

## Decisão
Acima de 1,0 UI/kg/dia a dose **não é travada**: o resultado carrega o alerta `DOSE_ACIMA_FAIXA_PLENA` e a recomendação "considerar compartilhamento de cuidados com especialista focal". Permanecem invioláveis: o incremento máximo por ajuste definido pela fonte (±4 UI basal, ±2 UI Regular) e o limite físico da caneta do SUS (1–60 UI por aplicação, graduação de 1 UI) — este último clampa a dose com alerta `TETO_POR_APLICACAO` e é invariante do value object `DoseUi`.

## Status
Ativa; realizada em `contemDoseLimitada` e no pós-processamento da fachada.
