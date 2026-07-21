# Roadmap: Fundação de banco de dados relacional (serviço local, acesso e saúde)

> Identificador: `003-banco-de-dados-psql-pg`
> Data: `2026-07-21`
> Requirements: `_reversa_forward/003-banco-de-dados-psql-pg/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature preenche o placeholder `infra/compose.yaml` (intenção declarada em `domain.md` §7) com um serviço PostgreSQL local em container, versão pinada e volume nomeado; cria o módulo único de acesso `infra/database.ts` (substituindo o `database.js` vazio) com pool preguiçoso, consultas parametrizadas, erros nomeados e log estruturado; e adiciona um teste de saúde do banco dentro da suíte de contrato existente (`tests/contract/**`, script `test:api`), sem tocar o contrato de `GET /api/v1/status`. Em produção, o banco nasce como instância gerenciada Neon via Vercel Marketplace (plano gratuito), que injeta `DATABASE_URL` no projeto; o job de contrato do CI ganha um service container de Postgres para o teste de saúde rodar no gate. Nenhum esquema de negócio é criado: é fundação pura, e o domínio clínico permanece com zero dependências novas.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | Requirements clarificado precede este plano; o módulo de acesso nasce citado pelos RF-02/RF-04 | respeita |
| II. Cadeia de derivação | `P_n` clarificado (fundação pura, sessão 2026-07-21) → RF-01..07 → decisões D-NN abaixo | respeita |
| III. Clarificação precede solução | As 5 dúvidas foram resolvidas via `/reversa-clarify` antes deste roadmap | respeita |
| IV. Portão G1 | Requirements sem `[DÚVIDA]` equivale ao seed travado do ciclo forward | respeita |
| V. Fase 2 proporcional | Sem PRD novo: feature de infraestrutura ancorada na extração; artefatos do forward fazem o papel da coleção | respeita |
| VI. Rastreabilidade bidirecional | Cada arquivo novo citará o RF-NN no cabeçalho; actions.md carregará a coluna de rastreio | respeita |
| VII. Testes como metade da fonte | O teste de saúde (nível `contract`) é entrega da feature, não posfácio; sem esquema não há testes de domínio | respeita |
| VIII. Proporcionalidade | Fundação sem esquema: pirâmide restrita ao nível `contract`; sem migrações, sem ORM | respeita |

Nenhum conflito de princípio identificado. A fronteira MD-0003/MD-0011 (`domain.md` §6) é reforçada pela RN-01 do requirements.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Serviço local via container Docker declarado em `infra/compose.yaml` (preenchendo o placeholder vazio), imagem oficial `postgres` pinada em major.minor, variante alpine, volume nomeado e healthcheck `pg_isready` | Reproduzível em comando único (RF-01); Docker 29 já presente na máquina; o placeholder é a intenção do legado | Instalação nativa (Homebrew): não reproduzível e polui o host; `embedded-postgres` (npm): jovem, contraria filtro de longevidade | 🟢 |
| D-02 | Acesso programático com a biblioteca `pg` 8.22.0 pinada + `@types/pg`, num módulo único `infra/database.ts`: pool preguiçoso (singleton), `query(texto, parametros)`, encerramento explícito, classe de erro nomeada e log estruturado chave/valor | Restrição declarada do usuário; biblioteca mais madura do ecossistema (node-postgres); módulo único realiza RN-02 (único ponto de acesso) e RF-02 | `postgres.js` (contraria a restrição); `pg-promise` (camada extra sem ganho); ORM Prisma/Drizzle (peso morto sem esquema; acoplamento que o Princípio 5.1 global veta na regra de negócio) | 🟢 |
| D-03 | Configuração exclusivamente por `DATABASE_URL`: `.env.local` (não commitado) no dev, `.env.example` commitado como gabarito, env do provedor em produção | RN-04 (config fora do código); convenção que a integração do marketplace injeta nativamente | Variáveis PG* separadas (mais superfície de erro); config em arquivo TS (credencial no repo) | 🟢 |
| D-04 | Produção: instância gerenciada **Neon** provisionada via Vercel Marketplace, plano gratuito do Hobby; a integração injeta `DATABASE_URL` no projeto; driver `pg` conecta normalmente em runtime Node | RF-07; a plataforma não oferece mais banco próprio — marketplace é o caminho oficial; Neon tem free tier robusto e é o sucessor designado do antigo Vercel Postgres | Supabase (arrasta auth/storage desnecessários); Prisma Postgres (acopla ao ORM); VPS própria (manutenção contínua contraria o mantenedor intermitente) | 🟡 |
| D-05 | Paridade de major: a imagem local pina o mesmo major de Postgres da instância Neon (premissa: 17; confirmar no provisionamento e ajustar o compose se divergir) | Evita drift de comportamento SQL entre dev e produção | Local sempre no último major (drift silencioso) | 🟡 |
| D-06 | Teste de saúde em `tests/contract/infra/banco.test.ts`, dentro de `tests/contract/**` (já incluído pelo `vitest.api.config.ts` da 002): `SELECT 1` parametrizado com tempo-limite de 5 s e erro nomeado na falha | Resposta do usuário ("rodar dentro do teste de status" → suíte de contrato); RF-04; não altera `status.test.ts` nem o contrato do endpoint (RN-03; watch W006) | Teste dentro do próprio `status.test.ts` (mistura contratos distintos no mesmo arquivo); script avulso fora da suíte (sem gate no CI) | 🟢 |
| D-07 | Sessão interativa via `docker compose exec` do serviço chamando o cliente `psql` **do container** (script `db:psql` no manifesto), junto de `db:up` e `db:down` | RF-03; `psql` não existe no host (verificado em 2026-07-21) e não precisa existir: o container já o traz | Instalar `psql` no host (setup extra que o README teria de manter); GUI (contraria terminal-first) | 🟢 |
| D-08 | O job **contrato** do CI ganha um service container de Postgres (mesma imagem pinada do D-01) com healthcheck, e `DATABASE_URL` de job apontando para ele; jobs de verificação e deploy permanecem intocados | O teste de saúde entra no gate sem acoplar o CI à instância de produção; preserva os três jobs vigiados por W005 | Apontar o CI para a Neon (acoplamento e segredo extra no gate; cold start do free tier flakeia o job) | 🟢 |
| D-09 | Nenhum esquema de negócio e nenhuma ferramenta de migração nesta feature; a primeira migração nasce junto do primeiro esquema, em feature futura | Esclarecimento 1a (fundação pura); Princípio VIII (proporcionalidade) | node-pg-migrate/Drizzle Kit desde já (artefato sem demanda validada — Princípio II) | 🟢 |
| D-10 | Verificação de fumaça contra a produção (RF-07) roda manualmente no encerramento da feature: `vercel env pull` traz a `DATABASE_URL` da Neon e o mesmo teste de saúde executa contra ela | Comprova RF-07 sem acoplar o gate contínuo à instância gerenciada (D-08) | Smoke de produção dentro do CI (flake por autosuspend do free tier) | 🟡 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| A Neon permanece disponível no marketplace com plano gratuito no Hobby e injeta `DATABASE_URL` | §5 RF-07; investigação 2026-07-21 | Trocar de provedor do marketplace; RF-07 não muda, só o fornecedor |
| Major default da Neon é 17 (paridade do D-05) | §6 RNF reprodutibilidade | Ajustar a tag da imagem no compose ao major real — mudança de uma linha |
| O `VERCEL_TOKEN` do repositório será rotacionado (pendência herdada da 002) | contexto operacional | O job de deploy segue vermelho; esta feature não depende dele para o gate de contrato, mas a publicação contínua sim |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Infraestrutura local (placeholder) | `_reversa_sdd/architecture.md#3-dados`; `_reversa_sdd/domain.md#7` (`infra/compose.yaml` vazio) | componente-novo | O placeholder vira serviço Postgres declarado, pinado e com healthcheck |
| Camada de acesso a dados | `_reversa_sdd/architecture.md#1-estilo-arquitetural` (três camadas; ADR 0003) | componente-novo | Nasce `infra/database.ts`, quarto vértice (infraestrutura) fora do fluxo `pages → interface → models`; nenhum dos três existentes o importa nesta feature |
| Pirâmide de testes — nível `contract` | `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | regra-alterada | A suíte de contrato passa a cobrir também a saúde do banco; o contrato do status permanece idêntico (W006) |
| CI/CD | `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` (job contrato) | regra-alterada | Job contrato ganha service container de Postgres; estrutura de três jobs preservada (W005) |
| Integrações externas | `_reversa_sdd/architecture.md#4-integrações-externas` ("nenhuma em runtime") | contrato-novo | Primeira dependência externa de dados: instância gerenciada Neon; detalhe em `interfaces/conexao-banco.md` |
| Vestígio `infra/database.js` | git status 2026-07-21 (untracked, vazio, fora da extração) | componente-extinto | Removido em favor do módulo tipado `infra/database.ts` |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma entidade de domínio muda**; o ERD em memória (`erd-complete.md`) permanece o único modelo. O banco nasce vazio (sem esquema de negócio), e o gatilho LGPD/autenticação de `permissions.md` continua armado, não disparado.
- Detalhe completo em: `_reversa_forward/003-banco-de-dados-psql-pg/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Conexão com o banco (local e Neon) | conexão TCP/TLS parametrizada por ambiente | `_reversa_forward/003-banco-de-dados-psql-pg/interfaces/conexao-banco.md` |

`GET /api/v1/status` **não** é afetado (RN-03); seu contrato segue em `_reversa_forward/002-producao-pagina-e-api-status/interfaces/http-get-api-v1-status.md`.

## 8. Plano de migração

n/a — não há dados a migrar: o banco nasce vazio e nenhum dado existente muda de lugar.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Porta 5432 já ocupada no host do mantenedor | baixo | médio | Porta do host parametrizada no compose via variável com default 5432 |
| Service container do CI demora a aceitar conexão e o teste flakeia | médio | médio | Healthcheck do service + tempo-limite explícito de 5 s no teste com mensagem clara |
| `DATABASE_URL` vazar em log de erro | alto | baixo | O módulo nunca loga a URL nem credencial; log estruturado só com host mascarado e nome do erro |
| Free tier da Neon com autosuspend: primeira conexão lenta | baixo | alto | Smoke de produção fora do CI (D-10) e tolerância de cold start documentada no onboarding |
| `VERCEL_TOKEN` inválido (pendência da 002) bloqueia o deploy contínuo | médio | certo até rotação | Rotacionar o secret antes da ação de publicação; gate de contrato independe dele |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `npm run test:api` verde localmente com o banco de pé (inclui o teste de saúde novo)
- [ ] CI verde nos três jobs com o service container ativo no job de contrato
- [ ] Instância Neon provisionada com `DATABASE_URL` presente nos ambientes do projeto e smoke manual verde contra ela (D-10)
- [ ] README responde subir/configurar/verificar/derrubar (RF-05)
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-21 | Versão inicial gerada por `/reversa-plan` | reversa |
