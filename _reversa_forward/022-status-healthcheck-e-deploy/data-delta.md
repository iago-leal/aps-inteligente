# Delta de dados: 022 — o healthcheck passa a verificar o que promete

> Identificador: `022-status-healthcheck-e-deploy`
> Data: `2026-07-28`
> Base: `_reversa_sdd/erd-complete.md`, `_reversa_sdd/data-dictionary.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Banco de dados: nada muda

🟢 **Nenhuma tabela, nenhuma coluna, nenhum índice, nenhuma migração.** O banco continua sem esquema
de aplicação, como a feature 003 o deixou e como `architecture.md` §3 descreve: ele existe para que
uma consulta comprove conectividade, e a consulta segue sendo `SELECT $1::int AS ok`, parametrizada.

Isso não é omissão de escopo: é o invariante de ADR 0002 em ação. Persistir qualquer coisa aqui
reabriria LGPD, autenticação e specs, e o gatilho está registrado na própria extração.

🟢 O que muda no **acesso** é o tempo, não o dado: a sessão da consulta de saúde passa a carregar um
`statement_timeout`, e o pool passa a nascer com um tempo-limite de conexão derivado do teto de
RF-07. Detalhe em `interfaces/conexao-banco.md`.

## 2. Estruturas em memória: o que nasce

As entidades desta feature são efêmeras por requisição, como todas as demais do sistema.

### 2.1 `EstadoDoBanco` — novo, em `infra/saude.ts`

União discriminada por `estado`, na mesma forma que o domínio clínico já pratica com as saídas de
cálculo (ADR 0004).

| Campo | Tipo | Obrigatório | Semântica |
|---|---|---|---|
| `estado` | `"integro" \| "degradado"` | sim | Discriminante. `integro` significa que a consulta de saúde completou dentro do teto |
| `causa` | `"conexao" \| "consulta" \| "configuracao" \| "tempo_esgotado"` | só quando `degradado` | Vocabulário público fechado; nunca transporta host, SQL, duração nem mensagem interna |

🟢 A função que a produz **não lança**: erro esperado é valor, conforme a invariante 2 do
`domain.md`. Exceção que escape dela é bug, e cai no tratamento padrão da plataforma.

### 2.2 `CausaDeErroDeBanco` — alterada, em `infra/database.ts`

| Antes | Depois |
|---|---|
| `"conexao" \| "consulta" \| "configuracao"` | `"conexao" \| "consulta" \| "configuracao" \| "tempo_esgotado"` |

🟢 Acréscimo de membro a união existente. Todo `switch` exaustivo sobre a causa passa a exigir o
quarto ramo, e o type checker o cobra — é o comportamento desejado, porque o único lugar que
enumera causas hoje é a mensagem de erro do próprio módulo.

🟢 Mapeamento de origem para a causa nova:

| Situação observada | Causa antes | Causa depois |
|---|---|---|
| Consulta abortada pelo servidor por `statement_timeout` (`57014`) | `consulta` | `tempo_esgotado` |
| Espera por conexão excedida (`ETIMEDOUT`, "timeout exceeded when trying to connect") | `conexao` | `tempo_esgotado` |
| Host inalcançável, credencial recusada, banco inexistente | `conexao` | `conexao` (inalterado) |
| SQL inválido, resultado inesperado | `consulta` | `consulta` (inalterado) |
| `DATABASE_URL` ausente ou malformada | `configuracao` | `configuracao` (inalterado) |

### 2.3 Corpo de `GET /api/v1/status` — ampliado

Diff conceitual sobre o corpo que o contrato da 002 fixou. Detalhe normativo, com exemplos e
códigos, em `interfaces/http-get-api-v1-status.md`.

| Campo | Situação | Tipo | Semântica |
|---|---|---|---|
| `atualizado_em` | **inalterado** | string ISO 8601 UTC | Momento em que a resposta foi gerada; muda a cada consulta |
| `versao` | **inalterado** | string | Versão do manifesto no build publicado |
| `commit` | **inalterado** | string | SHA do commit publicado; `"local"` fora do provedor |
| `publicado_em` | **novo** | string ISO 8601 UTC ou `null` | Instante do build que gerou este deploy; idêntico entre consultas ao mesmo deploy |
| `ambiente` | **novo** | `"producao" \| "pre-visualizacao" \| "local"` | Vocabulário próprio, traduzido do provedor |
| `banco` | **novo** | objeto (`EstadoDoBanco`) | Estado apurado da dependência, com causa quando degradado |

🟢 A adição é pura: nenhum campo existente muda de nome, de tipo, de posição na raiz ou de
semântica. É o caso que a seção "Propriedades" do contrato da 002 autoriza dentro de `/api/v1`.

## 3. Configuração: o que nasce fora do código

| Variável | Onde | Padrão | Semântica |
|---|---|---|---|
| `APS_TIMEOUT_SAUDE_MS` | ambiente de execução do servidor | `3000` | Teto total da verificação de saúde, em milissegundos. Valor ausente ou não inteiro positivo cai no padrão e registra log estruturado |
| `APS_PUBLICADO_EM` | injetada por `next.config.ts` no build | instante do build | Origem de `publicado_em`. Não é para ser definida à mão; defini-la manualmente faz o campo mentir |
| `VERCEL_ENV` | injetada pelo provedor | ausente fora dele | Origem de `ambiente`, traduzida e nunca repassada crua |

🟢 `.env.example` ganha `APS_TIMEOUT_SAUDE_MS` comentada, com a explicação de por que o padrão é 3 s
e não 2 s — o despertar da instância suspensa —, mantendo o gabarito como a documentação de
configuração que ele já é.

## 4. Retrocompatibilidade

| Consumidor | Efeito |
|---|---|
| Cliente que lê `{atualizado_em, versao, commit}` | Nenhum. Campos presentes, com a mesma semântica (RF-05) |
| `scripts/conferir-producao.mts` | Lê os campos novos como opcionais, porque a produção consultada pode ser anterior a esta feature (D-09) |
| `tests/contract/api/v1/status.test.ts` | Precisa mudar: a asserção `Object.keys(corpo).sort()` sobre três chaves passa a valer sobre seis. É mudança de teste derivada do contrato, não relaxamento dele |
| Chamadores de `saude()` | Nenhum em produção hoje; o parâmetro novo é opcional e o padrão preserva o comportamento (`interfaces/conexao-banco.md`) |
| `_reversa_sdd/openapi/status.yaml` | Passa a divergir do corpo servido. Reconciliação é trabalho de `/reversa-sync`, e não do ciclo de codificação: a extração não se edita fora dela |
