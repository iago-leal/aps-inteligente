# infra — Tarefas de Implementação

> `tasks.md` · Re-extração 2.

## Pré-requisitos

- [ ] `pg` instalado (versão pinada no manifesto)
- [ ] Docker disponível para o serviço local
- [ ] `DATABASE_URL` em `.env.local` (gabarito em `.env.example`)

## Tarefas

- [ ] **T-01** Definir `ErroDeBanco` com causa e preservação da origem
  - Origem no legado: `infra/database.ts:11-21`
  - Critério de pronto: `causa: "conexao" | "consulta" | "configuracao"`; `cause` preservada
  - Confiança: 🟢

- [ ] **T-02** Validar `DATABASE_URL` e mascarar host
  - Origem no legado: `infra/database.ts:41-68`
  - Critério de pronto: ausente/malformada → `configuracao`; host truncado no log
  - Confiança: 🟢

- [ ] **T-03** Pool preguiçoso com timeouts e handler de erro ocioso
  - Origem no legado: `infra/database.ts:102-114`
  - Critério de pronto: `max=5`, timeouts 5 s, `pool.on("error")` registra sem cair
  - Confiança: 🟢

- [ ] **T-04** `query` parametrizada com classificação de erro e log
  - Origem no legado: `infra/database.ts:116-148`
  - Critério de pronto: sempre parametrizada; erro classificado (conexão/consulta) e logado com duração
  - Confiança: 🟢

- [ ] **T-05** `saude` e `encerrar`
  - Origem no legado: `infra/database.ts:150-166`
  - Critério de pronto: `SELECT 1` valida; `encerrar` drena o pool
  - Confiança: 🟢

- [ ] **T-06** Serviço Postgres local no Compose
  - Origem no legado: `infra/compose.yaml`
  - Critério de pronto: `postgres:17.10-alpine`, healthcheck `pg_isready`, porta `POSTGRES_PORT`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] **TT-01** `DATABASE_URL` ausente → `ErroDeBanco("configuracao")`
- [ ] **TT-02** Falha de conexão → `causa "conexao"`, log com host mascarado
- [ ] **TT-03** Log nunca contém URL nem credencial
- [ ] **TT-04** `saude` retorna `{ ok: true }` contra o Postgres local

## Ordem Sugerida

1. T-01, T-02 (erros e config) antes do pool.
2. T-03 → T-04 → T-05 (acesso). T-06 (serviço) em paralelo.

## Lacunas Pendentes (🔴)

Nenhuma.
