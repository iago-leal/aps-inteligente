# ADR 0009 — Escopo da fase 1: o que o guia cobre, a calculadora cobre — sem orientações ao paciente

> Retroativo, reconstruído pelo Reversa Detective (2026-07-19) a partir de MD-0009 (bundle). Confiança: 🟢

## Contexto
Era preciso fixar a fronteira da primeira fase: quais esquemas, quais insumos, qual público da saída.

## Decisão
Uma única fronteira de escopo, alinhada à fonte única (ADR 0001): a calculadora cobre **basal, basal-plus e basal-bolus** — tudo que o guia titula; os insumos do formulário são exatamente os que o algoritmo do guia exige; o catálogo de insulinas nomeia só o que o guia contempla (NPH/Regular); o resultado dirige-se **somente ao médico** (dose, delta, alertas, referência), sem orientações ao paciente. O que a fonte não cobre é recusado com `ForaDoEscopoDaFonte` — sem segunda camada arbitrária de recorte.

## Status
Ativa; realizada em `motivoForaDoEscopo` e nas três regras do motor.
