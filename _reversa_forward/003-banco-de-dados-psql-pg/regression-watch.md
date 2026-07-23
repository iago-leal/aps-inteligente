# Regression Watch: Fundação de banco de dados relacional

> Identificador: `003-banco-de-dados-psql-pg`
> Data: `2026-07-21`
> Consumidor: o agente reverso na próxima re-extração (`/reversa`); cada item deve continuar verdadeiro até ser arquivado

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| W001 | `domain.md` §7 (intenção realizada); roadmap 003 D-01 | `infra/compose.yaml` declara o serviço Postgres com imagem pinada em major.minor (`postgres:17.10-alpine`), volume nomeado, healthcheck `pg_isready` e porta parametrizada `POSTGRES_PORT` | presença | Compose vazio de novo, imagem sem pin (`latest`/só major) ou porta chumbada |
| W002 | `architecture.md` §1 (ADR 0003); requirements 003 RN-02 | `infra/database.ts` é o **único** ponto de acesso ao banco: nenhum import de `pg` fora de `infra/`; `models/insulina/` e `interface/calculadora/` seguem sem dependência de banco | presença | Import de `pg` (ou consulta SQL) em `models/`, `interface/` ou `pages/` |
| W003 | `architecture.md` §3 ("sem banco por design") | A re-extração descreve o plano de dados como **fundação sem esquema de negócio**: schema `public` vazio, ERD em memória (`erd-complete.md`) segue único modelo | redação | Extração seguir afirmando "sem banco", ou afirmar esquema de negócio existente sem spec própria |
| W004 | requirements 003 RN-01 (MD-0003/MD-0011 ampliadas); `permissions.md#vigilância-futura` | Nenhuma tabela ou coluna representando dado clínico ou pessoal no banco; o gatilho LGPD/autenticação permanece armado e não disparado | ausência | Qualquer DDL de negócio (especialmente com dado pessoal) sem spec, autenticação e análise LGPD anteriores ao código |
| W005 | requirements 003 RN-03; adendo 002 (W006) | `GET /api/v1/status` não consulta o banco: contrato fixo preservado, saúde do banco vive só em `tests/contract/infra/banco.test.ts` | presença | Endpoint de status importando `infra/database` ou mudança no corpo/cabeçalhos do contrato |
| W006 | roadmap 003 D-06; `vitest.api.config.ts` | A suíte de contrato inclui o teste de saúde com caso negativo (erro nomeado dentro de tempo-limite finito) e teardown `encerrar()` | presença | Teste removido, sem caso negativo, ou tolerando sucesso silencioso com banco fora |
| W007 | roadmap 003 D-08; adendo 002 (W005) | O CI mantém exatamente três jobs; o job contrato tem service container Postgres com a mesma imagem pinada do compose; deploy não conhece `DATABASE_URL` | presença | Quarto job, service container divergente do compose, ou credencial de banco no job de deploy |
| W008 | roadmap 003 §5 (componente-extinto) | `infra/database.js` não existe; a pasta `infra/` contém apenas artefatos tipados/declarativos (`compose.yaml`, `database.ts`) | ausência | Reaparecimento de módulo `.js` de acesso a dados |
| W009 | roadmap 003 D-03; requirements RN-04 | Configuração exclusivamente por `DATABASE_URL`: `.env.example` e `.env.test` commitados sem segredo real; nenhuma credencial de produção no repositório | presença | Credencial da Neon em arquivo versionado, ou `.gitignore` voltando a engolir `.env.example`/`.env.test` (linha `.env*`) |

## Observações (sem peso de regressão — origem 🟡)

- **Neon (D-04 🟡):** instância `neon-indigo-lever`, plano Free, conectada ao projeto com `DATABASE_URL` em production/preview/development. Major confirmado no provisionamento: **PostgreSQL 17.10**, paridade exata com o pin local (premissa D-05 fechada em 2026-07-21). Se o provedor mudar, o RF-07 permanece; só o fornecedor troca.
- **Smoke de produção (D-10 🟡):** executado verde (4/4) em 2026-07-21 via `vercel env pull`; credencial apagada após o teste. Cold start por autosuspend é esperado na primeira conexão (limites do plano em `onboarding.md` §7).
- **Colaterais da CLI:** skills `neon`/`neon-postgres` e `skills-lock.json` instalados automaticamente; decisão de commit pendente.
- **Pendência herdada da 002:** rotação do `VERCEL_TOKEN` — o gate de contrato independe dele, mas o deploy contínuo não.

## Histórico de re-extrações


### Re-extração 2026-07-23 21:40 (nº 3 — absorve features 011–014)

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W002 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W003 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W004 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W005 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W006 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W007 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W008 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W009 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
### Re-extração 2026-07-23 14:10

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | `infra/compose.yaml`: `postgres:17.10-alpine`, healthcheck `pg_isready`, porta `${POSTGRES_PORT:-5432}` |
| W002 | 🟢 verde | import de `pg` só em `infra/database.ts`; nenhum em `models/`, `interface/`, `pages/` (grep) |
| W003 | 🟢 verde | unit `infra/` descreve fundação sem esquema de negócio; `erd-complete.md` modela contratos em memória — não afirma mais "sem banco" nem esquema de negócio existente |
| W004 | 🟢 verde | nenhuma DDL de negócio; gatilho LGPD/autenticação armado e não disparado (`permissions.md`) |
| W005 | 🟢 verde | `pages/api/v1/status.ts` não importa `infra/database` (grep vazio) |
| W006 | 🟢 verde | suíte de contrato cobre a saúde do banco com caso negativo e teardown (parte dos 16/16; `infra/` TT) |
| W007 | 🟢 verde | CI com exatamente três jobs; job de deploy sem `DATABASE_URL` |
| W008 | 🟢 verde | `infra/database.js` ausente; `infra/` só com `compose.yaml` + `database.ts` |
| W009 | 🟢 verde | `.env.example` e `.env.test` versionados sem segredo real (git ls-files) |

## Arquivadas

_(vazio)_
