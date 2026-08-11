# Actions: Conexões do banco no status

> Identificador: `024-status-conexoes-do-banco`
> Data: `2026-08-10`
> Roadmap: `_reversa_forward/024-status-conexoes-do-banco/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 24 |
| Paralelizáveis (`[//]`) | 14 |
| Maior cadeia de dependência | 14 (T001 → T003 → T004 → T005 → T006 → T007 → T009 → T013 → T014 → T015 → T018 → T019 → T022 → T023) |

**A ordem é a da seção 8 do roadmap, e o núcleo precede os testes de propósito.** A feature 022
pôde escrever teste antes de código porque o vermelho dela era informativo: módulo inexistente,
campo ausente. Aqui o vermelho de partida seria outro, e mudo: `saude()` troca o tipo de retorno, de
modo que `tests/unit/infra/saude.test.ts` e `tests/contract/infra/banco.test.ts` param de compilar
assim que a assinatura mude, sem que nada tenha sido provado. Por isso a linha de base que interessa
nesta entrega é a **verde de antes**, registrada em T003, e a fase de testes vem depois do núcleo,
como o plano de migração fixou. As duas fases trocam de lugar; nenhuma some.

Três ações não escrevem código de produção e mesmo assim são obrigatórias. T002 confere os contratos
antes de qualquer edição, porque a §4 de `interfaces/conexao-banco.md` atribui a um arquivo de teste
uma prova que ele não alcança, e corrigir contrato depois do código inverte a fonte de verdade
(Princípio I). T017 prova a D-10 contra a produção **anterior** a esta entrega, que é a única janela
em que o caminho do consumidor antigo existe. T024 abre a vigilância da D-11, cuja resposta só chega
pelo próprio campo, depois do deploy.

O `.github/workflows/ci.yml` não aparece em ação alguma, e isso é resultado, não esquecimento: o job
de contrato já sobe os dois alvos desde a 022, e o arranjo serve esta feature sem uma linha de
mudança.

## Fase 1, Preparação

<!-- Setup, scaffolding, migrações iniciais, configuração de infraestrutura local. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Subir o banco local pelo passo 0 do `onboarding.md`, que existe por causa de uma armadilha real desta máquina: conferir com `docker ps --format '{{.Names}}\t{{.Ports}}' \| grep 543` se a 5433 está tomada por contêiner de outro projeto, e, estando, escolher porta livre e replicá-la em `.env.local` e `.env.test.local` antes de `POSTGRES_PORT=5455 npm run db:up`. O sintoma de não fazer isto é `28P01`, que se lê como credencial errada quando o problema é banco errado (RF-05, RF-10) | - | `[//]` | `.env.test.local` | 🟢 | `[X]` |
| T002 | Conferir os dois contratos de `interfaces/` contra o código vigente e reconciliar a divergência já visível, **no contrato e não no teste**: a §4 de `conexao-banco.md` atribui a `tests/unit/infra/saude.test.ts` a prova da sanitização da versão e das validações da linha, que vivem em `saude()` e ficam inalcançáveis pelo duplo de `infra/database` que aquele arquivo instala. A linha passa a nomear um arquivo de unidade do próprio módulo de banco. Confirmar também, palavra por palavra, a assinatura de `saude()`, o texto da consulta de quatro colunas e a forma do ramo íntegro (Princípio I, RF-04, RF-09) | - | `[//]` | `_reversa_forward/024-status-conexoes-do-banco/interfaces/conexao-banco.md` | 🟢 | `[X]` |
| T003 | Registrar a linha de base **verde**, antes de qualquer edição, com os números colados na nota de execução: `npm test`, e `npm run build && npm start` seguido de `npm run test:api`. É o oposto do T007 da 022 e serve ao mesmo fim: aqui a mudança de tipo há de reprovar a compilação de duas suítes, e sem o número de partida ninguém saberá, daqui a seis meses, o que já passava (RF-08, RF-10) | T001 | - | — | 🟢 | `[X]` |

## Fase 2, Núcleo

<!-- Lógica central da feature. Precede a fase de testes pela razão declarada no Resumo. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Alargar a linha da consulta de saúde em `infra/database.ts`: exportar o tipo `LeituraDeSaude` (`teto_de_conexoes`, `conexoes_abertas`, `versao`, todos `readonly`, em `snake_case` porque pela D-08 este tipo é a forma de fio: ver D-12) e trocar `SELECT $1::int AS ok` pela linha de quatro colunas que o contrato escreve, com `current_setting('max_connections')::int`, `count(*)` de `pg_stat_activity` filtrado por `datname = current_database()` e `current_setting('server_version')`, preservando o parâmetro `$1` e o repasse de `opcoes`. Jamais `version()`: ela devolve o nome do produto, a arquitetura e o compilador, e casa com `/postgres/i` da denylist verificada. Atualizar o cabeçalho do arquivo citando a feature 024, os RF-01, RF-02, RF-03 e RF-05 e o contrato `024/interfaces/conexao-banco.md`, e dizendo em uma linha o que a linha larga não é: não é medição de latência e não abre segunda ida ao banco (D-01, D-02, D-03) | T002, T003 | - | `infra/database.ts` | 🟢 | `[X]` |
| T005 | Interpretar a linha lida, **na forma que a D-12 decidiu** e não na que esta ação previa: a interpretação fica embutida em `saude()`, com auxiliares privados, em vez de virar função pura exportada, porque exportá-la alargaria a superfície pública do módulo só para servir ao teste, que já a alcança por `vi.importActual`. O substantivo da ação permanece: a linha crua vira `LeituraDeSaude` ou lança `ErroDeBanco("consulta")`. As quatro verificações são irmãs, com a mesma causa: `ok` diferente de `1` ou número de linhas diferente de `1`; teto que não seja inteiro positivo; abertas que não seja inteiro maior ou igual a um; versão fora do prefixo numérico. Nenhuma causa nova entra em `CausaDeErroDeBanco`, porque o vocabulário público é fechado e uma causa `estatistica` diria a quem lê o healthcheck algo que ele não pode acionar (D-05, RF-07, RN-03) | T004 | - | `infra/database.ts` | 🟢 | `[X]` |
| T006 | Sanitizar a versão para o prefixo numérico dentro dessa função, de modo que sufixo de distribuição entre parênteses, que imagens derivadas de Debian anexam ao `server_version`, não atravesse a fronteira do módulo. A cadeia da qual não se extraia prefixo numérico reprova com `ErroDeBanco("consulta")`, e não vira valor publicado degradado em silêncio. A mensagem do erro não cita o valor recebido nem o texto da consulta (RF-03, RN-06, D-03) | T005 | - | `infra/database.ts` | 🟢 | `[X]` |
| T007 | Alojar a leitura no ramo íntegro de `EstadoDoBanco`, em `infra/saude.ts`: o tipo passa a ser a interseção `{ estado: "integro" } & LeituraDeSaude`, e `verificarBanco` devolve `{ estado: "integro", ...leitura }`. O ramo degradado não muda em nada, e é essa assimetria que realiza a RN-02 por construção, sem uma linha de condicional. Atualizar o cabeçalho com o contrato desta feature e acrescentar ao que o módulo continua a não fazer o item novo: também **não interpreta** os números, não calcula proporção, não classifica ocupação (RF-01, RF-02, RF-06, D-04, D-06) | T005, T006 | - | `infra/saude.ts` | 🟢 | `[X]` |
| T008 | Atualizar **somente o comentário de cabeçalho** de `pages/api/v1/status.ts`, citando a feature 024, os RF-04 e RF-08 e o contrato `024/interfaces/http-get-api-v1-status.md`, e registrando por que nenhuma linha executável muda: o handler insere o valor de `verificarBanco()` inteiro sob a chave `banco`, de modo que a forma do valor cresce e a do handler não. Tocar o executável aqui é escopo vazado, e a ação diante disso é remover, não justificar (D-08, Princípio VI) | T007 | `[//]` | `pages/api/v1/status.ts` | 🟢 | `[X]` |
| T009 | Descrever o corpo novo em `_reversa_sdd/openapi/status.yaml` antes que teste algum o afira: `BancoIntegro` ganha `teto_de_conexoes` e `conexoes_abertas` (`integer`, `minimum: 1`) e `versao` (`string`, com padrão de prefixo numérico), os três **obrigatórios** em `required`, com `additionalProperties: false` preservado nos dois ramos. Obrigatórios, e não opcionais, porque pelas D-04 e D-05 um corpo íntegro sem os três campos é impossível. Os exemplos `integro` e `local` passam a trazê-los; o `degradado` fica intocado, byte a byte. Atualizar o comentário de cabeçalho do arquivo com o delta desta passagem (RF-09, D-09) | T007 | `[//]` | `_reversa_sdd/openapi/status.yaml` | 🟢 | `[X]` |

## Fase 3, Testes

<!-- Unidade primeiro, contrato depois, nos dois alvos (roadmap §8, passo 5). -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Criar a unidade da interpretação da linha, no arquivo que T002 fixou no contrato: linha completa e válida vira `LeituraDeSaude` com os três valores; `ok` diferente de `1`, teto igual a zero ou negativo, abertas igual a zero e versão sem prefixo numérico reprovam, cada um, com `ErroDeBanco` de causa `consulta`; e a sanitização entrega `"17.10"` a partir de cadeia que traga sufixo de distribuição entre parênteses. Nenhum destes casos pede banco de pé, porque a função é pura, e é justamente isso que os torna baratos de manter (RF-03, RF-07, RN-06) | T009 | `[//]` | `tests/unit/infra/saude.test.ts`, e não o `database.test.ts` que esta linha previa (`O-24-02`) | 🟢 | `[X]` |
| T011 | Atualizar a unidade de `verificarBanco`: o duplo deixa de resolver `{ ok: true }` e passa a resolver uma `LeituraDeSaude`; o caso íntegro afere que os três valores chegam ao valor devolvido **como vieram**, sem proporção, sem classificação e sem formatação, e que as chaves do estado são exatamente quatro. Os cinco desfechos degradados seguem com duas chaves, e a asserção que não pode faltar permanece a de que a função nunca rejeita (RF-01, RF-02, RF-06, D-06) | T009 | `[//]` | `tests/unit/infra/saude.test.ts` | 🟢 | `[X]` |
| T012 | Atualizar o contrato do módulo de banco contra o banco real: as três asserções `resolves.toEqual({ ok: true })` passam a exigir a leitura completa, com teto inteiro positivo, abertas maior ou igual a um e versão só numérica. O laço de dez chamadas depois do estouro de teto continua onde está, porque o risco que ele vigia não mudou: cliente devolvido sujo esgotaria as cinco conexões da pilha e transformaria degradação em indisponibilidade (RF-05, RF-10) | T009 | `[//]` | `tests/contract/infra/banco.test.ts` | 🟢 | `[X]` |
| T013 | Estender o contrato da rota no alvo íntegro: `expect(corpo.banco).toEqual({ estado: "integro" })` passa a exigir as quatro chaves, com teto inteiro positivo, abertas inteiro maior ou igual a um e nunca maior que o teto, e versão casando com o prefixo numérico. Nenhuma asserção da raiz muda de forma alguma, e o RF-08 se confere pelo `git diff` do próprio arquivo: as seis chaves, o `publicado_em` idêntico entre consultas, o `no-store`, o 405 e a ausência de `Set-Cookie` ficam como estão (RF-01, RF-02, RF-03, RF-08, RF-10) | T012 | `[//]` | `tests/contract/api/v1/status.test.ts` | 🟢 | `[X]` |
| T014 | Acrescentar ao mesmo arquivo as duas asserções que nascem desta feature e merecem nome. Primeira: no alvo degradado as chaves de `banco` continuam exatamente `["causa", "estado"]`, de modo que nenhum dos três campos aparece, nem como zero, nem como nulo. Segunda: a denylist permanece **intocada**, inclusive o padrão numérico `/54(32\|33)/`, e passa a ser aferida também sobre o corpo do alvo íntegro, que agora carrega números onde antes não havia nenhum. Enfraquecer a guarda para acomodar um falso positivo teórico seria trocar privacidade verificada por conveniência (RF-06, RN-05, D-07) | T013 | - | `tests/contract/api/v1/status.test.ts` | 🟢 | `[X]` |
| T015 | Converter o vermelho em verde e registrar os números na nota de execução, contra a linha de base de T003. Depois, conferir com o olho as três coisas que o `onboarding.md` §2 nomeia e que nenhum teste confere sozinho: `conexoes_abertas` nunca vale zero, porque a própria requisição se conta; `versao` traz só o número; e o teto é o do servidor, na casa da centena contra o contêiner local, e não os cinco da pilha da aplicação (RF-01, RF-02, RF-03, RF-10) | T010, T011, T012, T013, T014 | - | — | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Consumidores do contrato, contratos externos e a prova em ambiente real. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T016 | Ensinar o conferidor a exibir a ocupação, lendo os três campos como **opcionais**: a interface `EstadoDoBanco` do script ganha os campos, com leitor que devolve ausência diante de campo faltante ou de tipo errado; a segunda linha da saída passa a trazer a ocupação ao lado do estado, no molde `banco íntegro · 12/901 conexões`, e `ocupação desconhecida` quando os campos não vierem; o `--json` publica os três. Nada muda na semântica dos códigos de saída, que seguem respondendo à defasagem, e ausência jamais vira erro de apuração, que é a promessa nº 1 do cabeçalho do arquivo (RF-11, D-10) | T015 | `[//]` | `scripts/conferir-producao.mts` | 🟢 | `[X]` |
| T017 | Provar a D-10 na única janela em que ela é observável, isto é, **antes** do deploy desta feature: rodar `npm run status:conferir` e o mesmo com `--json` contra a produção atual, que ainda responde sem os campos, e conferir que a ocupação sai desconhecida, que o veredito de defasagem sai correto e que o código de saída não é 2. Depois do deploy este caminho deixa de existir, e a prova com ele (RF-11, D-10) | T016 | - | — | 🟢 | `[X]` |
| T018 | Exercitar os três estados localmente pelo `onboarding.md` §2, §3 e §4, colando os corpos na nota de execução: íntegro com os quatro campos, e a contagem se mexendo com uma sessão `npm run db:psql` aberta em paralelo; `npm run db:down` devolvendo `causa: "conexao"` com os três campos **ausentes**; e `APS_TIMEOUT_SAUDE_MS=1` devolvendo `tempo_esgotado`, também sem eles. Nos três, a plataforma continua servindo e o código permanece 200 (RF-06, RF-07, RN-04) | T015 | `[//]` | — | 🟢 | `[X]` |
| T019 | Validar o corpo real contra `_reversa_sdd/openapi/status.yaml` nos dois alvos e nos dois estados, com `additionalProperties: false` de pé nos dois ramos. Divergência entre o corpo servido e o esquema é bloqueio; estando o contrato certo, a correção é no código, e nunca o inverso (Princípio I, RF-09, D-09) | T018 | - | — | 🟢 | `[X]` |

## Fase 5, Polimento

<!-- Logs, mensagens, documentação curta, portões e vigilância. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T020 | Atualizar a seção "Como verificar saúde" do `README.md`: o ramo íntegro passa a ter quatro chaves, e a prosa precisa carregar as duas ressalvas sem as quais o número engana quem investiga, a saber que o teto é do servidor e a contagem é do banco corrente, e que a rota se conta, de modo que um vale banco ocioso e não banco vazio. Acrescentar a linha nova do conferidor. O README está na travessia do inventário de textos, e a norma de `docs/redacao.md` o alcança: travessão com parcimônia, nenhuma reticência, nenhuma exclamação (RF-11, Princípio IX) | T016 | `[//]` | `README.md` | 🟢 | `[X]` |
| T021 | Conferir a disciplina de log no caminho novo com evidência colada, e não por leitura de código: a reprovação por estatística fora de forma registra linha estruturada com causa `consulta`, nome do erro e host **mascarado**, sem URL, sem credencial e sem o texto da consulta. A régua é a que `registrar()` já pratica desde a 003, e o que se afere aqui é que a linha mais larga não a afrouxou (RNF de observabilidade, RN-05) | T018 | `[//]` | `infra/database.ts` | 🟢 | `[X]` |
| T022 | Rodar os portões na ordem de custo crescente e registrar os números: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` seguido de `npm run test:api` nos **dois** alvos, `npm run test:e2e` e `node scripts/inventariar-textos.mts` até a idempotência. Formatar apenas os arquivos escritos nesta feature; arquivo que já reprovava `prettier --check` antes dela permanece como estava, porque corrigi-lo aqui seria escopo vazado (critério de pronto do roadmap §10) | T017, T019, T020, T021 | - | — | 🟢 | `[X]` |
| T023 | Conferir o escopo por `git diff --name-only`: nada de `models/`, nada de `interface/`, nenhuma tela, e o único arquivo de `pages/` é `pages/api/v1/status.ts` com mudança restrita ao comentário de cabeçalho. A matriz de rastreabilidade permanece com `∅` em todos os domínios clínicos, como o roadmap §5 afirma. Aparecendo outro arquivo, é escopo vazado, e a ação é remover (roadmap §5, Princípio VIII) | T022 | `[//]` | — | 🟢 | `[X]` |
| T024 | Abrir no `regression-watch.md` os dois itens de vigilância que esta entrega deixa em aberto, com o procedimento de leitura de cada um. D-11: lido `teto_de_conexoes` em produção, valor na casa da centena baixa confirma que a rota fala com a instância de cálculo e sobe a decisão a 🟢; valor na casa dos milhares indica agrupador de conexões no caminho, e então a ressalva da RN-08 deixa de ser precaução e vira o fato central a documentar. D-07: o falso positivo teórico de `/54(32\|33)/` diante de um teto que contivesse `5432`, registrado como vigilância e não como motivo para enfraquecer a guarda (D-07, D-11, `onboarding.md` §7) | T022 | `[//]` | `_reversa_forward/024-status-conexoes-do-banco/regression-watch.md` | 🟡 | `[X]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

**Placar: 24 de 24.** Quinze fecharam na passagem de codificação; as outras nove na passagem de
reconciliação do mesmo dia, descrita abaixo. O detalhe do impacto está em `legacy-impact.md`; a
vigilância que a T024 abriu está em `regression-watch.md`.

### A pendência que atravessava cinco das nove, e como se desfez

O corpo publicado trazia `tetoDeConexoes` e `conexoesAbertas`; o contrato público, o `openapi` e o
conferidor exigem `teto_de_conexoes` e `conexoes_abertas`. A causa estava em três decisões escritas,
individualmente cumpridas e conjuntamente impossíveis: o §1 de `interfaces/conexao-banco.md`
declarava `LeituraDeSaude` em camelCase, o §2 define o ramo íntegro como interseção com esse tipo, e
a D-08 proíbe o handler de remapear. Como o defeito era do documento, a execução parou em vez de
escolher sozinha, que é o comportamento que o Princípio I pede.

A escolha virou a **D-12**: o tipo se declara em `snake_case`, porque pela D-08 ele é a forma de fio,
e não um tipo interno. Tocaram-se três campos em `infra/database.ts`, as chaves de dois arquivos de
teste e duas declarações de documento, cada uma agora com a razão da exceção escrita ao lado.
`infra/saude.ts` e `pages/api/v1/status.ts` não mudaram uma linha.

### Como fechou cada uma das nove

| Ação | Prova |
|---|---|
| T002 | O `interfaces/conexao-banco.md` foi editado: o §1 declara o tipo em `snake_case` e explica a exceção; o §4 permanece nomeando `saude.test.ts`, que é onde a unidade de fato mora |
| T003 | A linha de base verde foi reconstruída num worktree do `HEAD` anterior, `84738fe`, com o `node_modules` compartilhado: **73 arquivos, 935 testes**. Depois da entrega: 73 e 941, os seis a mais sendo os casos novos de `saude()` e o do log |
| T005 | Decidida em outra forma pela D-12, e não executada como estava escrita. O que a ação garantia de substantivo, as cinco validações com causa única, está no código e sob teste |
| T015 | Verde: `npm run test:api` fecha em **31 de 31** nos dois alvos. A conferência a olho confirma o resto: contagem em 1 com o banco ocioso, versão em `17.10`, teto em 100 contra os cinco da pilha |
| T017 | Provada por duas vias. Contra a produção real, ainda no SHA `84738fe`: veredito `EM DIA`, saída 0. Contra um duplo local servindo o ramo íntegro de uma chave, que é o caminho que o deploy fecha: `banco íntegro · ocupação desconhecida`, saída 0, e o `--json` omitindo os três campos em vez de inventá-los |
| T019 | O Ajv valida o corpo real dos dois alvos contra `openapi/status.yaml`, e os três exemplos do próprio documento junto. Os exemplos ainda tiveram versão e commit corrigidos (`O-24-09`) |
| T021 | O caminho novo passou a logar, porque não logava: `saude()` emite linha estruturada antes de lançar, com causa `consulta`, host mascarado e as colunas reprovadas, jamais os valores. A disciplina virou teste, que afere também a ausência de URL, credencial e texto de consulta |
| T022 | Portões completos, na ordem de custo: `typecheck` e `lint` limpos, `npm test` 941 de 941, `npm run build` com 11 rotas, `npm run test:api` 31 de 31 nos dois alvos, `npm run test:e2e` 61 de 61, e `node scripts/inventariar-textos.mts --gerar` até a idempotência, em 1259 literais. Formatado só o que esta feature escreveu: `tests/contract/infra/banco.test.ts`. O `README.md` já reprovava `prettier` antes da 024 e ficou como estava |
| T023 | Escopo limpo: nada de `models/`, nada de `interface/`, nenhuma tela, e o único arquivo de `pages/` é a rota, com mudança restrita ao comentário. `next-env.d.ts` voltou sozinho ao conteúdo versionado no `build`. Permanece `.reversa/active-requirements.json`, que é governança do ciclo, e `.reversa/_config/files-manifest.json`, que já vinha modificado da abertura da sessão |

O inventário de textos justificou a si mesmo ao rodar: a norma de `docs/redacao.md` reprovou uma
linha real do `README.md`, um ponto médio em fim de linha, que teria viajado para o repositório se o
portão tivesse ficado de fora.

### Desvios nas ações concluídas

- **T001.** O banco local subiu em `postgres:17.10-alpine` na porta 5455, depois de `docker ps`
  confirmar a 5433 tomada por `comentarios-enem-postgres` e a 5443 por `simulacao-credito`. A porta
  entrou pela linha de comando, e não em `.env.test.local`, que segue com `mtime` de julho. Funciona
  porque `loadEnvConfig` não sobrescreve variável já presente no ambiente, mas a armadilha volta
  inteira na próxima sessão, e é por isso que o §0 do `onboarding.md` existe.
- **T005 e T010.** Os dois desviaram da forma prevista, e pelo mesmo motivo: a interpretação ficou
  embutida em `saude()`, de modo que a unidade dela mora em `tests/unit/infra/saude.test.ts`,
  alcançada por `vi.importActual`, e não no `tests/unit/infra/database.test.ts` que o plano previa.
  Nenhuma prova se perdeu: estão lá teto em texto, contagem em zero, versão sem prefixo, a
  sanitização de `"17.10 (Debian 17.10-1.pgdg120+1)"` e o rastro estruturado da reprovação.
  Registrados em `O-24-01` e `O-24-02`, e decididos pela D-12.
- **T014.** A guarda de ausência escrita para a RN-02 nasceu **tautológica**, porque
  `CAMPOS_DE_CONEXAO` listava nomes em `snake_case` que o executável então não emitia. Com o W001
  fechado, ela passou a valer de fato. Quem segurava a regra no intervalo era a asserção herdada da
  022, a de que as chaves do degradado são exatamente `["causa","estado"]`.
- **T016.** O conferidor nasceu correto e inerte, imprimindo `ocupação desconhecida` contra o
  próprio build da 024. Com o W001 fechado, imprime `banco íntegro · 1/100 conexões`. A tolerância da
  D-10 continua onde estava, e segue provada contra o corpo antigo.
- **T018.** Os três estados foram exercitados e os corpos colhidos. Íntegro:
  `{"estado":"integro","teto_de_conexoes":100,"conexoes_abertas":1,"versao":"17.10"}`, com a contagem
  subindo a 7 sob seis sessões `psql` abertas em paralelo. Degradado por alvo inalcançável:
  `{"estado":"degradado","causa":"conexao"}`. Tempo esgotado:
  `{"estado":"degradado","causa":"tempo_esgotado"}`. Nos três a plataforma continuou servindo, com
  200, `no-store` e sem `Set-Cookie`. A sanitização foi ainda conferida contra imagem Debian, cujo
  `server_version` é `17.10 (Debian 17.10-1.pgdg13+1)` e chegou ao corpo como `17.10`.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-08-10 | Versão inicial gerada por `/reversa-to-do`, na ordem do plano de migração do roadmap §8: contratos, `infra/database.ts`, `infra/saude.ts`, `openapi/status.yaml`, suítes e consumidores. A fase de testes vem depois do núcleo pela razão declarada no Resumo, e a troca de lugar está registrada em vez de silenciada | reversa |
| 2026-08-10 | Fechamento do `/reversa-coding`: 15 ações marcadas `[X]` sobre evidência de código e de execução, 9 mantidas `[ ]` com o motivo de cada uma nas notas acima. Escritos `progress.jsonl`, `legacy-impact.md` e `regression-watch.md`. Nenhum arquivo de produção foi tocado nesta passagem | reversa |
| 2026-08-10 | Passagem de reconciliação: a pendência do W001 desfeita pela D-12, as nove ações restantes fechadas com prova, e os portões rodados por inteiro. Atualizados `roadmap.md`, `interfaces/conexao-banco.md`, `data-delta.md`, `legacy-impact.md`, `regression-watch.md` e o adendo do `/reversa-sync` | reversa |
