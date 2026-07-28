# Contrato: Conexão com o banco e superfície de `infra/database.ts` (revisão da feature 022)

> Identificador: `022-status-healthcheck-e-deploy`
> Tipo: conexão TCP/TLS parametrizada por ambiente e superfície de módulo (não é contrato HTTP)
> Estende `_reversa_forward/003-banco-de-dados-psql-pg/interfaces/conexao-banco.md`
> Realiza: RF-01, RF-02, RF-07 (RN-03, RN-06)

## 0. O que esta revisão revoga

🟢 O §4 do contrato da 003 diz, literalmente: "O contrato de `GET /api/v1/status` (feature 002)
**não muda**: o endpoint não consulta o banco (RN-03; watch W006)."

**Essa cláusula fica revogada nesta data.** O endpoint passa a consultar o banco, e é essa a razão
de ser da feature 022: a extração afirmava o vínculo, o código não o realizava, e o Princípio I
manda reconciliar o código. O watch W006 da feature 003 deixa de vigiar a ausência da chamada e
passa a vigiar a disciplina dela — uma tentativa, teto de tempo, nenhum dado interno no corpo.

Tudo o mais que o contrato da 003 fixa permanece vigente, com as alterações abaixo.

## 1. Parâmetros de conexão

| Item | Antes (003) | Depois (022) | Observação |
|---|---|---|---|
| Variável | `DATABASE_URL` (única) | **inalterado** | RN-04; a integração do provedor a injeta em produção e pré-visualização |
| TLS | obrigatório em produção, por URL | **inalterado** | decidido por URL, não por código condicional |
| Pool | máximo 5 conexões, criação preguiçosa | **inalterado** | |
| Timeout de conexão | 5 000 ms | **teto de saúde** (`APS_TIMEOUT_SAUDE_MS`, padrão 3 000 ms) | O único consumidor do pool é a verificação de saúde; manter 5 000 aqui faria a fase de conexão sozinha estourar o teto total de RF-07 |
| Timeout de consulta | 5 000 ms, por `query_timeout` do driver | **`statement_timeout` no servidor**, igual ao teto de saúde | Troca de mecanismo, e é a decisão D-03: o temporizador do driver não cancela nada, e deixaria a conexão ocupada depois de a resposta ter saído |
| Retentativa | nenhuma automática | **inalterado** | Falha barulhenta; retry é decisão do chamador, e o chamador é um healthcheck, que não repete (RN-06) |
| Idempotência | n/a | **inalterado** | Sem escrita; consultas somente-leitura |

🟢 **`APS_TIMEOUT_SAUDE_MS`**: inteiro positivo em milissegundos, padrão `3000`. Ausente ou inválido,
cai no padrão e registra uma linha de log estruturado — teto malformado que virasse `NaN` desligaria
a proteção em silêncio, e silêncio é o defeito que esta feature combate.

## 2. Superfície do módulo `infra/database.ts`

| Função | Assinatura conceitual | Mudança |
|---|---|---|
| `query` | `(texto, parametros?, opcoes?: { tetoMs?: number }) → Promise<linhas>` | **parâmetro novo, opcional.** É aqui que o teto se realiza; sem argumento, vale o padrão. Sempre parametrizada, erro vira `ErroDeBanco` com causa preservada |
| `saude` | `(opcoes?: { tetoMs?: number }) → Promise<{ ok: true }>` | **parâmetro novo, opcional**, repassado a `query`. Sem argumento, comporta-se como hoje sob o teto padrão; chamada existente não muda |

🟢 **Por que o teto desce até `query`, e não fica em `saude`.** A decomposição da feature revelou
que, com o teto apenas em `saude()`, o cenário "o banco demora mais do que o healthcheck admite"
não tem verificação determinística: a consulta de saúde é `SELECT $1::int`, rápida demais para
estourar teto algum de forma confiável. Com o parâmetro em `query`, o teste exercita o caminho real
com uma consulta deliberadamente lenta (`SELECT pg_sleep(…)`) e um teto pequeno, e o que se afere é
o mecanismo, não o acaso. `saude()` fica sendo o que já era: uma linha sobre `query`.
| `encerrar` | `() → Promise<void>` | **inalterada**; drena o pool, obrigatório no teardown de testes |

🟢 **Como o teto se realiza**, e por que não por fora:

1. O relógio começa antes de obter a conexão.
2. A espera pela conexão é limitada pelo tempo-limite do pool, que vale o teto padrão.
3. O que resta do orçamento vira o teto da consulta. Quando o teto pedido difere do padrão, o módulo
   emite `SELECT set_config('statement_timeout', $1, false)` — parametrizado, como manda o contrato
   da 003 — antes da consulta de saúde; quando é o padrão, o valor já viajou nos parâmetros de
   inicialização da sessão, e não há round-trip extra.
4. Estourado o teto, o servidor aborta a consulta e devolve `57014`; o cliente é **descartado** ao
   voltar ao pool, de modo que nenhuma conexão fica pendurada.

🔴 O que fica **proibido** aqui, e vale escrito porque é o erro natural: impor o limite por fora com
`Promise.race`. Ele não cancela a consulta, e a conexão seguiria consumindo o pool depois de a
resposta ter saído — que é justamente o modo de transformar degradação em indisponibilidade.

## 3. Erros nomeados

| Erro | Quando | Mensagem contém | Mudança |
|---|---|---|---|
| `ErroDeBanco` (`causa: "conexao"`) | host inalcançável, credencial inválida, banco inexistente | nome do erro, host **mascarado**, duração; jamais a URL ou a senha | escopo reduzido: estouro de tempo na conexão migra para `tempo_esgotado` |
| `ErroDeBanco` (`causa: "consulta"`) | falha de SQL, resultado inesperado | nome do erro, primeiros caracteres do texto SQL, sem parâmetros | escopo reduzido: cancelamento por tempo migra para `tempo_esgotado` |
| `ErroDeBanco` (`causa: "configuracao"`) | `DATABASE_URL` ausente ou malformada | instrução apontando `.env.example` | **inalterado** |
| `ErroDeBanco` (`causa: "tempo_esgotado"`) | teto atingido, na conexão ou na consulta | nome do erro, host mascarado, duração e o teto aplicado | **novo** |

🟢 A causa é a única parte do erro que atravessa a fronteira pública. A mensagem — que cita host
mascarado, trecho de SQL e duração — **jamais** entra no corpo da resposta; ela vive no log
estruturado, com a disciplina que `registrar()` já pratica.

## 4. Módulo novo: `infra/saude.ts`

| Função | Assinatura conceitual | Comportamento |
|---|---|---|
| `verificarBanco` | `(tetoMs?: number) → Promise<EstadoDoBanco>` | Chama `saude()` sob o teto e **nunca lança**: devolve `{ estado: "integro" }` ou `{ estado: "degradado", causa }` |

🟢 Razão de existir, em uma linha: erro esperado é valor (invariante 2 do `domain.md`), e a rota não
é lugar de política de falha. A camada mantém `infra/database.ts` como único ponto de acesso ao
banco — `saude.ts` é infraestrutura, e é o único importador em produção.

🟢 Exceção que escape de `verificarBanco` é **bug**, não estado esperado. O teste de unidade cobre os
quatro desfechos degradados e o íntegro.

## 5. Compatibilidade e vigilância

- Chamador existente de `saude()` não muda: o parâmetro é opcional e o padrão preserva o
  comportamento sob o teto de 3 s. O teste da 003 que exige rejeição com `causa: "conexao"` contra
  `127.0.0.1:9` continua válido — recusa imediata não é estouro de tempo.
- O teste da 003 que afere duração inferior a 6 000 ms continua verde, e agora com folga, porque o
  tempo-limite de conexão baixou de 5 000 para 3 000 ms.
- Mudança incompatível nesta superfície — renomear função, alterar semântica de causa, remover o
  parâmetro de teto — exige atualizar esta spec **antes** do código (Princípio I).
- Vigilância nova, herdeira do W006 da 003: nenhum outro módulo pode passar a importar
  `infra/database.ts`. O acesso ao banco continua tendo um consumidor só, e agora ele se chama
  `infra/saude.ts`.
