# Code-Spec Matrix — aps-inteligente

> Gerado pelo Reversa Writer em 2026-07-19.
> Por arquivo do legado: qual unit cobre o quê. 🟢 coberto · 🟡 parcial · n/a sem unit.
> Complementa `spec-impact-matrix.md` (impacto entre módulos, do Architect).

## Código de produção

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `models/insulina/calculadora.ts` | `models-insulina/` | 🟢 |
| `models/insulina/validacao.ts` | `models-insulina/` | 🟢 |
| `models/insulina/regra-inicio.ts` | `models-insulina/` | 🟢 |
| `models/insulina/regra-titulacao-basal.ts` | `models-insulina/` | 🟢 |
| `models/insulina/regra-intensificacao.ts` | `models-insulina/` | 🟢 |
| `models/insulina/fonte-clinica.ts` | `models-insulina/` | 🟢 |
| `models/insulina/tipos.ts` | `models-insulina/` | 🟢 |
| `interface/calculadora/calculadora-app.tsx` | `interface-calculadora/` | 🟢 |
| `interface/calculadora/formulario.tsx` | `interface-calculadora/` | 🟢 |
| `interface/calculadora/resultado.tsx` | `interface-calculadora/` | 🟢 |
| `interface/calculadora/tela.tsx` | `interface-calculadora/` | 🟢 |
| `interface/calculadora/preferencia-de-tema.ts` | `interface-calculadora/` | 🟢 |
| `interface/calculadora/relator-de-erros.ts` | `interface-calculadora/` | 🟢 |
| `interface/estilos/globais.css` | `interface-calculadora/` | 🟡 tokens citados; sem spec visual própria (design no projeto Claude Design) |
| `pages/_app.tsx` | `pages-next/` | 🟢 |
| `pages/_document.tsx` | `pages-next/` | 🟢 |
| `pages/index.tsx` | `pages-next/` | 🟢 |
| `pages/api/v1/index.js` | `pages-next/` | 🟡 vazio; coberto como lacuna (RF-04/T-04) |

## Testes

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `tests/unit/dominio/*` (7 suítes) | `models-insulina/` (TT-01..07) | 🟢 |
| `tests/integration/interface/*` (3 suítes) | `interface-calculadora/` (TT-01..03) | 🟢 |
| `tests/apoio/construtores.ts` | `models-insulina/` + `interface-calculadora/` | 🟢 builders compartilhados |
| `tests/integration/api/v1/index.js` | `pages-next/` | 🟡 vazio; lacuna declarada (TT-02) |

## Configuração e infra

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `next.config.ts` / `tsconfig.json` | `pages-next/` (design §Interface) | 🟢 |
| `vitest.config.ts` | `models-insulina/` (RNF cobertura 90%) | 🟢 |
| `eslint.config.mjs` / `.prettierrc*` | n/a | guardrails transversais; lacuna: regra de fronteira D-01 |
| `package.json` / `package-lock.json` | n/a | manifesto; scripts quebrados anotados em `inventory.md` |
| `infra/compose.yaml` | n/a | 🔴 vazio; sem unit até existir conteúdo |

## Cobertura estimada

🟢 **100% do código de produção ativo** (18/18 arquivos) tem unit correspondente; os 3 itens 🟡 são placeholders vazios ou artefatos com spec parcial declarada. Itens `n/a` são configuração transversal, cobertos pelos artefatos globais (`inventory.md`, `architecture.md`).
