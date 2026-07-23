# Code-Spec Matrix — aps-inteligente

> Atualizado na re-extração 2 (2026-07-23), cobrindo os três domínios e a plataforma guarda-chuva.
> Por arquivo/diretório do legado: qual unit cobre o quê. 🟢 coberto · 🟡 parcial · n/a sem unit.
> Complementa `spec-impact-matrix.md` (impacto entre módulos, do Architect).

## Domínio (`models/`)

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `models/insulina/{calculadora,validacao,regra-inicio,regra-titulacao-basal,regra-intensificacao,fonte-clinica,tipos}.ts` | `models-insulina/` | 🟢 |
| `models/gestacao/{calculadora,datacao,datas,validacao,fonte-clinica,tipos}.ts` | `models-gestacao/` | 🟢 |
| `models/cardiopatia-isquemica/{calculadora,classificacao,probabilidade,conduta,validacao,fonte-clinica,tipos}.ts` | `models-cardiopatia-isquemica/` | 🟢 |

## Interface (`interface/`)

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `interface/comum/moldura.tsx` | `interface-comum/` | 🟢 |
| `interface/calculadora/*` (16 arquivos: app, tela, formulario, resultado, esquema-atual, glicemias, antidiabeticos, validacao-campos, agrupar-recomendacoes, formatar-plano, rotulos, area-de-transferencia, preferencia-de-tema, provedor-tema, relator-de-erros, erro-de-campo) | `interface-calculadora/` | 🟢 |
| `interface/cardiologia/{tela,app,formulario,resultado,referencias}.tsx` | `interface-cardiologia/` | 🟢 |
| `interface/gestacao/{tela,app,formulario,resultado}.tsx` | `interface-gestacao/` | 🟢 |
| `interface/inicio/{catalogo.ts,tela.tsx,icones.tsx}` | `interface-inicio/` | 🟢 |
| `interface/estilos/{globais,cabecalho,inicio,cardiologia}.css` | `interface-estilos/` | 🟢 |

> Nota: `preferencia-de-tema.ts` fica em `interface/calculadora/` mas é consumido por `interface-comum` (Moldura) — acoplamento candidato a realocação, coberto pelas duas units.

## Shell e infraestrutura

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `pages/_app.tsx` `pages/_document.tsx` `pages/index.tsx` | `pages-next/` | 🟢 |
| `pages/dm2/insulina.tsx` `pages/pre-natal/idade-gestacional.tsx` `pages/cardiologia/dor-toracica.tsx` | `pages-next/` | 🟢 |
| `pages/api/v1/status.ts` | `pages-api-v1-status/` | 🟢 |
| `infra/database.ts` `infra/compose.yaml` | `infra/` | 🟢 |

## Testes

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `tests/unit/dominio/*` | `models-insulina/` | 🟢 |
| `tests/unit/dominio-gestacao/*` | `models-gestacao/` | 🟢 |
| `tests/unit/dominio-cardiopatia/*` (property-based + oráculo das 24 células) | `models-cardiopatia-isquemica/` | 🟢 |
| `tests/integration/interface/*` (insulina, gestacao, inicio, cardiologia, moldura) | units de interface correspondentes | 🟢 |
| `tests/apoio/construtores.ts` | builders compartilhados | 🟢 |
| `e2e/*` (calculadora, plataforma) + `axe-baseline.json` | `interface-*` / `pages-next/` | 🟢 |
| suíte de contrato (`/api/v1/status`) | `pages-api-v1-status/` | 🟢 |

## Configuração e infra transversal

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `next.config.ts` / `tsconfig.json` | `pages-next/` (design §Interface) | 🟢 |
| `vitest.config.ts` | units de domínio (RNF cobertura) | 🟢 |
| `eslint.config.mjs` / `.prettierrc*` | n/a | guardrails transversais |
| `package.json` / lockfile | n/a | manifesto (versão lida em `/api/v1/status`) |
| `public/` (logos, tiles, manifest.webmanifest) | `interface-comum/` (logo) + `pages-next/` (PWA) | 🟢 |

## Cobertura estimada

🟢 **100% do código de produção** dos três domínios e da plataforma tem unit correspondente. As lacunas 🔴 da extração 1 (API `/api/v1` vazia, `infra/compose.yaml` vazio, tipografia IBM Plex) foram **resolvidas** pelas features 002/003/004: a API está realizada, a infra tem conteúdo, e a tipografia migrou para a pilha do Primer. Itens `n/a` são configuração transversal, cobertos pelos artefatos globais (`inventory.md`, `architecture.md`).
