# C4 — Nível 1: Contexto — aps-inteligente

> Gerado pelo Reversa Architect em 2026-07-19.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

🟢 O sistema não possui **nenhuma integração de runtime**: o cálculo roda inteiro no navegador (ADR 0002). Os únicos atores externos são o médico prescritor, a plataforma de hospedagem (build/deploy) e a fonte clínica — esta última uma dependência **editorial**, não técnica.

```mermaid
C4Context
    title Contexto — aps-inteligente (calculadora de insulina DM2)

    Person(medico, "Médico prescritor da APS", "Usa a calculadora no navegador durante a consulta; papel único, anônimo")

    System(aps, "aps-inteligente", "Website Next.js: calculadora de insulinização DM2, 100% client-side")

    System_Ext(vercel, "Vercel", "Hospedagem e deploy das páginas estáticas e do bundle")
    System_Ext(guia, "Guia Rápido DM — SMS-Rio, 2.ª ed. 2023", "Fonte clínica única (PDF fora do repo); regras extraídas em tempo de desenvolvimento")

    Rel(medico, aps, "Insere peso, glicemias, esquema; recebe conduta com referência", "HTTPS / navegador")
    Rel(vercel, aps, "Serve build estático", "HTTPS")
    Rel(guia, aps, "Fundamenta as constantes e regras (R-01..R-20)", "extração manual determinística, dev-time")
```

## Observações

- 🟢 **Nenhum dado sai do dispositivo**: não há analytics, telemetria (ADR 0007) nem backend com estado; o único armazenamento local é a preferência de tema.
- 🟡 As três personas do PRD antigo (recuperáveis no bundle) são variações do mesmo ator técnico "médico prescritor".
- 🔴 Rota `pages/api/v1/` vazia: a fronteira de sistema já reserva espaço para uma API sem dado clínico (ADR 0008), hoje inexistente.
