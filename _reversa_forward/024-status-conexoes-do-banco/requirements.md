# Requirements: Conexões do banco no status, no molde do TabNews

> Identificador: `024-status-conexoes-do-banco`
> Data: `2026-08-10`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

`GET /api/v1/status` informa hoje se o banco respondeu, e nada sobre quanto dele ainda resta. A
entrega acrescenta ao corpo o teto de conexões do servidor e quantas estão abertas no instante da
consulta, de modo que a distância até o limite se veja antes de ela virar indisponibilidade. A
referência de forma é o `GET /api/v1/status` do TabNews, cujo bloco `dependencies.database` reúne
`status`, `max_connections`, `opened_connections`, `latency` e `version`. Da sessão de esclarecimento
saiu a medida dessa reprodução: reproduz-se o **conteúdo** do bloco de banco, dentro do `banco` que
já existe e em vocabulário próprio, sem aninhamento novo, sem `/api/v2`, sem o bloco de servidor de
aplicação e sem as medidas de latência. Ficam três campos, e nada além deles: teto de conexões,
conexões abertas e versão do servidor. O beneficiário é um só: o mantenedor intermitente, que confere
a plataforma por
`scripts/conferir-producao.mts` ou por `curl`, sem abrir o painel do provedor.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/pages-api-v1-status/requirements.md#regras-de-negócio` | RN-03 e RN-10: responde `200` em todo estado do banco, porque a dependência não essencial não governa o código HTTP. RN-04: o estado é `integro` ou `degradado`, com causa entre quatro | 🟢 |
| `_reversa_sdd/openapi/status.yaml#components.schemas` | `Status` declara seis chaves obrigatórias e `additionalProperties: false`, tanto na raiz quanto nos dois ramos de `EstadoDoBanco`. Campo novo sem alteração do esquema reprova o próprio contrato | 🟢 |
| `_reversa_sdd/architecture.md#4-integrações-externas` | Neon em runtime de fato, só em `/api/v1/status`, a cada requisição, sob teto de 3.000 ms, e com dado clínico igual a "não" porque a consulta é `SELECT $1::int AS ok` | 🟢 |
| `_reversa_sdd/domain.md#10-invariantes-transversais` | Invariante 8, privacidade por construção: o healthcheck é o único acesso a rede, e a denylist do teste de contrato foi estendida a host, URL de conexão e trecho de SQL, aferida nos dois estados do banco | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-19--pagesapiv1status` | O corpo fala o **vocabulário do produto**: `VERCEL_ENV` é traduzido para `producao`, `pre-visualizacao` e `local`, porque amarrar o corpo aos nomes de quem hospeda faria a troca de hospedagem virar mudança incompatível | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-20--infra` | Teto imposto no servidor por `statement_timeout`, sem retentativa automática, host mascarado no log, cliente descartado no caminho de estouro. O reconhecimento do estouro por frase do driver está sob o watch W007 | 🟢 |
| `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md#propriedades` | Regra de versionamento escrita pelo próprio contrato: dentro de `/api/v1`, apenas acréscimo de campos; renomear ou reaninhar exige `/api/v2` | 🟢 |
| `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md#denylist-de-privacidade-rn-02-invariável` | A resposta jamais contém segredo, variável de ambiente salvo o SHA do commit, host, URL de conexão, trecho de SQL nem **duração de consulta** | 🟢 |
| `tests/contract/api/v1/status.test.ts` | A denylist verificada tem quinze padrões gerais e oito de conexão, entre eles `/postgres/i` e `/54(32\|33)/`, aferidos sobre o corpo **realmente serializado**, nos dois alvos | 🟢 |
| `_reversa_sdd/adrs/0008-plataforma-hibrida-api-sem-dado-clinico.md` | A rota é pública, sem autenticação, e a guarda contra vazamento é comportamental, sem allowlist nominal | 🟢 |
| `_reversa_sdd/adrs/0020-dependencia-nao-essencial-nao-governa-o-codigo-http.md` | O banco é infraestrutura acessória: a sua queda informa, não derruba | 🟢 |
| `_reversa_sdd/adrs/0007-telemetria-nula-fase-1.md` | A plataforma não acumula série temporal de nada, o que limita o proveito de qualquer medida instantânea publicada | 🟢 |
| Endpoint de referência, lido em 2026-08-10 | `https://www.tabnews.com.br/api/v1/status` devolve `updated_at` e `dependencies`, com `database` (`status`, `max_connections`, `opened_connections`, `latency` de três consultas, `version`) e `webserver` (`provider`, `environment`, `aws_region`, `vercel_region`, `timezone`, autor e mensagem do último commit) | 🟢 |

**Vigência dos adendos.** Os adendos 001 a 022 foram superados pela re-extração nº 4, de 2026-07-28,
e o que diziam já está absorvido nos artefatos-base citados acima. O único adendo vigente é o 023,
que trata da Escala de Depressão Geriátrica e não toca esta rota. 🟢

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Mantenedor intermitente | Saber, ao retomar o projeto, se a plataforma está de pé e com folga | Roda `scripts/conferir-producao.mts` depois de semanas de pausa e lê, na mesma tela, o SHA publicado, a idade do deploy e a ocupação de conexões do banco |
| Mantenedor em investigação | Distinguir banco fora de banco lotado | Uma requisição volta `degradado` com causa `conexao`; a leitura seguinte, com o banco de pé, mostra a ocupação próxima do teto e explica a intermitência |
| Suíte de contrato na integração contínua (CI) | Provar que o corpo publicado é o corpo especificado | O job de contrato consulta os dois alvos, com banco acessível e com banco inalcançável, e afere os campos novos e a denylist sobre o corpo serializado |
| Monitor externo, futuro | Acompanhar a dependência em laço | Gatilho registrado em `MD-0032`: surgindo esse consumidor, a verificação migra para rota própria e o bloco atual vira projeção dela |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** o teto de conexões, a contagem das abertas e a versão do servidor são apurados **na
   mesma verificação de saúde já existente**, numa ida só ao banco, sob o teto vigente de
   `APS_TIMEOUT_SAUDE_MS` e sem retentativa. 🟢
   - Origem no legado: `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md#tempo-de-resposta` (RN-06 daquela feature) e `_reversa_sdd/code-analysis.md#módulo-20--infra`
   - Tipo: nova
   - Razão: repetir mascararia a intermitência que o healthcheck existe para revelar, e uma segunda
     ida ao banco dobraria o custo da única rota de observabilidade do sistema.
2. **RN-02:** os três valores só existem quando a verificação teve sucesso. No estado `degradado`
   eles ficam **ausentes**, jamais iguais a zero e jamais nulos. 🟢
   - Origem no legado: `_reversa_sdd/pages-api-v1-status/requirements.md#regras-de-negócio`, RN-04
   - Tipo: nova
   - Razão: zero é uma leitura possível do mundo, e publicá-lo como sinônimo de "não apurado"
     transformaria ausência de informação em afirmação falsa. A ausência é estrutural, e não
     condicional: os campos vivem no ramo íntegro do estado, que é o único onde podem existir.
3. **RN-03:** com uma consulta só, o que falhar na apuração reprova a verificação inteira, e o
   estado resultante é `degradado` com causa `consulta`. Não existe estado intermediário de banco
   íntegro com números indisponíveis. 🟢
   - Origem no legado: `_reversa_sdd/pages-api-v1-status/requirements.md#regras-de-negócio`, RN-05
   - Tipo: nova. **Decidida na sessão de esclarecimento de 2026-08-10**, contra a alternativa de
     manter `integro` omitindo os campos.
   - Consequência aceita: faltando permissão de leitura das estatísticas ao papel de conexão, **toda
     requisição passa a responder `degradado`**. A premissa P-02 deixa de ser confortável e vira
     item obrigatório de investigação antes de qualquer código.
4. **RN-04:** o código HTTP permanece `200` em todo estado do banco, e a ocupação de conexões, por
   alta que esteja, não o altera. 🟢
   - Origem no legado: `_reversa_sdd/pages-api-v1-status/requirements.md#regras-de-negócio`, RN-03 e
     RN-10, e `_reversa_sdd/adrs/0020-dependencia-nao-essencial-nao-governa-o-codigo-http.md`
   - Tipo: herdada, inalterada
5. **RN-05:** a denylist de privacidade permanece invariável e passa a ser aferida também sobre os
   campos novos: número de conexões não vem acompanhado de host, usuário, nome de banco, endereço,
   trecho de SQL nem duração de consulta. Nenhum item dela é revogado por esta feature, e a proibição
   da duração de consulta em particular permanece de pé, agora com decisão explícita por trás
   (RF-12). 🟢
   - Origem no legado: `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md#denylist-de-privacidade-rn-02-invariável`
   - Tipo: alterada, por extensão de alcance
6. **RN-06:** a versão do servidor é publicada **apenas como número**, no molde `"17.5"`. A cadeia
   completa que o servidor devolve nomeia o produto, a arquitetura e o compilador, e casaria com o
   padrão `/postgres/i` da denylist verificada. 🟢
   - Origem no legado: `tests/contract/api/v1/status.test.ts`, `DENYLIST_DE_CONEXAO`
   - Tipo: nova
7. **RN-07:** acréscimo de campo cabe em `/api/v1`; renomear campo existente, reaninhá-lo sob chave
   nova ou trocar o vocabulário de um valor publicado são mudanças incompatíveis, e exigem
   `/api/v2`. 🟢
   - Origem no legado: `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md#propriedades`
   - Tipo: herdada, inalterada
8. **RN-08:** os números publicados descrevem **a contagem de conexões do banco corrente** e **o teto
   configurado no servidor**. O contrato declara os dois universos, porque eles não são o mesmo, e a
   razão entre eles só se lê corretamente com essa ressalva à vista. 🟢
   - Origem no legado: não há; nasce da natureza gerenciada da dependência
     (`_reversa_sdd/architecture.md#4-integrações-externas`) e da decisão de 2026-08-10
   - Tipo: nova
9. **RN-09:** o teto publicado é o do **servidor**, e não o da pilha de conexões da aplicação, que
   vale cinco e vive em `MAXIMO_DE_CONEXOES`. São grandezas distintas com nomes parecidos, e o
   contrato as separa em nome e em descrição. 🟢
   - Origem no legado: `infra/database.ts`, via `_reversa_sdd/code-analysis.md#módulo-20--infra`
   - Tipo: nova

## 5. Requisitos Funcionais

Os nomes abaixo seguem a decisão da sessão de esclarecimento: acréscimo aditivo **dentro de `banco`**,
em português e no molde `snake_case` que a raiz já usa em `atualizado_em` e `publicado_em`.

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O corpo publica o teto de conexões do servidor, em `banco.teto_de_conexoes` | Must | Com o banco de pé, o corpo traz um inteiro positivo; a suíte de contrato o afere | 🟢 |
| RF-02 | O corpo publica quantas conexões estão abertas no banco corrente, em `banco.conexoes_abertas` | Must | Com o banco de pé, o corpo traz um inteiro maior ou igual a um, e nunca maior que o teto | 🟢 |
| RF-03 | O corpo publica a versão do servidor de banco, em `banco.versao`, só como número | Should | Com o banco de pé, o corpo traz a versão em texto no molde `"17.5"`, e a denylist segue verde | 🟢 |
| RF-04 | O acréscimo cabe em `/api/v1`, sem aninhamento novo e sem renomear campo existente | Must | Os três campos vivem no ramo íntegro de `banco`; nenhuma chave da raiz muda de nome, tipo ou semântica | 🟢 |
| RF-05 | A apuração dos três valores acontece na mesma ida ao banco da verificação de saúde | Must | O número de consultas por requisição não aumenta em relação ao estado atual, verificado por registro no servidor de teste | 🟢 |
| RF-06 | No estado degradado, os campos novos estão ausentes | Must | Com o alvo degradado, nenhum dos três campos aparece no corpo, e nenhum vale zero ou nulo | 🟢 |
| RF-07 | Falha na apuração das estatísticas degrada o estado, com causa `consulta` | Must | Com o papel de conexão sem permissão de leitura, o corpo traz `degradado` e causa `consulta` | 🟢 |
| RF-08 | Os seis campos hoje publicados permanecem intocados enquanto `/api/v1` viver | Must | A suíte de contrato da feature 022 continua verde sem alteração das asserções existentes | 🟢 |
| RF-09 | O contrato publicado em `_reversa_sdd/openapi/status.yaml` descreve os campos novos | Must | O esquema valida o corpo real dos dois alvos, com `additionalProperties: false` preservado nos dois ramos | 🟢 |
| RF-10 | A suíte de contrato afere os campos novos e estende a denylist a eles | Must | `tests/contract/api/v1/status.test.ts` cobre os dois alvos e afere a denylist sobre o corpo serializado | 🟢 |
| RF-11 | O conferidor de produção exibe a ocupação de conexões | Should | `scripts/conferir-producao.mts` lê os campos como opcionais, no molde da D-09 da feature 022, e não falha contra um deploy antigo que não os publique | 🟢 |
| RF-12 | O corpo publica a latência da verificação, no molde `latency` da referência | Won't | **Fora de escopo por decisão de 2026-08-10.** A denylist proíbe duração de consulta e permanece sem revogação; o molde exigiria três idas ao banco, contra a RN-01 | 🟢 |
| RF-13 | O corpo publica o bloco de servidor de aplicação, no molde `webserver` da referência | Won't | **Fora de escopo por decisão de 2026-08-10.** `ambiente`, `versao`, `commit` e `publicado_em` já cobrem o mesmo terreno na raiz, em vocabulário próprio; provedor, região e autoria de commit ficam de fora | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | O tempo de resposta permanece na faixa hoje observada, de 0,3 s a 0,6 s com a instância quente, sob o mesmo teto de 3.000 ms configurável | `_reversa_forward/022-.../interfaces/http-get-api-v1-status.md#tempo-de-resposta` | 🟢 |
| Desempenho | O número de idas ao banco por requisição não aumenta | RN-01 | 🟢 |
| Segurança | A rota permanece pública e sem autenticação, e nenhum campo novo revela host, credencial, endereço, nome de banco ou SQL | ADR 0008; denylist da feature 022 | 🟢 |
| Privacidade | Nenhum campo novo carrega dado clínico ou pessoal, inclusive de quem mantém o projeto | `_reversa_sdd/domain.md#10-invariantes-transversais`, invariante 8; RF-13 fora de escopo | 🟢 |
| Compatibilidade | Consumidor escrito contra o corpo atual continua funcionando sem alteração | RN-07 | 🟢 |
| Observabilidade | O significado dos números é legível sem consultar a documentação do provedor, e os dois universos aparecem declarados no contrato | RN-08 e RN-09 | 🟢 |
| Manutenibilidade | A leitura das conexões não abre segundo ponto de acesso ao banco: `infra/database.ts` permanece o único | `_reversa_sdd/code-analysis.md#módulo-20--infra` | 🟢 |
| Robustez | Nenhum valor publicado pode casar com padrão da denylist verificada; em particular a versão sai só como número | RN-06; `tests/contract/api/v1/status.test.ts` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: banco de pé, com folga
  Dado o banco disponível
  Quando GET /api/v1/status é processado
  Então retorna 200
  E banco.teto_de_conexoes é um inteiro positivo
  E banco.conexoes_abertas é um inteiro maior ou igual a um
  E banco.conexoes_abertas não excede banco.teto_de_conexoes

Cenário: versão do servidor de banco
  Dado o banco disponível
  Quando GET /api/v1/status é processado
  Então banco.versao traz apenas o número da versão
  E o corpo serializado não contém o nome do produto de banco
  E ela foi apurada na mesma consulta dos demais campos

Cenário: banco fora
  Dado o banco inalcançável
  Quando GET /api/v1/status é processado
  Então retorna 200, e não 503
  E banco.estado é degradado, com causa em vocabulário público fechado
  E os três campos de conexão estão ausentes do corpo
  E nenhum deles vale zero ou nulo

Cenário: estatísticas ilegíveis para o papel de conexão
  Dado o banco disponível e um papel sem permissão de leitura das estatísticas
  Quando GET /api/v1/status é processado
  Então retorna 200
  E banco.estado é degradado, com causa consulta
  E os três campos de conexão estão ausentes do corpo

Cenário: teto de tempo atingido
  Dado o teto de verificação igual a 1 milissegundo e o banco de pé
  Quando GET /api/v1/status é processado
  Então banco.estado é degradado, com causa de tempo esgotado
  E os três campos de conexão estão ausentes do corpo

Cenário: privacidade preservada nos dois estados
  Dado o corpo realmente serializado, com o banco de pé e com o banco fora
  Então ele não contém host, usuário, nome de banco, endereço, trecho de SQL nem duração de consulta
  E nenhum valor numérico publicado casa com padrão da denylist

Cenário: consumidor antigo não quebra
  Dado um cliente escrito contra os seis campos da feature 022
  Quando ele consulta o endpoint depois desta entrega
  Então os seis campos permanecem com o mesmo nome, tipo e semântica

Cenário: conferidor diante de um deploy antigo
  Dado um deploy anterior a esta entrega, que não publica os campos de conexão
  Quando o conferidor de produção é executado contra ele
  Então ele relata a ocupação como desconhecida
  E não falha por ausência dos campos

Cenário: método não permitido
  Dado uma requisição POST
  Então retorna 405 com Allow: GET
  E o banco não é consultado
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 e RF-02 | Must | São o pedido, e sem eles a entrega não existe |
| RF-04 | Must | É o que mantém a entrega em `/api/v1` e o contrato honrado |
| RF-05 | Must | Uma segunda ida ao banco dobraria o custo da única rota de observabilidade |
| RF-06 e RF-07 | Must | Zero no lugar de ausente, ou íntegro no lugar de degradado, transformariam falta de informação em afirmação falsa |
| RF-08 | Must | O contrato só permanece em `/api/v1` enquanto isto valer |
| RF-09 e RF-10 | Must | Contrato que não é verificado é intenção, e a intenção era o defeito de origem da feature 022 |
| RF-03 | Should | Faz parte do bloco de referência e custa nada a mais, apurada na mesma consulta |
| RF-11 | Should | O conferidor é o consumidor real e diário; sem ele o campo existe e ninguém lê |
| RNF de compatibilidade | Must | Decorre da RN-07, que o próprio contrato escreveu |
| RNF de observabilidade | Should | Sem a declaração dos universos, o número engana justamente quem investiga |
| RF-12 | Won't | Fora de escopo por decisão registrada; a denylist segue íntegra e a RN-01 preservada |
| RF-13 | Won't | Fora de escopo por decisão registrada; o terreno já está coberto na raiz |

## 9. Esclarecimentos

### Sessão 2026-08-10

- **Q:** Até onde vai "reproduzir essa estrutura", já que renomear ou reaninhar campo existente é
  mudança incompatível pela regra do próprio contrato?
  **R:** Acréscimo aditivo dentro de `banco`, com `/api/v1` intacto e nenhum consumidor quebrado,
  **e com os nomes em português**. Reproduz-se o conteúdo do bloco de banco da referência, não a sua
  forma sintática: nem `dependencies`, nem `updated_at`, nem `status: "healthy"`.
  *Nomes adotados:* `banco.teto_de_conexoes`, `banco.conexoes_abertas` e `banco.versao`. "Teto" é o
  termo que o projeto já usa para limite em `TETO_PADRAO_MS` e em toda a prosa da feature 022, e
  evita a colisão com `MAXIMO_DE_CONEXOES`, que nomeia coisa diferente, a saber o limite da pilha de
  conexões da aplicação (RN-09).
- **Q:** O bloco `webserver` da referência deve ser reproduzido, com provedor, região, fuso e autoria
  do último commit?
  **R:** Não. `ambiente`, `versao`, `commit` e `publicado_em` já cobrem o mesmo terreno na raiz, em
  vocabulário próprio. Vira escopo negativo declarado em RF-13.
- **Q:** A que universo os números se referem, num banco gerenciado com possível agrupador de
  conexões no caminho?
  **R:** Contagem do **banco corrente**, teto lido da **configuração do servidor**. Os dois universos
  são declarados no contrato (RN-08), porque não coincidem.
- **Q:** Se a leitura das estatísticas falhar por falta de permissão, mas a consulta de saúde
  responder, o que a rota informa?
  **R:** Degrada, com causa `consulta`, como a RN-03 já estava escrita. A consequência é dura e fica
  registrada: sem a permissão, **toda** requisição responderia degradado, de modo que verificar a
  permissão do papel de conexão passa a ser item obrigatório de investigação no plano, e não
  premissa a confirmar depois.
- **Q:** Qual é o risco de publicar o bloco `latency`?
  **R:** Cinco riscos foram levantados, e o de maior peso é que a denylist do contrato nomeia
  "duração de consulta" entre o que a resposta jamais contém, sem que a suíte a verifique: dos vinte
  e três padrões de `tests/contract/api/v1/status.test.ts`, nenhum alcança um número de latência, de
  modo que revogar a regra em silêncio passaria despercebido. Somam-se a isso três idas ao banco
  contra a RN-01, com risco de a própria medição causar o `tempo_esgotado`; a ausência de série
  histórica (ADR 0007), que torna a medida instantânea pouco decisória; o compromisso durável que a
  RN-07 impõe a qualquer campo publicado; e a abertura de canal de temporização em rota pública sem
  limite de taxa. **Decisão: não reproduzir.** A denylist segue íntegra, e a RN-01 preservada.

## 10. Lacunas

Nenhuma dúvida em aberto. As cinco levantadas na redação inicial foram resolvidas na sessão de
esclarecimento de 2026-08-10, e o registro das respostas está na seção 9.

**Premissas declaradas, sem marcador de dúvida.** Ficam registradas porque regras acima dependem
delas, e nenhuma foi verificada no ambiente real desta plataforma:

- 🟡 **P-01:** os três valores são apuráveis numa leitura só, de modo que a RN-01 seja realizável.
  Invalidada, a RN-01 muda antes do código, e não o contrário.
- 🟡 **P-02:** o papel com que a aplicação se conecta enxerga as estatísticas de conexão do banco
  corrente e a configuração de teto do servidor. **Promovida a item obrigatório de investigação pela
  RN-03:** sem a permissão, toda requisição responderia degradado, o que seria regressão inaceitável.
  Verificar contra o banco gerenciado antes de escrever qualquer código.
- 🟡 **P-03:** a pilha de conexões da aplicação, hoje limitada a cinco, é pequena o bastante para que
  a contagem publicada seja dominada por outros consumidores do servidor, e não pela própria rota que
  a lê. A rota conta a si mesma, e o contrato precisa dizer isso.

**Observação para o plano, sem peso de regra.** A denylist verificada contém o padrão numérico
`/54(32|33)/`, herdado da guarda contra portas de conexão. Ele é aferido por casamento de subcadeia
sobre o corpo inteiro, de modo que um teto de conexões que contivesse `5432` reprovaria a suíte sem
que houvesse vazamento algum. O valor é implausível nos tamanhos usuais de instância, mas a armadilha
existe e cabe ao plano decidir se a guarda passa a ser aferida por campo, em vez de por corpo inteiro.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-08-10 | Versão inicial gerada por `/reversa-requirements`, a partir do pedido de expor `max_connections` e `opened_connections` e da estrutura do `GET /api/v1/status` do TabNews, lida no mesmo dia | reversa |
| 2026-08-10 | Sessão de esclarecimento: quatro das cinco dúvidas resolvidas. Fixados a forma aditiva em `/api/v1`, os nomes em português, o escopo negativo do bloco de servidor de aplicação, os universos dos dois números e a degradação por falha de apuração. Acrescidas RN-06, RN-08 e RN-09 a partir da leitura da denylist verificada e da colisão de vocabulário com `MAXIMO_DE_CONEXOES` | reversa |
| 2026-08-10 | Quinta dúvida fechada: a latência não se reproduz. RF-12 passa a `Won't`, a denylist permanece sem revogação e a RN-01 preservada. Documento sem dúvida em aberto | reversa |

## Pendências de Qualidade

Uma ressalva sobrevive às iterações de auto-validação, e fica registrada em vez de corrigida:

- **Q-018, ausência de nome de produto no documento.** O texto nomeia o endpoint de referência, o
  provedor de hospedagem e o servidor de banco. Nenhum deles é escolha deste documento: o endpoint
  foi indicado no pedido e é a única definição possível de "esta estrutura"; os outros dois já
  constam da extração, em `_reversa_sdd/architecture.md#4-integrações-externas`, e a RN-06 existe
  justamente porque o nome do produto de banco casa com a denylist verificada. A regra do vocabulário
  próprio governa o **corpo publicado**, e não a prosa da spec.
