# `infra` — Fundação de dados (acesso a banco + Postgres local)

> `requirements.md` · **Re-extração 4 (2026-07-28)**. Features 003 e **022**.
> **A unit deixou de ser arquivo único**: nasceu `infra/saude.ts`, e o banco ganhou o seu
> primeiro consumidor de produção.

## Visão Geral

Único ponto de acesso ao banco PostgreSQL: pool preguiçoso, consultas sempre parametrizadas,
erros nomeados com causa preservada e log estruturado sem credencial. Acompanha um serviço
Postgres local com paridade de major com a instância gerenciada de produção. 🟢

O que mudou nesta passagem, e inverte a afirmação da extração anterior: **até a feature 022 o
único importador de `infra/database.ts` era um teste**. Hoje a rota de status a consome a cada
requisição, e a fundação deixou de ser preparação para uso futuro. Nenhum dado clínico
continua trafegando por aqui. 🟢

## Responsabilidades

- Expor `query`, `saude` e `encerrar` como fachada única de acesso. 🟢
- Criar o pool sob demanda, com tetos de tempo e limite de conexões. 🟢
- Classificar o erro em **quatro** causas: conexão, consulta, configuração e tempo esgotado. 🟢
- **(022)** Traduzir a falha em estado observável, em `infra/saude.ts`, sem propagá-la. 🟢
- Registrar log estruturado com o host mascarado, sem URL nem credencial. 🟢
- Falhar de forma barulhenta, sem retry automático — o retry é decisão do chamador. 🟢
- Prover o Postgres local reproduzível, com healthcheck e porta parametrizável. 🟢

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | Consultas sempre parametrizadas; a fachada não concatena SQL. | 🟢 |
| RN-02 | Erros nomeados (`ErroDeBanco` com `causa`), com a causa original preservada. | 🟢 |
| RN-03 | Log estruturado sem URL nem credencial; o host sai sempre mascarado. | 🟢 |
| RN-04 | Sem retry: a falha sobe imediatamente. | 🟢 |
| RN-05 | Paridade de major entre o Postgres local e o gerenciado. | 🟢 |
| RN-06 | **(022)** Quatro causas, e não três: `tempo_esgotado` é a nova. | 🟢 |
| RN-07 | **(022)** O teto de tempo vem de `APS_TIMEOUT_SAUDE_MS`, com padrão de 3.000 ms, e governa **as duas** pontas: `connectionTimeoutMillis` no pool e `statement_timeout` na sessão. | 🟢 |
| RN-08 | **(022)** A verificação da causa de estouro precisa **preceder** a de conexão, porque o estouro de conexão também casa com o padrão de erro de conexão. | 🟢 |
| RN-09 | **(022)** `verificarBanco` nunca lança: erro fora do contrato vira log e cai em `degradado`/`consulta`. | 🟢 |
| RN-10 | Valor inválido em `APS_TIMEOUT_SAUDE_MS` é registrado e substituído pelo padrão, em vez de derrubar o processo. | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Prover Postgres local reproduzível. | Must | `npm run db:up/down/psql`, com healthcheck. |
| RF-02 | Expor a fachada única de acesso, com pool preguiçoso. | Must | `query`, `saude`, `encerrar`. |
| RF-03 | Classificar o erro nas quatro causas. | Must | Testes por causa em `tests/unit/infra/`. |
| RF-04 | **(022)** Traduzir falha em `EstadoDoBanco`, sem lançar. | Must | `verificarBanco` devolve `integro` ou `degradado`. |
| RF-05 | **(022)** Aplicar o teto de tempo nas duas pontas. | Must | `APS_TIMEOUT_SAUDE_MS=1` produz `tempo_esgotado`. |
| RF-06 | Mascarar o host em todo log. | Must | Nenhuma credencial ou URL aparece. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Host mascarado; sem URL nem credencial em log. | `infra/database.ts:hostMascarado` | 🟢 |
| Robustez | Tetos de conexão e de consulta; no máximo cinco conexões. | `infra/database.ts` | 🟢 |
| Disponibilidade | Tratador de erro do pool ocioso evita a queda do processo. | `infra/database.ts` | 🟢 |
| Reprodutibilidade | Imagem pinada e porta parametrizável. | `infra/compose.yaml` | 🟢 |
| Configurabilidade | Teto por ambiente, com padrão seguro e aviso em valor inválido. | `infra/database.ts:tetoDoAmbiente` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: configuração ausente
  Dado DATABASE_URL ausente
  Quando uma consulta é solicitada
  Então lança ErroDeBanco de causa "configuracao", com mensagem instrutiva

Cenário: conexão recusada
  Dado o banco fora do ar
  Quando uma consulta é executada
  Então lança ErroDeBanco de causa "conexao"
  E o log traz o host mascarado, sem credencial

Cenário: teto estourado
  Dado APS_TIMEOUT_SAUDE_MS igual a 1 e o banco de pé
  Quando a saúde é verificada
  Então a causa é "tempo_esgotado", e não "conexao"

Cenário: verificação não lança
  Dado qualquer falha, inclusive fora do contrato
  Quando verificarBanco é chamada
  Então ela devolve degradado com causa, e nunca rejeita
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Fachada única de acesso | Must | Único ponto de acoplamento ao banco. |
| Tradução de falha em estado | Must | É o que permite ao healthcheck responder `200` degradado. |
| Log sem credencial | Must | Segurança, sem alternativa. |
| Teto configurável nas duas pontas | Must | Sem ele, a rota poderia pendurar. |
| Postgres local | Must | Reprodutibilidade de desenvolvimento. |
| Retry | Won't | Decisão deliberada: falha barulhenta, reação do chamador. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `infra/database.ts` | `query`, `saude`, `encerrar`, `ErroDeBanco`, `obterPool`, `tetoDoAmbiente`, `ehEstouroDeTempo`, `ehErroDeConexao` | 🟢 |
| `infra/saude.ts` | `verificarBanco`, `EstadoDoBanco` | 🟢 |
| `infra/compose.yaml` | Serviço do Postgres local | 🟢 |
