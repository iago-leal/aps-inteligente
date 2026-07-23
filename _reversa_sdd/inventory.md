# Inventário — aps-inteligente

> Gerado pelo Reversa Scout em 2026-07-19 · **Re-extração 3 em 2026-07-23** (absorve as features 011–014 sobre a base 001–010).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Visão geral

🟢 **aps-inteligente** é um website Next.js (Pages Router) dedicado à prática médica na APS (Atenção Primária à Saúde), concebido como **plataforma guarda-chuva** de calculadoras clínicas, cada uma ancorada em uma fonte clínica citável. O cálculo é **100% client-side**: nenhum dado clínico sai do navegador (ADR 0002).

🟢 A re-extração 2 (23/07) refletia **três calculadoras**. Esta 3ª passagem absorve as features 011–014: uma **quarta calculadora** (risco cardiovascular por Pooled Cohort Equations, feature 014), o **cabeçalho refatorado** (toggle de tema icônico e retorno à home; features 011/013) e o **domínio próprio `apsinteligente.app`** (adendo 012, infra/DNS). O motor das três calculadoras anteriores permanece intocado.

🟢 As quatro calculadoras e suas fontes (README, catálogo tipado em `interface/inicio/catalogo.ts`):

| Seção | Calculadora | Rota | Fonte clínica | Domínio |
|---|---|---|---|---|
| Diabetes Mellitus tipo 2 | Insulina (início, titulação, intensificação) | `/dm2/insulina` | Guia Rápido DM — SMS-Rio, 2023 | `models/insulina/` |
| Pré-natal | Idade gestacional (DUM e/ou ultrassom) | `/pre-natal/idade-gestacional` | Guia Rápido Pré-Natal — SMS-Rio, 2025 | `models/gestacao/` |
| Cardiologia | Dor torácica e probabilidade pré-teste de DAC | `/cardiologia/dor-toracica` | TeleCondutas Cardiopatia Isquêmica — TelessaúdeRS-UFRGS, 2017 | `models/cardiopatia-isquemica/` |
| Cardiologia | Risco cardiovascular em 10 anos (Pooled Cohort Equations) | `/cardiologia/risco-cardiovascular` | ACC/AHA Pooled Cohort Equations, 2013 (feature 014) | `models/risco-cardiovascular/` |

## Arquitetura em camadas

🟢 Separação estrita, verificável por `git diff` vazio entre camadas nas features de apresentação:

- **Domínio** (`models/`) — lógica pura, determinista, sem React nem framework. Erros como valores; exceção só para bug de invariante (ADR 0004). Toda saída carrega `ReferenciaClinica` (ADR 0001).
- **Interface** (`interface/`) — componentes React; a `Moldura` comum é o esqueleto compartilhado das telas (cabeçalho refatorado nas features 011/013).
- **Shell/rotas** (`pages/`) — Next.js Pages Router; uma rota por calculadora, home na raiz, `_app`/`_document`.
- **Infraestrutura** (`infra/`) — pool `pg` e compose do PostgreSQL local; toca só o status.

## Estrutura de pastas

```
aps-inteligente/
├── models/                          # DOMÍNIO puro (4 calculadoras, ~3.133 LOC .ts)
│   ├── insulina/                    # DM2 — 8 arq., 1.352 LOC (intocado)
│   │   ├── calculadora.ts · regra-inicio.ts · regra-intensificacao.ts
│   │   ├── regra-titulacao-basal.ts · regra-metformina.ts (feature 005)
│   │   ├── fonte-clinica.ts · tipos.ts · validacao.ts
│   ├── gestacao/                    # Idade gestacional — 6 arq., 609 LOC (feature 007, intocado)
│   │   ├── calculadora.ts · datacao.ts · datas.ts · fonte-clinica.ts · tipos.ts · validacao.ts
│   ├── cardiopatia-isquemica/       # Dor torácica/pré-teste — 7 arq., 572 LOC (feature 010, intocado)
│   │   ├── calculadora.ts · classificacao.ts · probabilidade.ts · conduta.ts
│   │   ├── fonte-clinica.ts · tipos.ts · validacao.ts
│   └── risco-cardiovascular/        # 🆕 Risco CV 10 anos (PCE) — 7 arq., 600 LOC (feature 014)
│       ├── calculadora.ts (53)      # Fachada/orquestração
│       ├── equacao.ts (56)          # Pooled Cohort Equations (ln, coeficientes por sexo/raça)
│       ├── categoria.ts (12)        # Faixa de risco (baixo/limítrofe/intermediário/alto)
│       ├── elegibilidade.ts (39)    # Faixa etária/parâmetros elegíveis à equação
│       ├── fonte-clinica.ts (168) · tipos.ts (109) · validacao.ts (163)
├── interface/                       # APRESENTAÇÃO React (~3.844 LOC)
│   ├── comum/moldura.tsx            # Moldura compartilhada — cabeçalho refatorado (011/013)
│   ├── calculadora/                 # Tela da insulina — 16 arq. (intocado)
│   ├── gestacao/                    # Tela da IG — 4 arq. (feature 007)
│   ├── cardiologia/                 # Tela da dor torácica — 5 arq. (feature 010)
│   ├── risco-cardiovascular/        # 🆕 Tela do risco CV — 5 arq., 537 LOC (feature 014)
│   │   ├── tela.tsx · app.tsx · formulario.tsx · resultado.tsx
│   │   └── proveniencia.tsx         # Bloco de proveniência da fonte (PCE)
│   ├── inicio/                      # Home por seções — 3 arq. (features 007/008 + cartão de risco 014)
│   │   ├── catalogo.ts · icones.tsx · tela.tsx
│   └── estilos/                     # CSS sobre tokens Primer — 5 arq., 723 LOC
│       ├── globais.css (364) · inicio.css (188) · cabecalho.css (116, consolidado 011/013)
│       ├── cardiologia.css (47) · risco-cardiovascular.css (8)
├── pages/                           # SHELL Next.js (Pages Router)
│   ├── index.tsx · _app.tsx · _document.tsx (PWA, feature 009)
│   ├── dm2/insulina.tsx
│   ├── pre-natal/idade-gestacional.tsx
│   ├── cardiologia/dor-toracica.tsx
│   ├── cardiologia/risco-cardiovascular.tsx   # 🆕 rota da feature 014
│   └── api/v1/status.ts             # GET /api/v1/status (feature 002)
├── infra/                           # INFRAESTRUTURA de dados (feature 003)
│   ├── database.ts · compose.yaml   # postgres:17.10-alpine local
├── public/                          # Ativos PWA/logo (feature 009) — same-origin
├── referencias/                     # PDFs das fontes clínicas (fora do git, MD-0008)
├── tests/ · e2e/                    # unidade + integração + contrato + regressão + Playwright/axe
├── .github/workflows/ci.yml         # CI: verificação → contrato → deploy
└── next.config.ts · vercel.json · tsconfig.json · eslint.config.mjs · *.config.ts
```

## Tecnologias

🟢 **Linguagem primária:** TypeScript (110 arquivos `.ts`/`.tsx` em código de aplicação e testes). CSS (5, sobre tokens Primer). Node `>=24` (campo `engines`).

🟢 **Framework:** Next.js 16.2.10 (Pages Router, Turbopack), React 19.2.4. Sistema de design **GitHub Primer** (`@primer/react` 38.33.0, `@primer/octicons-react` 19.29.2, `@primer/primitives` 11.9.0). TypeScript 6.0.3.

🟢 **Dados:** `pg` 8.22.0 — único uso é o healthcheck em `/api/v1/status`; produção via integração **Neon** (Vercel Marketplace), local via compose. Nenhum dado clínico persiste (ADR 0002/0008).

🟢 **Domínio próprio (adendo 012):** `apsinteligente.app` no ar (apex → www 308); `*.vercel.app` segue válido.

## Pontos de entrada

🟢 Home: `pages/index.tsx`. Rotas de calculadora: `pages/dm2/insulina.tsx`, `pages/pre-natal/idade-gestacional.tsx`, `pages/cardiologia/dor-toracica.tsx`, `pages/cardiologia/risco-cardiovascular.tsx` (🆕 feature 014). Shell: `pages/_app.tsx` (CSS globais + por-tela), `pages/_document.tsx` (PWA). API: `pages/api/v1/status.ts`.

🟢 **CI/CD:** `.github/workflows/ci.yml` — três jobs em cadeia: (1) lint+typecheck+testes em todo push; (2) contrato contra o build de produção com CSP ativa e Postgres efêmero; (3) deploy Vercel só em `main` com 1–2 verdes. Auto-deploy por push desligado (`vercel.json`: `git.deploymentEnabled=false`).

🟢 **Segurança de borda:** CSP sem terceiros só em produção (`next.config.ts`); `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`.

## Banco de dados (superficial)

🟢 Sem DDL, migrations nem ORM. `infra/database.ts` expõe um pool `pg` lazy consumido apenas pelo teste de saúde do status. O schema é vazio por design (a plataforma não persiste dado clínico).

## Testes

🟢 **37 arquivos** de teste. Vitest (unidade + integração jsdom + contrato) e Playwright (e2e + axe-core de acessibilidade). `fast-check` para property-based no domínio.

- **Unidade** (`tests/unit/`): domínio insulina (8), gestação (3), cardiopatia (6), **risco-cardiovascular (2: `equacao`, `invariantes`)**, interface (2).
- **Integração** (`tests/integration/interface/`): 9 telas/componentes (moldura, formulário, resultado, início, gestacao, cardiologia, **risco-cardiovascular**, provedor-tema, relator-de-erros).
- **Contrato** (`tests/contract/`): status da API, banco, cabeçalhos da plataforma.
- **Regressão** (`tests/regression/`): BUG-20260719-RHZ5.
- **E2E** (`e2e/`): `cabecalho.spec.ts` (guardas geométricas das features 011/013), `calculadora.spec.ts`, `plataforma.spec.ts`, `axe-baseline.json`.

🟢 Cobertura com threshold alto em `models/**` (config em `vitest.config.ts`).
