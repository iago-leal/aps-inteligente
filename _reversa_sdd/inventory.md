# Inventário — aps-inteligente

> Gerado pelo Reversa Scout em 2026-07-19 · **Re-extração 2 em 2026-07-23** (absorve as features 001–010).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Visão geral

🟢 **aps-inteligente** é um website Next.js (Pages Router) dedicado à prática médica na APS (Atenção Primária à Saúde), concebido como **plataforma guarda-chuva** de calculadoras clínicas, cada uma ancorada em uma fonte clínica citável. O cálculo é **100% client-side**: nenhum dado clínico sai do navegador (ADR 0002).

🟢 Na primeira extração (19–20/07) existia uma única calculadora (insulina DM2). Esta re-extração reflete a plataforma tal como cresceu por dez features do ciclo forward: **três calculadoras**, uma **home por seções**, identidade visual **Primer**, **logo APSi/PWA** e uma **fundação de dados** (PostgreSQL) usada apenas pelo healthcheck de status.

🟢 As três calculadoras e suas fontes (README, catálogo tipado em `interface/inicio/catalogo.ts`):

| Seção | Calculadora | Rota | Fonte clínica | Domínio |
|---|---|---|---|---|
| Diabetes Mellitus tipo 2 | Insulina (início, titulação, intensificação) | `/dm2/insulina` | Guia Rápido DM — SMS-Rio, 2023 | `models/insulina/` |
| Pré-natal | Idade gestacional (DUM e/ou ultrassom) | `/pre-natal/idade-gestacional` | Guia Rápido Pré-Natal — SMS-Rio, 2025 | `models/gestacao/` |
| Cardiologia | Dor torácica e probabilidade pré-teste de DAC | `/cardiologia/dor-toracica` | TeleCondutas Cardiopatia Isquêmica — TelessaúdeRS-UFRGS, 2017 | `models/cardiopatia-isquemica/` |

## Arquitetura em camadas

🟢 Separação estrita, verificável por `git diff` vazio entre camadas nas features de apresentação:

- **Domínio** (`models/`) — lógica pura, determinista, sem React nem framework. Erros como valores; exceção só para bug de invariante (ADR 0004). Toda saída carrega `ReferenciaClinica` (ADR 0001).
- **Interface** (`interface/`) — componentes React; a `Moldura` comum é o esqueleto compartilhado das telas.
- **Shell/rotas** (`pages/`) — Next.js Pages Router; uma rota por calculadora, home na raiz, `_app`/`_document`.
- **Infraestrutura** (`infra/`) — pool `pg` e compose do PostgreSQL local; toca só o status.

## Estrutura de pastas

```
aps-inteligente/
├── models/                          # DOMÍNIO puro (3 calculadoras, ~2.533 LOC .ts)
│   ├── insulina/                    # DM2 — 8 arq., 1.352 LOC
│   │   ├── calculadora.ts           # Fachada/orquestração (226)
│   │   ├── regra-inicio.ts          # Início de insulinização
│   │   ├── regra-intensificacao.ts  # Intensificação (250)
│   │   ├── regra-titulacao-basal.ts # Titulação basal (221)
│   │   ├── regra-metformina.ts      # Metformina × TFG (feature 005)
│   │   ├── fonte-clinica.ts · tipos.ts (198) · validacao.ts (183)
│   ├── gestacao/                    # Idade gestacional — 6 arq., 609 LOC (feature 007)
│   │   ├── calculadora.ts (172) · datacao.ts · datas.ts · fonte-clinica.ts · tipos.ts · validacao.ts
│   └── cardiopatia-isquemica/       # Dor torácica/pré-teste — 7 arq., 572 LOC (feature 010)
│       ├── calculadora.ts · classificacao.ts · probabilidade.ts · conduta.ts
│       ├── fonte-clinica.ts · tipos.ts · validacao.ts
├── interface/                       # APRESENTAÇÃO React (~3.307 LOC)
│   ├── comum/moldura.tsx            # Moldura compartilhada (95) — h1, tema, apresentação, logo
│   ├── calculadora/                 # Tela da insulina — 16 arq., 1.380 LOC
│   │   ├── resultado.tsx (353) · formulario.tsx (313) · tela.tsx · calculadora-app.tsx
│   │   ├── formatar-plano.ts · area-de-transferencia.ts · rotulos.ts (feature 006)
│   │   ├── provedor-tema.tsx · preferencia-de-tema.ts · relator-de-erros.ts · validacao-campos.ts …
│   ├── gestacao/                    # Tela da IG — 4 arq., 438 LOC (feature 007)
│   ├── cardiologia/                 # Tela da dor torácica — 5 arq., 596 LOC (feature 010)
│   │   └── app · formulario (203) · resultado (192) · referencias · tela
│   ├── inicio/                      # Home por seções — 3 arq., 139 LOC (features 007/008)
│   │   ├── catalogo.ts              # Catálogo tipado de seções/calculadoras
│   │   ├── icones.tsx               # id→Octicon (feature 008)
│   │   └── tela.tsx
│   └── estilos/                     # CSS sobre tokens Primer — 4 arq., 659 LOC
│       ├── globais.css (teto ~400) · inicio.css · cabecalho.css · cardiologia.css
├── pages/                           # SHELL Next.js (Pages Router) — 243 LOC
│   ├── index.tsx                    # Home (feature 007)
│   ├── _app.tsx · _document.tsx     # Shell + PWA/ícones (feature 009)
│   ├── dm2/insulina.tsx
│   ├── pre-natal/idade-gestacional.tsx
│   ├── cardiologia/dor-toracica.tsx
│   └── api/v1/status.ts             # GET /api/v1/status (feature 002)
├── infra/                           # INFRAESTRUTURA de dados (feature 003)
│   ├── database.ts                  # Pool pg lazy (singleton)
│   └── compose.yaml                 # postgres:17.10-alpine local
├── public/                          # Ativos PWA/logo (feature 009) — same-origin
├── referencias/                     # PDFs das fontes clínicas (fora do git, MD-0008)
├── tests/                           # unidade + integração + contrato + regressão
├── e2e/                             # Playwright + axe-baseline.json
├── .github/workflows/ci.yml         # CI: verificação → contrato → deploy (features 002/003)
└── next.config.ts · vercel.json · tsconfig.json · eslint.config.mjs · *.config.ts
```

## Tecnologias

🟢 **Linguagem primária:** TypeScript (97 arquivos `.ts`/`.tsx`). CSS (6, sobre tokens Primer). Node >= 24 (campo `engines`).

🟢 **Framework:** Next.js 16.2.10 (Pages Router, Turbopack), React 19.2.4. Sistema de design **GitHub Primer** (`@primer/react` 38.33.0, `@primer/octicons-react` 19.29.2, `@primer/primitives` 11.9.0).

🟢 **Dados:** `pg` 8.22.0 — único uso é o healthcheck em `/api/v1/status`; produção via integração **Neon** (Vercel Marketplace), local via compose. Nenhum dado clínico persiste (ADR 0002/0008).

## Pontos de entrada

🟢 Home: `pages/index.tsx`. Rotas de calculadora: `pages/dm2/insulina.tsx`, `pages/pre-natal/idade-gestacional.tsx`, `pages/cardiologia/dor-toracica.tsx`. Shell: `pages/_app.tsx` (CSS globais + por-tela), `pages/_document.tsx` (PWA). API: `pages/api/v1/status.ts`.

🟢 **CI/CD:** `.github/workflows/ci.yml` — três jobs em cadeia: (1) lint+typecheck+testes em todo push; (2) contrato contra o build de produção com CSP ativa e Postgres efêmero; (3) deploy Vercel só em `main` com 1–2 verdes. Auto-deploy por push desligado (`vercel.json`: `git.deploymentEnabled=false`).

🟢 **Segurança de borda:** CSP sem terceiros só em produção (`next.config.ts`); `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`.

## Banco de dados (superficial)

🟢 Sem DDL, migrations nem ORM. `infra/database.ts` expõe um pool `pg` lazy consumido apenas pelo teste de saúde do status. O `reversa-data-master` faria a análise detalhada, mas o schema é vazio por design (a plataforma não persiste dado clínico).

## Testes

🟢 **33 arquivos** de teste. Vitest (unidade + integração jsdom + contrato) e Playwright (e2e + axe-core de acessibilidade). `fast-check` para property-based no domínio.

- **Unidade** (`tests/unit/`): domínio insulina (8), gestação (3), cardiopatia (6), interface (2).
- **Integração** (`tests/integration/interface/`): 8 telas/componentes (moldura, formulário, resultado, início, gestacao, cardiologia, provedor-tema, relator-de-erros).
- **Contrato** (`tests/contract/`): status da API, banco, cabeçalhos da plataforma.
- **Regressão** (`tests/regression/`): BUG-20260719-RHZ5.
- **E2E** (`e2e/`): `calculadora.spec.ts`, `plataforma.spec.ts`, `axe-baseline.json`.

🟢 Cobertura com threshold alto em `models/**` (config em `vitest.config.ts`).
