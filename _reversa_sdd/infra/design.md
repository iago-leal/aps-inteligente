# `infra` — Design Técnico

> `design.md` · **Re-extração 4 (2026-07-28)**. Acesso a banco via `pg` mais o serviço local.
> Dois arquivos desde a feature 022: `database.ts` e `saude.ts`.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `query<Linha>` | `(texto: string, parametros?: unknown[])` | `Promise<Linha[]>` | Sempre parametrizada; erro vira `ErroDeBanco`. |
| `saude` | `({ tetoMs }?)` | `Promise<{ ok: true }>` | Consulta de verificação; aceita teto explícito. |
| `encerrar` | `()` | `Promise<void>` | Drena e encerra o pool. |
| `ErroDeBanco` | `class extends Error` | — | `causa` entre quatro valores; causa original preservada. |
| `verificarBanco` | `(tetoMs?)` | `Promise<EstadoDoBanco>` | **Nunca lança.** |
| `EstadoDoBanco` | união | — | `integro`, ou `degradado` com causa. |

## Fluxo Principal

1. `query` mede o tempo, obtém o pool preguiçoso e executa.
2. Em erro, classifica: já sendo `ErroDeBanco`, registra e repropaga; senão, decide entre
   `tempo_esgotado`, `conexao` e `consulta`.
3. `obterPool` cria o pool com a URL validada, limite de conexões e os tetos derivados do
   ambiente, mais o tratador de erro do cliente ocioso.
4. `verificarBanco` embrulha `saude()` e traduz qualquer desfecho em estado.

## A ordem das verificações, que é regra e não detalhe

`ehEstouroDeTempo` **precisa vir antes** de `ehErroDeConexao`. O estouro de conexão emite uma
mensagem que casa com os dois padrões, e invertê-los classificaria todo estouro como falha de
conexão — a rota continuaria respondendo `200`, com a causa errada, e ninguém notaria. 🟢

O reconhecimento se apoia em **frase do driver** ("Connection terminated due to connection
timeout"), o que torna a atualização de `pg` um gatilho de revisão. É o acoplamento mais
frágil que a feature 022 deixou, e está sob o watch **W007**. 🟡

## As quatro causas

| Causa | Origem típica |
|-------|---------------|
| `configuracao` | `DATABASE_URL` ausente ou malformada — detectada antes de qualquer conexão. |
| `conexao` | Códigos de rede e de recusa do servidor, ou mensagem de terminação. |
| `tempo_esgotado` | Cancelamento por `statement_timeout`, `ETIMEDOUT`, ou estouro do teto de conexão. |
| `consulta` | O resto, incluindo rejeição fora do contrato. |

## O teto de tempo

`APS_TIMEOUT_SAUDE_MS` governa as duas pontas: `connectionTimeoutMillis` no pool e
`statement_timeout` na sessão, este aplicado por consulta parametrizada de configuração. O
padrão é 3.000 ms. Valor inválido é registrado e substituído pelo padrão, em vez de derrubar o
processo — coerente com a disciplina de falhar alto sem falhar fatal na borda. 🟢

## Fluxos Alternativos

- **Configuração ausente ou malformada:** erro de configuração, com mensagem que aponta o
  gabarito de ambiente.
- **Cliente ocioso falha:** o tratador registra sem derrubar o processo.
- **Banco fora:** `npm run db:down` reproduz a causa `conexao`.
- **Teto de 1 ms com banco de pé:** reproduz `tempo_esgotado`.

## Dependências

- `pg` — driver PostgreSQL. Única dependência de runtime desta unit.
- `DATABASE_URL` e `APS_TIMEOUT_SAUDE_MS`, ambas fora do código.
- Docker Compose, para o Postgres local.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Pool preguiçoso, singleton por módulo. | `database.ts` | 🟢 |
| Erros nomeados com causa preservada. | `database.ts:ErroDeBanco` | 🟢 |
| Host mascarado em todo log. | `database.ts:hostMascarado` | 🟢 |
| Sem retry automático. | cabeçalho de `database.ts` | 🟢 |
| Paridade de major entre local e produção. | `compose.yaml` | 🟢 |
| **(022)** A tradução de erro em estado mora em arquivo próprio, e não no handler HTTP. | `infra/saude.ts` | 🟢 |
| **(022)** `verificarBanco` nunca lança, e registra o que não conhece. | `infra/saude.ts` | 🟢 |
| **(022)** O teto governa as duas pontas, e não só a consulta. | `database.ts` | 🟢 |
| O `compose.yaml` chumba credenciais locais de propósito, por serem de desenvolvimento e precisarem ser reproduzíveis sem `.env`. | `infra/compose.yaml` | 🟢 |

## Estado Interno

O pool no escopo do módulo, criado sob demanda e zerado por `encerrar`, mais o teto aplicado na
última criação. Sobrevive entre requisições na mesma instância de função. 🟢

## Observabilidade

Log estruturado em JSON com nível, origem, causa, nome do erro, host mascarado e duração. É a
única emissão de log da plataforma inteira. 🟢

## Riscos e Lacunas

- 🟡 **`ehEstouroDeTempo` depende de frase do driver** (W007). Atualização de `pg` exige
  reconferir os padrões.
- 🟡 **`query` usa o relógio para medir duração**, aceitável em infraestrutura e proibido no
  domínio puro.
- 🟢 Nenhum dado clínico trafega pelo banco; o esquema segue sem tabela de aplicação.
- 🟢 A afirmação da extração anterior — "usada só pelo healthcheck, e o único importador é um
  teste" — está encerrada: a rota de status é consumidor de produção desde a feature 022.
