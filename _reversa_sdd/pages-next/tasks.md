# pages/ — Tarefas de Implementação

> `tasks.md` · Re-extração 2 (2026-07-23), regenerado.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Pré-requisitos

- [ ] Units de interface implementadas (`inicio`, `calculadora`, `gestacao`, `cardiologia`, `comum`)
- [ ] Next.js + aliases `models/*`, `interface/*` (tsconfig, next.config)
- [ ] `@primer/primitives` e `@primer/react`; ativos PWA em `public/`

## Tarefas

- [ ] **T-01** `_document.tsx`: `lang="pt-BR"` + identidade PWA
  - Origem no legado: `pages/_document.tsx`
  - Critério de pronto: favicon, apple-touch, manifest e theme-color same-origin
  - Confiança: 🟢

- [ ] **T-02** `_app.tsx`: primitivos Primer + estilos + `ProvedorTemaPrimer`
  - Origem no legado: `pages/_app.tsx`
  - Critério de pronto: ordem primitivos→globais→cabecalho→inicio→cardiologia; `.app-raiz`; nenhuma fonte baixada
  - Confiança: 🟢

- [ ] **T-03** `index.tsx`: home na raiz com metadados de privacidade
  - Origem no legado: `pages/index.tsx`
  - Critério de pronto: `/` monta `TelaInicio`; description declara "nada é salvo nem enviado"
  - Confiança: 🟢

- [ ] **T-04** Rotas das três calculadoras
  - Origem no legado: `pages/dm2/insulina.tsx`, `pages/pre-natal/idade-gestacional.tsx`, `pages/cardiologia/dor-toracica.tsx`
  - Critério de pronto: cada rota monta sua tela com `<Head>` próprio
  - Confiança: 🟢

- [ ] **T-05** Endpoint de status
  - Origem no legado: `pages/api/v1/status.ts` (ver unit `pages-api-v1-status`)
  - Critério de pronto: contrato `GET /api/v1/status` (16/16)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** Smoke: `/` renderiza a home; cada rota monta sua tela
- [ ] **TT-02** Contrato do status + guarda de privacidade de API (sem corpo clínico, sem `Set-Cookie`)
- [ ] **TT-03** Documento servido tem os links de ícone/manifesto (feature 009)

## Ordem Sugerida

1. T-01 → T-02 (shell) primeiro.
2. T-03 e T-04 (rotas) após as telas prontas; T-05 é independente.

## Lacunas Pendentes (🔴)

Nenhuma. As lacunas 🔴 da extração 1 (API vazia, CSP não verificada, tipografia) foram resolvidas nas features 002/004. Débito 🟡: página 404 dedicada (opcional).
