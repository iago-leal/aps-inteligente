# Adendo: Fundação de banco de dados relacional (serviço local, acesso e saúde)

> Identificador: `003-banco-de-dados-psql-pg`
> Data: `2026-07-21`
> Cenário: `legado`

## Vigência

Vigente desde 2026-07-21.

## Resumo da entrega

A feature materializou a intenção de infraestrutura declarada no legado (`infra/compose.yaml` vazio desde a refundação): um banco PostgreSQL local que sobe por comando único e reproduzível (imagem pinada `postgres:17.10-alpine`, volume nomeado, healthcheck, porta parametrizada), a camada de acesso programático confinada à infraestrutura (`infra/database.ts`, único ponto de acesso, erros nomeados, log com host mascarado) e a verificação de saúde com falha barulhenta dentro da suíte de contrato da API. Em produção, instância gerenciada Neon (plano Free, Vercel Marketplace) com `DATABASE_URL` injetada nos três ambientes; smoke de produção verde. É fundação pura: nenhum esquema de negócio nasceu, nenhum dado clínico ou pessoal é persistido, e o comportamento do produto (calculadora e contrato do status) não mudou.

Ações concluídas: **11 de 11** (`progress.jsonl`: 12 registros — 11 `done`, 1 `corrected`).

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | `#3-dados` ("Sem banco — ausência por design") | componente-novo | Existe agora um plano de dados de fundação: Postgres local em container e instância gerenciada Neon, ambos **sem esquema de negócio**; a leitura correta é "banco vazio de fundação", não "sem banco" |
| `_reversa_sdd/architecture.md` | `#1-estilo-arquitetural` | componente-novo | Nasce o quarto vértice `infra/database.ts`, fora do fluxo `pages → interface → models`; nenhum módulo existente o importa — dependência unidirecional e ADR 0003 preservados |
| `_reversa_sdd/architecture.md` | `#4-integrações-externas` ("nenhuma em runtime") | delta-de-contrato-externo | Primeira dependência externa de dados: Neon `neon-indigo-lever` (plano Free), fora do runtime da calculadora e do status; contrato em `_reversa_forward/003-banco-de-dados-psql-pg/interfaces/conexao-banco.md`; major confirmado 17.10 em paridade exata com o pin local |
| `_reversa_sdd/domain.md` | `#6-fronteiras-de-escopo` (MD-0003/MD-0011) | regra-nova | RN-01 amplia o alcance da fronteira: a exclusão de dado clínico/pessoal vale também **dentro do banco**; o gatilho de `permissions.md#vigilância-futura` (LGPD/autenticação antes de qualquer dado pessoal) permanece armado, não disparado |
| `_reversa_sdd/domain.md` | `#7-intenções-declaradas-e-não-realizadas` | componente-novo | A intenção "infra/compose.yaml vazio" foi **realizada** por esta feature; o item correspondente da lista 🔴 deve ser lido como atendido |
| `_reversa_sdd/domain.md` | `#7` (vestígio `infra/database.js`) | componente-extinto | O arquivo vazio de 2026-07-21 foi removido em favor do módulo tipado `infra/database.ts` |
| `_reversa_sdd/erd-complete.md` | modelo completo | delta-de-dados | Nenhum: as entidades em memória (`EntradaCalculo` → `SaidaCalculo`) seguem o único modelo; o schema `public` do banco nasce e permanece vazio |
| `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | suíte de contrato (`test:api`) | regra-alterada | O nível `contract` passa a cobrir também a saúde do banco (`tests/contract/infra/banco.test.ts`, com caso negativo); o contrato de `GET /api/v1/status` permanece idêntico e o endpoint **não** consulta o banco (RN-03) |
| `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | CI de três jobs | regra-alterada | O job **contrato** ganha service container Postgres (mesma imagem pinada do compose) e `DATABASE_URL` de job; estrutura de três jobs e gate de deploy inalterados; o CI não conhece a instância de produção |

## Regras sob vigilância

W001, W002, W003, W004, W005, W006, W007, W008, W009 — detalhe em `_reversa_forward/003-banco-de-dados-psql-pg/regression-watch.md` (watch principal; observações sem peso de regressão incluem a origem 🟡 da Neon, o smoke D-10, os colaterais da CLI e a pendência do `VERCEL_TOKEN`).

## Fontes

- `_reversa_forward/003-banco-de-dados-psql-pg/legacy-impact.md`
- `_reversa_forward/003-banco-de-dados-psql-pg/regression-watch.md`
- `_reversa_forward/003-banco-de-dados-psql-pg/requirements.md`
- `_reversa_forward/003-banco-de-dados-psql-pg/roadmap.md`
- `_reversa_forward/003-banco-de-dados-psql-pg/progress.jsonl`
- `_reversa_forward/003-banco-de-dados-psql-pg/interfaces/conexao-banco.md`
