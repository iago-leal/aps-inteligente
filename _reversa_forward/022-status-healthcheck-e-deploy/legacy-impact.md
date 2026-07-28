# Legacy impact — feature 022, o healthcheck passa a verificar o que promete

> Identificador: `022-status-healthcheck-e-deploy`
> Data: 2026-07-28
> Âncora: extração de legado (`_reversa_sdd/architecture.md` + `_reversa_sdd/domain.md`), 3.ª
> re-extração, mais os adendos 015 a 021
> Ações executadas: 22 de 22, nenhuma falha

O que esta feature muda no legado cabe numa frase: **um vínculo que a extração afirmava há três
passagens passa a existir em runtime**. `architecture.md` §1, §2 e §4 descrevem `infra/database.ts`
como a dependência "usada só pelo healthcheck"; até aqui o healthcheck não a usava, e o único
importador do módulo era um teste. O Princípio I resolve o conflito reconciliando o **código**, e é
isso que foi feito.

## Tabela de impacto

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `pages/api/v1/status.ts` | Módulo 13 (`pages/api/v1/status`) | `delta-de-contrato-externo` | **HIGH** | O corpo público ganha três campos e o handler passa a fazer I/O. Aditivo dentro de `/api/v1`, mas é contrato externo com consumidores conhecidos, e a rota deixa de ser pura |
| `infra/database.ts` | Módulo 14 (`infra`) | `regra-alterada` | **HIGH** | Quarta causa em `CausaDeErroDeBanco`, teto por chamada realizado no servidor, pool nascendo com tempos derivados do teto. Reclassificação de erro muda o que o sistema **diz** sobre uma falha |
| `infra/saude.ts` | Módulo 14 (`infra`) | `componente-novo` | MEDIUM | Adaptador de uma função que converte `ErroDeBanco` em valor; passa a ser o único importador de `saude()` em produção |
| `next.config.ts` | Módulo 12 (`pages`, shell Next.js) | `regra-nova` | MEDIUM | Carimbo do instante do build por substituição estática. Toca o artefato de build de **todas** as rotas, ainda que só uma o leia |
| `tests/contract/api/v1/status.test.ts` | Módulo 13 | `regra-alterada` | MEDIUM | O contrato verificado deixa de aceitar o corpo de três chaves; ganha bloco condicional para o alvo degradado |
| `tests/contract/infra/banco.test.ts` | Módulo 14 | `regra-nova` | LOW | Duas asserções novas: o teto cancela de fato, e o pool não fica preso depois do cancelamento |
| `tests/unit/infra/saude.test.ts` | Módulo 14 | `componente-novo` | LOW | Cinco desfechos de `verificarBanco` exercitados sem servidor nem banco |
| `.github/workflows/ci.yml` | fora da árvore de módulos (infraestrutura de entrega) | `regra-alterada` | MEDIUM | O job `contrato` passa a subir um segundo servidor. Continuam **três** jobs, e `verificacao` e `deploy` ficam intocados |
| `scripts/conferir-producao.mts` | fora da árvore de módulos (entregue em `5db2cb4`) | `regra-alterada` | LOW | Lê os campos novos como opcionais, exibe idade do deploy e estado do banco, ganha `--exigir-saudavel` |
| `.env.example` | Módulo 14 (`infra`, configuração) | `regra-nova` | LOW | Gabarito de `APS_TIMEOUT_SAUDE_MS`, comentado, com a razão do valor |
| `README.md` | documentação | `regra-alterada` | LOW | Seção "Como verificar saúde" reescrita ao corpo novo, com a leitura de `MD-0031` |
| `tests/apoio/inventario-textual.json` | superfície textual (Princípio IX) | `delta-de-dados` | LOW | Regerado: 1187 literais, 19 a mais, todos vindos da seção nova do README |

Nenhuma mudança em `models/`, em `interface/` ou em `pages/` fora de `pages/api/v1/status.ts`
(RF-10, conferido por `git status`).

## Diff conceitual por componente

### Módulo 13 — `pages/api/v1/status`

Era um handler síncrono que compunha três campos a partir do relógio, do manifesto e de uma variável
do provedor: nenhuma I/O, nenhuma dependência, nenhum modo de falhar que não fosse bug. Passa a
`async` e a compor seis campos, um dos quais é o resultado de uma consulta ao banco.

O que **não** mudou, e é o que sustenta a compatibilidade: `atualizado_em`, `versao` e `commit`
continuam na raiz, com o mesmo nome, o mesmo tipo e a mesma semântica; `Cache-Control: no-store`
continua; a ausência de `Set-Cookie` continua; o 405 com `Allow: GET` continua, e agora com uma
garantia a mais, a de que precede qualquer I/O. Por isso a mudança cabe em `/api/v1` pela regra que
o contrato da 002 escreveu para si mesmo.

O que mudou de natureza é o **modo de falhar**. Antes, a rota não tinha dependência; agora tem, e a
decisão foi que a falha dela é valor, não código de status: 200 em todo estado do banco (`MD-0031`).
O argumento é o produto, não a conveniência — as seis calculadoras são integralmente cliente e
seguem servindo com o banco fora, de modo que um 503 afirmaria uma queda que não houve.

### Módulo 14 — `infra`

`CausaDeErroDeBanco` passou de três para quatro valores. A quarta, `tempo_esgotado`, não é
cosmética: ela **retira** casos de duas causas existentes. O cancelamento pelo servidor (`57014`)
deixava de ser `consulta`, e o estouro na espera por conexão deixava de ser `conexao`. Quem lia
`conexao` como "banco fora" continuava certo; quem lia lentidão como defeito de SQL passava a ler
outra coisa.

O teto deixou de ser o par fixo de 5 000 ms do driver e passou a ser orçamento configurável de
3 000 ms, realizado **no servidor**. A troca de mecanismo é o núcleo técnico da feature: o
`query_timeout` do `pg` é temporizador de cliente, que não cancela nada e devolveria ao pool um
cliente com resposta pendente. Com `statement_timeout`, o Postgres aborta e a conexão volta limpa;
no caminho de erro, o cliente é descartado de propósito.

`infra/saude.ts` nasce como camada de uma função. Ela existe para que a rota nunca veja exceção, e
para que os cinco desfechos sejam testáveis sem servidor. Não formata mensagem, não lê ambiente, não
compõe resposta.

### Módulo 12 — `pages` (shell)

`next.config.ts` ganhou `env: { APS_PUBLICADO_EM }`, avaliado uma vez por build. É substituição
estática, e a inspeção do artefato confirmou: o carimbo está literal no chunk servido, e o nome da
variável não aparece em lugar nenhum. A premissa que o roadmap marcou 🟡 caiu como confirmada.

### Integração com o banco gerenciado

Deixa de ser vínculo afirmado e passa a ser vínculo executado. A consequência operacional é
declarada e aceita em `MD-0032`: cada consulta ao status pode despertar a instância suspensa do
plano gratuito. O custo é hipotético enquanto o padrão de acesso for o de hoje, e o gatilho de
revisão está registrado — surgindo monitor em laço, a verificação migra para rota própria.

## Preservadas

Regras 🟢 do legado que continuam intactas, conferidas nesta entrega:

| Regra | Origem | Como se conferiu |
|---|---|---|
| Privacidade por construção: nenhum dado clínico sai do navegador; o único acesso a rede é o healthcheck, sem dado clínico | `domain.md` §7.7 (ADR 0002, ADR 0008) | Denylist do teste de contrato, estendida a host, URL e SQL, nos **dois** estados do corpo |
| Erros esperados são valores | `domain.md` §7.2 (ADR 0004) | `infra/saude.ts` realiza a invariante fora do domínio clínico pela primeira vez; nenhuma exceção escapa de `verificarBanco` |
| `infra/database.ts` é o único ponto de acesso ao banco; nenhum import de `pg` fora de `infra/` | `architecture.md` §1 (ADR 0003); watch W002 da 003 | `infra/saude.ts` mora em `infra/` e importa `infra/database`, não `pg`; `models/` e `interface/` seguem sem dependência de banco |
| Banco sem esquema de negócio; nenhuma tabela, coluna ou migração | watch W003/W004 da 003 | `data-delta.md` §1: a consulta segue sendo `SELECT $1::int AS ok` |
| Configuração exclusivamente por variável de ambiente, sem segredo versionado | RN-04 da 003; watch W009 | `APS_TIMEOUT_SAUDE_MS` entra no `.env.example` comentada, com o padrão explícito |
| O CI mantém três jobs; `deploy` não conhece `DATABASE_URL` | watch W007 da 003 | O segundo servidor é **passo** dentro do job `contrato`, não job novo |
| Suíte de contrato com caso negativo e teardown `encerrar()` | watch W006 da 003 | Preservada e ampliada; os testes novos dividem o mesmo `afterEach` |
| Contrato fixo com `no-store`, sem `Set-Cookie`, 405 com `Allow: GET`, sem eco de requisição | contrato da 002 | Testes da 002 mantidos palavra por palavra na suíte |
| Nenhum texto autoral novo chega à tela sem classe declarada | Princípio IX; `MD-0016` | Inventário idempotente; os literais novos ficam fora da régua, e o único texto autoral novo é do README |

## Modificadas

| Regra | Origem | O que era | O que passa a ser |
|---|---|---|---|
| **`GET /api/v1/status` não consulta o banco** | RN-03 da 003; **watch W005** da 003; contrato da 003 §4 | O endpoint não fazia I/O, e a saúde do banco vivia só em `tests/contract/infra/banco.test.ts` | O endpoint consulta o banco a cada requisição, uma tentativa só, sob teto de 3 000 ms. A regra deixa de vigiar a **ausência** da chamada e passa a vigiar a **disciplina** dela |
| Corpo de `GET /api/v1/status` tem exatamente três chaves | contrato da 002; teste de contrato | `{atualizado_em, versao, commit}` | Seis chaves, aditivas, com os três campos antigos intocados em nome, tipo e semântica |
| `CausaDeErroDeBanco` é união de três valores | contrato da 003 §3; `data-dictionary.md` | `conexao \| consulta \| configuracao` | Quatro valores, com `tempo_esgotado` retirando casos das duas primeiras |
| Tempo-limite do banco é 5 000 ms fixo, imposto pelo driver | contrato da 003 §1 | `connectionTimeoutMillis` e `query_timeout`, ambos 5 000 | Teto único de 3 000 ms configurável, com `connectionTimeoutMillis` e `statement_timeout`; o cancelamento é do servidor |
| `saude()` e `query()` não aceitam parâmetro de tempo | contrato da 003 §2 | assinaturas sem opções | Ambas aceitam `{ tetoMs }` opcional, retrocompatível |

### Correção de referência, e ela importa para quem for auditar

O contrato desta feature (`interfaces/conexao-banco.md` §0) e o roadmap §7 dizem revogar o **W006**
da feature 003. O item que afirma "o endpoint não consulta o banco" é o **W005**; o W006 trata da
suíte de contrato com caso negativo, e esse **permanece vigente e verde**. A revogação vale para o
W005, e é assim que ela entra no `regression-watch.md` desta feature. `/reversa-sync` há de levar a
correção ao adendo.
