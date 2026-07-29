# Code-Spec Matrix — aps-inteligente

> Atualizada na **re-extração 4 (2026-07-28)**, cobrindo **cinco domínios clínicos, um não
> clínico** e a plataforma guarda-chuva, mais a **camada dev-time** que a passagem anterior não
> conhecia.
> Por arquivo ou diretório do legado: qual unit cobre o quê. 🟢 coberto · 🟡 parcial · n/a sem
> unit.
> Complementa `spec-impact-matrix.md` (impacto entre módulos, do Architect).

## Domínio (`models/`)

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `models/insulina/{calculadora,validacao,regra-inicio,regra-titulacao-basal,regra-intensificacao,regra-metformina,fonte-clinica,tipos}.ts` | `models-insulina/` | 🟢 |
| `models/gestacao/{calculadora,datacao,datas,validacao,fonte-clinica,tipos}.ts` | `models-gestacao/` | 🟢 |
| `models/cardiopatia-isquemica/{calculadora,classificacao,probabilidade,conduta,validacao,fonte-clinica,tipos}.ts` | `models-cardiopatia-isquemica/` | 🟢 |
| `models/risco-cardiovascular/{calculadora,equacao,categoria,elegibilidade,validacao,fonte-clinica,tipos}.ts` | `models-risco-cardiovascular/` | 🟢 |
| 🆕 `models/puericultura/{calculadora,tipos,fonte-clinica,validacao,datas,idades,medidas,elegibilidade,padrao,classificacao}.ts` | `models-puericultura/` | 🟢 |
| 🆕 `models/puericultura/oms/{lms,leitura}.ts` + `oms/tabelas/*` (14 módulos gerados + `manifesto.json`) | `models-puericultura/` | 🟢 |
| 🆕 `models/puericultura/intergrowth/{equacoes,escore}.ts` | `models-puericultura/` | 🟢 |
| 🆕 `models/puericultura/consulta/{calculadora,tipos,selecao,registro,fonte-clinica}.ts` + `consulta/fichas/*` (10 fichas + `campos` + `indice`) | `models-puericultura-consulta/` | 🟢 |
| 🆕 `models/contribuicao/{br-code,campo,crc16,validacao,tipos}.ts` | `models-contribuicao/` | 🟢 |

> **Duas fachadas sob uma unit** — arranjo inédito na plataforma. `models/puericultura/` tem
> `CalculadoraCrescimentoInfantil` e, no submódulo `consulta/`,
> `RegistroDeConsultaPuericultura`. As duas compartilham tipos, datas e fonte clínica, e por
> isso recebem units de spec distintas sob a mesma pasta de código (ADR 0017).

## Interface (`interface/`)

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `interface/comum/moldura.tsx` (016: `comInicio`; 021: coluna do corpo) | `interface-comum/` | 🟢 |
| `interface/calculadora/*` (16 arquivos) | `interface-calculadora/` | 🟢 |
| `interface/cardiologia/{tela,app,formulario,resultado,referencias}.tsx` | `interface-cardiologia/` | 🟢 |
| `interface/risco-cardiovascular/{tela,app,formulario,resultado,proveniencia}.tsx` | `interface-risco-cardiovascular/` | 🟢 |
| `interface/gestacao/{tela,app,formulario,resultado}.tsx` | `interface-gestacao/` | 🟢 |
| 🆕 `interface/puericultura/{tela,app,formulario,resultado,proveniencia}.tsx` | `interface-puericultura/` | 🟢 |
| 🆕 `interface/puericultura/consulta/*` (9 arquivos, incl. `formatar-registro.ts`) | `interface-puericultura-consulta/` | 🟢 |
| 🆕 `interface/contribuicao/{bloco-de-apoio,painel,acao-copiar,codigo-qr}.tsx` + `beneficiario.ts` | `interface-contribuicao/` | 🟢 |
| `interface/inicio/{catalogo.ts,tela.tsx,icones.tsx}` (quatro seções, seis fichas) | `interface-inicio/` | 🟢 |
| `interface/estilos/*.css` (**nove** folhas, incl. `moldura.css`) | `interface-estilos/` | 🟢 |

> Nota mantida: `preferencia-de-tema.ts` fica em `interface/calculadora/` e é consumido pela
> Moldura — acoplamento candidato a realocação, coberto pelas duas units.

## Shell e infraestrutura

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `pages/_app.tsx` `pages/_document.tsx` `pages/index.tsx` | `pages-next/` | 🟢 |
| `pages/dm2/insulina.tsx` `pages/pre-natal/idade-gestacional.tsx` `pages/cardiologia/{dor-toracica,risco-cardiovascular}.tsx` 🆕 `pages/puericultura/{crescimento,consulta}.tsx` | `pages-next/` | 🟢 |
| `pages/api/v1/status.ts` (handler `async`, seis chaves) | `pages-api-v1-status/` | 🟢 |
| `infra/database.ts` 🆕 `infra/saude.ts` `infra/compose.yaml` | `infra/` | 🟢 |

## Camada dev-time (`scripts/`) — nova nesta passagem

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| 🆕 `scripts/{baixar-tabelas-oms,gerar-tabelas-oms}.mts` + `scripts/oms/*` | `scripts/` | 🟢 |
| 🆕 `scripts/congelar-casos-oraculo.mts` + `scripts/oraculo/*` | `scripts/` | 🟢 |
| 🆕 `scripts/congelar-fichas-caderneta.mts` | `scripts/` | 🟢 |
| 🆕 `scripts/inventariar-textos.mts` + `scripts/textos/*` | `scripts/` | 🟡 (`textos/classes/interface.mts` em 684 linhas, dívida aberta) |
| 🆕 `scripts/conferir-producao.mts` | `scripts/` | 🟢 |
| 🆕 `scripts/lib/*` | `scripts/` | 🟢 |

## Testes

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `tests/unit/dominio/*` | `models-insulina/` | 🟢 |
| `tests/unit/dominio-gestacao/*` | `models-gestacao/` | 🟢 |
| `tests/unit/dominio-cardiopatia/*` | `models-cardiopatia-isquemica/` | 🟢 |
| `tests/unit/dominio-risco-cardiovascular/*` | `models-risco-cardiovascular/` | 🟢 |
| 🆕 `tests/unit/dominio-puericultura/*` (12 arquivos, 201 testes) | `models-puericultura/` | 🟢 |
| 🆕 `tests/unit/dominio-puericultura/consulta-*` (5 arquivos, 54 testes) | `models-puericultura-consulta/` | 🟢 |
| 🆕 `tests/unit/dominio-contribuicao/*` (vetor conhecido + `fast-check`) | `models-contribuicao/` | 🟢 |
| 🆕 `tests/unit/textos/*` (7 verificadores da norma de redação) | `scripts/` + `interface-*` | 🟢 |
| `tests/unit/infra/*` | `infra/` | 🟢 |
| `tests/integration/interface/*` (incl. 🆕 `puericultura`, `consulta-puericultura`) | units de interface | 🟢 |
| `tests/apoio/*` (construtores, oráculos congelados, linha de base de citação, inventário) | `scripts/` + units de domínio | 🟢 |
| `e2e/*` + `axe-baseline.json` | `interface-*` / `pages-next/` | 🟢 |
| suíte de contrato de `/api/v1/status`, **com caso negativo** | `pages-api-v1-status/` | 🟢 |

> **Suíte aferida em 2026-07-28:** 816 testes em 67 arquivos, 8,6 s. A cifra encerra a dívida
> **L-11**, que arrastava "37 arquivos" desde a feature 018.

## Configuração e infra transversal

| Arquivo do legado | Unit correspondente | Cobertura |
|---------|---------------------|-----------|
| `next.config.ts` / `tsconfig.json` | `pages-next/` | 🟢 |
| `vitest.config.ts` | units de domínio | 🟢 |
| `eslint.config.mjs` / `.prettierrc*` | n/a | guardrails transversais |
| `package.json` / lockfile (🆕 `react-qr-code@2.2.0`) | n/a | manifesto; versão lida no status |
| `docs/redacao.md` | `scripts/` + `interface-*` | 🟢 (norma, ADR 0019) |
| `public/` (logos, tiles, manifesto) | `interface-comum/` + `pages-next/` | 🟢 |
| `referencias/` (fontes fora do git) | `scripts/` | 🟡 por natureza — mitigado por `sha256` no manifesto |

## Cobertura estimada

🟢 **100% do código de produção** tem unit correspondente, agora incluindo os dois domínios
novos, o unit não clínico e as três telas novas. A **camada dev-time** entrou pela primeira vez
na matriz, com uma única cobertura 🟡: `scripts/textos/classes/interface.mts`, em 684 linhas,
acima do teto de 400 que a plataforma se impõe, e fora da exceção nominal que o README concede
às tabelas geradas.

Itens `n/a` são configuração transversal, cobertos pelos artefatos globais (`inventory.md`,
`architecture.md`, `dependencies.md`).

**Lacuna 🔴 declarada:** literal montado por interpolação em tempo de execução fica fora do
inventário textual por desenho do extrator, e o congelamento não o cobre. Alcança as recusas de
`elegibilidade.ts` e o aviso de `medidas.ts`.
