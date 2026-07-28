# Actions: O healthcheck passa a verificar o que promete

> Identificador: `022-status-healthcheck-e-deploy`
> Data: `2026-07-28`
> Roadmap: `_reversa_forward/022-status-healthcheck-e-deploy/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 22 |
| Paralelizáveis (`[//]`) | 9 |
| Maior cadeia de dependência | 12 (T004 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T017 → T018 → T021 → T022) |

A ordem das fases é TDD com uma cautela aprendida na feature 021: **teste que muda de alvo não tem
linha de base verde**. Aqui o alvo não muda — o que muda é o corpo —, e por isso a reprovação da
fase 2 é limpa e informativa: os testes de contrato falham por campo ausente, e os de unidade, por
módulo inexistente. T007 existe para **registrar** essa reprovação antes que qualquer linha do
núcleo seja escrita; sem esse registro, ninguém saberá, daqui a seis meses, se o teste chegou a
provar alguma coisa.

Duas ações não escrevem código e mesmo assim são obrigatórias. T014 fecha a premissa 🟡 de D-04
inspecionando o artefato de build, e T018 prova D-09 contra a produção **anterior** à feature, que é
o único momento em que esse caminho pode ser observado — depois do deploy ele deixa de existir.

## Fase 1, Preparação

<!-- Setup, scaffolding, migrações iniciais, configuração de infraestrutura local. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Acrescentar `APS_TIMEOUT_SAUDE_MS` ao gabarito, comentada e com o padrão de 3 000 ms, explicando em uma linha por que não são 2 000: despertar a instância suspensa custa mais que a consulta quente, e um teto curto produziria falso negativo sistemático (D-06, Q5) | - | `[//]` | `.env.example` | 🟢 | `[X]` |
| T002 | Carimbar o instante do build em `next.config.ts`, acrescentando `env: { APS_PUBLICADO_EM: new Date().toISOString() }` ao objeto de configuração, ao lado da CSP e do `turbopack.root` que já vivem ali. Comentário de cabeçalho citando RF-03 e D-04, e dizendo o que o valor **não** é: não é a data do commit, nem o instante da requisição | - | `[//]` | `next.config.ts` | 🟢 | `[X]` |

## Fase 2, Testes

<!-- Testes que precisam existir antes ou logo após o núcleo. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Criar os testes de unidade de `verificarBanco`, com duplo de `infra/database` no lugar do banco: um caso íntegro e quatro degradados, um por causa (`conexao`, `consulta`, `configuracao`, `tempo_esgotado`). Asserção central e que não pode faltar: a função **nunca rejeita**, nem quando o duplo lança erro que não é `ErroDeBanco` — nesse caso o desfecho é degradado, não exceção (D-07, RF-02) | - | `[//]` | `tests/unit/infra/saude.test.ts` | 🟢 | `[X]` |
| T004 | Ampliar o contrato do módulo de banco com o teto: (a) `query("SELECT pg_sleep(5)", [], { tetoMs: 200 })` rejeita com `ErroDeBanco` de causa `tempo_esgotado` em menos de 1 s; (b) imediatamente depois, dez chamadas sucessivas a `saude()` completam — prova de que o cliente descartado não deixou o pool preso, que é o risco alto do roadmap; (c) `saude()` sem argumento segue com o comportamento de hoje. Exige banco de pé (`npm run db:up`) | - | `[//]` | `tests/contract/infra/banco.test.ts` | 🟢 | `[X]` |
| T005 | Ampliar o contrato da rota para o corpo novo no alvo padrão: seis chaves na raiz; `publicado_em` em ISO 8601 e **idêntico entre duas consultas**; `ambiente` dentro do vocabulário fechado; `banco.estado` igual a `integro`; e os três campos da 002 preservados em nome, tipo e semântica (RF-01, RF-03, RF-04, RF-05) | - | `[//]` | `tests/contract/api/v1/status.test.ts` | 🟢 | `[X]` |
| T006 | Acrescentar ao mesmo arquivo o bloco do estado degradado, lido de `API_BASE_URL_DEGRADADO` e **pulado quando a variável estiver ausente**, de modo que a suíte siga executável localmente com um servidor só: 200 e não 503, `banco.estado` degradado com causa em vocabulário público, os campos de deploy ainda corretos, e a denylist estendida a host, URL de conexão e trecho de SQL sobre o corpo serializado (RF-02, RF-06, D-08) | T005 | - | `tests/contract/api/v1/status.test.ts` | 🟢 | `[X]` |
| T007 | Executar as três suítes e **registrar a reprovação de linha de base** na nota de execução: unidade falhando por `infra/saude.ts` inexistente, contrato do banco falhando por `query` sem teto, contrato da rota falhando por corpo de três chaves. Colar a saída resumida. É o que separa teste escrito de teste que prova | T003, T004, T005, T006 | - | — | 🟢 | `[X]` |

## Fase 3, Núcleo

<!-- Lógica central da feature. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Acrescentar `tempo_esgotado` a `CausaDeErroDeBanco` e à classificação: `57014` (cancelamento pelo servidor) deixa de cair em `consulta`, e o estouro na espera por conexão — `ETIMEDOUT` e a mensagem "timeout exceeded when trying to connect" que o módulo já reconhece — deixa de cair em `conexao`. Os demais códigos de `CODIGOS_DE_CONEXAO` ficam onde estão (D-02, `data-delta.md` §2.2) | T007 | - | `infra/database.ts` | 🟢 | `[X]` |
| T009 | Realizar o teto no mesmo módulo: ler `APS_TIMEOUT_SAUDE_MS` com validação de inteiro positivo, caindo no padrão de 3 000 e registrando log estruturado quando inválido; criar o pool com `connectionTimeoutMillis` e `statement_timeout` iguais ao padrão; dar a `query` o parâmetro `{ tetoMs }`, que emite `SELECT set_config('statement_timeout', $1, false)` **apenas** quando difere do padrão; descartar o cliente (`release(true)`) no caminho de estouro. Nunca impor o limite com `Promise.race` — o contrato o proíbe pelo nome (D-03, D-06) | T008 | - | `infra/database.ts` | 🟢 | `[X]` |
| T010 | Criar `infra/saude.ts` com `verificarBanco(tetoMs?)`, que chama `saude()` e converte o desfecho em valor: `{ estado: "integro" }` ou `{ estado: "degradado", causa }`, exportando também o tipo `EstadoDoBanco`. A função não relança nada, e o que ela **não** faz é tão importante quanto o que faz: não formata mensagem, não lê ambiente, não compõe resposta (D-07) | T003, T009 | - | `infra/saude.ts` | 🟢 | `[X]` |
| T011 | Reescrever o handler do status: `async`, com a discriminação de método e o 405 **antes** de qualquer I/O, `Cache-Control: no-store` preservado, e o corpo composto por `atualizado_em`, `versao` e `commit` intocados mais `publicado_em` (de `APS_PUBLICADO_EM`, ou `null`), `ambiente` (tradução de `VERCEL_ENV` para `producao`/`pre-visualizacao`/`local`, nunca o valor cru) e `banco` (de `verificarBanco`). Cabeçalho citando os RF desta feature e o contrato em `022/interfaces/` (D-01, D-05, RF-01 a RF-05) | T002, T010 | - | `pages/api/v1/status.ts` | 🟢 | `[X]` |
| T012 | Declarar a classe dos literais novos da rota como **identificador** na entrada já existente de `pages/api/v1/status.ts`, e rodar `node scripts/inventariar-textos.mts` até a idempotência. Nenhum texto autoral novo entra: nomes de campo e valores de enumeração são identificadores por definição do Princípio IX, e literal sem entrada faz o gerador parar | T011 | - | `scripts/textos/classes/pages-e-arquivos.mts` | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Cola com outras partes do sistema, contratos externos, ganchos. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T013 | Converter a reprovação de T007 em verde: com o banco de pé e o build de produção servindo, rodar unidade e contrato e registrar o resultado. Divergência entre o corpo servido e o que `interfaces/http-get-api-v1-status.md` declara é bloqueio, e a correção é no código, jamais no documento (Princípio I, RF-09) | T011, T012 | - | — | 🟢 | `[X]` |
| T014 | Fechar a premissa 🟡 de D-04 por inspeção do artefato: após `npm run build`, confirmar que o bundle da rota em `.next/server/pages/api/v1/` contém um carimbo ISO literal, e não a leitura de uma variável que ninguém definiu; em seguida, duas consultas ao servidor com `publicado_em` idêntico. Vindo `null`, acionar o plano B de `investigation.md` §4 e registrar a mudança de rota antes de prosseguir | T013 | - | — | 🟡 | `[X]` |
| T015 | Exercitar os dois estados degradados localmente, pelo procedimento de `onboarding.md` §5 e §6: com `npm run db:down`, o corpo traz `causa: "conexao"` e o código segue 200, e as calculadoras continuam servindo; com `APS_TIMEOUT_SAUDE_MS=1`, a causa é `tempo_esgotado` e dez consultas seguidas respondem de imediato. Registrar os corpos e a busca por vazamento de host, URL ou SQL (RF-02, RF-06, RF-07) | T013 | - | — | 🟢 | `[X]` |
| T016 | Dar ao job `contrato` do CI um segundo servidor sobre o mesmo build: porta 3001, `DATABASE_URL` apontada a `127.0.0.1:9`, espera ativa no mesmo padrão de 60 s que o primeiro já usa, e `API_BASE_URL_DEGRADADO` no ambiente do passo de teste. Os jobs `verificacao` e `deploy` ficam intocados (D-08) | T006 | `[//]` | `.github/workflows/ci.yml` | 🟢 | `[X]` |
| T017 | Ensinar o comando de conferência a ler os campos novos **como opcionais**: exibir há quanto tempo o deploy subiu e o estado do banco no texto, acrescentá-los ao `--json`, e criar `--exigir-saudavel`, que promove degradado a saída não-zero sem tocar na semântica dos códigos de hoje, que seguem respondendo à defasagem. Campo ausente é "desconhecido", nunca erro de contrato (D-09, RF-08, Q4) | T011 | - | `scripts/conferir-producao.mts` | 🟢 | `[X]` |
| T018 | Provar D-09 na única janela em que ele é observável — **antes do deploy desta feature** —, rodando o comando contra a produção atual, que ainda responde com três campos: o veredito de defasagem sai correto, os campos novos aparecem como desconhecidos e o código de saída não é 2. Depois do deploy este caminho deixa de existir, e a prova com ele | T017 | - | — | 🟢 | `[X]` |

## Fase 5, Polimento

<!-- Logs, telemetria, mensagens, documentação curta. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T019 | Atualizar a seção "Como verificar saúde" do README com o que o corpo passou a dizer, e com a leitura que `MD-0031` fixa: degradado significa banco fora, não produto fora, e as calculadoras seguem servindo. Incluir a linha de `--exigir-saudavel` e a de `APS_TIMEOUT_SAUDE_MS` | T017 | `[//]` | `README.md` | 🟢 | `[X]` |
| T020 | Conferir a disciplina de log no caminho novo: o estouro de tempo registra linha estruturada com causa, nome do erro, host **mascarado** e o teto aplicado, sem URL, sem senha e sem parâmetro de consulta — a mesma régua que `registrar()` já pratica. Vale como verificação com evidência colada, e não como leitura de código (RNF "Observabilidade") | T015 | `[//]` | `infra/database.ts` | 🟢 | `[X]` |
| T021 | Rodar os portões na ordem de custo crescente e registrar os números: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` seguido de `npm run test:api` nos dois alvos, `npm run test:e2e`, e `node scripts/inventariar-textos.mts` idempotente. Formatar apenas os arquivos escritos nesta feature; `e2e/plataforma.spec.ts` já reprovava `prettier --check` antes dela, e corrigi-lo aqui violaria RF-10 | T013, T014, T015, T016, T018, T019, T020 | - | — | 🟢 | `[X]` |
| T022 | Conferir RF-10 pelo `git diff`: nenhum arquivo de `models/`, de `interface/` ou de `pages/` fora de `pages/api/v1/status.ts` aparece na mudança. Aparecendo, é escopo vazado, e a ação é remover, não justificar | T021 | - | — | 🟢 | `[X]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

### T007 — reprovação de linha de base, registrada antes do núcleo

As três suítes foram executadas com o banco local de pé e o build de produção servindo na porta
3000, ainda com o handler de três campos. Cada uma reprovou pela razão prevista, e nenhuma por
outra:

**Unidade** (`npx vitest run tests/unit/infra/saude.test.ts`) — 1 suíte falha, 0 testes executados:

```
Error: Cannot find module '/infra/saude' imported from tests/unit/infra/saude.test.ts
```

**Contrato do banco** (`--config vitest.api.config.ts tests/contract/infra/banco.test.ts`) —
1 falha, 5 passes:

```
teto excedido: causa tempo_esgotado, e o cliente descartado não prende o pool
- { "causa": "tempo_esgotado" }
+ ErroDeBanco { "causa": "consulta" }
```

O `{ tetoMs }` é hoje um argumento ignorado, e quem cortou a consulta foi o `query_timeout` de
5 000 ms do driver — que classifica como `consulta`. A reprovação diz exatamente isso.

**Contrato da rota** (`--config vitest.api.config.ts tests/contract/api/v1/status.test.ts`) —
3 falhas, 9 passes, 4 pulados (bloco degradado, sem `API_BASE_URL_DEGRADADO`):

```
200 com as seis chaves da raiz     → ["atualizado_em","commit","versao"]
campos de deploy                   → expected undefined to be 'string'  (publicado_em)
RF-01 banco.estado é integro       → expected undefined to deeply equal { estado: 'integro' }
```

### Achado A001 — a restauração do teto não estava no contrato, e sem ela a sessão fica suja

`interfaces/conexao-banco.md` §2 manda emitir `set_config('statement_timeout', $1, false)` quando o
teto pedido difere do padrão, e descartar o cliente **no caminho de estouro**. O que o contrato não
trata é o caminho de **sucesso** com teto explícito: `is_local = false` vale para a sessão inteira, e
o cliente volta ao pool carregando o teto pequeno, que contaminaria a próxima consulta a cair na
mesma conexão. A restauração ao padrão no `finally` é o que faz valer a cláusula que o contrato já
escreveu — "sem argumento, vale o padrão" —, e por isso não é decisão nova, e sim realização da
existente. Fica como guarda o segundo teste novo de `tests/contract/infra/banco.test.ts`, que exige
uma consulta de 500 ms passar logo depois de uma chamada com teto de 200 ms.

### T014 — a premissa 🟡 de D-04 cai como confirmada, por inspeção do artefato

A substituição de `env` **alcança** o bundle da rota sob Turbopack. A prova não é a resposta do
servidor, que poderia vir de leitura em runtime, e sim o artefato:

```
$ grep -o 'publicado_em[^,]*' '.next/server/chunks/[root-of-the-server]__1g4bj3g._.js'
publicado_em:"2026-07-28T20:23:07.351Z"

$ grep -c 'APS_PUBLICADO_EM' '.next/server/chunks/[root-of-the-server]__1g4bj3g._.js'
0
```

O carimbo está literal no chunk e o nome da variável **não aparece em lugar nenhum**: não há o que
ler em runtime. Duas consultas ao mesmo servidor devolvem `publicado_em` idêntico
(`20:23:07.351Z`) com `atualizado_em` distinto (`20:23:17.160Z` e `20:23:44.596Z`). O plano B de
`investigation.md` §4 não foi acionado, e a premissa passa a 🟢.

### Achado A004 — o estouro na espera pela conexão vinha classificado como `conexao`

T009 tratou `ETIMEDOUT` e "timeout exceeded when trying to connect", que é o que o contrato nomeia.
O driver, porém, anuncia o estouro de `connectionTimeoutMillis` com outra frase — **"Connection
terminated due to connection timeout"** —, e ela casava com o `/connection terminated/i` que
`ehErroDeConexao` já usava desde a 003 para queda de conexão. Resultado observado em T015:
`APS_TIMEOUT_SAUDE_MS=1` produzia `causa: "conexao"`, que significaria banco fora quando o banco
estava de pé e saudável — exatamente a confusão que D-02 existe para desfazer.

A correção é uma alternativa a mais na regex de estouro, que é avaliada antes da de conexão. Não é
decisão nova: `interfaces/conexao-banco.md` §3 já atribui a `tempo_esgotado` o "teto atingido, na
conexão ou na consulta". O que faltava era reconhecer a frase com que o driver o diz. Fica por
vigilância no watch, porque é acoplamento a texto de mensagem de biblioteca.

### T015 e T020 — os dois estados degradados, exercitados de fato

Banco derrubado (`npm run db:down`), servidor de pé:

```json
{"atualizado_em":"…","versao":"0.1.0","commit":"local","publicado_em":"2026-07-28T20:23:07.351Z",
 "ambiente":"local","banco":{"estado":"degradado","causa":"conexao"}}
```

Código **200**, `home 200` e `insulina 200` na mesma janela — a plataforma continua servindo, que é
o argumento de `MD-0031`. A busca por `postgres|localhost|senha|password|select|5433|127.0.0.1|host`
sobre o corpo respondeu `nada vazou`.

Teto absurdo (`APS_TIMEOUT_SAUDE_MS=1`), banco de pé:

```json
{"banco":{"estado":"degradado","causa":"tempo_esgotado"}}
```

Dez consultas seguidas: dez `tempo_esgotado`, **0,386 s no total** — nenhuma conexão ficou pendurada,
que é o risco alto do roadmap. E o log do caminho novo (T020), colado do servidor, não de leitura de
código:

```json
{"nivel":"erro","origem":"infra/database","causa":"tempo_esgotado","erro":"Error",
 "host":"loca•••","duracao_ms":0,"teto_ms":1}
```

Causa, nome do erro, host **mascarado** e o teto aplicado. Sem URL, sem senha, sem parâmetro de
consulta — a mesma régua que `registrar()` já praticava.

### T016 — o segundo alvo, ensaiado localmente antes de ir ao CI

O arranjo do CI foi exercitado nesta máquina com o mesmo build servindo duas vezes:

```
$ PORT=3001 DATABASE_URL='postgres://ninguem:nada@127.0.0.1:9/fora' npm start &
$ API_BASE_URL_DEGRADADO=http://localhost:3001 npm run test:api
  Test Files  3 passed (3) · Tests  26 passed (26)
```

Sem a variável, os quatro testes do bloco degradado aparecem como pulados e a suíte fecha
22 passados, 4 pulados — que é o comportamento pedido para quem roda com um servidor só.

### T018 — D-09 provado na janela em que ele existe

Contra `https://apsinteligente.app`, que ainda serve o corpo de três campos:

```
  produção  5db2cb4 · v0.1.0 · 256 ms
            publicado em data desconhecida · ambiente desconhecido · banco desconhecido
  local     5db2cb4 (último commit de aplicação)

  ✓ EM DIA
saída: 0
```

`--exigir-saudavel` contra o mesmo alvo também sai 0: banco **desconhecido** não é banco degradado, e
ausência de campo não vira erro de apuração. O `--json` traz `publicado_em`, `ambiente` e `banco`
como `null`, que é a forma estruturada de dizer o mesmo. Depois do deploy desta feature este caminho
deixa de existir, e a prova com ele.

Contra os servidores locais, os dois eixos aparecem separados: o alvo íntegro exibe
`publicado há 3 min · ambiente local · banco íntegro`; o degradado exibe
`banco degradado (conexao)`, a nota de que as calculadoras seguem servindo e, sob
`--exigir-saudavel`, a linha que atribui a saída não-zero a esse motivo.

### T021 e T022 — os portões, com número, e o escopo conferido pelo `git status`

| Portão | Resultado |
|---|---|
| `npm run typecheck` | verde |
| `npm run lint` | verde |
| `npm test` | **816** testes, 67 arquivos (eram 808; os 8 novos são a unidade de `verificarBanco`) |
| `npm run build` + `npm run test:api` (dois alvos) | **26** de 26, incluindo os 4 do bloco degradado |
| `npm run test:e2e` | **56** de 56, axe em zero |
| `node scripts/inventariar-textos.mts --gerar` | idempotente, 1187 literais |

O inventário subiu de 1168 para 1187 pelos 19 literais que a seção nova do `README.md` acrescentou;
o gerador não parou, porque o README é declarado de classe uniforme por origem.

RF-10 conferido pelo `git status`: o único arquivo tocado em `models/`, `interface/` ou `pages/` é
`pages/api/v1/status.ts`. Nenhuma tela, nenhuma regra clínica, nenhuma rota de página.

### Observação O-22-01 — a norma do produto alcança o `README.md`, e alcançou esta feature

Dois travessões escritos na seção nova reprovaram `tests/unit/textos/norma.test.ts` por `MD-0020`.
Foram trocados por dois-pontos e vírgula, e a suíte voltou ao verde. Vale registrar porque a
tentação de tratar o README como documento interno é real: ele **é** superfície textual do produto,
está na travessia do inventário, e a norma o alcança.

### Observação O-22-02 — o `README.md` reprova `prettier --check`, e já reprovava antes

Mesma família de `O-21-06` (`e2e/plataforma.spec.ts`): conferido contra o `HEAD` antes de decidir,
com o arquivo original extraído por `git show`. O `prettier --write` desta feature reformatou uma
célula da tabela do topo, alheia à entrega; a linha foi **restaurada ao que era**, e a formatação
ficou restrita ao que esta feature escreveu.

### Achado A003 — T012 não tinha literal a declarar, e declarar assim mesmo seria pior

A ação supunha que os literais novos da rota entrariam no inventário como candidatos a classificar.
Não entraram: a régua de `scripts/inventariar-textos.mts` é a união de posição de exibição e corte de
duas palavras, e `producao`, `pre-visualizacao`, `integro`, `degradado` e os nomes de campo ficam
**abaixo do corte** — uma palavra, fora de posição de exibição. O gerador não parou, e a única
mudança no inventário foi o número da linha do literal do 405, que desceu de 13 para 37 com a
reescrita do handler.

Declarar entradas para literais que a travessia não apanha criaria declaração órfã, e órfã hoje não
é verificada por ninguém (`todasAsDeclaracoes` existe em `scripts/textos/classificacao.mts` e não
tem consumidor). Seria peso morto com aparência de rigor. O critério real da ação — nenhum texto
autoral novo, gerador idempotente — está cumprido e conferido por duas execuções seguidas com
`git diff` estável.

### Achado A002 — a causa de erro que não é `ErroDeBanco` é lacuna de contrato, e foi preenchida

`interfaces/conexao-banco.md` §4 diz que `verificarBanco` nunca lança, sem dizer que causa atribuir
ao erro que não seja `ErroDeBanco` — situação que, pelo próprio contrato, é bug e não estado. A
escolha foi `consulta`, por coerência com a classificação que `infra/database.ts` já pratica desde a
003, onde tudo o que não é conexão, configuração ou tempo cai no balde de consulta; e ela é
barulhenta, com linha de log estruturado, porque chegar ali significa contrato interno quebrado.
Nenhuma ação foi criada: preencher lacuna de contrato dentro do vocabulário que ele mesmo fecha não
é decisão nova.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-to-do`, sobre o roadmap já emendado em D-03 (teto desce de `saude` para `query`, pela razão registrada em `interfaces/conexao-banco.md` §2) | reversa |
