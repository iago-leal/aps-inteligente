# Code-Spec Matrix — aps-inteligente

> Atualizado na re-extração 3 (2026-07-23), cobrindo os quatro domínios e a plataforma guarda-chuva.
> Por arquivo/diretório do legado: qual unit cobre o quê. 🟢 coberto · 🟡 parcial · n/a sem unit.
> Complementa `spec-impact-matrix.md` (impacto entre módulos, do Architect).

## Domínio (`models/`)

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `models/insulina/{calculadora,validacao,regra-inicio,regra-titulacao-basal,regra-intensificacao,regra-metformina,fonte-clinica,tipos}.ts` | `models-insulina/` | 🟢 |
| `models/gestacao/{calculadora,datacao,datas,validacao,fonte-clinica,tipos}.ts` | `models-gestacao/` | 🟢 |
| `models/cardiopatia-isquemica/{calculadora,classificacao,probabilidade,conduta,validacao,fonte-clinica,tipos}.ts` | `models-cardiopatia-isquemica/` | 🟢 |
| `models/risco-cardiovascular/{calculadora,equacao,categoria,elegibilidade,validacao,fonte-clinica,tipos}.ts` | `models-risco-cardiovascular/` | 🟢 |

## Interface (`interface/`)

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `interface/comum/moldura.tsx` (cabeçalho refatorado 011/013) | `interface-comum/` | 🟢 |
| `interface/calculadora/*` (16 arquivos: app, tela, formulario, resultado, esquema-atual, glicemias, antidiabeticos, validacao-campos, agrupar-recomendacoes, formatar-plano, rotulos, area-de-transferencia, preferencia-de-tema, provedor-tema, relator-de-erros, erro-de-campo) | `interface-calculadora/` | 🟢 |
| `interface/cardiologia/{tela,app,formulario,resultado,referencias}.tsx` | `interface-cardiologia/` | 🟢 |
| `interface/risco-cardiovascular/{tela,app,formulario,resultado,proveniencia}.tsx` | `interface-risco-cardiovascular/` | 🟢 |
| `interface/gestacao/{tela,app,formulario,resultado}.tsx` | `interface-gestacao/` | 🟢 |
| `interface/inicio/{catalogo.ts,tela.tsx,icones.tsx}` (cardiologia com 2 fichas) | `interface-inicio/` | 🟢 |
| `interface/estilos/{globais,cabecalho,inicio,cardiologia,risco-cardiovascular}.css` | `interface-estilos/` | 🟢 |

> Nota: `preferencia-de-tema.ts` fica em `interface/calculadora/` mas é consumido por `interface-comum` (Moldura) — acoplamento candidato a realocação, coberto pelas duas units.

## Shell e infraestrutura

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `pages/_app.tsx` `pages/_document.tsx` `pages/index.tsx` | `pages-next/` | 🟢 |
| `pages/dm2/insulina.tsx` `pages/pre-natal/idade-gestacional.tsx` `pages/cardiologia/dor-toracica.tsx` `pages/cardiologia/risco-cardiovascular.tsx` | `pages-next/` | 🟢 |
| `pages/api/v1/status.ts` | `pages-api-v1-status/` | 🟢 |
| `infra/database.ts` `infra/compose.yaml` | `infra/` | 🟢 |

## Testes

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `tests/unit/dominio/*` | `models-insulina/` | 🟢 |
| `tests/unit/dominio-gestacao/*` | `models-gestacao/` | 🟢 |
| `tests/unit/dominio-cardiopatia/*` (property-based + oráculo das 24 células) | `models-cardiopatia-isquemica/` | 🟢 |
| `tests/unit/dominio-risco-cardiovascular/*` (`equacao`, `invariantes`) | `models-risco-cardiovascular/` | 🟢 |
| `tests/integration/interface/*` (insulina, gestacao, inicio, cardiologia, risco-cardiovascular, moldura) | units de interface correspondentes | 🟢 |
| `tests/apoio/construtores.ts` | builders compartilhados | 🟢 |
| `e2e/*` (cabecalho, calculadora, plataforma) + `axe-baseline.json` | `interface-*` / `pages-next/` | 🟢 |
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

🟢 **100% do código de produção** dos quatro domínios e da plataforma tem unit correspondente. As lacunas 🔴 da extração 1 foram resolvidas nas re-extrações anteriores; nesta 3ª passagem, o novo domínio (feature 014) chega com unit própria (`models-risco-cardiovascular/`, `interface-risco-cardiovascular/`) e a dívida amarela de `globais.css` (teto de 400) foi encerrada pela consolidação do cabeçalho (011/013). Itens `n/a` são configuração transversal, cobertos pelos artefatos globais (`inventory.md`, `architecture.md`).
