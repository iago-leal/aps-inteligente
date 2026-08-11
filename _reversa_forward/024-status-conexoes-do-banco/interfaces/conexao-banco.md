# Contrato interno — acesso ao banco por `infra/` (revisão da feature 024)

> Feature: `024-status-conexoes-do-banco`
> Data: 2026-08-10
> Realiza: RF-05, RF-07 (RN-01, RN-03, RN-06, RN-08, RN-09)
> Estende `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/conexao-banco.md`, que permanece vigente naquilo que este documento não altera.

## 0. O que **não** muda

Tudo o que faz este módulo ser o que é. `infra/database.ts` segue sendo o **único** ponto de acesso
ao banco; `infra/saude.ts` segue sendo o único importador de `saude()` em produção; o teto continua
imposto no servidor por `statement_timeout`; não há retentativa; o cliente continua descartado no
caminho de erro; o log continua estruturado, sem URL nem credencial, com host mascarado. As quatro
causas de `ErroDeBanco` permanecem as mesmas, com o mesmo significado.

Muda uma coisa só: **a largura da linha que a consulta de saúde devolve**.

## 1. `saude()` — `infra/database.ts`

### Assinatura

| Antes | Depois |
|---|---|
| `saude(opcoes?: { tetoMs?: number }): Promise<{ ok: true }>` | `saude(opcoes?: { tetoMs?: number }): Promise<LeituraDeSaude>` |

```ts
export type LeituraDeSaude = {
  readonly teto_de_conexoes: number;
  readonly conexoes_abertas: number;
  readonly versao: string;
};
```

🟢 **Os nomes vão em `snake_case`, e é exceção deliberada ao `camelCase` do módulo.** Este tipo não
é interno: a D-08 manda o handler inserir o valor de `verificarBanco()` inteiro no corpo, sem
remapear chave nenhuma, de modo que **os nomes dos campos deste tipo são os nomes publicados** e
precisam coincidir com o que a RF-01 e a RF-02 fixam em `openapi/status.yaml`. Um `camelCase` aqui
publicaria `tetoDeConexoes` no corpo, ou obrigaria a inventar um tradutor no handler contra a D-08.
A convenção do módulo cede porque a forma de fio é o contrato, e o contrato vem antes do estilo.

### A consulta

```sql
SELECT $1::int AS ok,
       current_setting('max_connections')::int AS teto_de_conexoes,
       (SELECT count(*) FROM pg_stat_activity
         WHERE datname = current_database())::int AS conexoes_abertas,
       current_setting('server_version') AS versao
```

Uma ida, quatro colunas, parâmetro preservado. Três exigências fixam-se aqui:

1. **`current_setting('server_version')`, jamais `version()`.** A segunda devolve o nome do produto,
   a arquitetura e o compilador, e cairia na denylist da suíte de contrato.
2. **A contagem filtra pelo banco corrente.** Sem o filtro, o número passaria a descrever a instância
   inteira, incompatível com o que o contrato público promete.
3. **A versão é sanitizada para o prefixo numérico** antes de sair do módulo. Imagens derivadas de
   Debian anexam sufixo entre parênteses ao `server_version`, e o contrato público promete só o
   número.

### Validação, e o caminho de falha

A validação de hoje (`linhas.length !== 1 || linhas[0].ok !== 1` → `ErroDeBanco("consulta")`) ganha
três verificações irmãs, no mesmo molde e com a mesma causa:

| Condição | Desfecho |
|---|---|
| `ok` diferente de `1`, ou número de linhas diferente de `1` | `ErroDeBanco("consulta")`, como hoje |
| `teto_de_conexoes` não é inteiro positivo | `ErroDeBanco("consulta")` |
| `conexoes_abertas` não é inteiro maior ou igual a `1` | `ErroDeBanco("consulta")` |
| `versao` não casa com o prefixo numérico esperado | `ErroDeBanco("consulta")` |

🟢 **A causa é `consulta` de propósito, e não uma quinta causa nova.** O vocabulário público de
`banco.causa` é fechado, e uma causa `estatistica` diria a quem lê o healthcheck algo que ele não
pode acionar. Ela permanece exatamente o que sempre significou: a conexão abriu, e a consulta de
saúde não devolveu o resultado esperado.

## 2. `verificarBanco()` — `infra/saude.ts`

### Assinatura

Inalterada: `verificarBanco(tetoMs?: number): Promise<EstadoDoBanco>`.

### O tipo

```ts
export type EstadoDoBanco =
  | ({ readonly estado: "integro" } & LeituraDeSaude)
  | { readonly estado: "degradado"; readonly causa: CausaDeErroDeBanco };
```

O ramo degradado não muda. É a assimetria que garante, **por tipo**, que os três valores não existam
onde não poderiam ter sido apurados: nenhuma condicional em runtime realiza a RN-02, o compilador a
realiza.

### O que o módulo continua a não fazer

Não formata mensagem, não lê ambiente, não compõe resposta, e agora também **não interpreta** os
números: não calcula proporção, não classifica ocupação, não decide se o banco está "cheio". Traduz
desfecho em estado, e transporta a leitura. Qualquer juízo sobre os valores pertence a quem os lê.

## 3. Consequência a jusante, e ela é a menor possível

`pages/api/v1/status.ts` insere o valor de `verificarBanco()` inteiro no corpo, sob a chave `banco`.
Como a forma do valor cresce e a do handler não, **nenhuma linha executável da rota muda**. O que
muda é o comentário de contrato do cabeçalho, por exigência de rastreabilidade (Princípio VI).

## 4. Verificação

| Nível | Arquivo | O que prova |
|---|---|---|
| Unidade | `tests/unit/infra/saude.test.ts` | Os desfechos de `verificarBanco`, agora incluindo leitura íntegra completa e cada uma das três validações reprovando com causa `consulta` |
| Unidade | idem | A sanitização da versão, exercitada com uma cadeia que traga sufixo de distribuição |
| Contrato | `tests/contract/infra/banco.test.ts` | `saude()` contra um banco real: a linha devolve os quatro valores, e o pool não fica preso |
| Contrato | `tests/contract/api/v1/status.test.ts` | O corpo publicado nos dois alvos, com a denylist aferida sobre o corpo serializado |
