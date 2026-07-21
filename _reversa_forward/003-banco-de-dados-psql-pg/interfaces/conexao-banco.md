# Contrato: Conexão com o banco de dados (local, CI e Neon)

> Identificador: `003-banco-de-dados-psql-pg`
> Tipo: conexão TCP/TLS parametrizada por ambiente (não é contrato HTTP)
> Consumidor único: `infra/database.ts` (RN-02 — nenhum outro módulo conecta)

## 1. Parâmetros de conexão

| Item | Valor | Observação |
|---|---|---|
| Variável | `DATABASE_URL` (única) | RN-04; formato `postgres://user:senha@host:porta/banco` |
| TLS | obrigatório em produção (`sslmode=require`, já embutido na URL injetada pela Neon); ausente no local/CI | decidido por URL, não por código condicional |
| Pool | máximo 5 conexões; criação preguiçosa no primeiro uso | fundação sem carga; subir só com demanda futura |
| Timeout de conexão | 5 000 ms | alinhado ao tempo-limite do teste de saúde (RF-04) |
| Timeout de consulta | 5 000 ms | consultas da fundação são triviais (`SELECT 1`) |
| Retentativa | **nenhuma automática** | falha barulhenta (RN-05); retry é decisão do chamador |
| Idempotência | n/a nesta feature | sem escrita de negócio; consultas somente-leitura |

## 2. Superfície do módulo `infra/database.ts`

| Função | Assinatura conceitual | Comportamento |
|---|---|---|
| `query` | `(texto: string, parametros?: unknown[]) → Promise<linhas>` | Sempre parametrizada; erro vira `ErroDeBanco` com causa preservada |
| `saude` | `() → Promise<{ ok: true }>` | `SELECT 1` sob os timeouts acima; nunca retorna sucesso com banco fora |
| `encerrar` | `() → Promise<void>` | Drena o pool; obrigatório no teardown de testes |

## 3. Erros nomeados

| Erro | Quando | Mensagem contém |
|---|---|---|
| `ErroDeBanco` (`causa: "conexao"`) | host inalcançável, credencial inválida, timeout de conexão | nome do erro, host **mascarado**, duração; jamais a URL ou a senha |
| `ErroDeBanco` (`causa: "consulta"`) | falha de SQL ou timeout de consulta | nome do erro, primeiros caracteres do texto SQL (sem parâmetros) |
| `ErroDeBanco` (`causa: "configuracao"`) | `DATABASE_URL` ausente ou malformada | instrução de correção apontando `.env.example` |

## 4. Compatibilidade e vigilância

- O contrato de `GET /api/v1/status` (feature 002) **não muda**: o endpoint não consulta o banco (RN-03; watch W006).
- Mudança incompatível nesta superfície (renomear função, alterar semântica de erro) exige atualização desta spec antes do código (Princípio I).
