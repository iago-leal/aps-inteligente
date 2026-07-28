# Inventário — aps-inteligente

> Gerado pelo Reversa Scout em 2026-07-19 · **Re-extração 4 em 2026-07-28** (absorve as features 015–022 sobre a base 001–014).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Visão geral

🟢 **aps-inteligente** é um website Next.js (Pages Router) dedicado à prática médica na APS (Atenção Primária à Saúde), concebido como **plataforma guarda-chuva** de calculadoras clínicas, cada uma ancorada em uma fonte clínica citável. O cálculo é **100% client-side**: nenhum dado clínico sai do navegador (ADR 0002).

🟢 A re-extração 3 (23/07) refletia **quatro calculadoras** e quatro domínios, todos clínicos. Esta 4ª passagem absorve as features **015–022** e encontra um sistema que mudou de forma, não só de tamanho. Quatro deltas estruturais, cada um sem precedente na base anterior:

1. **Quinto domínio clínico** — `models/puericultura` (feature 017): escores z de crescimento infantil por LMS, com o primeiro **acervo tabular embarcado** da plataforma (14 módulos gerados, 376 kB, com procedência `sha256`) e um **oráculo congelado** que julga o motor com números que não vieram dele.
2. **Duas fachadas sob uma unit** — o submódulo `models/puericultura/consulta` (feature 020) acrescenta `RegistroDeConsultaPuericultura.montar` ao lado de `CalculadoraCrescimentoInfantil.avaliar`. É também a primeira saída do produto que **não é um número**, mas texto SOAP para colar no prontuário.
3. **Primeiro unit não clínico** — `models/contribuicao` (feature 019): BR Code PIX estático e CRC16, isento por escrito de fonte clínica única, `ReferenciaClinica` e catálogo congelado (`MD-0022`), conservando os demais invariantes da família.
4. **Camada dev-time** — `scripts/**` (features 017–020): quatro geradores idempotentes que não entram no bundle e não são importados por `models/`, `interface/` nem `pages/`.

🟢 Some-se a **inversão da rota de status** (feature 022): `GET /api/v1/status` deixou de ser handler síncrono sem dependência e passou a consultar o banco de verdade, devolvendo seis chaves. O motor das quatro calculadoras anteriores permanece intocado.

🟢 As seis calculadoras e suas fontes (`interface/inicio/catalogo.ts`, fonte única e congelada):

| Seção | Calculadora | Rota | Fonte clínica | Domínio |
|---|---|---|---|---|
| Diabetes Mellitus tipo 2 | Insulina (início, titulação, intensificação) | `/dm2/insulina` | Guia Rápido DM — SMS-Rio, 2023 | `models/insulina/` |
| Pré-natal | Idade gestacional (DUM e/ou ultrassom) | `/pre-natal/idade-gestacional` | Guia Rápido Pré-Natal — SMS-Rio, 2025 | `models/gestacao/` |
| Cardiologia | Dor torácica e probabilidade pré-teste de DAC | `/cardiologia/dor-toracica` | TeleCondutas Cardiopatia Isquêmica — TelessaúdeRS-UFRGS, 2017 | `models/cardiopatia-isquemica/` |
| Cardiologia | Risco cardiovascular em 10 anos (PCE) | `/cardiologia/risco-cardiovascular` | ACC/AHA Pooled Cohort Equations, 2013 | `models/risco-cardiovascular/` |
| Puericultura | 🆕 Avaliação do crescimento infantil (escores z) | `/puericultura/crescimento` | Caderneta da Criança — MS, 2.ª ed., 2020 (OMS + INTERGROWTH-21st) | `models/puericultura/` |
| Puericultura | 🆕 Ficha de consulta em SOAP | `/puericultura/consulta` | Caderneta da Criança — MS, 2.ª ed., 2020 (pp. 66–75) | `models/puericultura/consulta/` |

🟢 Fora do catálogo, e por decisão explícita: o **bloco de apoio via PIX** na home (feature 019) fica **fora do `map` do `CATALOGO`**, porque o catálogo é fonte única de calculadoras e, desde a feature 018, oráculo da descrição da plataforma.

## Arquitetura em camadas

🟢 Separação estrita, verificável por `git diff` vazio entre camadas nas features de apresentação, e agora **verificada por teste** no quinto domínio (`invariantes.test.ts` varre `models/puericultura/**` e falha se algum arquivo importar de fora, mencionar React/Next/Primer ou ler o relógio):

- **Domínio** (`models/`) — lógica pura, determinista, sem React nem framework. Erros como valores; exceção só para bug de invariante (ADR 0004). Toda saída de domínio **clínico** carrega `ReferenciaClinica` (ADR 0001); `models/contribuicao` é isento por `MD-0022`.
- **Interface** (`interface/`) — componentes React; a `Moldura` comum é o esqueleto compartilhado das telas e, desde a feature 021, **dona do enquadramento horizontal** de todas elas.
- **Shell/rotas** (`pages/`) — Next.js Pages Router; uma rota por calculadora, home na raiz, `_app`/`_document`.
- **Infraestrutura** (`infra/`) — pool `pg`, adaptador de saúde e compose do PostgreSQL local; consumida em produção pelo healthcheck.
- 🆕 **Dev-time** (`scripts/`) — aquisição, verificação, emissão e congelamento. **Não entra no bundle** e não é importada por nenhuma das quatro camadas acima.

## Estrutura de pastas

```
aps-inteligente/
├── models/                          # DOMÍNIO puro — 6 units, ~8.222 LOC .ts (+ 376 kB gerados)
│   ├── insulina/                    # DM2 — 8 arq., 1.361 LOC (intocado)
│   ├── gestacao/                    # Idade gestacional — 6 arq., 619 LOC (só comentário em datas.ts)
│   ├── cardiopatia-isquemica/       # Dor torácica/pré-teste — 7 arq., 575 LOC (intocado)
│   ├── risco-cardiovascular/        # Risco CV 10 anos (PCE) — 7 arq., 604 LOC (intocado)
│   ├── puericultura/                # 🆕 5º domínio clínico — feature 017
│   │   ├── calculadora.ts           # Fachada 1: CalculadoraCrescimentoInfantil.avaliar
│   │   ├── classificacao.ts · elegibilidade.ts · idades.ts · medidas.ts · datas.ts
│   │   ├── padrao.ts · tipos.ts · validacao.ts · fonte-clinica.ts   (10 arq., 1.618 LOC)
│   │   ├── oms/                     # Leitura LMS (433 LOC) + tabelas/ (14 módulos gerados,
│   │   │   └── tabelas/             #   12.964 linhas L/M/S, 376 kB, manifesto.json com sha256)
│   │   ├── intergrowth/             # Equações fechadas do pré-termo — 2 arq., 192 LOC
│   │   └── consulta/                # 🆕 2ª FACHADA — feature 020, 17 arq., 2.484 LOC
│   │       ├── calculadora.ts       # Fachada 2: RegistroDeConsultaPuericultura.montar
│   │       ├── registro.ts · selecao.ts · tipos.ts · fonte-clinica.ts
│   │       └── fichas/              # 10 consultas datadas da caderneta + campos.ts + indice.ts
│   └── contribuicao/                # 🆕 1º unit NÃO CLÍNICO — feature 019, 5 arq., 336 LOC
│       └── br-code.ts · campo.ts · crc16.ts · tipos.ts · validacao.ts
├── interface/                       # APRESENTAÇÃO React — ~5.432 LOC .tsx/.ts + 1.086 LOC CSS
│   ├── comum/moldura.tsx (118)      # Moldura: `comInicio` (016) e coluna do corpo (021)
│   ├── calculadora/                 # Tela da insulina — 16 arq., 1.390 LOC
│   ├── gestacao/ (4) · cardiologia/ (5) · risco-cardiovascular/ (5)
│   ├── puericultura/                # 🆕 Tela do crescimento — 5 arq., 774 LOC (017)
│   │   └── consulta/                # 🆕 Ficha SOAP — 9 arq., 1.055 LOC (020)
│   ├── contribuicao/                # 🆕 Painel PIX — 5 arq., 324 LOC (019)
│   ├── inicio/                      # Home: catalogo.ts (4 seções, 6 fichas) · icones.tsx · tela.tsx
│   └── estilos/                     # 🔧 NOVE folhas CSS sobre tokens Primer — 1.086 LOC
│       ├── globais.css (367) · inicio.css (185) · contribuicao.css (133)
│       ├── cabecalho.css (121) · consulta-puericultura.css (113) · moldura.css (79)
│       └── cardiologia.css (47) · puericultura.css (33) · risco-cardiovascular.css (8)
├── pages/                           # SHELL Next.js (Pages Router) — 270 LOC
│   ├── index.tsx · _app.tsx · _document.tsx (PWA, feature 009)
│   ├── dm2/insulina.tsx · pre-natal/idade-gestacional.tsx
│   ├── cardiologia/{dor-toracica,risco-cardiovascular}.tsx
│   ├── puericultura/{crescimento,consulta}.tsx     # 🆕 rotas das features 017 e 020
│   └── api/v1/status.ts (57)        # 🔧 async, com I/O e seis chaves (feature 022)
├── infra/                           # INFRAESTRUTURA de dados — 326 LOC
│   ├── database.ts (284)            # 🔧 pool pg com tetos derivados de APS_TIMEOUT_SAUDE_MS
│   ├── saude.ts (42)                # 🆕 adaptador: ErroDeBanco vira valor (feature 022)
│   └── compose.yaml                 # PostgreSQL 17.10-alpine local
├── scripts/                         # 🆕 DEV-TIME — 23 arq. .mts, 5.517 LOC (features 017–020)
│   ├── baixar-tabelas-oms.mts · gerar-tabelas-oms.mts · oms/ (6 arq.)
│   ├── congelar-casos-oraculo.mts · oraculo/{oms,intergrowth}.mts
│   ├── congelar-fichas-caderneta.mts
│   ├── inventariar-textos.mts · textos/ (classificacao + classes/ com 6 mapas)
│   ├── conferir-producao.mts        # Confere o SHA e a saúde da produção pela régua certa
│   └── lib/planilha.mts
├── tests/                           # 77 arq. .ts/.tsx — unit, integration, contract, regression
├── e2e/                             # 6 roteiros Playwright + axe-baseline.json
├── docs/redacao.md                  # 🆕 Norma de redação do produto (feature 018)
├── referencias/                     # PDFs e planilhas das fontes (fora do bundle)
│   ├── caderneta/ (2 PDFs) · oms/ (14 .xlsx) · intergrowth/ (6 PDFs)
└── public/                          # Ativos da logo e manifesto PWA (feature 009)
```

## Superfície em números

| Métrica | Re-extração 3 (23/07) | **Re-extração 4 (28/07)** |
|---|---|---|
| Units de `models/` | 4 (todos clínicos) | **6** (5 clínicos + 1 não clínico) |
| Fachadas de domínio | 4 | **6** (duas sob `models/puericultura`) |
| Calculadoras no catálogo | 4, em 3 seções | **6, em 4 seções** |
| Rotas de página | 5 (home + 4) | **7** (home + 6) |
| Folhas de estilo | 5 | **9** |
| Arquivos de teste (suíte padrão) | 37 | **67** 🟢 aferido |
| Testes (suíte padrão) | — | **816** 🟢 aferido em 28/07, 8,6 s |
| Roteiros e2e | — | **6 arquivos**, 56 roteiros |
| Camadas | 4 | **5** (com dev-time) |
| Dependências de runtime | 7 | **8** (`react-qr-code@2.2.0`) |

> 🟢 A cifra de testes foi **medida** nesta passagem (`npx vitest run`: 67 arquivos, 816 testes, exit 0), e não copiada dos adendos. Isso encerra a dívida **L-11**, que apontava `architecture.md` §5 preso em "37 arquivos" desde a feature 018. Fora da suíte padrão correm 3 arquivos de contrato (`vitest.api.config.ts`, exigem servidor de pé) e os 6 roteiros e2e.

## Pontos de entrada

🟢

| Caminho | Tipo | Observação |
|---|---|---|
| `pages/_app.tsx` | app_entry | Importa as nove folhas de estilo e provê o tema |
| `pages/_document.tsx` | document_entry | Metadados do PWA e da logo (feature 009) |
| `pages/index.tsx` | page_entry | Home por seções, com o bloco de apoio ao pé |
| `pages/api/v1/status.ts` | api_entry | 🔧 Único caminho de rede da plataforma; agora com I/O |
| `infra/database.ts` | infra_entry | Pool `pg`; único importador em produção é `infra/saude.ts` |
| `scripts/*.mts` | devtime_entry | Quatro geradores idempotentes, executados à mão |

## Configuração

🟢 `next.config.ts` (CSP sem terceiros em produção, carimbo `APS_PUBLICADO_EM` no build, `transpilePackages` do Primer) · `tsconfig.json` · `eslint.config.mjs` · `vitest.config.ts` (suíte padrão) · `vitest.api.config.ts` (contrato) · `playwright.config.ts` · `vercel.json` (auto-deploy **desligado**: o CI é o único caminho para produção) · `.env.example` (`DATABASE_URL`, `APS_TIMEOUT_SAUDE_MS`, `POSTGRES_PORT`).

## CI/CD

🟢 `.github/workflows/ci.yml`, três jobs em cadeia:

1. **verificacao** — `lint`, `typecheck`, `test` em todo push.
2. **contrato** — build de produção com CSP ativa contra um Postgres 17.10-alpine efêmero; desde a feature 022 sobe **dois** servidores, um íntegro e outro com o banco inalcançável (`PORT=3001`), para aferir a denylist no estado degradado sobre o corpo realmente serializado.
3. **deploy** — Vercel via CLI, só em `main` e só com os dois anteriores verdes; falha barulhenta se faltar secret.

## Banco de dados (superficial)

🟢 Não há DDL, migration, ORM nem schema versionado: **nenhum dado é persistido**. O PostgreSQL existe para o healthcheck comprovar conectividade, e a consulta é `SELECT $1::int AS ok`. Local por `infra/compose.yaml` (17.10-alpine); em produção, instância Neon injetada por integração de marketplace. O `reversa-data-master` não tem schema a analisar — o dado do sistema vive em memória, como value objects, e em módulos estáticos (as tabelas da OMS).

## Testes

🟢 **Vitest 4.1.10** (unidade, integração, regressão e contrato), **Playwright 1.61.1** com `@axe-core/playwright` (ponta a ponta e acessibilidade) e **fast-check 4.9.0** (propriedade, no motor do BR Code).

| Nível | Local | Arquivos |
|---|---|---|
| Unidade — domínio | `tests/unit/dominio*` (6 pastas, uma por unit) | 39 |
| Unidade — interface e textos | `tests/unit/interface`, `tests/unit/textos` | 12 |
| Unidade — infra | `tests/unit/infra/saude.test.ts` | 1 |
| Integração | `tests/integration/interface` | 12 |
| Regressão | `tests/regression` (BUG-20260719-RHZ5) | 1 |
| **Subtotal da suíte padrão** | `vitest run` | **67 · 816 testes** |
| Contrato | `tests/contract` (API, infra, plataforma) | 3 |
| Ponta a ponta | `e2e` | 6 · 56 roteiros |

🟢 Cobertura exigida em `models/**`: 90% de linhas, statements, funções e branches (limiar do `vitest.config.ts`).

## Fontes clínicas versionadas

🟢 `referencias/` guarda as fontes primárias fora do bundle: as duas tiragens da *Caderneta da Criança*, 14 planilhas da OMS e 6 PDFs do INTERGROWTH-21st, além dos guias de DM2, pré-natal e cardiopatia isquêmica. A cadeia dev-time as consome; o código de aplicação, nunca.
