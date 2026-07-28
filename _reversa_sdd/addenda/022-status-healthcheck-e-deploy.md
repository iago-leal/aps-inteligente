# Adendo 022 — O healthcheck passa a verificar o que promete

> Feature: `022-status-healthcheck-e-deploy`
> Data: `2026-07-28`
> Cenário: `legado`

## Vigência

Vigente desde 2026-07-28.

## Resumo da entrega

`GET /api/v1/status` respondia 200 quando o servidor da aplicação respondia, e nada além disso. O
banco provisionado pela feature 003 para comprovar conectividade, o pool que o abre e a função
`saude()` que o consulta existiam e eram testados, mas o único importador de `infra/database.ts` em
todo o repositório era o próprio teste de contrato: o status responderia 200 com o banco caído.

A entrega liga o healthcheck ao que ele diz verificar e acrescenta ao corpo o que faltava para
conferir um deploy sem abrir o painel do provedor, isto é, quando aquilo subiu e em que ambiente. O
handler passa a `async` e compõe seis campos; os três da feature 002 permanecem intocados em nome,
tipo e semântica, de modo que a mudança é aditiva e cabe em `/api/v1` pela regra que o próprio
contrato escreveu para si.

O que a entrega tem de estrutural não é o campo novo, e sim a natureza do que mudou. A extração
afirmava, desde a re-extração 1, um vínculo que o código não realizava; o Princípio I resolve o
conflito reconciliando o código, e foi o que se fez. Com isso a rota ganha dependência e, portanto,
modo de falhar: a decisão registrada em `MD-0031` é que a falha do banco é valor, não código de
status, porque as seis calculadoras são integralmente cliente e seguem servindo com o banco fora.
Um 503 afirmaria uma queda que não houve.

Duas escolhas técnicas sustentam a disciplina da chamada. O teto deixou de ser o par fixo de
5 000 ms do driver e passou a orçamento configurável de 3 000 ms imposto **no servidor**, por
`statement_timeout`, porque o `query_timeout` do `pg` é temporizador de cliente que não cancela nada
e devolveria ao pool um cliente com resposta pendente. E `CausaDeErroDeBanco` ganhou a quarta causa,
`tempo_esgotado`, que retira casos de duas causas existentes: instância suspensa que demora a
despertar deixa de ser lida como banco fora.

**22 de 22 ações concluídas**, nenhuma falha. Portões: `typecheck` e `lint` verdes, 816 testes de
unidade e integração, 26 de contrato nos dois alvos, 56 roteiros e2e com axe em zero, e o inventário
textual idempotente em 1187 literais. Escopo conferido por `git status`: o único arquivo tocado em
`models/`, `interface/` ou `pages/` é `pages/api/v1/status.ts`.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | §1, Estilo arquitetural | regra-alterada | O diagrama de camadas descreve `infra/database.ts` como "usada SÓ pelo healthcheck". A frase era intenção, e passa a ser descrição de runtime, com um intermediário no caminho: `pages/api/v1/status` → `infra/saude.ts` → `infra/database.ts`. A restrição "SÓ pelo healthcheck" segue exata; o que muda é que agora ela descreve uma chamada, e não uma ausência |
| `_reversa_sdd/architecture.md` | §2, Containers e componentes | delta-de-contrato-externo | O container 2 deixa de ser "sem estado, sem dado clínico, contrato fixo" para ser também **com I/O**: o handler consulta o container 3 a cada requisição, sob teto. O container 3 deixa de existir só para o teste comprovar conectividade e passa a ter consumidor de produção |
| `_reversa_sdd/architecture.md` | §4, Integrações externas | delta-de-contrato-externo | Onde se lê que `GET /api/v1/status` devolve `{atualizado_em, versao, commit}`, leia-se **seis** chaves na raiz, com `publicado_em`, `ambiente` e `banco` acrescidos. A linha da Neon, "runtime (só `/api/v1/status`)", passa a valer em runtime de fato, e a coluna "dado clínico: não" permanece verdadeira: a consulta segue sendo `SELECT $1::int AS ok` |
| `_reversa_sdd/architecture.md` | §5, Qualidade e testes | regra-alterada | A contagem sobe para **39 arquivos de teste** com `tests/unit/infra/saude.test.ts`, que exercita os cinco desfechos de `verificarBanco` sem servidor nem banco. A suíte de contrato do banco ganha o teto e a prova de que o pool não fica preso; a da rota ganha alvo duplo, lido de `API_BASE_URL_DEGRADADO` e pulado quando a variável está ausente, de modo que a suíte siga executável com um servidor só |
| `_reversa_sdd/domain.md` | §7, invariante 7 (privacidade por construção) | regra-alterada | O invariante continua verdadeiro e passa a ter conteúdo: o único acesso a rede, o healthcheck, deixa de ser acesso hipotético. A guarda segue comportamental, e a denylist do teste de contrato foi estendida a host, URL de conexão e trecho de SQL, aferida sobre o corpo serializado nos **dois** estados do banco |
| `_reversa_sdd/domain.md` | §7.2, Regras da interface com força de navegação | — | Sem impacto. Nenhuma tela, nenhuma regra clínica e nenhuma rota de página mudaram (RF-10, conferido por `git status`) |
| `_reversa_sdd/code-analysis.md` | Módulo 13, `pages/api/v1/status` | delta-de-contrato-externo | A descrição "devolve `{atualizado_em, versao, commit}`" e a leitura implícita de handler síncrono sem dependência estão superadas. Permanecem exatos o 405 com `Allow: GET`, agora com a garantia de preceder qualquer I/O, e o `Cache-Control: no-store` |
| `_reversa_sdd/code-analysis.md` | Módulo 14, `infra` | componente-novo | `infra/` deixa de ser arquivo único: nasce `infra/saude.ts`, adaptador de uma função que converte `ErroDeBanco` em valor e passa a ser o único importador de `saude()` em produção. Não formata mensagem, não lê ambiente, não compõe resposta |
| `_reversa_sdd/code-analysis.md` | Módulo 14, `infra` | regra-alterada | O pool nasce com `connectionTimeoutMillis` e `statement_timeout` derivados de `APS_TIMEOUT_SAUDE_MS`, cujo padrão é 3 000 ms e cujo valor malformado cai no padrão registrando log. `query` aceita `{ tetoMs }`, emite `set_config` apenas quando o teto difere do padrão, restaura o padrão no `finally` e descarta o cliente no caminho de estouro |
| `_reversa_sdd/data-dictionary.md` | `ErroDeBanco` | delta-de-dados | `causa` deixa de ser união de três valores e passa a quatro, com `tempo_esgotado`. A quarta causa **retira** casos das outras duas: o cancelamento pelo servidor (`57014`) deixa de cair em `consulta`, e o estouro na espera por conexão deixa de cair em `conexao` |
| `_reversa_sdd/data-dictionary.md` | API — `GET /api/v1/status` | delta-de-contrato-externo | O corpo documentado tem três chaves; passa a ter seis, com `publicado_em` (carimbo de build, ou `null`), `ambiente` em vocabulário próprio (`producao`, `pre-visualizacao`, `local`) e `banco` (`{estado}` ou `{estado, causa}`) |
| `_reversa_sdd/openapi/status.yaml` | `components.schemas`, exemplo e `required` | delta-de-contrato-externo | O esquema descreve o corpo da feature 002. Os três campos seguem obrigatórios, e a eles se somam os três novos; o exemplo está defasado. O código é **200 em todo estado do banco**, inclusive degradado (`MD-0031`) |
| `_reversa_sdd/traceability/spec-impact-matrix.md` | Mapa de dependências, linha `saude()` / `ErroDeBanco` | regra-alterada | A entrada "a Function só chama `saude()`" era projeção da spec, e agora é fato, com `infra/saude.ts` entre as duas pontas. A linha `api+infra` da matriz permanece ortogonal ao clínico, com `∅` em todos os domínios e telas, e isso foi verificado nesta entrega, não presumido |
| `_reversa_sdd/adrs/0008` | Rota de API pública sem dado clínico | regra-alterada | A ADR permanece válida e a guarda continua comportamental, sem allowlist nominal. O que muda é o alcance da guarda: a rota deixou de ser pura, de modo que "não vazar" passou a incluir não vazar host, URL de conexão nem SQL no corpo, e a suíte afere isso com o banco íntegro e com o banco fora |
| `_reversa_sdd/inventory.md` | Superfície de arquivos | componente-novo | `infra/saude.ts` e o diretório `tests/unit/infra/` entram no inventário. Fora da árvore de módulos, `.github/workflows/ci.yml` ganha um segundo servidor **dentro** do job `contrato`, e `scripts/conferir-producao.mts` passa a ler os campos novos como opcionais, com `--exigir-saudavel` |

Nenhum impacto em `erd-complete.md`: o banco continua sem esquema de negócio, sem tabela, sem coluna
e sem migração, e a consulta de saúde segue sendo `SELECT $1::int AS ok`.

## Correção de referência que a extração há de carregar

O contrato desta feature (`interfaces/conexao-banco.md` §0) e o roadmap §7 dizem revogar o watch
**W006** da feature 003. O item que afirma "o endpoint não consulta o banco" é o **W005**; o W006
trata da suíte de contrato com caso negativo e teardown, e esse **permanece vigente e verde**, tendo
sido preservado e ampliado aqui. A revogação vale para o W005, e é assim que ela entra no
`regression-watch.md` desta feature e neste adendo.

## Regras sob vigilância

Quatorze watch items nascem desta entrega: **W001** a **W014**, em
`_reversa_forward/022-status-healthcheck-e-deploy/regression-watch.md`.

O de maior valor é o **W001**, porque inverte o sinal de um item anterior: o W005 da feature 003
vigiava a **ausência** da chamada ao banco, e o W001 passa a vigiar a **disciplina** dela. Logo
adiante vêm W005 e W006, que guardam o mecanismo do teto — `Promise.race` e `query_timeout` seguem
proibidos pelo nome, e o teto explícito não pode contaminar a conexão devolvida ao pool —, e o
**W007**, que é o único de tipo redação e o mais frágil por natureza: reconhece o estouro de conexão
por uma frase que o driver emite, de modo que atualização do `pg` é gatilho de revisão.

Sete observações sem peso de regressão acompanham a lista. Duas interessam à próxima re-extração:
`O-22-06` registra a correção de referência acima, e `O-22-07` registra que a extração ainda descreve
a rota como sem I/O em `code-analysis.md` e `architecture.md`. Note-se a inversão: até esta feature,
o código estava atrasado em relação à extração; a partir dela, é a extração que está atrasada em
relação ao código, e este adendo é o que sustenta a leitura correta até a re-extração nº 4.

## Fontes

- `_reversa_forward/022-status-healthcheck-e-deploy/requirements.md`
- `_reversa_forward/022-status-healthcheck-e-deploy/roadmap.md`
- `_reversa_forward/022-status-healthcheck-e-deploy/legacy-impact.md`
- `_reversa_forward/022-status-healthcheck-e-deploy/regression-watch.md`
- `_reversa_forward/022-status-healthcheck-e-deploy/actions.md`
- `_reversa_forward/022-status-healthcheck-e-deploy/progress.jsonl`
- `_reversa_forward/022-status-healthcheck-e-deploy/data-delta.md`
- `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md`
- `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/conexao-banco.md`
- `.harness/decisoes/MD-0030.md`, `MD-0031.md`, `MD-0032.md`
