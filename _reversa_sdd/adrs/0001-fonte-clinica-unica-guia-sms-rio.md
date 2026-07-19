# ADR 0001 — Fonte clínica única: Guia Rápido DM (SMS-Rio, 2.ª ed., 2023), com PDF fora do git

> Retroativo, reconstruído pelo Reversa Detective (2026-07-19) a partir de MD-0008 (bundle) e commit `23445ec`/`a3a9493`. Confiança: 🟢

## Contexto
O motor de cálculo precisa de fundamento clínico rastreável; referências internacionais (ADA) e nacionais abrangentes (SBD) não refletem o fluxo de decisão rápida da APS/SUS.

## Decisão
O *Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023* (ISBN 978-65-86417-33-3) é a fonte clínica **única** do motor. O PDF (obra de terceiro) fica fora do versionamento; o repositório versiona a extração determinística das regras (tabela R-01..R-20, citada página a página) e toda saída do motor carrega `ReferenciaClinica` (fonte, edição, localização).

## Status
Ativa. Gatilhos de revisão: nova edição do guia; necessidade de segunda fonte (reabre NG-04); acúmulo de referências que justifique gerenciador próprio (RAG foi avaliado e adiado por proporcionalidade).
