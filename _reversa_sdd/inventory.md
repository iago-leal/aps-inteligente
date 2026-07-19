# Inventário — aps-inteligente

> Gerado pelo Reversa Scout em 2026-07-19.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Visão geral

🟢 **aps-inteligente** é um website Next.js dedicado à prática médica na APS (Atenção Primária à Saúde), concebido como plataforma guarda-chuva cuja primeira ferramenta é uma **calculadora de insulina para DM2, 100% client-side** (descrição do `package.json`).

🟢 O repositório passou por uma **refundação** (commit `26f3bc9`): apenas o domínio da calculadora de insulina e seus testes foram preservados; a estrutura atual (Next.js, `models/`, `interface/`, `pages/`) é recente e parte dela ainda não está commitada.

## Estrutura de pastas

```
aps-inteligente/
├── models/
│   └── insulina/            # Domínio puro da calculadora (7 arquivos .ts, ~1.080 LOC)
│       ├── calculadora.ts           # Fachada/orquestração do cálculo (156 LOC)
│       ├── fonte-clinica.ts         # Referências clínicas (108 LOC)
│       ├── regra-inicio.ts          # Regra de início de insulinização (69 LOC)
│       ├── regra-intensificacao.ts  # Regra de intensificação (240 LOC)
│       ├── regra-titulacao-basal.ts # Regra de titulação basal (173 LOC)
│       ├── tipos.ts                 # Tipos e contratos do domínio (186 LOC)
│       └── validacao.ts             # Validação de entrada (148 LOC)
├── interface/
│   ├── calculadora/         # Componentes React da calculadora (~1.005 LOC)
│   │   ├── calculadora-app.tsx      # Componente raiz (80 LOC)
│   │   ├── formulario.tsx           # Formulário de entrada (532 LOC) ⚠️ > 400 linhas
│   │   ├── resultado.tsx            # Exibição do resultado (291 LOC)
│   │   ├── tela.tsx                 # Composição da tela (43 LOC)
│   │   ├── preferencia-de-tema.ts   # Tema claro/escuro (39 LOC)
│   │   └── relator-de-erros.ts      # Relato de erros da UI (20 LOC)
│   └── estilos/
│       └── globais.css              # Estilos globais (699 LOC)
├── pages/                   # Next.js Pages Router
│   ├── _app.tsx                     # Entry point da aplicação (27 LOC)
│   ├── _document.tsx                # Documento HTML base (13 LOC)
│   ├── index.tsx                    # Página inicial (18 LOC)
│   └── api/v1/index.js              # 🔴 VAZIO — placeholder de API
├── tests/
│   ├── apoio/construtores.ts        # Builders de teste (134 LOC)
│   ├── unit/dominio/                # 7 suítes de unidade do domínio (~863 LOC)
│   ├── integration/interface/       # 3 suítes de integração da UI (~388 LOC)
│   └── integration/api/v1/index.js  # 🔴 VAZIO — placeholder
├── infra/
│   └── compose.yaml                 # 🔴 VAZIO — placeholder de infraestrutura
├── next.config.ts · tsconfig.json · vitest.config.ts · eslint.config.mjs
└── package.json · package-lock.json
```

🟡 Arquitetura em camadas com aliases de path (`models/*`, `interface/*` no `tsconfig.json` e no `vitest.config.ts`): domínio puro em `models/insulina/`, apresentação em `interface/`, shell/roteamento em `pages/`. O domínio não importa nada de React ou Next (a confirmar pelo Arqueólogo).

## Linguagens

| Linguagem | Extensões | Arquivos | Observação |
|---|---|---|---|
| TypeScript | `.ts` | 19 | Domínio, utilitários de UI, testes de unidade, configs |
| TypeScript (React) | `.tsx` | 10 | Componentes, páginas, testes de integração |
| JavaScript | `.js`, `.mjs` | 3 | 2 placeholders vazios + `eslint.config.mjs` |
| CSS | `.css` | 1 | `interface/estilos/globais.css` |

**Linguagem principal:** TypeScript (strict mode habilitado).

## Tecnologias e frameworks

- 🟢 **Next.js 16.2.10** (Pages Router; Turbopack com `root` fixado em `next.config.ts`)
- 🟢 **React 19.2.4** / react-dom 19.2.4
- 🟢 **TypeScript 6.0.3** (`strict: true`, `noEmit`)
- 🟢 **Vitest 4.1.10** + Testing Library + jsdom + **fast-check 4.9.0** (property-based testing)
- 🟢 **Playwright 1.61.1** + @axe-core/playwright (acessibilidade) — 🔴 sem `playwright.config.*` no repo
- 🟢 **ESLint 9** (flat config) + eslint-config-next + **Prettier 3**
- 🟢 Node **>= 24** (campo `engines`)
- 🟢 Gerenciador de pacotes: **npm** (`package-lock.json` presente)

## Pontos de entrada

| Arquivo | Tipo |
|---|---|
| `pages/_app.tsx` | Entry point da aplicação Next.js |
| `pages/index.tsx` | Página inicial (monta a calculadora) |
| `pages/api/v1/index.js` | 🔴 Endpoint de API vazio (placeholder) |

## Scripts do `package.json`

| Script | Comando | Estado |
|---|---|---|
| `dev` / `build` / `start` | `next dev` / `next build` / `next start` | 🟢 |
| `lint` / `typecheck` | `eslint` / `tsc --noEmit` | 🟢 |
| `test` / `test:watch` / `test:coverage` | `vitest` | 🟢 |
| `test:api` | `vitest run --config vitest.api.config.ts` | 🔴 **quebrado** — `vitest.api.config.ts` não existe |
| `test:e2e` | `playwright test` | 🔴 **incompleto** — sem config nem specs e2e |
| `format` / `format:check` | `prettier` | 🟢 |

## CI/CD, Docker e configuração

- 🔴 **CI/CD ausente** — não há `.github/workflows/`, Jenkinsfile ou equivalente.
- 🔴 `infra/compose.yaml` existe porém **vazio**.
- 🟢 Deploy alvo: **Vercel** (`.vercel/project.json` presente; `.env.local` contém apenas `VERCEL_OIDC_TOKEN`).
- 🟢 `.env` presente (vazio de chaves relevantes); sem `.env.example`.

## Banco de dados

🟢 **Ausente por design** — a calculadora é 100% client-side. Nenhum DDL, migration ou ORM encontrado. O agente Data Master não se aplica.

## Cobertura de testes

- 🟢 Framework: **Vitest** (ambiente `node`, jsdom para UI via Testing Library).
- 🟢 13 arquivos de teste ativos: 7 de unidade (domínio), 3 de integração (interface), 1 pasta de apoio, 2 placeholders vazios.
- 🟢 Threshold de cobertura exigido no domínio (`models/**`): **90%** em linhas, statements, funções e branches (`vitest.config.ts`, referenciando "RNF-04 do motor; categoria Produto").
- 🟡 Proporção testes/código do domínio ≈ 0,8:1 em LOC — cobertura provavelmente alta (a confirmar com `npm run test:coverage`).

## Sinais de atenção para os próximos agentes

1. 🔴 Placeholders vazios: `pages/api/v1/index.js`, `tests/integration/api/v1/index.js`, `infra/compose.yaml` — indicam intenção futura de API v1 e infraestrutura, ainda não realizada.
2. 🔴 Scripts `test:api` e `test:e2e` referenciam configs inexistentes.
3. ⚠️ `formulario.tsx` (532 LOC) e `globais.css` (699 LOC) ultrapassam o limite de 400 linhas por arquivo adotado pelo mantenedor.
4. 🟡 Git status mostra deleções de `src/dominio/insulina/` e `src/interface/calculadora/` não commitadas — a migração `src/` → `models/` + `interface/` está em andamento no working tree.
