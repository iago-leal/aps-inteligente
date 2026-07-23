# C4 — Nível 1: Contexto — aps-inteligente

> Regenerado pelo Reversa Architect em 2026-07-23 (re-extração nº 2).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

🟢 O cálculo clínico dos três domínios roda inteiro no navegador (ADR 0002). Os atores externos são o médico prescritor, a plataforma de hospedagem (build/deploy/Function), o banco gerenciado do healthcheck (sem dado clínico) e as **três fontes clínicas** — estas dependências **editoriais**, não técnicas, uma por domínio.

```mermaid
C4Context
    title Contexto — aps-inteligente (plataforma de calculadoras clínicas da APS)

    Person(medico, "Médico prescritor da APS", "Usa as calculadoras no navegador durante a consulta; papel único, anônimo")

    System(aps, "aps-inteligente", "Plataforma web Next.js: três calculadoras clínicas (insulina DM2, idade gestacional, dor torácica), 100% client-side no cálculo")

    System_Ext(vercel, "Vercel", "Build, CDN e execução da Function /api/v1/status")
    System_Ext(neon, "Neon (Postgres)", "Banco gerenciado do healthcheck — NENHUM dado clínico (só SELECT 1)")
    System_Ext(guiaDm, "Guia Rápido DM — SMS-Rio, 2.ª ed. 2023", "Fonte clínica única da insulina (PDF fora do repo)")
    System_Ext(guiaPn, "Guia Rápido Pré-Natal — SMS-Rio, 4.ª ed. 2025", "Fonte clínica única da gestação (PDF fora do repo)")
    System_Ext(teleC, "TeleCondutas Cardiopatia Isquêmica — TelessaúdeRS-UFRGS, 2017", "Fonte clínica única da dor torácica (PDF fora do repo)")

    Rel(medico, aps, "Insere dados clínicos; recebe conduta/datação/estrato com referência", "HTTPS / navegador")
    Rel(vercel, aps, "Serve build estático e executa a Function", "HTTPS")
    Rel(aps, neon, "Healthcheck SELECT 1 (só /api/v1/status)", "TLS / pg")
    Rel(guiaDm, aps, "Fundamenta constantes e regras da insulina", "extração dev-time")
    Rel(guiaPn, aps, "Fundamenta a datação gestacional", "extração dev-time")
    Rel(teleC, aps, "Fundamenta a estimativa pré-teste de DAC", "extração dev-time")
```

## Observações

- 🟢 **Nenhum dado clínico sai do dispositivo:** não há analytics nem telemetria (ADR 0007), e a única ida à rede em runtime é o healthcheck, que não carrega dado clínico. O único armazenamento local é a preferência de tema.
- 🟢 **Uma fonte por domínio** (ADR 0001/0011): as três fontes não se misturam; cada tela cita só a sua. Nova edição de qualquer guia é gatilho de revisão registrado (MD-0008).
- 🟡 As personas do PRD são variações do mesmo ator técnico "médico prescritor" — papel único, anônimo, sem autenticação (`permissions.md`).
