<!--
Corpo do actions.md gerado por /reversa-to-do e atualizado por /reversa-coding.

REGRAS DE PREENCHIMENTO:
- IDs estáveis: T001, T002, ..., zero-padded três dígitos. Nunca recicle.
- Marcador de paralelismo é [//] no início da linha de ID. Tarefas [//] não compartilham arquivo alvo.
- Coluna "Dependências" lista IDs separados por vírgula. Ações sem dependência usam "-".
- Status inicial é [ ]. /reversa-coding muda para [X] ao concluir.
- Toda ação precisa ser ATÔMICA: cabe num turno do agente, sem precisar de feedback humano no meio.
-->

# Actions: Fundação de banco de dados relacional (serviço local, acesso e saúde)

> Identificador: `003-banco-de-dados-psql-pg`
> Data: `2026-07-21`
> Roadmap: `_reversa_forward/003-banco-de-dados-psql-pg/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 11 |
| Paralelizáveis (`[//]`) | 6 |
| Maior cadeia de dependência | 3 (ex.: T003 → T006 → T010) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Preencher o placeholder `infra/compose.yaml` com serviço PostgreSQL: imagem oficial pinada em major.minor variante alpine (major 17, paridade D-05), volume nomeado, healthcheck `pg_isready` e porta do host parametrizada por variável com default 5432 (D-01; RF-01) | - | `[//]` | `infra/compose.yaml` | 🟢 | `[X]` |
| T002 | Criar `.env.example` commitado com o gabarito de `DATABASE_URL` local e conferir que `.gitignore` exclui `.env.local` (D-03; RN-04) | - | `[//]` | `.env.example` | 🟢 | `[X]` |
| T003 | Adicionar `pg` 8.22.0 pinado como dependência e `@types/pg` como dependência de desenvolvimento, com lockfile atualizado e commitado (D-02; RNF reprodutibilidade) | - | `[//]` | `package.json` | 🟢 | `[X]` |
| T004 | Adicionar ao manifesto os scripts `db:up` (sobe o serviço), `db:down` (derruba e remove o volume — RF-06) e `db:psql` (`docker compose exec` chamando o `psql` do container — D-07; RF-03) | T001, T003 | - | `package.json` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Escrever `tests/contract/infra/banco.test.ts` contra o contrato de `interfaces/conexao-banco.md`: caso positivo (`saude()` responde `{ ok: true }` em até 5 s), caso negativo (`DATABASE_URL` apontando porta fechada produz `ErroDeBanco` nomeado dentro do tempo-limite, sem sucesso silencioso) e teardown com `encerrar()`; `status.test.ts` permanece intocado (D-06; RF-04; RN-03, RN-05) | T003 | `[//]` | `tests/contract/infra/banco.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Implementar `infra/database.ts` conforme `interfaces/conexao-banco.md`: pool preguiçoso singleton (máx. 5 conexões, timeouts de conexão e consulta de 5 000 ms), `query(texto, parametros)` sempre parametrizada, `saude()` via `SELECT 1`, `encerrar()`, classe `ErroDeBanco` com causas `conexao`/`consulta`/`configuracao` e log estruturado chave/valor com host mascarado — jamais URL ou senha (D-02, D-03; RF-02; RN-02, RN-04, RN-05) | T002, T003 | `[//]` | `infra/database.ts` | 🟢 | `[X]` |
| T007 | Remover o vestígio vazio `infra/database.js`, substituído pelo módulo tipado (componente-extinto do roadmap §5; esclarecimento 4a do requirements) | T006 | - | `infra/database.js` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Adicionar ao job **contrato** do CI um service container de Postgres com a mesma imagem pinada do compose, healthcheck e `DATABASE_URL` no env do job; jobs de verificação e deploy permanecem intocados (D-08; W005) | T001, T005, T006 | - | `.github/workflows/` (workflow do CI) | 🟢 | `[X]` |
| T009 | Provisionar a instância Neon via Vercel Marketplace no plano gratuito, confirmar a injeção de `DATABASE_URL` nos ambientes do projeto e o major real do Postgres — se divergir de 17, ajustar a tag da imagem no compose (D-04, D-05; RF-07) | - | `[//]` | ambiente Vercel (ajuste condicional em `infra/compose.yaml`) | 🟡 | `[X]` |
| T010 | Executar o smoke manual de produção: `vercel env pull` para obter a `DATABASE_URL` da Neon e rodar o teste de saúde contra ela, tolerando o cold start do free tier (D-10; RF-07) | T006, T009 | - | n/a (execução local) | 🟡 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T011 | Atualizar o README com as quatro respostas do RF-05 — subir (`db:up`), configurar (`.env.example` → `.env.local`), verificar saúde (`test:api` com o banco de pé), derrubar (`db:down`) — mais a sessão interativa (`db:psql`, RF-03) e a nota de cold start da Neon | T004, T006 | - | `README.md` | 🟢 | `[X]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-21 | Versão inicial gerada por `/reversa-to-do` | reversa |
