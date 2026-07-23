# infra — Fundação de dados (acesso a banco + Postgres local)

> `requirements.md` · Re-extração 2 (2026-07-23). Feature 003-banco-de-dados-psql-pg.

## Visão Geral

Único ponto de acesso ao banco PostgreSQL: pool preguiçoso, consultas sempre parametrizadas, erros nomeados com causa preservada e log estruturado sem credencial. Acompanha um serviço Postgres local (Docker Compose) com paridade de major (17) com a instância gerenciada de produção. Nenhum dado clínico trafega por aqui na Fase 1: a fundação existe para observabilidade e uso futuro. 🟢

## Responsabilidades

- Expor `query`, `saude` e `encerrar` como fachada única de acesso ao banco. 🟢
- Criar o pool sob demanda com timeouts e limite de conexões. 🟢
- Classificar erros em conexão / consulta / configuração, preservando a causa. 🟢
- Logar de forma estruturada mascarando o host, sem URL nem credencial. 🟢
- Falhar de forma barulhenta, sem retry automático (retry é decisão do chamador). 🟢
- Prover o Postgres local reproduzível com healthcheck e porta parametrizável. 🟢

## Regras de Negócio

- **RN-02** Consultas sempre parametrizadas; a fachada não concatena SQL. 🟢
- **RN-04** Erros nomeados (`ErroDeBanco` com `causa`), causa original preservada em `cause`. 🟢
- **RN-05** Log estruturado sem URL nem credencial; host sempre mascarado. 🟢
- **Sem retry** Falha sobe imediatamente; o chamador decide reagir. 🟢
- **Paridade de major** Postgres 17 local ≈ produção gerenciada (D-05). 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Postgres local reproduzível | Must | `npm run db:up/down/psql`; healthcheck `pg_isready` |
| RF-02 | Fachada única de acesso | Must | `query`/`saude`/`encerrar`; pool preguiçoso |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Host mascarado; sem URL/credencial em log | `infra/database.ts:61-68,85-100` | 🟢 |
| Robustez | Timeouts de conexão e consulta (5 s); máx. 5 conexões | `database.ts:8-9,104-109` | 🟢 |
| Disponibilidade | Handler de erro do pool ocioso evita queda do processo | `database.ts:110-111` | 🟢 |
| Reprodutibilidade | Imagem pinada `postgres:17.10-alpine`; porta parametrizável | `infra/compose.yaml:7,13-14` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado DATABASE_URL ausente
Quando uma consulta é solicitada
Então lança ErroDeBanco de causa "configuracao" com mensagem instrutiva

Dado uma falha de conexão (ex.: ECONNREFUSED)
Quando uma consulta é executada
Então lança ErroDeBanco de causa "conexao" e loga host mascarado, sem credencial

Dado o serviço local
Quando "npm run db:up"
Então o Postgres 17 sobe com healthcheck pg_isready
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Fachada de acesso (RF-02) | Must | Único ponto de acoplamento ao banco |
| Postgres local (RF-01) | Must | Reprodutibilidade de desenvolvimento |
| Log sem credencial (RN-05) | Must | Segurança, sem fallback |
| Retry no chamador | Won't (aqui) | Decisão deliberada: falha barulhenta |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `infra/database.ts` | `query` `saude` `encerrar` `ErroDeBanco` `obterPool` | 🟢 |
| `infra/compose.yaml` | serviço `banco` (Postgres 17) | 🟢 |
