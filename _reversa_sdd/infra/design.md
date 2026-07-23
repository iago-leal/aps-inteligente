# infra — Design Técnico

> `design.md` · Re-extração 2. Acesso a banco via `pg` + serviço Docker Compose.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `query<Linha>` | `(texto: string, parametros?: unknown[])` | `Promise<Linha[]>` | Sempre parametrizada; erros como `ErroDeBanco` |
| `saude` | `()` | `Promise<{ ok: true }>` | `SELECT 1`; lança se resultado inesperado |
| `encerrar` | `()` | `Promise<void>` | Drena e encerra o pool |
| `ErroDeBanco` | `class extends Error` | — | `causa: "conexao" \| "consulta" \| "configuracao"`, `cause` preservada |

## Fluxo Principal

1. `query` mede o tempo, obtém o pool (`obterPool`, preguiçoso) e executa. `database.ts:116-126` 🟢
2. Em erro: se já é `ErroDeBanco`, registra e repropaga; se é erro de conexão (código/mensagem), embrulha em `causa: "conexao"`; senão `causa: "consulta"`. `database.ts:127-147` 🟢
3. `obterPool` cria o `Pool` com `connectionString` validada, `max=5`, timeouts de 5 s, e handler de erro do cliente ocioso. `database.ts:102-114` 🟢
4. `urlDeConexao` valida `DATABASE_URL` (presença e forma), lançando `configuracao` quando inválida. `database.ts:41-59` 🟢

## Fluxos Alternativos

- **`DATABASE_URL` ausente/malformada:** `ErroDeBanco("configuracao", …)`. `database.ts:42-58` 🟢
- **Código de rede/recusa do servidor:** classificado como conexão (conjunto `CODIGOS_DE_CONEXAO`). `database.ts:29-39,76-83` 🟢
- **Cliente ocioso falha:** handler `pool.on("error")` registra sem derrubar o processo. `database.ts:110-111` 🟢

## Dependências

- `pg` (`Pool`, `QueryResultRow`) — driver PostgreSQL. 🟢
- `process.env.DATABASE_URL` — string de conexão (fora do código). 🟢
- Docker Compose (`infra/compose.yaml`) — Postgres 17 local. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Pool preguiçoso singleton por módulo | `database.ts:23,102-114` | 🟢 |
| Erros nomeados com causa preservada (RN-04) | `database.ts:13-21` | 🟢 |
| Host mascarado em todo log (RN-05) | `database.ts:61-68` | 🟢 |
| Sem retry automático (falha barulhenta) | `database.ts:4-5` (comentário) | 🟢 |
| Paridade de major 17 local ↔ produção (D-05) | `compose.yaml:2-3,7` | 🟢 |

## Estado Interno

`pool: Pool | undefined` no escopo do módulo — criado sob demanda, zerado por `encerrar`. 🟢

## Observabilidade

Log estruturado JSON em `console.error` (`nivel`, `origem`, `causa`, `erro`, `host` mascarado, `duracao_ms`). 🟢

## Riscos e Lacunas

- 🟢 Sem dado clínico no banco na Fase 1 (ADR 0008); a fundação é para observabilidade e uso futuro.
- 🟡 `query` usa `Date.now()` para medir duração (aceitável em infra, ao contrário do domínio puro).
