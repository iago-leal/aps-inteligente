# ADR 0008 — Plataforma híbrida: páginas estáticas + rotas de API sem dado clínico

> Retroativo, reconstruído pelo Reversa Detective (2026-07-19) a partir de MD-0011 e da feature 002 (bundle). Confiança: 🟢 quanto à decisão histórica; 🔴 quanto à realização atual

## Contexto
A plataforma nasceu "SSG puro, sem rotas de API"; a feature 002 (observabilidade do deploy: saber por URL se o site está no ar) e a trilha do curso.dev pediram um endpoint `GET /api/v1/status`.

## Decisão
O que se protege é a **privacidade**, não a ausência de servidor: rotas de API são permitidas desde que nenhum dado clínico ou pessoal trafegue ou persista por elas. A guarda é comportamental (sem leitura de corpo, sem `Set-Cookie`), vigiada por teste de contrato — não uma allowlist nominal de endpoints.

## Status
Historicamente ativa; **não reconstituída** após a refundação. Vestígios no repo atual: `pages/api/v1/index.js` e `tests/integration/api/v1/index.js` vazios, script `test:api` quebrado. Quando a API renascer, endpoint, guarda de privacidade e teste de contrato voltam juntos (spec antes do código).
