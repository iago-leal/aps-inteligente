# Roadmap: O healthcheck passa a verificar o que promete

> Identificador: `022-status-healthcheck-e-deploy`
> Data: `2026-07-28`
> Requirements: `_reversa_forward/022-status-healthcheck-e-deploy/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature liga três pontas que hoje existem separadas: a rota `pages/api/v1/status.ts`, que não faz
I/O; o módulo `infra/database.ts`, cujo único importador é um teste; e a extração, que há três
passagens afirma um vínculo entre os dois. Nada disso pede componente novo de peso — pede um
adaptador fino e um contrato ampliado.

O caminho tem quatro movimentos. Primeiro, `infra/database.ts` ganha um teto de tempo por chamada,
realizado no servidor por `statement_timeout`, e uma quarta causa de erro, `tempo_esgotado`, porque
sem ela a rota não distingue lentidão de defeito. Segundo, nasce `infra/saude.ts`, camada de uma
função só, que envolve `saude()` e converte `ErroDeBanco` em **valor** — a rota nunca vê exceção.
Terceiro, o handler passa a `async`, compõe o corpo com o objeto `banco` ao lado dos três campos de
hoje e acrescenta `publicado_em` e `ambiente`, o primeiro carimbado no build por `next.config.ts`.
Quarto, `scripts/conferir-producao.mts` lê os campos novos como opcionais, porque a produção que ele
consulta pode ainda ser a anterior a esta feature, e ganha `--exigir-saudavel`.

A adição é pura: `atualizado_em`, `versao` e `commit` permanecem na raiz, intocados, e por isso a
mudança cabe em `/api/v1` pela regra que o próprio contrato da 002 escreveu.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. A spec é a fonte de verdade | É o caso-limite do princípio, e por isso vale enunciá-lo: a extração (`architecture.md` §1, §2 e §4) afirma que `infra/database.ts` serve ao healthcheck, e o código não o realiza. O conflito se resolve **reconciliando o código**, jamais rebaixando a spec ao que se observa. O contrato em `interfaces/` é escrito antes, e o teste dele deriva | respeita |
| II. Cadeia de derivação | Cada decisão abaixo cita o `RF-NN` que a origina; nenhum campo entra no corpo sem RF que o peça, e é isso que mantém `latencia_ms`, `região` e `versão do banco` fora dele (D-10) | respeita |
| III. Clarificação precede a solução | `/reversa-clarify` rodou em 28/07 e zerou as três `[DÚVIDA]`, com fichas `MD-0031` e `MD-0032`. As decisões com mais de uma saída defensável (D-02, D-03, D-04, D-08) trazem aqui as alternativas descartadas, e não só a escolhida | respeita |
| IV. Portão G1 | Requisitos travados: o `requirements.md` não tem marcador em aberto e a seção 10 o declara | respeita |
| V. Fase 2 proporcional | A coleção desta feature é o quinteto do ciclo forward mais dois contratos em `interfaces/`; nenhum molde SDD novo se justifica para uma rota e um módulo de infraestrutura | respeita |
| VI. Rastreabilidade bidirecional | Todo arquivo tocado cita, no cabeçalho, o `RF-NN` desta feature, no formato que `status.ts` e `database.ts` já praticam; a matriz da extração é reconciliada por `/reversa-sync` | respeita |
| VII. Testes em dois papéis | Validação por contrato nos dois estados do banco (D-08) e por unidade em `infra/saude.ts`; o defeito de origem — healthcheck que responde sem verificar — vira asserção permanente, e não anotação | respeita |
| VIII. Proporcionalidade | Categoria **Aplicação**. O adaptador é uma função; o que sobe de rigor é o contrato e o teste, não a estrutura | respeita |
| IX. A prosa do produto tem norma declarada | A rota está sob a varredura de `scripts/inventariar-textos.mts`, que cobre `models`, `interface` e `pages`. Os literais novos são **identificadores** (nomes de campo e valores de enumeração) e serão declarados em `scripts/textos/classes/pages-e-arquivos.mts`, que já tem entrada para este arquivo. Nenhum texto autoral novo chega à tela | respeita |

Nenhum conflito de princípio a registrar.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | O estado do banco entra como objeto `banco` na raiz do corpo: `{ estado: "integro" \| "degradado", causa?: … }` (RF-01, RF-05) | Adição pura, que é o caso que o contrato da 002 autoriza em "Propriedades"; os três campos de hoje não se movem nem se reaninham, de modo que o consumidor antigo não percebe a mudança | (a) achatar em `banco_estado`/`banco_causa`, que espalha na raiz o que é uma coisa só; (b) aninhar tudo sob `dependencias.banco`, que antecipa uma pluralidade inexistente; (c) mover os campos de hoje para dentro de `deploy`, que seria reaninhamento e exigiria `/api/v2` | 🟢 |
| D-02 | `CausaDeErroDeBanco` ganha um quarto valor, `tempo_esgotado`, e ele é também o vocabulário público da causa (RF-01, RF-07, RN-03) | O cenário "o banco demora mais do que o healthcheck admite" exige distinguir lentidão de SQL defeituoso, e hoje ambos cairiam em `consulta`. A causa é palavra fechada de um vocabulário de quatro termos: não carrega host, SQL nem duração, e por isso atravessa a fronteira pública sem tradução | (a) mapear o cancelamento para `consulta`, que apaga a distinção que o critério de aceite pede; (b) manter três causas e derivar o rótulo na rota inspecionando a mensagem interna, que acopla a rota ao texto de um erro e o torna intraduzível; (c) criar um vocabulário público paralelo às causas internas, que duplica a lista e a deixa divergir | 🟢 |
| D-03 | O teto de RF-07 é **orçamento total repartido**, realizado no servidor: o pool passa a nascer com `connectionTimeoutMillis` e `statement_timeout` iguais ao teto padrão, e `query(texto, parametros, { tetoMs })` só emite `SELECT set_config('statement_timeout', $1, false)` quando o teto pedido difere do padrão. `saude({ tetoMs })` apenas repassa. Estourado o tempo, o cliente é descartado (`release(true)`) | É o único mecanismo que **cancela de fato**: o Postgres aborta a consulta e devolve `57014`, deixando a conexão limpa. O relógio começa antes de obter a conexão e o que sobra vira o teto da consulta, de modo que o total respeita os 3 s em vez de admiti-los duas vezes. O caminho quente não paga round-trip, porque o padrão já viaja no startup da conexão | (a) `Promise.race` externo, vetado pelo próprio RF-07: não cancela e deixa a conexão consumindo o pool depois de a resposta ter saído; (b) `query_timeout` do `pg` por chamada — suportado (`node_modules/pg/lib/client.js:660`), mas é temporizador de cliente: a consulta segue viva no servidor e o cliente volta ao pool com resposta pendente; (c) `statement_timeout` só no startup do pool, que cancela igualmente mas fixa o teto e retira a parametrização de que o teste do cenário depende | 🟢 |
| D-04 | `publicado_em` é carimbo de **build**, injetado por `next.config.ts` via `env: { APS_PUBLICADO_EM: new Date().toISOString() }`, e o campo é `string \| null` (RF-03) | O valor precisa ser idêntico entre duas consultas ao mesmo deploy e diferente entre deploys, e o único instante com essa propriedade é o do build. A opção `env` é substituição estática em tempo de build, presente no esquema de configuração do Next 16 (`node_modules/next/dist/server/config-schema.js:542`); `null` é o caminho honesto para quem executar o handler fora de um build carimbado | (a) avaliar `new Date()` no escopo do módulo, que muda a cada partida a frio e mediria a instância, não o deploy; (b) usar a data do commit publicado, que mede quando alguém escreveu o código, e não quando ele subiu; (c) `VERCEL_DEPLOYMENT_ID`, que identifica o deploy sem datá-lo | 🟢 |
| D-05 | `ambiente` é vocabulário próprio — `producao \| pre-visualizacao \| local` —, derivado de `VERCEL_ENV` e nunca o repassando cru (RF-04) | O corpo é contrato do produto, e amarrá-lo aos nomes de um provedor faria a troca de hospedagem virar mudança incompatível. A tradução mora num ponto só e é trivial de reapontar | (a) ecoar o valor do provedor; (b) inferir do `Host` da requisição, que confunde domínio próprio com alias e falha atrás de proxy; (c) omitir o campo, já que RF-04 é `Should` — descartada porque é exatamente a conferência apontada por engano a uma pré-visualização que motiva o requisito | 🟡 — o valor em pré-visualização não foi observado deste repositório; verificável no primeiro deploy de preview |
| D-06 | O teto vem de `APS_TIMEOUT_SAUDE_MS`, inteiro em milissegundos, padrão 3 000; valor ausente ou inválido cai no padrão e registra uma linha de log estruturado (RF-07, RNF "Desempenho") | Configuração fora do código, com falha barulhenta em vez de silêncio: um teto malformado que virasse `NaN` desligaria a proteção sem que ninguém soubesse | (a) constante no código, que exigiria deploy para ajustar o teto ao comportamento real do plano gratuito; (b) parâmetro na URL, que é superfície de entrada nova e contradiz `MD-0032` | 🟢 |
| D-07 | Nasce `infra/saude.ts`, com `verificarBanco(tetoMs?): Promise<EstadoDoBanco>`, função que **nunca lança**: devolve `{ estado: "integro" }` ou `{ estado: "degradado", causa }` (RF-01, RF-02, RN-03) | Erro esperado é valor, que é a invariante 2 do `domain.md` e o que ADR 0004 já pratica no domínio clínico. A separação mantém `infra/database.ts` como único ponto de acesso ao banco, deixa o handler fino e torna os três estados testáveis por unidade, sem servidor de pé | (a) tratar o erro dentro do handler, que mistura composição de resposta com política de falha e só se testa com servidor; (b) mudar `saude()` para devolver união, que quebraria o contrato da 003 e o teste que hoje exige rejeição; (c) pôr a tradução em `models/`, que é a camada clínica e não conhece infraestrutura | 🟢 |
| D-08 | O estado degradado é verificado **ponta a ponta**, com um segundo servidor no job de contrato do CI apontado a uma `DATABASE_URL` inalcançável, e não por duplo de teste (RF-01, RF-02, RF-06) | RF-06 exige a denylist "inclusive no degradado", e denylist se afere sobre o corpo realmente serializado. O custo é um `npm start` a mais sobre um build que já existe, com recusa imediata de conexão | (a) só duplo de teste com `vi.mock`, que prova a lógica e não o corpo; (b) derrubar o serviço de banco no meio do job, que torna o job sequencial e frágil; (c) confiar no teste manual do `onboarding.md`, que não é portão | 🟢 |
| D-09 | `scripts/conferir-producao.mts` trata `publicado_em`, `ambiente` e `banco` como **opcionais** na leitura, exibe a idade do deploy e ganha `--exigir-saudavel` (RF-08) | O comando é a ferramenta de conferir defasagem, e a produção que ele consulta é, por definição, capaz de ser anterior a esta feature. Exigir campo novo faria a própria conferência falhar com erro de apuração justamente quando ela precisa dizer "defasada". Os códigos de saída seguem respondendo à defasagem, conforme Q4 | (a) exigir os campos novos, que confunde ausência de campo com erro de contrato; (b) criar um terceiro código de saída para degradado, descartado em Q4 pela precedência arbitrária no caso defasada-e-degradada; (c) comando novo só para saúde, que duplica a leitura da mesma rota | 🟢 |
| D-10 | Escopo negativo do corpo: nada de latência da consulta, região, versão do servidor de banco ou contagem de erros (RNF "Escopo negativo") | Princípio II: campo sem RF que o origine não entra. Latência mede a instância que respondeu, e num tempo de resposta que já embute o despertar da instância suspensa ela informa menos do que sugere | (a) `latencia_ms` no objeto `banco`, tentador e sem requisito; (b) histórico de últimas verificações, que é estado, vetado por `MD-0032` | 🟢 |

## 4. Premissas

Nenhuma premissa nasce de `[DÚVIDA]` não resolvida: a seção 10 do `requirements.md` registra as
três como fechadas. Restam duas premissas técnicas, ambas verificáveis dentro da execução:

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| `VERCEL_ENV` vale `production` em produção e `preview` na pré-visualização, e chega ao runtime da Function | §5, RF-04 (🟡); D-05 | O campo `ambiente` sai como `local` em produção. Detectável na primeira conferência pós-deploy; correção é de uma linha e não afeta nenhum outro campo |
| A substituição de `env` do `next.config.ts` alcança o bundle da rota de API sob Turbopack | §5, RF-03; D-04 | `publicado_em` sai `null` em produção. O teste de contrato reprova antes do merge, porque exige o campo presente e em ISO 8601 no alvo apontado por `API_BASE_URL` |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `pages/api/v1/status` (Módulo 13) | `_reversa_sdd/code-analysis.md#módulo-13--pagesapiv1status` | contrato-alterado | Handler passa a `async`, consulta o banco por `infra/saude.ts` e acrescenta `banco`, `publicado_em` e `ambiente`; 405, `no-store` e ausência de `Set-Cookie` intocados |
| `infra` (Módulo 14) | `_reversa_sdd/code-analysis.md#módulo-14--infra` | regra-alterada | `saude()` aceita teto; quarta causa `tempo_esgotado`; pool nasce com `connectionTimeoutMillis` e `statement_timeout` derivados do teto padrão |
| `infra/saude.ts` | — | componente-novo | Adaptador de uma função que converte `ErroDeBanco` em valor; único consumidor de `saude()` em produção |
| `pages` (Módulo 12, shell Next.js) | `_reversa_sdd/code-analysis.md#módulo-12--pages` | regra-alterada | `next.config.ts` passa a carimbar o instante do build em `env`, ao lado da CSP e do `turbopack.root` que já mantém |
| Integração com o banco gerenciado | `_reversa_sdd/architecture.md` §2 e §4 | regra-alterada | Deixa de ser vínculo afirmado pela extração e passa a ser vínculo executado: a linha "usada SÓ pelo healthcheck" torna-se verdadeira em runtime, e não só em intenção |
| `scripts/conferir-producao.mts` | fora da árvore de módulos da extração (entregue em `5db2cb4`) | regra-alterada | Lê os campos novos como opcionais, exibe idade do deploy e estado do banco, e ganha `--exigir-saudavel` |
| CI, job `contrato` | `.github/workflows/ci.yml` | regra-alterada | Sobe um segundo servidor com `DATABASE_URL` inalcançável, para o cenário degradado (D-08) |

Nenhuma tela, nenhuma rota de página e nenhum domínio clínico entra no delta — é o que RF-10 exige e
o que o `git diff` há de comprovar.

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma tabela, nenhuma coluna, nenhuma migração.** O banco continua sem
  esquema de aplicação, e a consulta segue sendo `SELECT $1::int AS ok`. O que muda é a forma do
  corpo da resposta e o tipo `EstadoDoBanco`, estruturas efêmeras por requisição, além de um quarto
  valor na união `CausaDeErroDeBanco`.
- Detalhe completo em: `_reversa_forward/022-status-healthcheck-e-deploy/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `GET /api/v1/status` | HTTP | `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md` |
| Conexão com o banco e superfície de `infra/database.ts` | conexão TCP/TLS e módulo | `_reversa_forward/022-status-healthcheck-e-deploy/interfaces/conexao-banco.md` |

O segundo contrato **revoga uma cláusula do seu antecessor**: o §4 do contrato da feature 003 diz
"o endpoint não consulta o banco (RN-03; watch W006)". Esta feature existe para tornar essa frase
falsa, e a revogação é declarada, não silenciosa.

## 8. Plano de migração

Não há migração de dados. Há uma ordem de entrega, e ela importa porque o portão de contrato roda
contra o build de produção:

1. Escrever os dois arquivos de `interfaces/` antes de qualquer linha de código (Princípio I).
2. `infra/database.ts`: quarta causa, teto por chamada, pool derivado do teto. A suíte da 003
   continua verde sem alteração de chamada, porque o parâmetro é opcional.
3. `infra/saude.ts` e seus testes de unidade, com os três desfechos.
4. `next.config.ts`: carimbo de build.
5. `pages/api/v1/status.ts`: composição do corpo, e a declaração de classe dos literais novos em
   `scripts/textos/classes/pages-e-arquivos.mts` na mesma ação — literal sem classe faz
   `node scripts/inventariar-textos.mts` parar, e a ação não se dá por concluída antes disso.
6. Contrato: `tests/contract/api/v1/status.test.ts` ampliado, incluindo o alvo degradado.
7. CI: segundo servidor no job de contrato.
8. `scripts/conferir-producao.mts`: campos opcionais, idade do deploy, `--exigir-saudavel`.
9. Portões na ordem de custo: `typecheck`, `lint`, `npm test`, `npm run build` + `test:api`, e o
   inventário textual idempotente.

A entrega chega a produção pelo caminho de sempre, e a conferência final é `npm run status:conferir`
contra `https://apsinteligente.app`, que passa a exibir os campos que ela mesma acaba de ganhar.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| A instância suspensa demora mais que 3 s ao despertar, e o healthcheck passa a acusar degradação onde há apenas ociosidade | médio — falso negativo sistemático, exatamente o que Q5 quis evitar | média | Teto configurável por ambiente (D-06) sem novo deploy de código; o estado `tempo_esgotado` é distinto de `conexao`, de modo que o falso negativo é reconhecível pelo próprio campo, e não se confunde com banco fora |
| A rota passa a ter I/O e a latência do status sobe de ~0,3 s para algo entre 0,4 s e o teto | baixo | alta (é o efeito pretendido) | Uma tentativa só (RN-06), teto de 3 s e nenhum consumidor em laço hoje; o gatilho de `MD-0032` cobre o dia em que houver |
| Conexão pendurada no pool depois de a resposta ter saído | alto — esgotaria as cinco conexões e transformaria degradação em indisponibilidade | baixa | D-03: cancelamento no servidor e descarte do cliente no caminho de estouro; asserção de que consultas sucessivas após um estouro continuam obtendo conexão |
| A substituição de `env` não alcança o bundle sob Turbopack, e `publicado_em` sai `null` | médio — RF-03 não se realiza | baixa | O teste de contrato exige o campo presente e em ISO 8601; reprova antes do merge. Plano B registrado em `investigation.md` §4 |
| O segundo servidor do CI colide de porta ou não sobe a tempo | baixo — job vermelho por infraestrutura, não por defeito | média | Espera ativa com o mesmo padrão de 60 s que o job já usa para o primeiro servidor, e porta fixa distinta |
| Alguém lê `estado: "degradado"` como "produto fora do ar" | médio — alarme falso sobre software clínico | baixa | `MD-0031` fixa a leitura, o `README.md` a repete, e o comando de conferência a torna explícita ao separar defasagem de degradação |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Os dois arquivos de `interfaces/` escritos **antes** do código, e o teste de contrato derivado deles
- [ ] `GET /api/v1/status` responde 200 e traz `banco` íntegro com o banco de pé, e degradado com o banco fora, nos dois casos com `no-store`, sem `Set-Cookie` e sem host, URL, credencial ou trecho de SQL
- [ ] `atualizado_em`, `versao` e `commit` presentes e com a semântica da 002 (RF-05)
- [ ] `publicado_em` idêntico entre duas consultas ao mesmo deploy (RF-03)
- [ ] `npm run status:conferir` exibe idade do deploy e estado do banco, com os códigos de saída de hoje, e `--exigir-saudavel` promove degradado a saída não-zero (RF-08)
- [ ] `git diff` vazio em `models/`, `interface/` e `pages/` fora de `pages/api/v1/status.ts` (RF-10)
- [ ] `node scripts/inventariar-textos.mts` idempotente, com os literais novos declarados como identificador (Princípio IX)
- [ ] Portões verdes: `typecheck`, `lint`, `npm test`, `npm run test:api` contra o build de produção, `npm run test:e2e`
- [ ] Conferência pós-deploy contra `https://apsinteligente.app`, com `ambiente` valendo `producao` (fecha a premissa 🟡 de D-05)
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-plan`, sobre requirements travado e sem `[DÚVIDA]`, com as fichas `MD-0031` e `MD-0032` já vigentes | reversa |
| 2026-07-28 | Emenda a D-03 durante `/reversa-to-do`: o teto desce de `saude()` para `query()`, porque a consulta de saúde é rápida demais para que o cenário de RF-07 fosse verificável de modo determinístico com o teto na camada de cima. `interfaces/conexao-banco.md` §2 registra a razão; nenhuma outra decisão muda | reversa |
